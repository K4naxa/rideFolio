import { TodoFormatterService } from './todoFormatter.service';
import { UnitConversionService } from '../utils/unit-conversion.service';
import { Todo, Vehicle } from 'prisma/generated/client';

describe('TodoFormatterService', () => {
  let service: TodoFormatterService;

  beforeEach(() => {
    const unitConversion = new UnitConversionService();
    service = new TodoFormatterService(unitConversion);
  });

  // ── formatDueDate ───────────────────────────────────────────────────

  describe('formatDueDate', () => {
    it('returns null when dueDate is null', () => {
      expect(service.formatDueDate(null)).toBeNull();
    });

    it('returns overdue=true for a past date', () => {
      const pastDate = new Date('2020-01-01');
      const result = service.formatDueDate(pastDate);
      expect(result).not.toBeNull();
      expect(result!.date).toEqual(pastDate);
      expect(result!.overdue).toBe(true);
    });

    it('returns overdue=false for a future date', () => {
      const futureDate = new Date('2099-12-31');
      const result = service.formatDueDate(futureDate);
      expect(result).not.toBeNull();
      expect(result!.overdue).toBe(false);
    });
  });

  // ── formatDueOdometer ───────────────────────────────────────────────

  describe('formatDueOdometer', () => {
    const baseVehicle = {
      odometerType: 'KILOMETER',
      odometer_km: 15000,
      odometer_hour: 0,
    } as Vehicle;

    it('returns null when no due odometer is set', () => {
      const todo = { dueOdometer_hour: null, dueOdometer_km: null } as Todo;
      expect(service.formatDueOdometer(todo, baseVehicle)).toBeNull();
    });

    it('returns null when both due odometer values are 0', () => {
      const todo = { dueOdometer_hour: 0, dueOdometer_km: 0 } as Todo;
      expect(service.formatDueOdometer(todo, baseVehicle)).toBeNull();
    });

    it('returns overdue=true when vehicle odometer has passed due odometer', () => {
      const todo = { dueOdometer_km: 14000, dueOdometer_hour: null } as Todo;
      const result = service.formatDueOdometer(todo, baseVehicle);

      expect(result).not.toBeNull();
      expect(result!.overdue).toBe(true);
      expect(result!.unit).toBe('km');
    });

    it('returns overdue=false when vehicle odometer is below due odometer', () => {
      const todo = { dueOdometer_km: 20000, dueOdometer_hour: null } as Todo;
      const result = service.formatDueOdometer(todo, baseVehicle);

      expect(result).not.toBeNull();
      expect(result!.overdue).toBe(false);
      expect(result!.remaining).toBe(5000);
    });

    it('works with HOUR odometer type', () => {
      const hourVehicle = { odometerType: 'HOUR', odometer_hour: 500, odometer_km: 0 } as Vehicle;
      const todo = { dueOdometer_hour: 600, dueOdometer_km: null } as Todo;
      const result = service.formatDueOdometer(todo, hourVehicle);

      expect(result).not.toBeNull();
      expect(result!.unit).toBe('h');
      expect(result!.overdue).toBe(false);
      expect(result!.remaining).toBe(100);
    });

    it('calculates remaining correctly when exactly at due odometer', () => {
      const todo = { dueOdometer_km: 15000, dueOdometer_hour: null } as Todo;
      const result = service.formatDueOdometer(todo, baseVehicle);

      expect(result!.overdue).toBe(true);
      expect(result!.remaining).toBe(0);
    });
  });

  // ── toBaseTodo ──────────────────────────────────────────────────────

  describe('toBaseTodo', () => {
    const baseDbTodo = {
      id: 'todo-1',
      title: 'Change oil',
      description: 'Use synthetic oil',
      isCompleted: false,
      vehicleId: 'vehicle-1',
      dueDate: null,
      dueOdometer_km: null,
      dueOdometer_hour: null,
      createdAt: new Date('2025-01-01'),
      completedAt_date: null,
      completedAt_km: null,
      completedAt_hour: null,
      completedById: null,
      createdBy: { name: 'Test User', image: null },
      completedBy: null,
      vehicle: {
        id: 'vehicle-1',
        odometerType: 'KILOMETER' as const,
        odometer_km: 15000,
        odometer_hour: 0,
      },
    };

    it('transforms a basic incomplete todo', () => {
      const result = service.toBaseTodo(baseDbTodo as any);

      expect(result.id).toBe('todo-1');
      expect(result.title).toBe('Change oil');
      expect(result.description).toBe('Use synthetic oil');
      expect(result.isCompleted).toBe(false);
      expect(result.vehicleId).toBe('vehicle-1');
      expect(result.dueDate).toBeNull();
      expect(result.dueOdometer).toBeNull();
      expect(result.completedData).toBeNull();
    });

    it('transforms a completed todo with completion data', () => {
      const completedTodo = {
        ...baseDbTodo,
        isCompleted: true,
        completedAt_date: new Date('2025-03-01'),
        completedAt_km: 16000,
        completedAt_hour: null,
        completedBy: { id: 'user-2', name: 'Other User', image: 'img.jpg' },
      };

      const result = service.toBaseTodo(completedTodo as any);

      expect(result.isCompleted).toBe(true);
      expect(result.completedData).not.toBeNull();
      expect(result.completedData!.date).toEqual(new Date('2025-03-01'));
      expect(result.completedData!.user).toEqual({ id: 'user-2', name: 'Other User', image: 'img.jpg' });
      expect(result.completedData!.odometer.unit).toBe('km');
      expect(result.completedData!.odometer.value).toBe(16000);
    });

    it('includes due date when set', () => {
      const todoWithDueDate = { ...baseDbTodo, dueDate: new Date('2099-12-31') };
      const result = service.toBaseTodo(todoWithDueDate as any);

      expect(result.dueDate).not.toBeNull();
      expect(result.dueDate!.overdue).toBe(false);
    });

    it('includes due odometer when set', () => {
      const todoWithOdometer = { ...baseDbTodo, dueOdometer_km: 20000 };
      const result = service.toBaseTodo(todoWithOdometer as any);

      expect(result.dueOdometer).not.toBeNull();
      expect(result.dueOdometer!.value).toBe(20000);
      expect(result.dueOdometer!.remaining).toBe(5000);
    });
  });
});
