import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import * as XLSX from 'xlsx';

@Controller('meter/template')
export class MeterTemplateController {
  @Get()
  downloadTemplate(
    @Res({ passthrough: false }) res: Response,
  ) {
    const headers = [
      'Date',
      'Time',
      'ActiveEnergyImport',
      'ActiveEnergyExport',
      'ReactiveEnergyImport',
      'ReactiveEnergyExport',
      'Voltage',
      'Current',
      'Frequency',
      'PowerFactor',
    ];

    const sampleRow = {
      Date: '01-01-2025',
      Time: '10:00',
      ActiveEnergyImport: 1200,
      ActiveEnergyExport: 300,
      ReactiveEnergyImport: 150,
      ReactiveEnergyExport: 80,
      Voltage: 415,
      Current: 32,
      Frequency: 50,
      PowerFactor: 0.98,
    };

    const worksheet = XLSX.utils.json_to_sheet([sampleRow], {
      header: headers,
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'MeterTemplate');

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    res.set({
      'Content-Disposition': 'attachment; filename=meter_template.xlsx',
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    res.end(buffer);
  }
}
