import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WeatherExcelService } from './weather-excel.service';

@Controller('weather/upload')
export class WeatherUploadController {
  constructor(private readonly excelService: WeatherExcelService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadWeatherExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Excel file is required');
    return this.excelService.parseAndValidate(file.buffer);
  }
}
