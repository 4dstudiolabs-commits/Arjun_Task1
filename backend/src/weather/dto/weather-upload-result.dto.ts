export type WeatherRowDto = Record<string, any>;

export type RowErrorDto = {
  rowIndex: number;
  messages: string[];
};

export type WeatherUploadResultDto = {
  rows: WeatherRowDto[];
  errors: RowErrorDto[];
  isValid: boolean;
};
