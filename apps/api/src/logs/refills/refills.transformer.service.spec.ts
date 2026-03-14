import { RefillsTransformerService, DB_ClientRefill } from './refills.transformer.service';
import { UnitConversionService } from '../../utils/unit-conversion.service';
import { User } from 'prisma/generated/client';

describe('RefillsTransformerService', () => {
  let service: RefillsTransformerService;
  let unitConversion: UnitConversionService;

  beforeEach(() => {
    unitConversion = new UnitConversionService();
    service = new RefillsTransformerService(unitConversion);
  });

  // ── DB_refill_select ────────────────────────────────────────────────

  describe('DB_refill_select', () => {
    it('returns a valid Prisma select object', () => {
      const select = service.DB_refill_select();
      expect(select).toHaveProperty('id', true);
      expect(select).toHaveProperty('date', true);
      expect(select).toHaveProperty('fuelAmount_L', true);
      expect(select).toHaveProperty('consumption_L_per_100km', true);
      expect(select).toHaveProperty('consumption_L_per_hour', true);
      expect(select).toHaveProperty('user');
      expect(select).toHaveProperty('vehicle');
    });
  });

  // ── toClientRefill ──────────────────────────────────────────────────

  describe('toClientRefill', () => {
    const baseUser = {
      volumeUnit: 'LITER',
      consumptionUnitCode_distance: 'LITERS_PER_100KM',
      consumptionUnitCode_hour: 'LITERS_PER_HOUR',
    } as User;

    const baseRefill: DB_ClientRefill = {
      id: 'refill-1',
      date: new Date('2025-01-15'),
      odometer_km: 15000,
      odometer_hour: null,
      fullRefill: true,
      skippedRefill: false,
      fuelAmount_L: 45,
      pricePerUnit: 1.85,
      costTotal: 83.25,
      consumption_L_per_100km: 7.5,
      consumption_L_per_hour: null,
      notes: 'Test note',
      user: { id: 'user-1', name: 'Test User', image: null },
      vehicle: { id: 'vehicle-1', odometer_km: 15000, odometer_hour: null, odometerType: 'KILOMETER' },
    };

    it('transforms a distance-based refill correctly', () => {
      const result = service.toClientRefill(baseRefill, baseUser);

      expect(result.id).toBe('refill-1');
      expect(result.date).toEqual(new Date('2025-01-15'));
      expect(result.fullRefill).toBe(true);
      expect(result.skippedRefill).toBe(false);
      expect(result.vehicleId).toBe('vehicle-1');
      expect(result.pricePerUnit).toBe(1.85);
      expect(result.costTotal).toBe(83.25);
      expect(result.notes).toBe('Test note');
    });

    it('uses correct volume unit from user preferences', () => {
      const result = service.toClientRefill(baseRefill, baseUser);
      expect(result.fuelVolume.unit).toBe('L');
      expect(result.fuelVolume.value).toBe(45);
    });

    it('converts volume to gallons when user prefers gallons', () => {
      const gallonUser = { ...baseUser, volumeUnit: 'GALLON' } as User;
      const result = service.toClientRefill(baseRefill, gallonUser);
      expect(result.fuelVolume.unit).toBe('gal');
      expect(result.fuelVolume.value).toBeCloseTo(unitConversion.litersToGallons(45), 0);
    });

    it('returns km odometer for KILOMETER vehicle', () => {
      const result = service.toClientRefill(baseRefill, baseUser);
      expect(result.odometer.unit).toBe('km');
      expect(result.odometer.value).toBe(15000);
    });

    it('returns consumption in L/100km for distance vehicle', () => {
      const result = service.toClientRefill(baseRefill, baseUser);
      expect(result.consumption).not.toBeNull();
      expect(result.consumption!.unit).toBe('L/100km');
      expect(result.consumption!.value).toBe(7.5);
    });

    it('converts consumption to MPG when user prefers it', () => {
      const mpgUser = { ...baseUser, consumptionUnitCode_distance: 'MILES_PER_GALLON' } as User;
      const result = service.toClientRefill(baseRefill, mpgUser);
      expect(result.consumption).not.toBeNull();
      expect(result.consumption!.unit).toBe('mi/gal');
      expect(result.consumption!.value).toBeCloseTo(235.214 / 7.5, 0);
    });

    it('transforms hourly vehicle refill correctly', () => {
      const hourlyRefill: DB_ClientRefill = {
        ...baseRefill,
        odometer_km: null,
        odometer_hour: 500,
        consumption_L_per_100km: null,
        consumption_L_per_hour: 3.5,
        vehicle: { id: 'vehicle-1', odometer_km: null, odometer_hour: 500, odometerType: 'HOUR' },
      };

      const result = service.toClientRefill(hourlyRefill, baseUser);
      expect(result.odometer.unit).toBe('h');
      expect(result.odometer.value).toBe(500);
      expect(result.consumption).not.toBeNull();
      expect(result.consumption!.unit).toBe('L/h');
      expect(result.consumption!.value).toBe(3.5);
    });

    it('transforms mile-based vehicle refill correctly', () => {
      const mileRefill: DB_ClientRefill = {
        ...baseRefill,
        vehicle: { id: 'vehicle-1', odometer_km: 15000, odometer_hour: null, odometerType: 'MILE' },
      };

      const result = service.toClientRefill(mileRefill, baseUser);
      expect(result.odometer.unit).toBe('mi');
      expect(result.odometer.type).toBe('MILE');
    });

    it('includes creator info when user exists', () => {
      const result = service.toClientRefill(baseRefill, baseUser);
      expect(result.creator).toEqual({ id: 'user-1', name: 'Test User', image: null });
    });

    it('returns null creator when user is null', () => {
      const refillNoUser: DB_ClientRefill = { ...baseRefill, user: null as any };
      const result = service.toClientRefill(refillNoUser, baseUser);
      expect(result.creator).toBeNull();
    });

    it('handles null consumption (partial refill)', () => {
      const partialRefill: DB_ClientRefill = {
        ...baseRefill,
        consumption_L_per_100km: null,
      };
      const result = service.toClientRefill(partialRefill, baseUser);
      // consumption should be computed from null base value → 0
      expect(result.consumption).not.toBeNull();
      expect(result.consumption!.value).toBe(0);
    });
  });
});
