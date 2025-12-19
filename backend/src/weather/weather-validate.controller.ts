import { Body, Controller, Post, BadRequestException } from '@nestjs/common';

import { WeatherValidateService } from './weather-validate.service';
import { normalizeUploadResult } from '../common/utils/normalize-upload-result';
import type { UploadResultDto } from '../common/types/upload-result';

@Controller('weather/validate')
export class WeatherValidateController {
  constructor(private readonly validateService: WeatherValidateService) {}

  @Post()
  validateWeatherRows(
    @Body() body: { rows: Record<string, any>[] },
  ): UploadResultDto {
    if (!body || !Array.isArray(body.rows)) {
      throw new BadRequestException('Request body must contain rows array');
    }

    const result = this.validateService.validateRows(body.rows);

    // validateRows may return { errors, isValid } (and sometimes rows)
    // normalizeUploadResult guarantees { rows, errors, isValid }
    return normalizeUploadResult({ ...result, rows: body.rows });
  }
}
