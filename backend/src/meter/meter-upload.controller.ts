import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { MeterUploadService } from './meter-upload.service';
import { normalizeUploadResult } from '../common/utils/normalize-upload-result';
import type { UploadResultDto } from '../common/types/upload-result';

@Controller('meter/upload')
export class MeterUploadController {
  private readonly uploadService = new MeterUploadService();

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadMeterExcel(@UploadedFile() file: Express.Multer.File): UploadResultDto {
    if (!file) {
      throw new BadRequestException('Excel file is required');
    }

    const result = this.uploadService.parseAndValidate(file.buffer);
    return normalizeUploadResult(result);
  }
}
