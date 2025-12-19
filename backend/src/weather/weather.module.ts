import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Weather, WeatherSchema } from './schemas/weather.schema';

import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

import { WeatherUploadController } from './weather-upload.controller';
import { WeatherValidateController } from './weather-validate.controller';
import { WeatherSubmitController } from './weather-submit.controller';
import { WeatherTemplateController } from './weather-template.controller';

import { WeatherValidateService } from './weather-validate.service';
import { WeatherSubmitService } from './weather-submit.service';
import { WeatherExcelService } from './weather-excel.service'; // ✅ add

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Weather.name, schema: WeatherSchema }]),
  ],
  controllers: [
    WeatherController,
    WeatherUploadController,
    WeatherValidateController,
    WeatherSubmitController,
    WeatherTemplateController,
  ],
  providers: [
    WeatherService,
    WeatherExcelService,        // ✅ add
    WeatherValidateService,
    WeatherSubmitService,
  ],
  exports: [WeatherService],
})
export class WeatherModule {}
