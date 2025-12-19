import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx'; // Ensure XLSX (SheetJS) is imported correctly

export interface RowErrorDto {
  rowNumber: number;
  errors: string[];
}

@Injectable()
export class WeatherExcelService {
  async parseAndValidate(fileBuffer: Buffer | Uint8Array) {
    // Log to check if the buffer is valid
    console.log('Loading workbook...');
    
    let weatherData: any[] = [];
    const errors: RowErrorDto[] = [];
    
    try {
      // Read the workbook using SheetJS
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

      console.log('Workbook loaded successfully.');

      // Pick the first sheet from the workbook
      const sheetName = workbook.SheetNames[0]; // You can use sheet index as well, e.g., `workbook.Sheets[0]`
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        throw new Error('Worksheet not found.');
      }

      // Convert worksheet to JSON data
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

      // Log worksheet details to ensure it's loaded correctly
      console.log('Worksheet loaded:', sheetName);
      console.log('Total rows in the worksheet:', jsonData.length);

      // Process each row (skip header row)
      jsonData.forEach((row: any, index: number) => {
        if (index === 0) return; // Skip header row

        const data = {
          date: row[0],  // Adjust based on actual columns in your sheet
          time: row[1],
          poaPyranometer: row[2],
          ghiPyranometer: row[3],
          albedo: row[4],
          moduleTemperature: row[5],
          ambientTemperature: row[6],
          windSpeed: row[7],
          rainfall: row[8],
          humidity: row[9],
        };

        const rowErrors = this.validateRow(data, index + 1); // Validate row, include rowNumber as index+1
        if (rowErrors.length > 0) {
          errors.push({ rowNumber: index + 1, errors: rowErrors });
        } else {
          weatherData.push(data);
        }
      });

    } catch (error) {
      console.error('Error loading workbook:', error);
      throw new Error('Error loading workbook.');
    }

    return { weatherData, errors };
  }

  validateRow(data: any, rowNumber: number) {
    const errors: string[] = [];

    // Date validation (should be in DD-MM-YYYY format)
    if (!this.isValidDate(data.date)) {
      errors.push('Invalid Date format (DD-MM-YYYY)');
    }

    // Time validation (should be in HH:MM format)
    if (!this.isValidTime(data.time)) {
      errors.push('Invalid Time format (HH:MM)');
    }

    // Validation logic for other fields
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

  // Date format validation
  isValidDate(date: string) {
    const datePattern = /^\d{2}-\d{2}-\d{4}$/;  // DD-MM-YYYY format
    return datePattern.test(date);
  }

  // Time format validation
  isValidTime(time: string) {
    const timePattern = /^\d{2}:\d{2}$/;  // HH:MM format
    return timePattern.test(time);
  }
}
