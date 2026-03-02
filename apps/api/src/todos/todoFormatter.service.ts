import { Injectable } from '@nestjs/common';
import { BaseTodo } from '@repo/validation';
import { Todo, Vehicle } from 'prisma/generated/client';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { TodoGetPayload, TodoInclude } from '../../prisma/generated/models/Todo';

@Injectable()
export class TodoFormatterService {
  constructor(private readonly unitConversion: UnitConversionService) {}

  DB_include_baseTodo() {
    return {
      createdBy: {
        select: {
          name: true,
          image: true,
        },
      },
      vehicle: true,
      completedBy: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    } satisfies TodoInclude;
  }

  DB_include_todoWithVehicle() {
    return {
      createdBy: {
        select: {
          name: true,
          image: true,
        },
      },
      vehicle: {
        include: {
          vehicleType: {
            select: {
              code: true,
              nameKey: true,
              icon: true,
            },
          },
        },
      },
      completedBy: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    };
  }

  toBaseTodo(baseTodo: DB_baseTodo): BaseTodo {
    return {
      id: baseTodo.id,
      title: baseTodo.title,
      description: baseTodo.description,
      priority: baseTodo.priority || null,
      isCompleted: baseTodo.isCompleted,
      vehicleId: baseTodo.vehicleId,
      dueDate: this.formatDueDate(baseTodo.dueDate),
      dueOdometer: this.formatDueOdometer(baseTodo, baseTodo.vehicle),
      createdData: this.formatCreatedData(baseTodo),
      completedData: this.formatCompletedData(baseTodo),
    };
  }

  private formatCompletedData(todo: DB_baseTodo): BaseTodo['completedData'] {
    if (!todo.isCompleted) {
      return null;
    }

    return {
      user: todo.completedBy
        ? {
            id: todo.completedBy.id,
            name: todo.completedBy.name,
            image: todo.completedBy.image ?? null,
          }
        : null,
      date: todo.completedAt_date,
      odometer: this.unitConversion.getOdometerDataByType(
        todo.vehicle.odometerType === 'HOUR' ? todo.completedAt_hour || 0 : todo.completedAt_km || 0,
        todo.vehicle.odometerType,
      ),
    };
  }

  private formatCreatedData(todo: DB_baseTodo): BaseTodo['createdData'] {
    return {
      user: todo.completedBy
        ? {
            id: todo.completedBy.id,
            name: todo.completedBy.name,
            image: todo.completedBy.image ?? null,
          }
        : null,
      date: todo.createdAt,
    };
  }

  formatDueDate(dueDate: Date | null): BaseTodo['dueDate'] {
    if (!dueDate) return null;

    return {
      date: dueDate,
      overdue: new Date() > dueDate,
    };
  }

  formatDueOdometer(todo: Todo, vehicle: Vehicle): BaseTodo['dueOdometer'] {
    // Check if todo has any odometer value set
    if (!todo.dueOdometer_hour && !todo.dueOdometer_km) {
      return null;
    }

    const todoBaseOdometer = this.getTodoBaseOdometer(todo, vehicle);
    const vehicleBaseOdometer = this.getVehicleBaseOdometer(vehicle);

    return {
      ...this.unitConversion.getOdometerDataByType(todoBaseOdometer, vehicle.odometerType),
      overdue: vehicleBaseOdometer >= todoBaseOdometer,
      remaining: todoBaseOdometer - vehicleBaseOdometer,
    };
  }

  private getVehicleBaseOdometer(vehicle: Vehicle): number {
    return vehicle.odometerType === 'HOUR' ? vehicle.odometer_hour || 0 : vehicle.odometer_km || 0;
  }

  private getTodoBaseOdometer(todo: Todo, vehicle: Vehicle): number {
    return vehicle.odometerType === 'HOUR' ? todo.dueOdometer_hour || 0 : todo.dueOdometer_km || 0;
  }
}

export type DB_baseTodo = TodoGetPayload<{ include: ReturnType<TodoFormatterService['DB_include_baseTodo']> }>;
export type DB_todoWithVehicle = TodoGetPayload<{
  include: ReturnType<TodoFormatterService['DB_include_todoWithVehicle']>;
}>;
