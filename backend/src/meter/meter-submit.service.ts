import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Meter, MeterDocument } from './meter.schema';

@Injectable()
export class MeterSubmitService {
  constructor(
    @InjectModel(Meter.name)
    private readonly meterModel: Model<MeterDocument>,
  ) {}

  async submitRows(rows: Record<string, any>[]) {
    if (!Array.isArray(rows)) {
      throw new BadRequestException('rows must be an array');
    }

    const ops = rows.map((r) => {
      const date = String(r?.Date ?? r?.date ?? '').trim();

      // Your current schema REQUIRES time.
      // Daily meter sheet usually won't have it, so we safely default.
      const time = String(r?.Time ?? r?.time ?? '00:00').trim();

      if (!date) {
        throw new BadRequestException('Each row must contain Date');
      }

      const doc: Partial<Meter> = {
        date,
        time,
        // Optional numeric fields (support multiple header styles)
        activeEnergyImport: this.num(r?.ActiveEnergyImport ?? r?.activeEnergyImport) ?? 0,
        activeEnergyExport: this.num(r?.ActiveEnergyExport ?? r?.activeEnergyExport) ?? 0,
        reactiveEnergyImport: this.num(r?.ReactiveEnergyImport ?? r?.reactiveEnergyImport) ?? 0,
        reactiveEnergyExport: this.num(r?.ReactiveEnergyExport ?? r?.reactiveEnergyExport) ?? 0,
        voltage: this.num(r?.Voltage ?? r?.voltage) ?? 0,
        current: this.num(r?.Current ?? r?.current) ?? 0,
        frequency: this.num(r?.Frequency ?? r?.frequency) ?? 0,
        powerFactor: this.num(r?.PowerFactor ?? r?.powerFactor) ?? 0,
      };

      return {
        updateOne: {
          filter: { date: doc.date, time: doc.time },
          update: { $set: doc },
          upsert: true,
        },
      };
    });

    const result = await this.meterModel.bulkWrite(ops, { ordered: false });

    // Some driver typings don't expose acknowledged on BulkWriteResult
    const acknowledged =
      (result as unknown as { acknowledged?: boolean }).acknowledged ?? true;

    return {
      acknowledged,
      insertedCount: result.insertedCount ?? 0,
      matchedCount: result.matchedCount ?? 0,
      modifiedCount: result.modifiedCount ?? 0,
      upsertedCount: result.upsertedCount ?? 0,
    };
  }

  private num(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
}
