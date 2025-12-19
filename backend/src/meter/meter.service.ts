import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meter, MeterDocument } from './meter.schema';

interface FindAllOptions {
  startDate?: string;
  endDate?: string;
  limit?: number;
  skip?: number;
}

@Injectable()
export class MeterService {
  constructor(
    @InjectModel(Meter.name)
    private readonly meterModel: Model<MeterDocument>,
  ) {}

  // CREATE
  async create(createMeterDto: Record<string, any>): Promise<Meter> {
    const date = String(createMeterDto?.date ?? createMeterDto?.Date ?? '').trim();
    const time = String(createMeterDto?.time ?? createMeterDto?.Time ?? '00:00').trim();

    if (!date) {
      throw new BadRequestException('Date is required');
    }

    try {
      const doc = new this.meterModel({
        date,
        time,
        activeEnergyImport: this.toNumber(createMeterDto?.activeEnergyImport ?? createMeterDto?.ActiveEnergyImport) ?? 0,
        activeEnergyExport: this.toNumber(createMeterDto?.activeEnergyExport ?? createMeterDto?.ActiveEnergyExport) ?? 0,
        reactiveEnergyImport: this.toNumber(createMeterDto?.reactiveEnergyImport ?? createMeterDto?.ReactiveEnergyImport) ?? 0,
        reactiveEnergyExport: this.toNumber(createMeterDto?.reactiveEnergyExport ?? createMeterDto?.ReactiveEnergyExport) ?? 0,
        voltage: this.toNumber(createMeterDto?.voltage ?? createMeterDto?.Voltage) ?? 0,
        current: this.toNumber(createMeterDto?.current ?? createMeterDto?.Current) ?? 0,
        frequency: this.toNumber(createMeterDto?.frequency ?? createMeterDto?.Frequency) ?? 0,
        powerFactor: this.toNumber(createMeterDto?.powerFactor ?? createMeterDto?.PowerFactor) ?? 0,
      });

      return await doc.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Meter record already exists for this date and time');
      }
      throw error;
    }
  }

  // READ ALL with filters
  async findAll(options: FindAllOptions = {}): Promise<{ data: Meter[]; total: number }> {
    const { startDate, endDate, limit = 100, skip = 0 } = options;

    const filter: Record<string, any> = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const [data, total] = await Promise.all([
      this.meterModel
        .find(filter)
        .sort({ date: -1, time: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.meterModel.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  // READ ONE by ID
  async findOne(id: string): Promise<Meter | null> {
    try {
      return await this.meterModel.findById(id).lean().exec();
    } catch {
      return null;
    }
  }

  // READ by date
  async findByDate(date: string): Promise<Meter[]> {
    return this.meterModel
      .find({ date })
      .sort({ time: 1 })
      .lean()
      .exec();
  }

  // UPDATE
  async update(id: string, updateMeterDto: Record<string, any>): Promise<Meter | null> {
    try {
      const updateData: Partial<Meter> = {};

      if (updateMeterDto.date !== undefined) updateData.date = String(updateMeterDto.date).trim();
      if (updateMeterDto.time !== undefined) updateData.time = String(updateMeterDto.time).trim();
      if (updateMeterDto.activeEnergyImport !== undefined) updateData.activeEnergyImport = this.toNumber(updateMeterDto.activeEnergyImport) ?? 0;
      if (updateMeterDto.activeEnergyExport !== undefined) updateData.activeEnergyExport = this.toNumber(updateMeterDto.activeEnergyExport) ?? 0;
      if (updateMeterDto.reactiveEnergyImport !== undefined) updateData.reactiveEnergyImport = this.toNumber(updateMeterDto.reactiveEnergyImport) ?? 0;
      if (updateMeterDto.reactiveEnergyExport !== undefined) updateData.reactiveEnergyExport = this.toNumber(updateMeterDto.reactiveEnergyExport) ?? 0;
      if (updateMeterDto.voltage !== undefined) updateData.voltage = this.toNumber(updateMeterDto.voltage) ?? 0;
      if (updateMeterDto.current !== undefined) updateData.current = this.toNumber(updateMeterDto.current) ?? 0;
      if (updateMeterDto.frequency !== undefined) updateData.frequency = this.toNumber(updateMeterDto.frequency) ?? 0;
      if (updateMeterDto.powerFactor !== undefined) updateData.powerFactor = this.toNumber(updateMeterDto.powerFactor) ?? 0;

      const updated = await this.meterModel
        .findByIdAndUpdate(id, { $set: updateData }, { new: true })
        .lean()
        .exec();

      return updated;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Duplicate date and time not allowed');
      }
      return null;
    }
  }

  // DELETE ONE
  async remove(id: string): Promise<Meter | null> {
    try {
      return await this.meterModel.findByIdAndDelete(id).lean().exec();
    } catch {
      return null;
    }
  }

  // DELETE MANY
  async removeMany(ids: string[]): Promise<{ deletedCount: number }> {
    const result = await this.meterModel.deleteMany({ _id: { $in: ids } }).exec();
    return { deletedCount: result.deletedCount ?? 0 };
  }

  private toNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
}