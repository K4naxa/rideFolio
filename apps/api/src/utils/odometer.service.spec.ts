import { OdometerService } from './odometer.service';
import { UnitConversionService } from './unit-conversion.service';
import { Vehicle } from 'prisma/generated/client';

describe('OdometerService', () => {
  let service: OdometerService;
  let unitConversion: UnitConversionService;

  beforeEach(() => {
    unitConversion = new UnitConversionService();
    // OdometerService depends on UnitConversionService and PrismaService.
    // We only test methods that don't touch Prisma, so we pass null for the prisma dependency.
    service = new OdometerService(unitConversion, null as any);
  });

  // ── getOdometerValues ───────────────────────────────────────────────

  describe('getOdometerValues', () => {
    const baseVehicle: Partial<Vehicle> = {
      odometer_km: 15000,
      odometer_hour: 500,
      lifetimeTotalTrackedUnits_km: 10000,
      lifetimeTotalTrackedUnits_hour: 300,
      lastRefillOdometer_km: 14800,
      lastRefillOdometer_hour: 490,
      initialOdometer_km: 5000,
      initialOdometer_hour: 200,
    };

    it('returns km data for KILOMETER odometer type', () => {
      const vehicle = { ...baseVehicle, odometerType: 'KILOMETER' } as Vehicle;
      const result = service.getOdometerValues(vehicle);

      expect(result).toEqual({
        value: 15000,
        lifeTimeTracked: 10000,
        lastRefillValue: 14800,
        unit: 'km',
        type: 'KILOMETER',
      });
    });

    it('returns hour data for HOUR odometer type', () => {
      const vehicle = { ...baseVehicle, odometerType: 'HOUR' } as Vehicle;
      const result = service.getOdometerValues(vehicle);

      expect(result).toEqual({
        value: 500,
        lifeTimeTracked: 300,
        lastRefillValue: 490,
        unit: 'h',
        type: 'HOUR',
      });
    });

    it('converts km to miles for MILE odometer type', () => {
      const vehicle = { ...baseVehicle, odometerType: 'MILE' } as Vehicle;
      const result = service.getOdometerValues(vehicle);

      expect(result.unit).toBe('mi');
      expect(result.type).toBe('MILE');
      expect(result.value).toBeCloseTo(unitConversion.kmToMiles(15000), 0);
      expect(result.lifeTimeTracked).toBeCloseTo(unitConversion.kmToMiles(10000), 0);
      expect(result.lastRefillValue).toBeCloseTo(unitConversion.kmToMiles(14800), 0);
    });

    it('handles null lastRefillOdometer for HOUR type', () => {
      const vehicle = { ...baseVehicle, odometerType: 'HOUR', lastRefillOdometer_hour: null } as Vehicle;
      const result = service.getOdometerValues(vehicle);

      expect(result.lastRefillValue).toBe(0);
    });

    it('handles null lastRefillOdometer for KILOMETER type', () => {
      const vehicle = { ...baseVehicle, odometerType: 'KILOMETER', lastRefillOdometer_km: null } as Vehicle;
      const result = service.getOdometerValues(vehicle);

      expect(result.lastRefillValue).toBe(0);
    });

    it('handles null lastRefillOdometer for MILE type', () => {
      const vehicle = { ...baseVehicle, odometerType: 'MILE', lastRefillOdometer_km: null } as Vehicle;
      const result = service.getOdometerValues(vehicle);

      expect(result.lastRefillValue).toBe(0);
    });
  });

  // ── getOdometerValueByType ──────────────────────────────────────────

  describe('getOdometerValueByType', () => {
    it('returns hour value for HOUR type', () => {
      const result = service.getOdometerValueByType(500, 15000, 'HOUR');
      expect(result).toEqual({ value: 500, unit: 'h', type: 'HOUR' });
    });

    it('returns km value for KILOMETER type', () => {
      const result = service.getOdometerValueByType(500, 15000, 'KILOMETER');
      expect(result).toEqual({ value: 15000, unit: 'km', type: 'KILOMETER' });
    });

    it('converts km to miles for MILE type', () => {
      const result = service.getOdometerValueByType(500, 160.934, 'MILE');
      expect(result.value).toBeCloseTo(100, 0);
      expect(result.unit).toBe('mi');
      expect(result.type).toBe('MILE');
    });

    it('treats null hour value as 0', () => {
      const result = service.getOdometerValueByType(null, 15000, 'HOUR');
      expect(result.value).toBe(0);
    });

    it('treats null km value as 0', () => {
      const result = service.getOdometerValueByType(500, null, 'KILOMETER');
      expect(result.value).toBe(0);
    });

    it('treats null km value as 0 for MILE type', () => {
      const result = service.getOdometerValueByType(500, null, 'MILE');
      expect(result.value).toBe(0);
    });
  });
});
