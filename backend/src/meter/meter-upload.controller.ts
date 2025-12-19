import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MeterExcelService } from './meter-excel.service';
import { BadRequestException } from '@nestjs/common';

@Controller('meter/upload')
export class MeterUploadController {
  constructor(private readonly excelService: MeterExcelService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadMeterExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Excel file is required');
    const { meterData, errors } = await this.excelService.parseAndValidate(file.buffer);
    return { meterData, errors };
  }
}
