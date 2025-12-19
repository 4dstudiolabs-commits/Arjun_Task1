import { UploadResultDto, RowErrorDto } from '../types/upload-result';

type AnyObj = Record<string, any>;

/**
 * Converts any legacy/variant shape into the single standard:
 * {
 *   rows: [],
 *   errors: [{ rowNumber, errors: [] }],
 *   isValid: boolean
 * }
 *
 * Supported inputs:
 * - rows OR data
 * - errors: [{ rowNumber, errors }] OR [{ rowIndex, messages }]
 * - isValid optional (computed if missing)
 */
export function normalizeUploadResult<T = AnyObj>(input: any): UploadResultDto<T> {
  const rows = normalizeRows<T>(input?.rows ?? input?.data);
  const errors = normalizeErrors(input?.errors);

  const isValid =
    typeof input?.isValid === 'boolean' ? input.isValid : errors.length === 0;

  return { rows, errors, isValid };
}

function normalizeRows<T>(value: any): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeErrors(value: any): RowErrorDto[] {
  if (!Array.isArray(value)) return [];

  const out: RowErrorDto[] = [];

  for (const e of value) {
    // Format A: { rowNumber, errors: string[] }
    if (typeof e?.rowNumber === 'number' && Array.isArray(e?.errors)) {
      out.push({ rowNumber: e.rowNumber, errors: e.errors.map(String) });
      continue;
    }

    // Format B: { rowIndex, messages: string[] }
    if (typeof e?.rowIndex === 'number' && Array.isArray(e?.messages)) {
      out.push({ rowNumber: e.rowIndex, errors: e.messages.map(String) });
      continue;
    }

    // Ignore unknown shapes safely
  }

  return out;
}
