import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx'; // Ensure XLSX (SheetJS) is imported correctly
import { WeatherService } from '../weather/weather.service'; // Assuming you have a weather service to fetch data

export interface RowErrorDto {
  rowNumber: number;
  errors: string[];
}

// Define a type for row data structure
export interface MeterData {
  date: string;
  startTime: string;
  stopTime: string;
  exportReading: number;
  importReading: number;
}

@Injectable()
export class MeterExcelService {
  constructor(private readonly weatherService: WeatherService) {}

  async parseAndValidate(fileBuffer: Buffer | Uint8Array) {
    let weatherData: MeterData[] = [];
    const errors: RowErrorDto[] = [];

    try {
      // Read the workbook using SheetJS
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

      console.log('Workbook loaded successfully.');

      // Pick the first sheet from the workbook
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        throw new Error('Worksheet not found.');
      }

      // Convert worksheet to JSON data (skip header row)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

      console.log('Worksheet loaded:', sheetName);
      console.log('Total rows in the worksheet:', jsonData.length);

      // Process each row (skip header row)
      for (let index = 1; index < jsonData.length; index++) {
        const row = jsonData[index] as any[];  // Cast row as an array (since each row is an array)

        // Cast the row as MeterData
        const data: MeterData = {
          date: row[0],  // Adjust based on actual columns in your sheet
          startTime: row[1],
          stopTime: row[2],
          exportReading: row[3],
          importReading: row[4],
        };

        // Validate the row
        const rowErrors = this.validateRow(data, index + 1); // Validate row, include rowNumber as index+1
        if (rowErrors.length > 0) {
          errors.push({ rowNumber: index + 1, errors: rowErrors });
        } else {
          // Fetch weather data to calculate Plant Start/Stop times
          const times = await this.calculatePlantTimes(data.date);  // Await the calculation
          data.startTime = times.startTime || data.startTime;
          data.stopTime = times.stopTime || data.stopTime;
          weatherData.push(data);
        }
      }
    } catch (error) {
      console.error('Error loading workbook:', error);
      throw new Error('Error loading workbook.');
    }

    return { meterData: weatherData, errors };
  }

  // Row validation
  validateRow(data: MeterData, rowNumber: number) {
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

  // Date format validation (DD-MM-YYYY)
  isValidDate(date: string) {
    const datePattern = /^\d{2}-\d{2}-\d{4}$/;
    return datePattern.test(date);
  }

  // Time format validation (HH:MM)
  isValidTime(time: string) {
    const timePattern = /^\d{2}:\d{2}$/;
    return timePattern.test(time);
  }

  // Function to calculate Plant Start/Stop times based on weather data
  async calculatePlantTimes(date: string) {
    const weatherData = await this.weatherService.getWeatherByDate(date);

    if (!weatherData || weatherData.length === 0) {
      return { startTime: '00:00', stopTime: '00:00' };
    }

    let plantStartTime = '00:00';
    let plantStopTime = '00:00';

    // Loop through weather data and calculate start/stop times based on POA values
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
