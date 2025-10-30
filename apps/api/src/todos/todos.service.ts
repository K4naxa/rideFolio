import { Injectable } from '@nestjs/common';
import { Todo, TodoSchemaType } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { VehicleRepository } from 'src/utils/vehicleRepository';

@Injectable()
export class TodosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly unitConversion: UnitConversionService,
    private readonly vehicleRepo: VehicleRepository,
    private readonly authValidation: AuthValidationService,
  ) {}

  async createTodo(userSession: UserSession, todoDto: TodoSchemaType) {
    await this.authValidation.canCreateLogs(userSession.user.id, todoDto.vehicleId);
    const vehicle = await this.vehicleRepo.findVehicleById(todoDto.vehicleId);

    let dueOdometer_km: number | null = null;
    let dueOdometer_hour: number | null = null;
    if (todoDto.dueOdometer && vehicle?.odometerType) {
      if (vehicle.odometerType === 'HOUR') {
        dueOdometer_hour = todoDto.dueOdometer;
      } else {
        dueOdometer_km = this.unitConversion.normalizeOdometer(todoDto.dueOdometer, vehicle.odometerType);
      }
    }

    await this.prisma.todo.create({
      data: {
        vehicleId: todoDto.vehicleId,
        title: todoDto.title,
        description: todoDto.description,
        priority: todoDto.priority,
        isCompleted: false,
        dueDate: todoDto.dueDate ? new Date(todoDto.dueDate) : null,
        dueOdometer_km,
        dueOdometer_hour,
        createdById: userSession.user.id,
      },
    });
  }

  async getAllTodosForUser(userSession: UserSession): Promise<Todo[]> {
    // Get all accessible vehicles for the user
    const accessibleVehicles = await this.vehicleRepo.findAccessibleVehicles(userSession.user.id);
    const vehicleIds = accessibleVehicles.map((v) => v.id);

    if (vehicleIds.length === 0) {
      return [];
    }

    // Fetch todos for all accessible vehicles
    const todos = await this.prisma.todo.findMany({
      where: { vehicleId: { in: vehicleIds } },
      include: {
        createdBy: {
          select: {
            name: true,
            image: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            name: true,
            image: true,
            make: true,
            model: true,
            type: true,
            odometer_km: true,
            odometer_hour: true,
            odometerType: true,
          },
        },
        completedBy: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: [{ isCompleted: 'asc' }, { createdAt: 'desc' }],
    });

    // Format todos with proper odometer calculations
    const formattedTodos: Todo[] = todos.map((todo) => {
      const vehicle = todo.vehicle;
      const isHourly = vehicle.odometerType === 'HOUR';
      const vehicleBaseOdometer = isHourly ? vehicle.odometer_hour || 0 : vehicle.odometer_km || 0;
      const todoBaseOdometer: number = isHourly ? todo.dueOdometer_hour || 0 : todo.dueOdometer_km || 0;

      return {
        id: todo.id,
        vehicleData: vehicle,
        title: todo.title,
        description: todo.description,
        priority: todo.priority || null,
        isCompleted: todo.isCompleted,
        dueDate: todo.dueDate
          ? {
              date: todo.dueDate,
              overdue: new Date() > todo.dueDate,
            }
          : null,
        dueOdometer:
          todo.dueOdometer_hour || todo.dueOdometer_km
            ? {
                ...this.unitConversion.getOdometerDataByType(todoBaseOdometer, vehicle.odometerType),
                overdue: vehicleBaseOdometer >= todoBaseOdometer,
              }
            : null,
        createdData: {
          name: todo.createdBy?.name ?? 'Unknown User',
          image: todo.createdBy?.image ?? null,
          date: todo.createdAt,
        },
        completedData:
          todo.isCompleted && todo.completedBy && todo.completedAt
            ? {
                name: todo.completedBy.name ?? '',
                image: todo.completedBy.image ?? null,
                date: todo.completedAt,
              }
            : null,
      };
    });

    return formattedTodos;
  }

  async getTodosForVehicle(userSession: UserSession, vehicleId: string): Promise<Todo[]> {
    await this.authValidation.hasAccessToVehicle(userSession.user.id, vehicleId);
    const vehicle = await this.vehicleRepo.findVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    const isHourly = vehicle.odometerType === 'HOUR';

    // fetch todos with related user data
    const todos = await this.prisma.todo.findMany({
      where: { vehicleId },
      include: {
        createdBy: {
          select: {
            name: true,
            image: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            name: true,
            image: true,
            make: true,
            model: true,
            type: true,
          },
        },
        completedBy: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: [{ isCompleted: 'asc' }, { createdAt: 'desc' }],
    });

    const vehicleBaseOdometer = isHourly ? vehicle.odometer_hour || 0 : vehicle.odometer_km || 0;

    const formattedTodos: Todo[] = todos.map((todo) => {
      const todoBaseOdometer: number = isHourly ? todo.dueOdometer_hour || 0 : todo.dueOdometer_km || 0;
      return {
        id: todo.id,
        vehicleData: vehicle,
        title: todo.title,
        description: todo.description,
        priority: todo.priority || null,
        isCompleted: todo.isCompleted,
        dueDate: todo.dueDate
          ? {
              date: todo.dueDate,
              overdue: new Date() > todo.dueDate,
            }
          : null,
        dueOdometer:
          todo.dueOdometer_hour || todo.dueOdometer_km
            ? {
                ...this.unitConversion.getOdometerDataByType(todoBaseOdometer, vehicle.odometerType),
                overdue: vehicleBaseOdometer >= todoBaseOdometer,
              }
            : null,
        createdData: {
          name: todo.createdBy?.name ?? 'Unknown User',
          image: todo.createdBy?.image ?? null,
          date: todo.createdAt,
        },
        completedData:
          todo.isCompleted && todo.completedBy && todo.completedAt // Add completedAt check
            ? {
                name: todo.completedBy.name ?? '', // Handle potential null
                image: todo.completedBy.image ?? null, // Handle potential null
                date: todo.completedAt, // This field needs to exist in your Prisma model
              }
            : null,
      };
    });

    return formattedTodos;
  }

  async toggleTodoCompletion(userSession: UserSession, todoId: string, complete: boolean) {
    const todo = await this.prisma.todo.findUnique({
      where: { id: todoId },
      include: { vehicle: { select: { id: true } } },
    });
    if (!todo) {
      throw new Error('Todo not found');
    }

    await this.authValidation.canCreateLogs(userSession.user.id, todo.vehicle.id);
    await this.prisma.todo.update({
      where: { id: todoId },
      data: {
        isCompleted: complete,
        completedById: complete ? userSession.user.id : null,
        completedAt: complete ? new Date() : null,
      },
    });
  }

  async deleteTodo(userSession: UserSession, todoId: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id: todoId },
      include: { vehicle: { select: { id: true } } },
    });
    if (!todo) {
      throw new Error('Todo not found');
    }
    await this.authValidation.canDeleteLogs(userSession.user.id, todo.vehicle.id);
    await this.prisma.todo.delete({
      where: { id: todoId },
    });
  }

  async updateTodo(userSession: UserSession, todoId: string, todoDto: TodoSchemaType) {
    const todo = await this.prisma.todo.findUnique({ where: { id: todoId }, include: { vehicle: true } });
    if (!todo) {
      throw new Error('Todo not found');
    }

    const vehicle = todo.vehicle ?? (await this.vehicleRepo.findVehicleById(todoDto.vehicleId));
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    await this.authValidation.canEditLogs(userSession.user.id, vehicle.id);

    let dueOdometer_km: number | null = null;
    let dueOdometer_hour: number | null = null;
    if (todoDto.dueOdometer && vehicle?.odometerType) {
      if (vehicle.odometerType === 'HOUR') {
        dueOdometer_hour = todoDto.dueOdometer;
      } else {
        dueOdometer_km = this.unitConversion.normalizeOdometer(todoDto.dueOdometer, vehicle.odometerType);
      }
    }

    await this.prisma.todo.update({
      where: { id: todoId },
      data: {
        vehicleId: todoDto.vehicleId,
        title: todoDto.title,
        description: todoDto.description,
        priority: todoDto.priority,
        dueDate: todoDto.dueDate ? new Date(todoDto.dueDate) : null,
        dueOdometer_km,
        dueOdometer_hour,
      },
    });
  }
}
