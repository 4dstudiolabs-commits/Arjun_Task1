export type RowErrorDto = {
  rowNumber: number;
  errors: string[];
};

export type UploadResultDto<T = Record<string, any>> = {
  rows: T[];
  errors: RowErrorDto[];
  isValid: boolean;
};
