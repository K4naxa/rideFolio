import { UnitConversionService } from './unit-conversion.service';

describe('UnitConversionService', () => {
  let service: UnitConversionService;

  beforeEach(() => {
    service = new UnitConversionService();
  });

  // ── Helper conversions ──────────────────────────────────────────────

  describe('milesToKm', () => {
    it('converts miles to kilometers', () => {
      expect(service.milesToKm(100)).toBeCloseTo(160.934, 2);
    });

    it('returns 0 for null', () => {
      expect(service.milesToKm(null)).toBe(0);
    });

    it('returns 0 for undefined', () => {
      expect(service.milesToKm(undefined)).toBe(0);
    });

    it('returns 0 for 0', () => {
      expect(service.milesToKm(0)).toBe(0);
    });
  });

  describe('kmToMiles', () => {
    it('converts kilometers to miles', () => {
      expect(service.kmToMiles(160.934)).toBeCloseTo(100, 1);
    });

    it('returns 0 for null', () => {
      expect(service.kmToMiles(null)).toBe(0);
    });

    it('returns 0 for 0', () => {
      expect(service.kmToMiles(0)).toBe(0);
    });
  });

  describe('gallonsToLiters', () => {
    it('converts gallons to liters', () => {
      expect(service.gallonsToLiters(1)).toBeCloseTo(3.78541, 3);
    });

    it('returns 0 for null', () => {
      expect(service.gallonsToLiters(null)).toBe(0);
    });

    it('returns 0 for 0', () => {
      expect(service.gallonsToLiters(0)).toBe(0);
    });
  });

  describe('litersToGallons', () => {
    it('converts liters to gallons', () => {
      expect(service.litersToGallons(3.78541)).toBeCloseTo(1, 3);
    });

    it('returns 0 for null', () => {
      expect(service.litersToGallons(null)).toBe(0);
    });
  });

  // ── Normalize helpers ───────────────────────────────────────────────

  describe('normalizeFuelAmount', () => {
    it('returns liters as-is for LITER type', () => {
      expect(service.normalizeFuelAmount(50, 'LITER')).toBe(50);
    });

    it('converts gallons to liters for GALLON type', () => {
      expect(service.normalizeFuelAmount(10, 'GALLON')).toBeCloseTo(37.8541, 2);
    });
  });

  describe('normalizeOdometer', () => {
    it('returns km as-is for KILOMETER type', () => {
      expect(service.normalizeOdometer(10000, 'KILOMETER')).toBe(10000);
    });

    it('returns value as-is for HOUR type', () => {
      expect(service.normalizeOdometer(500, 'HOUR')).toBe(500);
    });

    it('converts miles to km for MILE type', () => {
      expect(service.normalizeOdometer(100, 'MILE')).toBeCloseTo(160.934, 2);
    });
  });

  // ── getVolumeDataByUnitType ─────────────────────────────────────────

  describe('getVolumeDataByUnitType', () => {
    it('returns liters directly for LITER unit', () => {
      const result = service.getVolumeDataByUnitType(50, 'LITER');
      expect(result).toEqual({ value: 50, unit: 'L', type: 'LITER' });
    });

    it('converts to gallons for GALLON unit', () => {
      const result = service.getVolumeDataByUnitType(3.78541, 'GALLON');
      expect(result.value).toBeCloseTo(1, 0);
      expect(result.unit).toBe('gal');
      expect(result.type).toBe('GALLON');
    });

    it('throws for unsupported unit', () => {
      expect(() => service.getVolumeDataByUnitType(50, 'INVALID' as any)).toThrow('Unsupported volume unit');
    });
  });

  // ── getOdometerDataByType ───────────────────────────────────────────

  describe('getOdometerDataByType', () => {
    it('returns km data for KILOMETER type', () => {
      expect(service.getOdometerDataByType(15000, 'KILOMETER')).toEqual({
        value: 15000,
        unit: 'km',
        type: 'KILOMETER',
      });
    });

    it('returns hour data for HOUR type', () => {
      expect(service.getOdometerDataByType(500, 'HOUR')).toEqual({
        value: 500,
        unit: 'h',
        type: 'HOUR',
      });
    });

    it('converts km to miles for MILE type', () => {
      const result = service.getOdometerDataByType(160.934, 'MILE');
      expect(result.value).toBeCloseTo(100, 0);
      expect(result.unit).toBe('mi');
      expect(result.type).toBe('MILE');
    });

    it('treats null as 0', () => {
      expect(service.getOdometerDataByType(null, 'KILOMETER')).toEqual({
        value: 0,
        unit: 'km',
        type: 'KILOMETER',
      });
    });
  });

  // ── getBaseConsumptionFromBaseUnits ──────────────────────────────────

  describe('getBaseConsumptionFromBaseUnits', () => {
    it('calculates L/100km for distance-based odometer', () => {
      // 50L over 500km = 10 L/100km
      expect(service.getBaseConsumptionFromBaseUnits(50, 500, false)).toBeCloseTo(10, 5);
    });

    it('calculates L/h for hourly odometer', () => {
      // 20L over 10h = 2 L/h
      expect(service.getBaseConsumptionFromBaseUnits(20, 10, true)).toBeCloseTo(2, 5);
    });

    it('returns 0 when units is 0 (distance)', () => {
      expect(service.getBaseConsumptionFromBaseUnits(50, 0, false)).toBe(0);
    });

    it('returns 0 when units is 0 (hourly)', () => {
      expect(service.getBaseConsumptionFromBaseUnits(50, 0, true)).toBe(0);
    });
  });

  // ── getConsumptionData — DISTANCE type ──────────────────────────────

  describe('getConsumptionData (DISTANCE)', () => {
    it('returns L/100km directly', () => {
      const result = service.getConsumptionData(8.5, 'LITERS_PER_100KM', 'DISTANCE');
      expect(result).toEqual({ value: 8.5, unit: 'L/100km', type: 'LITERS_PER_100KM' });
    });

    it('converts L/100km to km/L', () => {
      // 10 L/100km => 100/10 = 10 km/L
      const result = service.getConsumptionData(10, 'KILOMETERS_PER_LITER', 'DISTANCE');
      expect(result.value).toBeCloseTo(10, 0);
      expect(result.unit).toBe('km/L');
    });

    it('converts L/100km to MPG', () => {
      // 235.214 / 10 = 23.5 MPG
      const result = service.getConsumptionData(10, 'MILES_PER_GALLON', 'DISTANCE');
      expect(result.value).toBeCloseTo(23.5, 0);
      expect(result.unit).toBe('mi/gal');
    });

    it('converts L/100km to mi/L', () => {
      const result = service.getConsumptionData(10, 'MILES_PER_LITER', 'DISTANCE');
      expect(result.value).toBeCloseTo(6.2, 0);
      expect(result.unit).toBe('mi/L');
    });

    it('converts L/100km to gal/100mi', () => {
      const result = service.getConsumptionData(10, 'GALLONS_PER_100_MILES', 'DISTANCE');
      expect(result.value).toBeGreaterThan(0);
      expect(result.unit).toBe('gal/100mi');
    });

    it('converts L/100km to km/gal', () => {
      const result = service.getConsumptionData(10, 'KILOMETERS_PER_GALLON', 'DISTANCE');
      expect(result.value).toBeGreaterThan(0);
      expect(result.unit).toBe('km/gal');
    });

    it('handles 0 base value for all distance units', () => {
      expect(service.getConsumptionData(0, 'LITERS_PER_100KM', 'DISTANCE').value).toBe(0);
      expect(service.getConsumptionData(0, 'KILOMETERS_PER_LITER', 'DISTANCE').value).toBe(0);
      expect(service.getConsumptionData(0, 'MILES_PER_GALLON', 'DISTANCE').value).toBe(0);
      expect(service.getConsumptionData(0, 'MILES_PER_LITER', 'DISTANCE').value).toBe(0);
      expect(service.getConsumptionData(0, 'GALLONS_PER_100_MILES', 'DISTANCE').value).toBe(0);
      expect(service.getConsumptionData(0, 'KILOMETERS_PER_GALLON', 'DISTANCE').value).toBe(0);
    });

    it('handles null base value', () => {
      const result = service.getConsumptionData(null, 'LITERS_PER_100KM', 'DISTANCE');
      expect(result.value).toBe(0);
    });

    it('throws for unsupported distance unit', () => {
      expect(() => service.getConsumptionData(10, 'LITERS_PER_HOUR' as any, 'DISTANCE')).toThrow(
        'Unsupported distance consumption unit',
      );
    });
  });

  // ── getConsumptionData — HOUR type ──────────────────────────────────

  describe('getConsumptionData (HOUR)', () => {
    it('returns L/h directly', () => {
      const result = service.getConsumptionData(5, 'LITERS_PER_HOUR', 'HOUR');
      expect(result).toEqual({ value: 5, unit: 'L/h', type: 'LITERS_PER_HOUR' });
    });

    it('converts to h/L', () => {
      // 5 L/h => 1/5 = 0.2 h/L
      const result = service.getConsumptionData(5, 'HOURS_PER_LITER', 'HOUR');
      expect(result.value).toBeCloseTo(0.2, 1);
      expect(result.unit).toBe('h/L');
    });

    it('converts to gal/h', () => {
      const result = service.getConsumptionData(3.78541, 'GALLONS_PER_HOUR', 'HOUR');
      expect(result.value).toBeCloseTo(1, 0);
      expect(result.unit).toBe('gal/h');
    });

    it('converts to h/gal', () => {
      const result = service.getConsumptionData(3.78541, 'HOURS_PER_GALLON', 'HOUR');
      expect(result.value).toBeCloseTo(1, 0);
      expect(result.unit).toBe('h/gal');
    });

    it('handles 0 base value for all hour units', () => {
      expect(service.getConsumptionData(0, 'LITERS_PER_HOUR', 'HOUR').value).toBe(0);
      expect(service.getConsumptionData(0, 'HOURS_PER_LITER', 'HOUR').value).toBe(0);
      expect(service.getConsumptionData(0, 'GALLONS_PER_HOUR', 'HOUR').value).toBe(0);
      expect(service.getConsumptionData(0, 'HOURS_PER_GALLON', 'HOUR').value).toBe(0);
    });

    it('throws for unsupported hour unit', () => {
      expect(() => service.getConsumptionData(10, 'LITERS_PER_100KM' as any, 'HOUR')).toThrow(
        'Unsupported hour consumption unit',
      );
    });
  });

  // ── getConsumptionData — invalid type ───────────────────────────────

  describe('getConsumptionData (invalid type)', () => {
    it('throws for unsupported consumption type', () => {
      expect(() => service.getConsumptionData(10, 'LITERS_PER_100KM', 'INVALID' as any)).toThrow(
        'Unsupported consumption type',
      );
    });
  });

  // ── getMBFromBytes ──────────────────────────────────────────────────

  describe('getMBFromBytes', () => {
    it('converts bytes to megabytes', () => {
      expect(service.getMBFromBytes(BigInt(1024 * 1024))).toBeCloseTo(1, 5);
    });

    it('returns 0 for 0 bytes', () => {
      expect(service.getMBFromBytes(BigInt(0))).toBe(0);
    });
  });

  // ── Round-trip consistency ──────────────────────────────────────────

  describe('round-trip conversions', () => {
    it('miles -> km -> miles returns approximately the original', () => {
      const original = 62.1371;
      const km = service.milesToKm(original);
      const backToMiles = service.kmToMiles(km);
      expect(backToMiles).toBeCloseTo(original, 2);
    });

    it('gallons -> liters -> gallons returns approximately the original', () => {
      const original = 10;
      const liters = service.gallonsToLiters(original);
      const backToGallons = service.litersToGallons(liters);
      expect(backToGallons).toBeCloseTo(original, 2);
    });
  });
});
