import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from './schemas/weather.schema';

@Injectable()
export class WeatherService {
  constructor(@InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>) {}

  async create(createWeatherDto: any) {
    const createdWeather = new this.weatherModel(createWeatherDto);
    return await createdWeather.save();
  }

  async findAllWithFilters(filters: any) {
    return this.weatherModel.find(filters).exec();
  }

  async findOne(id: string) {
    return this.weatherModel.findById(id).exec();
  }

  async findByDate(date: string) {
    return this.weatherModel.find({ date }).exec();
  }

  async update(id: string, updateWeatherDto: any) {
    return this.weatherModel.findByIdAndUpdate(id, updateWeatherDto, { new: true }).exec();
  }

  async remove(id: string) {
    return this.weatherModel.findByIdAndDelete(id).exec();
  }

  async removeMany(ids: string[]) {
    return this.weatherModel.deleteMany({ _id: { $in: ids } }).exec();
  }
}
