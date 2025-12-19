import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from './schemas/weather.schema';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { UpdateWeatherDto } from './dto/update-weather.dto';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(Weather.name)
    private weatherModel: Model<WeatherDocument>,
  ) {}

  // CREATE
  async create(createWeatherDto: CreateWeatherDto): Promise<Weather> {
    // Module temperature cannot be 0 (business rule)
    if (createWeatherDto.moduleTemp === 0) {
      throw new ConflictException('Module temperature cannot be 0');
    }

    try {
      const createdWeather = new this.weatherModel(createWeatherDto);
      return await createdWeather.save();
    } catch (error) {
      // Duplicate date + time error
      if (error.code === 11000) {
        throw new ConflictException(
          'Weather record already exists for this date and time',
        );
      }
      throw error;
    }
  }

  // READ ALL
  async findAll(): Promise<Weather[]> {
    return this.weatherModel.find().sort({ date: 1, time: 1 }).exec();
  }

  // READ ONE
  async findOne(id: string): Promise<Weather> {
    const weather = await this.weatherModel.findById(id).exec();
    if (!weather) {
      throw new NotFoundException('Weather record not found');
    }
    return weather;
  }

  // UPDATE
  async update(
    id: string,
    updateWeatherDto: UpdateWeatherDto,
  ): Promise<Weather> {
    if (updateWeatherDto.moduleTemp === 0) {
      throw new ConflictException('Module temperature cannot be 0');
    }

    try {
      const updatedWeather = await this.weatherModel
        .findByIdAndUpdate(id, updateWeatherDto, { new: true })
        .exec();

      if (!updatedWeather) {
        throw new NotFoundException('Weather record not found');
      }

      return updatedWeather;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          'Duplicate date and time not allowed',
        );
      }
      throw error;
    }
  }

  // DELETE
  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.weatherModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Weather record not found');
    }
    return { message: 'Weather record deleted successfully' };
  }
}
