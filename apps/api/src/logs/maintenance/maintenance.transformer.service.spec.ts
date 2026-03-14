import { MaintenanceTransformerService } from './maintenance.transformer.service';
import { UnitConversionService } from '../../utils/unit-conversion.service';
import { MaintenancePartTransformer } from './maintenance-part.transformer';

describe('MaintenanceTransformerService', () => {
  let service: MaintenanceTransformerService;
  let unitConversion: UnitConversionService;
  let partTransformer: MaintenancePartTransformer;

  beforeEach(() => {
    unitConversion = new UnitConversionService();
    // Mock the part transformer — its own logic is tested separately
    partTransformer = {
      DB_MaintenancePart_Include: jest.fn().mockReturnValue({}),
      toDisplayFormat: jest.fn().mockReturnValue([{ groupId: 'g1', partId: 'p1', partCode: 'OIL', label: 'Oil', locations: [] }]),
    } as any;
    service = new MaintenanceTransformerService(unitConversion, partTransformer);
  });

  describe('DB_ClientMaintenance_include', () => {
    it('returns a valid Prisma include object', () => {
      const include = service.DB_ClientMaintenance_include();
      expect(include).toHaveProperty('vehicle', true);
      expect(include).toHaveProperty('parts');
    });
  });

  describe('toClientFormat', () => {
    const baseMaintenance = {
      id: 'maint-1',
      date: new Date('2025-03-01'),
      title: 'Oil Change',
      notes: 'Regular service',
      vehicleId: 'vehicle-1',
      serviceProvider: 'AutoShop',
      image: null,
      costTotal: 75,
      odometer_km: 20000,
      odometer_hour: null,
      vehicle: {
        id: 'vehicle-1',
        odometerType: 'KILOMETER' as const,
        odometer_km: 20000,
        odometer_hour: null,
      },
      parts: [],
    };

    it('transforms km-based maintenance correctly', () => {
      const result = service.toClientFormat(baseMaintenance as any);

      expect(result.id).toBe('maint-1');
      expect(result.title).toBe('Oil Change');
      expect(result.notes).toBe('Regular service');
      expect(result.serviceProvider).toBe('AutoShop');
      expect(result.costTotal).toBe(75);
      expect(result.odometerData.unit).toBe('km');
      expect(result.odometerData.value).toBe(20000);
    });

    it('transforms hour-based maintenance correctly', () => {
      const hourlyMaintenance = {
        ...baseMaintenance,
        odometer_km: null,
        odometer_hour: 500,
        vehicle: { ...baseMaintenance.vehicle, odometerType: 'HOUR' as const },
      };

      const result = service.toClientFormat(hourlyMaintenance as any);
      expect(result.odometerData.unit).toBe('h');
      expect(result.odometerData.value).toBe(500);
    });

    it('converts odometer to miles for MILE vehicle', () => {
      const mileMaintenance = {
        ...baseMaintenance,
        vehicle: { ...baseMaintenance.vehicle, odometerType: 'MILE' as const },
      };

      const result = service.toClientFormat(mileMaintenance as any);
      expect(result.odometerData.unit).toBe('mi');
      expect(result.odometerData.type).toBe('MILE');
      expect(result.odometerData.value).toBeCloseTo(unitConversion.kmToMiles(20000), 0);
    });

    it('delegates parts transformation to part transformer', () => {
      service.toClientFormat(baseMaintenance as any);
      expect(partTransformer.toDisplayFormat).toHaveBeenCalledWith(baseMaintenance.parts);
    });

    it('handles null odometer values', () => {
      const noOdometer = {
        ...baseMaintenance,
        odometer_km: null,
      };

      const result = service.toClientFormat(noOdometer as any);
      expect(result.odometerData.value).toBe(0);
    });
  });
});
