import { Controller, Get, Param } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('by-id/:id')
  findOne(@Param('id') id: string) {
    return this.weatherService.findOne(id);
  }

  @Get()
  findAll() {
    return this.weatherService.findAll();
  }
}
