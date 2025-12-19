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
import { MeterService } from './meter.service';

@Controller('meter')
export class MeterController {
  constructor(private readonly meterService: MeterService) {}

  // CREATE - Single record
  @Post()
  async create(@Body() createMeterDto: Record<string, any>) {
    return this.meterService.create(createMeterDto);
  }

  // READ - All records with optional filters
  @Get()
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.meterService.findAll({
      startDate,
      endDate,
      limit: limit ? parseInt(limit, 10) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
    });
  }

  // READ - Single record by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const record = await this.meterService.findOne(id);
    if (!record) {
      throw new NotFoundException(`Meter record with ID ${id} not found`);
    }
    return record;
  }

  // READ - By date
  @Get('by-date/:date')
  async findByDate(@Param('date') date: string) {
    return this.meterService.findByDate(date);
  }

  // UPDATE - Single record
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMeterDto: Record<string, any>,
  ) {
    const updated = await this.meterService.update(id, updateMeterDto);
    if (!updated) {
      throw new NotFoundException(`Meter record with ID ${id} not found`);
    }
    return updated;
  }

  // DELETE - Single record
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deleted = await this.meterService.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Meter record with ID ${id} not found`);
    }
    return { message: 'Meter record deleted successfully', id };
  }

  // DELETE - Multiple records by IDs
  @Post('delete-many')
  async removeMany(@Body() body: { ids: string[] }) {
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException('ids array is required');
    }
    return this.meterService.removeMany(body.ids);
  }
}