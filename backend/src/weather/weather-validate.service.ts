import { Injectable } from '@nestjs/common';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function isValidDDMMMYY(s: string) {
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

function normalizeDDMMMYY(s: string) {
  const m = s.match(/^(\d{2})-([A-Za-z]{3})-(\d{2})$/);
  if (!m) return s;
  const dd = m[1];
  const mon = m[2].slice(0, 1).toUpperCase() + m[2].slice(1).toLowerCase();
  const yy = m[3];
  return `${dd}-${mon}-${yy}`;
}

function isValidHHMM(s: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

function normalizeHHMM(s: string) {
  // if HH:MM:SS comes in after editing, drop seconds
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return s;
  const hh = String(Number(m[1])).padStart(2, '0');
  const mm = m[2];
  return `${hh}:${mm}`;
}

@Injectable()
export class WeatherValidateService {
  validateRows(rows: Record<string, any>[]) {
    const errors: { rowNumber: number; errors: string[] }[] = [];
    const seenDateTime = new Set<string>();

    rows.forEach((row, index) => {
      const rowErrors: string[] = [];
      const rowNumber = index + 2;

      const rawDate = row['Date'] ?? row['date'] ?? '';
      const rawTime = row['Time'] ?? row['time'] ?? '';

      const date = rawDate ? normalizeDDMMMYY(String(rawDate).trim()) : '';
      const time = rawTime ? normalizeHHMM(String(rawTime).trim()) : '';

      if (!date) rowErrors.push('Missing Date');
      if (!time) rowErrors.push('Missing Time');

      if (date && !isValidDDMMMYY(date)) {
        rowErrors.push('Invalid Date format (expected DD-MMM-YY, e.g., 01-Dec-24)');
      }

      if (time && !isValidHHMM(time)) {
        rowErrors.push('Invalid Time format (expected HH:MM 24-hour, e.g., 09:30)');
      }

      if (date && time && isValidDDMMMYY(date) && isValidHHMM(time)) {
        const key = `${date}_${time}`;
        if (seenDateTime.has(key)) {
          rowErrors.push('Duplicate Date & Time');
        } else {
          seenDateTime.add(key);
        }
      }

      const checkRange = (value: any, min: number, max: number, field: string) => {
        if (value === null || value === undefined || value === '') return;

        const num = Number(value);
        if (isNaN(num)) {
          rowErrors.push(`${field} must be a number`);
          return;
        }

        if (num < min || num > max) {
          rowErrors.push(`${field} must be between ${min} and ${max}`);
        }
      };

      checkRange(row['POA'], 0, 1500, 'POA');
      checkRange(row['GHI'], 0, 1500, 'GHI');
      checkRange(row['AlbedoUp'], 0, 1500, 'AlbedoUp');
      checkRange(row['AlbedoDown'], 0, 1500, 'AlbedoDown');

      const moduleTemp = row['ModuleTemp'];
      if (moduleTemp === 0 || moduleTemp === '0') {
        rowErrors.push('Module Temperature cannot be 0');
      }
      checkRange(moduleTemp, 0, 100, 'Module Temperature');

      checkRange(row['AmbientTemp'], 0, 100, 'Ambient Temperature');
      checkRange(row['WindSpeed'], 0, 200, 'Wind Speed');
      checkRange(row['Rainfall'], 0, 500, 'Rainfall');
      checkRange(row['Humidity'], 0, 100, 'Humidity');

      if (rowErrors.length > 0) {
        errors.push({ rowNumber, errors: rowErrors });
      }
    });

    return {
      errors,
      isValid: errors.length === 0,
    };
  }
}
