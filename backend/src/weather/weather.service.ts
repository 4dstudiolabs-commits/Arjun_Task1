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

  // This is the new method
  async getWeatherByDate(date: string) {
    const formattedDate = this.formatDate(date); // Normalize the date format
    const weatherData = await this.weatherModel.find({
      $or: [
        { date: formattedDate },
        { Date: formattedDate }, // Check both 'date' and 'Date' fields in case of format differences
      ],
    }).exec();

    return weatherData;
  }

  private formatDate(date: string) {
    // Add logic here to format the date to the standard format if necessary
    // Example: Normalize 'DD-MMM-YY' to 'YYYY-MM-DD' if required

    // Check if the date is already in 'DD-MMM-YY' or 'YYYY-MM-DD' format and return the normalized one.
    const datePattern = /^\d{2}-[A-Za-z]{3}-\d{2}$/; // Check for 'DD-MMM-YY'
    if (datePattern.test(date)) {
      // Convert 'DD-MMM-YY' to 'YYYY-MM-DD'
      const [day, month, year] = date.split('-');
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
      const formattedDate = `20${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return formattedDate;
    }

    return date; // If already in 'YYYY-MM-DD' format, return as is
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
