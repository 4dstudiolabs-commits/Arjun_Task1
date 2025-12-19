import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

type RowError = { rowIndex: number; messages: string[] };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function isValidDDMMMYY(s: string) {
  // Strict: 01-Dec-24
  const m = s.match(/^(\d{2})-([A-Za-z]{3})-(\d{2})$/);
  if (!m) return false;

  const dd = Number(m[1]);
  const mon = m[2].slice(0, 1).toUpperCase() + m[2].slice(1).toLowerCase();
  const yy = Number(m[3]);

  if (dd < 1 || dd > 31) return false;
  if (!MONTHS.includes(mon as any)) return false;
  if (yy < 0 || yy > 99) return false;

  return true;
}

function isValidHHMM(s: string) {
  // Strict: 00:00 .. 23:59
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

@Injectable()
export class WeatherExcelService {
  parseAndValidate(buffer: Buffer) {
    const rows = this.parseExcel(buffer);

    const errors: RowError[] = [];
    const seen = new Set<string>();

    rows.forEach((r, i) => {
      const rowIndex = i + 2; // UI shows Row 2 as first data row (matches your current UI)
      const messages: string[] = [];

      const date = r.Date ?? r.date ?? null;
      const time = r.Time ?? r.time ?? null;

      if (!date) messages.push('Missing Date');
      if (!time) messages.push('Missing Time');

      if (date && !isValidDDMMMYY(String(date))) {
        messages.push('Invalid Date format (expected DD-MMM-YY, e.g., 01-Dec-24)');
      }

      if (time && !isValidHHMM(String(time))) {
        messages.push('Invalid Time format (expected HH:MM 24-hour, e.g., 09:30)');
      }

      if (date && time && isValidDDMMMYY(String(date)) && isValidHHMM(String(time))) {
        const key = `${date}__${time}`;
        if (seen.has(key)) messages.push('Duplicate Date & Time');
        seen.add(key);
      }

      if (messages.length) errors.push({ rowIndex, messages });
    });

    return {
      rows,
      errors,
      isValid: errors.length === 0,
    };
  }

  private parseExcel(buffer: Buffer): Record<string, any>[] {
    try {
      const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
      const sheetName = wb.SheetNames?.[0];
      if (!sheetName) throw new BadRequestException('No sheet found in Excel');

      const sheet = wb.Sheets[sheetName];

      const matrix = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: null,
        blankrows: false,
      }) as any[][];

      if (!matrix.length) throw new BadRequestException('Excel sheet is empty');

      const headerRowIndex = this.findHeaderRowIndex(matrix);
      if (headerRowIndex === -1) {
        throw new BadRequestException('Could not detect header row. Expected columns: Date, Time');
      }

      const rawHeaders = matrix[headerRowIndex] || [];
      const headers = this.makeUniqueHeaders(rawHeaders.map((h) => this.cleanHeader(h)));

      const dataRows = matrix.slice(headerRowIndex + 1);

      const out: Record<string, any>[] = [];

      for (const row of dataRows) {
        const hasAny = row?.some(
          (v) => v !== null && v !== undefined && String(v).trim() !== '',
        );
        if (!hasAny) continue;

        const obj: Record<string, any> = {};

        headers.forEach((h, idx) => {
          if (!h) return;

          const val = row?.[idx];
          const key = h.toLowerCase();

          if (key === 'date') {
            obj.Date = this.toDDMMMYY(val);
            return;
          }
          if (key === 'time') {
            obj.Time = this.toHHMM(val);
            return;
          }

          obj[h] = this.normalizeCell(val);
        });

        out.push(obj);
      }

      return out;
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to parse Excel');
    }
  }

  private findHeaderRowIndex(matrix: any[][]) {
    for (let i = 0; i < Math.min(matrix.length, 20); i++) {
      const row = matrix[i] || [];
      const normalized = row
        .map((x) => this.cleanHeader(x).toLowerCase())
        .filter(Boolean);

      const hasDate = normalized.some((x) => x === 'date');
      const hasTime = normalized.some((x) => x === 'time');

      if (hasDate && hasTime) return i;
    }
    return -1;
  }

  private cleanHeader(h: any) {
    if (h === null || h === undefined) return '';
    return String(h).replace(/\s+/g, ' ').replace(/\n/g, ' ').trim();
  }

  private makeUniqueHeaders(headers: string[]) {
    const used = new Map<string, number>();
    return headers.map((h) => {
      if (!h) return '';
      const count = used.get(h) ?? 0;
      used.set(h, count + 1);
      return count === 0 ? h : `${h} (${count + 1})`;
    });
  }

  private normalizeCell(val: any) {
    if (val === null || val === undefined) return null;
    if (val instanceof Date) return val.toISOString();
    return val;
  }

  private toDDMMMYY(val: any): string | null {
    if (val === null || val === undefined || val === '') return null;

    // 1) Already in DD-MMM-YY (accept, normalize casing)
    if (typeof val === 'string') {
      const s = val.trim();
      const m = s.match(/^(\d{2})-([A-Za-z]{3})-(\d{2})$/);
      if (m) {
        const dd = m[1];
        const mon = m[2].slice(0, 1).toUpperCase() + m[2].slice(1).toLowerCase();
        const yy = m[3];
        return `${dd}-${mon}-${yy}`;
      }
    }

    // 2) Date object
    if (val instanceof Date) {
      const dd = pad2(val.getDate());
      const mon = MONTHS[val.getMonth()];
      const yy = pad2(val.getFullYear() % 100);
      return `${dd}-${mon}-${yy}`;
    }

    // 3) Excel serial number (date)
    if (typeof val === 'number') {
      const parsed = XLSX.SSF.parse_date_code(val);
      if (parsed && parsed.y && parsed.m && parsed.d) {
        const dd = pad2(parsed.d);
        const mon = MONTHS[parsed.m - 1];
        const yy = pad2(parsed.y % 100);
        return `${dd}-${mon}-${yy}`;
      }
    }

    // 4) Try JS Date parse (fallback)
    const dt = new Date(String(val));
    if (!isNaN(dt.getTime())) {
      const dd = pad2(dt.getDate());
      const mon = MONTHS[dt.getMonth()];
      const yy = pad2(dt.getFullYear() % 100);
      return `${dd}-${mon}-${yy}`;
    }

    // Leave as-is (will fail strict validation, which is intended)
    return String(val).trim();
  }

  private toHHMM(val: any): string | null {
    if (val === null || val === undefined || val === '') return null;

    // 1) Date object (Excel time sometimes becomes Date)
    if (val instanceof Date) {
      const hh = pad2(val.getHours());
      const mm = pad2(val.getMinutes());
      return `${hh}:${mm}`;
    }

    // 2) Excel serial time (fraction of a day) or date-time serial
    if (typeof val === 'number') {
      const parsed = XLSX.SSF.parse_date_code(val);
      if (parsed) {
        const hh = pad2(parsed.H ?? 0);
        const mm = pad2(parsed.M ?? 0);
        return `${hh}:${mm}`;
      }
    }

    // 3) String formats: HH:MM or HH:MM:SS -> normalize to HH:MM
    const s = String(val).trim();
    const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (m) {
      const hh = pad2(Number(m[1]));
      const mm = m[2];
      return `${hh}:${mm}`;
    }

    // Leave as-is (will fail strict validation)
    return s;
  }
}
