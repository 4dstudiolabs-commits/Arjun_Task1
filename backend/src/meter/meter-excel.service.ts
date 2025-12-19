import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { WeatherService } from '../weather/weather.service';  // Assuming you have a weather service to fetch data

export interface RowErrorDto {
  rowNumber: number;
  errors: string[];
}

@Injectable()
export class MeterExcelService {
  constructor(private readonly weatherService: WeatherService) {}

  async parseAndValidate(fileBuffer: Buffer) {
    const workbook = new ExcelJS.Workbook();
    const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('Worksheet not found.');
    }

    const meterData: any[] = [];
    const errors: RowErrorDto[] = [];

    // Processing each row asynchronously
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const data = {
        date: row.getCell(1).text,
        startTime: row.getCell(2).text,
        stopTime: row.getCell(3).text,
        exportReading: row.getCell(4).value,
        importReading: row.getCell(5).value,
      };

      // Validate the row
      const rowErrors = this.validateRow(data, rowNumber);
      if (rowErrors.length > 0) {
        errors.push({ rowNumber, errors: rowErrors });
      } else {
        // Fetch weather data to calculate Plant Start/Stop times
        const times = await this.calculatePlantTimes(data.date);  // Await the calculation
        data.startTime = times.startTime || data.startTime;
        data.stopTime = times.stopTime || data.stopTime;
        meterData.push(data);
      }
    }

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

  async calculatePlantTimes(date: string) {
    const weatherData = await this.weatherService.getWeatherByDate(date);

    if (!weatherData || weatherData.length === 0) {
      return { startTime: '00:00', stopTime: '00:00' };
    }

    let plantStartTime = '00:00';
    let plantStopTime = '00:00';

    for (const weatherRow of weatherData) {
      if (weatherRow.poa >= 10 && !plantStartTime) {
        plantStartTime = weatherRow.time;  // First time POA ≥ 10 W/m²
      }
      if (weatherRow.poa > 0 && weatherRow.poa < 50) {
        plantStopTime = weatherRow.time;  // Last time POA > 0 and < 50 W/m²
      }
    }

    return { startTime: plantStartTime, stopTime: plantStopTime };
  }
}
