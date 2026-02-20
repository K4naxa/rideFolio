import { Injectable } from '@nestjs/common';
import { BaseTodo } from '@repo/validation/dist/types/todo/todo.types';
import { user, Vehicle } from 'prisma/generated/prisma/browser';
import { Todo } from 'prisma/generated/prisma/client';
import { UnitConversionService } from 'src/utils/unit-conversion.service';

type TodoWithRelations = Todo & {
  vehicle: Vehicle;
  createdBy: Pick<user, 'name' | 'image'> | null;
  completedBy: Pick<user, 'name' | 'image'> | null;
};
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
          name: true,
          image: true,
        },
      },
    };
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
          name: true,
          image: true,
        },
      },
    };
  }

  toBaseTodo(todoWithRelations: TodoWithRelations) {
    return {
      id: todoWithRelations.id,
      title: todoWithRelations.title,
      description: todoWithRelations.description,
      priority: todoWithRelations.priority || null,
      isCompleted: todoWithRelations.isCompleted,
      vehicleId: todoWithRelations.vehicleId,
      dueDate: this.formatDueDate(todoWithRelations.dueDate),
      dueOdometer: this.formatDueOdometer(todoWithRelations, todoWithRelations.vehicle),
      createdData: this.formatCreatedData(todoWithRelations.createdBy, todoWithRelations.createdAt),
      completedData: this.formatCompletedData(todoWithRelations),
    };
  }

  private formatCompletedData(todo: TodoWithRelations): BaseTodo['completedData'] {
    if (!todo.isCompleted) {
      return null;
    }

    return {
      user: {
        name: todo.completedBy?.name ?? 'Unknown user',
        image: todo.completedBy?.image ?? null,
      },
      date: todo.completedAt_date,
      odometer: this.unitConversion.getOdometerDataByType(
        todo.vehicle.odometerType === 'HOUR' ? todo.completedAt_hour || 0 : todo.completedAt_km || 0,
        todo.vehicle.odometerType,
      ),
    };
  }

  private formatCreatedData(createdBy: Pick<user, 'name' | 'image'> | null, createdAt: Date): BaseTodo['createdData'] {
    return {
      name: (createdBy?.name as string) ?? 'Unknown user',
      image: (createdBy?.image as string) ?? null,
      date: createdAt,
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
