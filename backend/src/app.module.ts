import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WeatherModule } from './weather/weather.module';
import { MeterModule } from './meter/meter.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://weatherMeter:WeatherOP@cluster0.f6x7db8.mongodb.net/?appName=Cluster0',
    ),
    HealthModule,
    WeatherModule,
    MeterModule,
  ],
})
export class AppModule {}
