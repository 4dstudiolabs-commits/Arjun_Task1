import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Meter, MeterSchema } from './meter.schema';

import { MeterUploadController } from './meter-upload.controller';
import { MeterValidateController } from './meter-validate.controller';
import { MeterSubmitController } from './meter-submit.controller';
import { MeterTemplateController } from './meter-template.controller';

import { MeterUploadService } from './meter-upload.service';
import { MeterValidateService } from './meter-validate.service';
import { MeterSubmitService } from './meter-submit.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meter.name, schema: MeterSchema }]),
  ],
  controllers: [
    MeterUploadController,
    MeterValidateController,
    MeterSubmitController,
    MeterTemplateController,
  ],
  providers: [
    MeterUploadService,
    MeterValidateService,
    MeterSubmitService,
  ],
  exports: [MeterSubmitService],
})
export class MeterModule {}
