import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { WeatherSubmitService } from './weather-submit.service';

@Controller('weather/submit')
export class WeatherSubmitController {
  constructor(private readonly submitService: WeatherSubmitService) {}

  @Post()
  async submitWeatherRows(@Body() body: { rows: Record<string, any>[] }) {
    if (!body || !Array.isArray(body.rows)) {
      throw new BadRequestException('Request body must contain rows array');
    }

    return this.submitService.submitRows(body.rows);
  }
}
