import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { UpdateWeatherDto } from './dto/update-weather.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  // CREATE - Single record
  @Post()
  async create(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }

  // READ - All records with optional filters
  @Get()
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.weatherService.findAllWithFilters({
      startDate,
      endDate,
      limit: limit ? parseInt(limit, 10) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
    });
  }

  // READ - Single record by ID
  @Get('by-id/:id')
  async findOne(@Param('id') id: string) {
    return this.weatherService.findOne(id);
  }

  // READ - By date
  @Get('by-date/:date')
  async findByDate(@Param('date') date: string) {
    return this.weatherService.findByDate(date);
  }

  // UPDATE - Single record
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWeatherDto: UpdateWeatherDto,
  ) {
    return this.weatherService.update(id, updateWeatherDto);
  }

  // DELETE - Single record
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.weatherService.remove(id);
  }

  // DELETE - Multiple records by IDs
  @Post('delete-many')
  async removeMany(@Body() body: { ids: string[] }) {
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException('ids array is required');
    }
    return this.weatherService.removeMany(body.ids);
  }
}