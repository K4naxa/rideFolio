import { VehicleTransformerService, DB_BasicVehicle, DB_BasicVehicleWithGroups } from './vehicleTransformer.service';
import { OdometerService } from '../utils/odometer.service';
import { UnitConversionService } from '../utils/unit-conversion.service';

describe('VehicleTransformerService', () => {
  let service: VehicleTransformerService;

  beforeEach(() => {
    const unitConversion = new UnitConversionService();
    const odometerService = new OdometerService(unitConversion, null as any);
    service = new VehicleTransformerService(odometerService);
  });

  const baseVehicle: DB_BasicVehicle = {
    id: 'vehicle-1',
    name: 'My Car',
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    licensePlate: 'ABC-123',
    vin: '1234567890',
    fuelType: 'GASOLINE',
    image: null,
    odometerType: 'KILOMETER',
    odometer_km: 50000,
    odometer_hour: 0,
    lifetimeTotalTrackedUnits_km: 40000,
    lifetimeTotalTrackedUnits_hour: 0,
    lastRefillOdometer_km: 49500,
    lastRefillOdometer_hour: null,
    initialOdometer_km: 10000,
    initialOdometer_hour: 0,
    vehicleType: { code: 'CAR', nameKey: 'vehicle.types.car', icon: 'car-icon' },
  } as any;

  // ── toMinimalVehicle ────────────────────────────────────────────────

  describe('toMinimalVehicle', () => {
    it('returns only minimal fields', () => {
      const result = service.toMinimalVehicle(baseVehicle);

      expect(result).toEqual({
        id: 'vehicle-1',
        name: 'My Car',
        make: 'Toyota',
        model: 'Corolla',
        type: 'CAR',
        image: null,
      });
    });

    it('handles null make and model', () => {
      const vehicle = { ...baseVehicle, make: null, model: null } as any;
      const result = service.toMinimalVehicle(vehicle);
      expect(result.make).toBeNull();
      expect(result.model).toBeNull();
    });
  });

  // ── toBasicVehicle ──────────────────────────────────────────────────

  describe('toBasicVehicle', () => {
    it('transforms all fields correctly', () => {
      const result = service.toBasicVehicle(baseVehicle);

      expect(result.id).toBe('vehicle-1');
      expect(result.name).toBe('My Car');
      expect(result.make).toBe('Toyota');
      expect(result.model).toBe('Corolla');
      expect(result.year).toBe(2020);
      expect(result.licensePlate).toBe('ABC-123');
      expect(result.vin).toBe('1234567890');
      expect(result.fuelType).toBe('GASOLINE');
      expect(result.image).toBeNull();
    });

    it('includes vehicle type info', () => {
      const result = service.toBasicVehicle(baseVehicle);
      expect(result.type).toEqual({ code: 'CAR', nameKey: 'vehicle.types.car', icon: 'car-icon' });
    });

    it('includes odometer data with correct units', () => {
      const result = service.toBasicVehicle(baseVehicle);
      expect(result.odometerData.unit).toBe('km');
      expect(result.odometerData.type).toBe('KILOMETER');
      expect(result.odometerData.value).toBe(50000);
    });
  });

  // ── toAccessibleVehicle ─────────────────────────────────────────────

  describe('toAccessibleVehicle', () => {
    const vehicleWithGroups: DB_BasicVehicleWithGroups = {
      ...baseVehicle,
      ownerId: 'user-owner',
      groups: [{ group: { id: 'group-1', name: 'Family Cars' } }],
    } as any;

    it('marks owner correctly', () => {
      const result = service.toAccessibleVehicle(vehicleWithGroups, 'user-owner');
      expect(result.isOwnerUser).toBe(true);
    });

    it('marks non-owner correctly', () => {
      const result = service.toAccessibleVehicle(vehicleWithGroups, 'user-other');
      expect(result.isOwnerUser).toBe(false);
    });

    it('includes group info when present', () => {
      const result = service.toAccessibleVehicle(vehicleWithGroups, 'user-other');
      expect(result.group).toEqual({ id: 'group-1', name: 'Family Cars' });
    });

    it('returns null group when no groups', () => {
      const noGroups = { ...vehicleWithGroups, groups: [] } as any;
      const result = service.toAccessibleVehicle(noGroups, 'user-other');
      expect(result.group).toBeNull();
    });

    it('includes full vehicle data', () => {
      const result = service.toAccessibleVehicle(vehicleWithGroups, 'user-owner');
      expect(result.vehicleData.id).toBe('vehicle-1');
      expect(result.vehicleData.name).toBe('My Car');
    });
  });

  // ── DBInclude_BasicVehicle ──────────────────────────────────────────

  describe('DBInclude_BasicVehicle', () => {
    it('returns a valid Prisma include object', () => {
      expect(service.DBInclude_BasicVehicle).toHaveProperty('vehicleType');
    });
  });

  describe('DBInclude_BasicVehicleWithGroups', () => {
    it('returns include with groups filtered by user', () => {
      const include = service.DBInclude_BasicVehicleWithGroups('user-1');
      expect(include).toHaveProperty('vehicleType');
      expect(include).toHaveProperty('groups');
    });
  });
});
