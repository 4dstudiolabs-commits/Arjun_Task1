import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from './schemas/weather.schema';

@Injectable()
export class WeatherSubmitService {
  constructor(
    @InjectModel(Weather.name)
    private readonly weatherModel: Model<WeatherDocument>,
  ) {}

  async submitRows(rows: Record<string, any>[]) {
    if (!rows.length) {
      return {
        inserted: 0,
        skipped: 0,
        message: 'No data provided',
      };
    }

    const docsToInsert: any[] = [];
    let skipped = 0;

    for (const row of rows) {
      const date = row['Date'];
      const time = row['Time'];

      if (!date || !time) {
        skipped++;
        continue;
      }

      const exists = await this.weatherModel.exists({
        date,
        time,
      });

      if (exists) {
        skipped++;
        continue;
      }

      docsToInsert.push({
        date,
        time,
        poa: Number(row['POA']) || 0,
        ghi: Number(row['GHI']) || 0,
        albedoUp: Number(row['AlbedoUp']) || 0,
        albedoDown: Number(row['AlbedoDown']) || 0,
        moduleTemp: Number(row['ModuleTemp']) || 0,
        ambientTemp: Number(row['AmbientTemp']) || 0,
        windSpeed: Number(row['WindSpeed']) || 0,
        rainfall: Number(row['Rainfall']) || 0,
        humidity: Number(row['Humidity']) || 0,
      });
    }

    if (docsToInsert.length > 0) {
      await this.weatherModel.insertMany(docsToInsert);
    }

    return {
      inserted: docsToInsert.length,
      skipped,
      message: 'Weather data submission completed',
    };
  }
}
