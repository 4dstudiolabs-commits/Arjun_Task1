import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WeatherExcelService, RowErrorDto } from './weather-excel.service';  // Import RowErrorDto

@Controller('weather')  // Ensure this is '/weather' (base route) and the endpoint is '/upload'
export class WeatherUploadController {
  constructor(private readonly excelService: WeatherExcelService) {}

  @Post('upload')  // This ensures that the correct route is used
  @UseInterceptors(FileInterceptor('file'))
  async uploadWeatherExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Excel file is required');
    const { weatherData, errors }: { weatherData: any[], errors: RowErrorDto[] } = await this.excelService.parseAndValidate(file.buffer);
    return { weatherData, errors };
  }
}
