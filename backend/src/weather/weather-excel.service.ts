import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs'; // Ensure ExcelJS is imported correctly

export interface RowErrorDto {
  rowNumber: number;
  errors: string[];
}

@Injectable()
export class WeatherExcelService {
  async parseAndValidate(fileBuffer: Buffer | Uint8Array) { // Update type to handle both Buffer and Uint8Array
    const workbook = new ExcelJS.Workbook();
    
    let buffer: Buffer;

    // Check if fileBuffer is an instance of Uint8Array or Buffer and cast accordingly
    if (fileBuffer instanceof Uint8Array) {
      buffer = Buffer.from(fileBuffer);  // Convert Uint8Array to Buffer
    } else if (Buffer.isBuffer(fileBuffer)) {
      buffer = fileBuffer; // Use fileBuffer directly if it's already a Buffer
    } else {
      throw new Error("Invalid file buffer format.");
    }

    await workbook.xlsx.load(buffer);  // Ensure that ExcelJS can properly load the buffer

    const worksheet = workbook.getWorksheet(1); 
    if (!worksheet) {
      throw new Error('Worksheet not found.');
    }

    const weatherData: any[] = [];
    const errors: RowErrorDto[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        const data = {
          date: row.getCell(1).text,
          time: row.getCell(2).text,
          poaPyranometer: row.getCell(3).value,
          ghiPyranometer: row.getCell(4).value,
          albedo: row.getCell(5).value,
          moduleTemperature: row.getCell(6).value,
          ambientTemperature: row.getCell(7).value,
          windSpeed: row.getCell(8).value,
          rainfall: row.getCell(9).value,
          humidity: row.getCell(10).value,
        };

        const rowErrors = this.validateRow(data, rowNumber);
        if (rowErrors.length > 0) {
          errors.push({ rowNumber, errors: rowErrors });
        } else {
          weatherData.push(data);
        }
      }
    });

    return { weatherData, errors };
  }

  validateRow(data: any, rowNumber: number) {
    const errors: string[] = [];

    // Validation logic for weather data
    if (data.poaPyranometer < 0 || data.poaPyranometer > 1500) {
      errors.push('POA Pyranometer value must be between 0 and 1500.');
    }
    if (data.ghiPyranometer < 0 || data.ghiPyranometer > 1500) {
      errors.push('GHI Pyranometer value must be between 0 and 1500.');
    }
    if (data.albedo < 0 || data.albedo > 1500) {
      errors.push('Albedo value must be between 0 and 1500.');
    }
    if (data.moduleTemperature <= 0) {
      errors.push('Module Temperature must be greater than 0.');
    }
    if (data.ambientTemperature < 0) {
      errors.push('Ambient Temperature must be greater than or equal to 0.');
    }
    if (data.windSpeed < 0) {
      errors.push('Wind Speed must be greater than or equal to 0.');
    }
    if (data.rainfall < 0) {
      errors.push('Rainfall must be greater than or equal to 0.');
    }
    if (data.humidity < 0) {
      errors.push('Humidity must be greater than or equal to 0.');
    }

    return errors;
  }
}
