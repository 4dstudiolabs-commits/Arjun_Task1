import {
  Body,
  Controller,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { MeterSubmitService } from './meter-submit.service';

@Controller('meter/submit')
export class MeterSubmitController {
  constructor(
    private readonly submitService: MeterSubmitService,
  ) {}

  @Post()
  async submitMeterRows(
    @Body() body: { rows: Record<string, any>[] },
  ) {
    if (!body || !Array.isArray(body.rows)) {
      throw new BadRequestException(
        'Request body must contain rows array',
      );
    }

    return this.submitService.submitRows(body.rows);
  }
}

