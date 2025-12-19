import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MeterExcelService } from './meter-excel.service';
import { BadRequestException } from '@nestjs/common';
import { MeterData, RowErrorDto } from './meter-excel.service';  // Import RowErrorDto type

@Controller('meter/upload')
export class MeterUploadController {
  constructor(private readonly excelService: MeterExcelService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadMeterExcel(@UploadedFile() file: Express.Multer.File): Promise<{ meterData: MeterData[], errors: RowErrorDto[] }> {
    // Check if the file is provided
    if (!file) {
      throw new BadRequestException('Excel file is required');
    }

    // Check if the file is an Excel file based on its MIME type (optional but recommended)
    if (!file.mimetype.includes('spreadsheetml.sheet') && !file.mimetype.includes('ms-excel')) {
      throw new BadRequestException('Invalid file type. Only Excel files are allowed');
    }

    try {
      // Pass the file buffer to the service to parse and validate
      const { meterData, errors } = await this.excelService.parseAndValidate(file.buffer);
      return { meterData, errors };
    } catch (error) {
      // Handle any errors that occur during file parsing
      throw new BadRequestException('Error processing the Excel file');
    }
  }
}
