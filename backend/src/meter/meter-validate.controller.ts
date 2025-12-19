import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { MeterValidateService } from './meter-validate.service';

@Controller('meter/validate')
export class MeterValidateController {
  constructor(private readonly validateService: MeterValidateService) {}

  @Post()
  async validateMeterRows(@Body() body: { rows: Record<string, any>[] }) {
    if (!body || !Array.isArray(body.rows)) {
      throw new BadRequestException('Request body must contain rows array');
    }

    return this.validateService.validateRows(body.rows);
  }
}
