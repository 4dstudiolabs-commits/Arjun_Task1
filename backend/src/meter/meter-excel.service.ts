import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

export interface RowErrorDto {
  rowNumber: number;
  errors: string[];
}

@Injectable()
export class MeterExcelService {
  async parseAndValidate(fileBuffer: Buffer) {
    const workbook = new ExcelJS.Workbook();
    
    // Convert the fileBuffer to a Buffer
    const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);

    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('Worksheet not found.');
    }

    const meterData: any[] = [];
    const errors: RowErrorDto[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        const data = {
          date: row.getCell(1).text,
          startTime: row.getCell(2).text,
          stopTime: row.getCell(3).text,
          exportReading: row.getCell(4).value,
          importReading: row.getCell(5).value,
        };

        const rowErrors = this.validateRow(data, rowNumber);
        if (rowErrors.length > 0) {
          errors.push({ rowNumber, errors: rowErrors });
        } else {
          meterData.push(data);
        }
      }
    });

    return { meterData, errors };
  }

  validateRow(data: any, rowNumber: number) {
    const errors: string[] = [];

    // Date and Time Format validation
    if (!this.isValidDate(data.date)) {
      errors.push('Invalid Date format (DD-MM-YYYY)');
    }

    if (!this.isValidTime(data.startTime)) {
      errors.push('Invalid Start Time format (HH:MM)');
    }

    if (!this.isValidTime(data.stopTime)) {
      errors.push('Invalid Stop Time format (HH:MM)');
    }

    // Export/Import Reading validation (must be numeric and non-negative)
    if (data.exportReading < 0 || isNaN(data.exportReading)) {
      errors.push('Invalid Export Reading (must be a positive number)');
    }

    if (data.importReading < 0 || isNaN(data.importReading)) {
      errors.push('Invalid Import Reading (must be a positive number)');
    }

    return errors;
  }

  isValidDate(date: string) {
    const datePattern = /^\d{2}-\d{2}-\d{4}$/;
    return datePattern.test(date);
  }

  isValidTime(time: string) {
    const timePattern = /^\d{2}:\d{2}$/;
    return timePattern.test(time);
  }
}
