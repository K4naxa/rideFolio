import { Injectable } from '@nestjs/common';
import { UnitConversionService } from '../../utils/unit-conversion.service';
import { RefillSelect } from '../../../prisma/generated/models/Refill';
import { Prisma, User } from '../../../prisma/generated/client';
import { TRefillForClient } from '@repo/validation';

@Injectable()
export class RefillsTransformerService {
  constructor(private readonly unitConversion: UnitConversionService) {}

  DB_refill_select() {
    return {
      id: true,
      date: true,
      odometer_km: true,
      odometer_hour: true,
      fullRefill: true,
      skippedRefill: true,
      fuelAmount_L: true,
      pricePerUnit: true,
      costTotal: true,
      consumption_L_per_100km: true,
      consumption_L_per_hour: true,
      notes: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      vehicle: {
        select: {
          id: true,
          odometer_hour: true,
          odometer_km: true,
          odometerType: true,
        },
      },
    } satisfies RefillSelect;
  }

  toClientRefill(refill: DB_ClientRefill, user: User): TRefillForClient {
    const isVehicleHourly = refill.vehicle.odometerType === 'HOUR';
    const userConsumptionUnit = isVehicleHourly ? user.consumptionUnitCode_hour : user.consumptionUnitCode_distance;
    const odometerBaseValue = isVehicleHourly ? refill.vehicle.odometer_hour : refill.vehicle.odometer_km;
    const consumptionBaseValue = isVehicleHourly ? refill.consumption_L_per_hour : refill.consumption_L_per_100km;
    const hourOrDistance = isVehicleHourly ? 'HOUR' : 'DISTANCE';

    return {
      id: refill.id,
      date: refill.date,
      fullRefill: refill.fullRefill,
      skippedRefill: refill.skippedRefill,
      notes: refill.notes,
      vehicleId: refill.vehicle.id,
      pricePerUnit: refill.pricePerUnit,
      costTotal: refill.costTotal,

      fuelVolume: this.unitConversion.getVolumeDataByUnitType(refill.fuelAmount_L, user.volumeUnit),
      odometer: this.unitConversion.getOdometerDataByType(odometerBaseValue, refill.vehicle.odometerType),
      consumption: this.unitConversion.getConsumptionData(consumptionBaseValue, userConsumptionUnit, hourOrDistance),
      creator: refill.user
        ? {
            name: refill.user.name,
            id: refill.user.id,
            image: refill.user.image,
          }
        : null,
    };
  }
}

export type DB_ClientRefill = Prisma.RefillGetPayload<{
  select: ReturnType<RefillsTransformerService['DB_refill_select']>;
}>;
