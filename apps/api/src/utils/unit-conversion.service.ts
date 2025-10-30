import { Injectable } from '@nestjs/common';
import { User, Vehicle } from '@prisma/client';
import { TConversionResult } from '@repo/validation';

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
          value: this.litersToGallons(volume_L),
          unit: 'gal',
          type: 'GALLON',
        };

      default:
        throw new Error(`Unsupported volume unit: ${String(volumeUnitType)}`);
    }
  }

  getOdometerDataByType(baseValue: number | null, odometerType: Vehicle['odometerType']): TConversionResult {
    if (baseValue === null) {
      console.error('❌ Base value for odometer is null, cannot convert.');
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
          value: this.kmToMiles(baseValue),
          unit: 'mi',
          type: 'MILE',
        };
    }
  }

  getConsumptionData(
    baseValue: number | null, // L/h OR L/100km depending on type
    preferredUnit: User['consumptionUnit_hour'] | User['consumptionUnit_distance'],
    type: 'HOUR' | 'DISTANCE',
  ): TConversionResult {
    if (baseValue === null) {
      console.error('❌ Base value for consumption is null, cannot convert.');
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
          return {
            value: Number((baseValue > 0 ? this.litersToGallons(baseValue) / this.kmToMiles(100) : 0).toFixed(1)),
            unit: 'gal/100mi',
            type: 'GALLONS_PER_100_MILES',
          };

        case 'MILES_PER_GALLON':
          return {
            value: Number((baseValue > 0 ? this.kmToMiles(100) / this.litersToGallons(baseValue) : 0).toFixed(1)),
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
  milesToKm(miles: number | null): number {
    return Number((miles ? miles * 1.60934 : 0).toFixed(1));
  }
  kmToMiles(km: number | null): number {
    return Number((km ? km / 1.60934 : 0).toFixed(1));
  }

  gallonsToLiters(GALLON: number | null): number {
    return Number((GALLON ? GALLON * 3.78541 : 0).toFixed(1));
  }

  litersToGallons(LITER: number | null): number {
    return Number((LITER ? LITER / 3.78541 : 0).toFixed(1));
  }
  normalizeFuelAmount(fuelAmount: number, type: User['volumeUnit']): number {
    return type === 'GALLON' ? this.litersToGallons(fuelAmount) : fuelAmount;
  }
  normalizeOdometer(odometer: number, type: Vehicle['odometerType']): number {
    return type === 'MILE' ? this.milesToKm(odometer) : odometer;
  }
}
