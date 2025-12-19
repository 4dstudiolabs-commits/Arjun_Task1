import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

type RowError = { rowNumber: number; errors: string[] };

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function isValidDDMMYYYY(s: string) {
  return /^\d{2}-\d{2}-\d{4}$/.test(s.trim());
}

function isValidHHMM(s: string) {
  const m = s.trim().match(/^(\d{2}):(\d{2})$/);
  if (!m) return false;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
}

function normalizeHHMM(value: any): string | null {
  if (value === null || value === undefined || value === '') return null;

  // Excel Date object
  if (value instanceof Date) {
    return `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;
  }

  // Excel serial number (time fraction)
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return `${pad2(parsed.H ?? 0)}:${pad2(parsed.M ?? 0)}`;
    }
  }

  const s = String(value).trim();

  // HH:MM:SS -> HH:MM
  const m2 = s.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (m2) return `${pad2(Number(m2[1]))}:${m2[2]}`;

  // H:MM or HH:MM -> HH:MM
  const m1 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m1) return `${pad2(Number(m1[1]))}:${m1[2]}`;

  return s;
}

function normalizeDateDDMMYYYY(value: any): string | null {
  if (value === null || value === undefined || value === '') return null;

  // Excel Date object
  if (value instanceof Date) {
    const dd = pad2(value.getDate());
    const mm = pad2(value.getMonth() + 1);
    const yyyy = value.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  // Excel serial date number
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed && parsed.y && parsed.m && parsed.d) {
      return `${pad2(parsed.d)}-${pad2(parsed.m)}-${parsed.y}`;
    }
  }

  const s = String(value).trim();
  if (!s) return null;

  // Accept already-correct DD-MM-YYYY
  if (isValidDDMMYYYY(s)) return s;

  // Try common alternative parse (YYYY-MM-DD)
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    return `${iso[3]}-${iso[2]}-${iso[1]}`;
  }

  // Last fallback: try JS Date parse
  const dt = new Date(s);
  if (!isNaN(dt.getTime())) {
    return `${pad2(dt.getDate())}-${pad2(dt.getMonth() + 1)}-${dt.getFullYear()}`;
  }

  // Keep raw (will fail strict validation, which is intended)
  return s;
}

function toNumberOrNull(v: any) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

@Injectable()
export class MeterUploadService {
  parseAndValidate(buffer: Buffer) {
    const rows = this.parseExcel(buffer);

    const errors: RowError[] = [];
    const seenDates = new Set<string>();

    rows.forEach((row, index) => {
      const rowErrors: string[] = [];
      const rowNumber = index + 2;

      // --- 1) Date validation: DD-MM-YYYY, no duplicates ---
      const date = row['Date'];

      if (!date) {
        rowErrors.push('Missing Date');
      } else if (!isValidDDMMYYYY(String(date))) {
        rowErrors.push('Date must be in format DD-MM-YYYY (e.g., 01-12-2024)');
      } else {
        if (seenDates.has(String(date))) rowErrors.push('No duplicate dates allowed');
        seenDates.add(String(date));
      }

      // --- 2) Start/Stop time format (if present) ---
      const startTime = row['Start Time'] ?? row['StartTime'] ?? row['Start'];
      const stopTime = row['Stop Time'] ?? row['StopTime'] ?? row['Stop'];

      if (startTime && !isValidHHMM(String(startTime))) {
        rowErrors.push('Start Time must be HH:MM (24-hour)');
      }

      if (stopTime && !isValidHHMM(String(stopTime))) {
        rowErrors.push('Stop Time must be HH:MM (24-hour)');
      }

      // --- 3) Each date must have either Start/Stop OR Export/Import readings ---
      const hasStartStop =
        !!startTime &&
        !!stopTime &&
        isValidHHMM(String(startTime)) &&
        isValidHHMM(String(stopTime));

      // Detect Export/Import reading columns
      const keys = Object.keys(row);
      const readingKeys = keys.filter((k) => /export|import/i.test(k));

      let hasAnyReading = false;

      // --- 4) Export/Import readings numeric + non-negative ---
      for (const k of readingKeys) {
        const n = toNumberOrNull(row[k]);
        if (n === null) continue;

        if (Number.isNaN(n)) {
          rowErrors.push(`${k} must be numeric`);
        } else {
          hasAnyReading = true;
          if (n < 0) rowErrors.push(`${k} cannot be negative`);
        }
      }

      if (!hasStartStop && !hasAnyReading) {
        rowErrors.push('Each date must have either Start/Stop times OR Export/Import readings');
      }

      if (rowErrors.length > 0) {
        errors.push({ rowNumber, errors: rowErrors });
      }
    });

    return {
      rows,
      errors,
      isValid: errors.length === 0,
    };
  }

  private parseExcel(buffer: Buffer): Record<string, any>[] {
    try {
      // cellDates true helps Date columns come as Date objects
      const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
      const sheetName = wb.SheetNames?.[0];
      if (!sheetName) throw new BadRequestException('No sheet found in Excel');

      const sheet = wb.Sheets[sheetName];

      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
        defval: null,
        raw: true,
      });

      // Normalize key fields so downstream logic is stable
      const rows = rawRows.map((r) => {
        const out: Record<string, any> = { ...r };

        // Normalize Date
        if ('Date' in out) {
          out['Date'] = normalizeDateDDMMYYYY(out['Date']);
        }

        // Normalize Start/Stop Time if those columns exist
        const startKey = this.findKey(out, ['Start Time', 'StartTime', 'Start']);
        const stopKey = this.findKey(out, ['Stop Time', 'StopTime', 'Stop']);

        if (startKey) out[startKey] = normalizeHHMM(out[startKey]);
        if (stopKey) out[stopKey] = normalizeHHMM(out[stopKey]);

        return out;
      });

      return rows;
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to parse Excel');
    }
  }

  private findKey(obj: Record<string, any>, candidates: string[]) {
    for (const c of candidates) {
      if (Object.prototype.hasOwnProperty.call(obj, c)) return c;
    }
    return null;
  }
}
