import { Injectable } from '@nestjs/common';
import { User, Vehicle } from 'prisma/generated/client';
import { ConsumptionUnitCode, TConversionResult } from '@repo/validation';

@Injectable()
export class UnitConversionService {
  getVolumeDataByUnitType(volume_L: number, volumeUnitType: User['volumeUnit']): TConversionResult {
    switch (volumeUnitType) {
      case 'LITER':
        return {
          value: volume_L,
          unit: 'L',
          type: 'LITER',
        };

      case 'GALLON':
        return {
          value: Number(this.litersToGallons(volume_L).toFixed(1)),
          unit: 'gal',
          type: 'GALLON',
        };

      default:
        throw new Error(`Unsupported volume unit: ${String(volumeUnitType)}`);
    }
  }

  getOdometerDataByType(baseValue: number | null, odometerType: Vehicle['odometerType']): TConversionResult {
    if (baseValue === null) {
      baseValue = 0;
    }
    switch (odometerType) {
      case 'HOUR':
        return {
          value: baseValue,
          unit: 'h',
          type: 'HOUR',
        };
      case 'KILOMETER':
        return {
          value: baseValue,
          unit: 'km',
          type: 'KILOMETER',
        };
      case 'MILE':
        return {
          value: Number(this.kmToMiles(baseValue).toFixed(1)),
          unit: 'mi',
          type: 'MILE',
        };
    }
  }

  getBaseConsumptionFromBaseUnits(volume_L: number, units: number, isOdometerHourly: boolean): number {
    if (isOdometerHourly) {
      return units > 0 ? volume_L / units : 0; // L/h
    } else {
      return units > 0 ? (volume_L / units) * 100 : 0; // L/100km
    }
  }
  getConsumptionData(
    baseValue: number | null, // L/h OR L/100km depending on type
    preferredUnit: ConsumptionUnitCode,
    type: 'HOUR' | 'DISTANCE',
  ): TConversionResult {
    if (baseValue === null) {
      baseValue = 0;
    }

    if (type === 'HOUR') {
      switch (preferredUnit) {
        case 'LITERS_PER_HOUR':
          return {
            value: baseValue,
            unit: 'L/h',
            type: 'LITERS_PER_HOUR',
          };

        case 'HOURS_PER_LITER':
          return {
            value: Number((baseValue > 0 ? 1 / baseValue : 0).toFixed(1)),
            unit: 'h/L',
            type: 'HOURS_PER_LITER',
          };

        case 'GALLONS_PER_HOUR':
          return {
            value: this.litersToGallons(baseValue),
            unit: 'gal/h',
            type: 'GALLONS_PER_HOUR',
          };

        case 'HOURS_PER_GALLON':
          return {
            value: Number((baseValue > 0 ? 1 / this.litersToGallons(baseValue) : 0).toFixed(1)),
            unit: 'h/gal',
            type: 'HOURS_PER_GALLON',
          };

        default:
          throw new Error(`Unsupported hour consumption unit: ${String(preferredUnit)}`);
      }
    } else if (type === 'DISTANCE') {
      switch (preferredUnit) {
        case 'LITERS_PER_100KM':
          return {
            value: Number(baseValue.toFixed(1)),
            unit: 'L/100km',
            type: 'LITERS_PER_100KM',
          };

        case 'KILOMETERS_PER_LITER':
          return {
            value: Number((baseValue > 0 ? 100 / baseValue : 0).toFixed(1)),
            unit: 'km/L',
            type: 'KILOMETERS_PER_LITER',
          };

        case 'MILES_PER_LITER':
          return {
            value: Number((baseValue > 0 ? this.kmToMiles(100 / baseValue) : 0).toFixed(1)),
            unit: 'mi/L',
            type: 'MILES_PER_LITER',
          };

        case 'GALLONS_PER_100_MILES':
          // Formula: (L/100km) × (gal/L) × (100km/100mi)
          return {
            value: Number((baseValue > 0 ? (baseValue / 3.78541) * (100 / this.kmToMiles(100)) : 0).toFixed(1)),
            unit: 'gal/100mi',
            type: 'GALLONS_PER_100_MILES',
          };

        case 'MILES_PER_GALLON':
          // Formula: 235.214 / (L/100km)
          // Derivation: (100km → mi) / (L → gal) = 62.1371 / 0.264172 = 235.214
          return {
            value: Number((baseValue > 0 ? 235.214 / baseValue : 0).toFixed(1)),
            unit: 'mi/gal',
            type: 'MILES_PER_GALLON',
          };

        case 'KILOMETERS_PER_GALLON':
          return {
            value: Number((baseValue > 0 ? 100 / this.litersToGallons(baseValue) : 0).toFixed(1)),
            unit: 'km/gal',
            type: 'KILOMETERS_PER_GALLON',
          };

        case 'GALLONS_PER_LITER':
          return {
            value: Number((baseValue > 0 ? this.litersToGallons(1) : 0).toFixed(1)),
            unit: 'gal/L',
            type: 'GALLONS_PER_LITER',
          };

        default:
          throw new Error(`Unsupported distance consumption unit: ${String(preferredUnit)}`);
      }
    } else {
      throw new Error(`Unsupported consumption type: ${String(type)}`);
    }
  }

  // ** Helper functions for unit conversions
  milesToKm(miles: number | null | undefined): number {
    return Number(miles ? miles * 1.60934 : 0);
  }
  kmToMiles(km: number | null): number {
    return Number(km ? km / 1.60934 : 0);
  }

  gallonsToLiters(GALLON: number | null): number {
    return Number(GALLON ? GALLON * 3.78541 : 0);
  }

  litersToGallons(LITER: number | null): number {
    return Number(LITER ? LITER / 3.78541 : 0);
  }
  normalizeFuelAmount(fuelAmount: number, type: User['volumeUnit']): number {
    return type === 'GALLON' ? this.gallonsToLiters(fuelAmount) : fuelAmount;
  }
  normalizeOdometer(odometer: number, type: Vehicle['odometerType']): number {
    return type === 'MILE' ? this.milesToKm(odometer) : odometer;
  }

  getMBFromBytes(bytes: bigint): number {
    return Number(bytes) / (1024 * 1024);
  }
}
