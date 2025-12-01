import { Injectable } from '@nestjs/common';
import { Vehicle } from 'prisma/generated/prisma/client';
import { TOdometerData } from '@repo/validation';
import { PrismaService } from 'src/prisma/prisma.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';

@Injectable()
export class OdometerService {
  constructor(
    private unitConversion: UnitConversionService,
    private prisma: PrismaService,
  ) {}

  getOdometerValues(vehicle: Vehicle): TOdometerData {
    switch (vehicle.odometerType) {
      case 'HOUR':
        return {
          value: vehicle.odometer_hour,
          lifeTimeTracked: vehicle.lifetimeTotalTrackedUnits_hour,
          lastRefillValue: vehicle.lastRefillOdometer_hour ?? 0,
          unit: 'h',
          type: 'HOUR',
        };
      case 'KILOMETER':
        return {
          value: vehicle.odometer_km,
          lifeTimeTracked: vehicle.lifetimeTotalTrackedUnits_km,
          lastRefillValue: vehicle.lastRefillOdometer_km ?? 0,
          unit: 'km',
          type: 'KILOMETER',
        };

      case 'MILE':
        return {
          value: this.unitConversion.kmToMiles(vehicle.odometer_km),
          lifeTimeTracked: this.unitConversion.kmToMiles(vehicle.lifetimeTotalTrackedUnits_km),
          lastRefillValue: this.unitConversion.kmToMiles(vehicle.lastRefillOdometer_km ?? 0),
          unit: 'mi',
          type: 'MILE',
        };
    }
  }

  getOdometerValueByType(
    hourValue: number | null,
    kmValue: number | null,
    type: Vehicle['odometerType'],
  ): { value: number; unit: string; type: Vehicle['odometerType'] } {
    switch (type) {
      case 'HOUR':
        return {
          value: hourValue ?? 0,
          unit: 'h',
          type: 'HOUR',
        };
      case 'KILOMETER':
        return {
          value: kmValue ?? 0,
          unit: 'km',
          type: 'KILOMETER',
        };
      case 'MILE':
        return {
          value: this.unitConversion.kmToMiles(kmValue ?? 0),
          unit: 'mi',
          type: 'MILE',
        };
    }
  }
}
