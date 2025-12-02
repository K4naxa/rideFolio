import { Injectable } from '@nestjs/common';
import { Todo as PrismaTodo, Vehicle, User } from 'prisma/generated/prisma/client';
import { Todo, TodoSchemaType } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { VehicleRepository } from 'src/utils/vehicleRepository';

type TodoWithRelations = PrismaTodo & {
  createdBy: Pick<User, 'name' | 'image'> | null;
  vehicle: Vehicle;
  completedBy: Pick<User, 'name' | 'image'> | null;
};

@Injectable()
export class TodosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly unitConversion: UnitConversionService,
    private readonly vehicleRepo: VehicleRepository,
    private readonly authValidation: AuthValidationService,
  ) {}

  async createTodo(userSession: UserSession, todoDto: TodoSchemaType): Promise<Todo> {
    await this.authValidation.canCreateLogs(userSession.user.id, todoDto.vehicleId);
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: todoDto.vehicleId },
    });

    if (!vehicle) throw new Error('Vehicle not found');
    const { dueOdometer_km, dueOdometer_hour } = this.normalizeOdometerForStorage(todoDto.dueOdometer, vehicle);

    const createdTodo = await this.prisma.todo.create({
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
      include: this.getTodoInclude(),
    });

    return this.formatTodo(createdTodo);
  }

  async getAllTodosForUser(userSession: UserSession): Promise<Todo[]> {
    // Get all accessible vehicles for the user
    const accessibleVehicles = await this.prisma.vehicle.findMany({
      where: {
        OR: [
          { ownerId: userSession.user.id },
          {
            pools: {
              some: { pool: { members: { some: { userId: userSession.user.id } } } },
            },
          },
        ],
      },
    });
    const vehicleIds = accessibleVehicles.map((v) => v.id);

    if (vehicleIds.length === 0) {
      return [];
    }

    // Fetch todos for all accessible vehicles
    const todos = await this.prisma.todo.findMany({
      where: { vehicleId: { in: vehicleIds } },

      include: this.getTodoInclude(),
      orderBy: this.getTodoOrderBy(),
    });

    // Format todos with proper odometer calculations
    return this.formatTodos(todos);
  }

  async getTodosForVehicle(userSession: UserSession, vehicleId: string): Promise<Todo[]> {
    await this.authValidation.hasAccessToVehicle(userSession.user.id, vehicleId);
    const vehicle = await this.vehicleRepo.findVehicleById(vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');

    // fetch todos with related user data
    const todos = await this.prisma.todo.findMany({
      where: { vehicleId },
      include: this.getTodoInclude(),
      orderBy: this.getTodoOrderBy(),
    });

    return this.formatTodos(todos);
  }

  async toggleTodoCompletion(userSession: UserSession, todoId: string, complete: boolean): Promise<Todo> {
    const todo = await this.prisma.todo.findUnique({
      where: { id: todoId },
      include: { vehicle: { select: { id: true } } },
    });
    if (!todo) {
      throw new Error('Todo not found');
    }

    await this.authValidation.canCreateLogs(userSession.user.id, todo.vehicle.id);
    const updatedTodo = await this.prisma.todo.update({
      where: { id: todoId },
      data: {
        isCompleted: complete,
        completedById: complete ? userSession.user.id : null,
        completedAt: complete ? new Date() : null,
      },
      include: this.getTodoInclude(),
    });
    return this.formatTodo(updatedTodo);
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

  async updateTodo(userSession: UserSession, todoId: string, todoDto: TodoSchemaType): Promise<Todo> {
    await this.authValidation.canEditLogs(userSession.user.id, todoDto.vehicleId);

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: todoDto.vehicleId } });
    if (!vehicle) throw new Error('Vehicle not found');
    const { dueOdometer_km, dueOdometer_hour } = this.normalizeOdometerForStorage(todoDto.dueOdometer, vehicle);

    const updatedTodo = await this.prisma.todo.update({
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
      include: this.getTodoInclude(),
    });

    return this.formatTodo(updatedTodo);
  }

  // HELPERS
  //////////////////////////
  private normalizeOdometerForStorage(
    dueOdometer: number | undefined | null,
    vehicle: Vehicle,
  ): { dueOdometer_km: number | null; dueOdometer_hour: number | null } {
    if (!dueOdometer || !vehicle?.odometerType) {
      return { dueOdometer_km: null, dueOdometer_hour: null };
    }

    if (vehicle.odometerType === 'HOUR') {
      return { dueOdometer_km: null, dueOdometer_hour: dueOdometer };
    }

    return {
      dueOdometer_km: this.unitConversion.normalizeOdometer(dueOdometer, vehicle.odometerType),
      dueOdometer_hour: null,
    };
  }

  private getVehicleBaseOdometer(vehicle: Vehicle): number {
    return vehicle.odometerType === 'HOUR' ? vehicle.odometer_hour || 0 : vehicle.odometer_km || 0;
  }
  private getTodoBaseOdometer(todo: PrismaTodo, vehicle: Vehicle): number {
    return vehicle.odometerType === 'HOUR' ? todo.dueOdometer_hour || 0 : todo.dueOdometer_km || 0;
  }
  private formatDueDate(dueDate: Date | null): Todo['dueDate'] {
    if (!dueDate) return null;

    return {
      date: dueDate,
      overdue: new Date() > dueDate,
    };
  }

  private formatDueOdometer(todo: PrismaTodo, vehicle: Vehicle): Todo['dueOdometer'] {
    // Check if todo has any odometer value set
    if (!todo.dueOdometer_hour && !todo.dueOdometer_km) {
      return null;
    }

    const todoBaseOdometer = this.getTodoBaseOdometer(todo, vehicle);
    const vehicleBaseOdometer = this.getVehicleBaseOdometer(vehicle);

    return {
      ...this.unitConversion.getOdometerDataByType(todoBaseOdometer, vehicle.odometerType),
      overdue: vehicleBaseOdometer >= todoBaseOdometer,
    };
  }

  private formatCreatedData(createdBy: Pick<User, 'name' | 'image'> | null, createdAt: Date): Todo['createdData'] {
    return {
      name: (createdBy?.name as string) ?? 'Unknown User',
      image: (createdBy?.image as string) ?? null,
      date: createdAt,
    };
  }
  private formatCompletedData(
    isCompleted: boolean,
    completedBy: Pick<User, 'name' | 'image'> | null,
    completedAt: Date | null,
  ): Todo['completedData'] {
    if (!isCompleted || !completedBy || !completedAt) {
      return null;
    }

    return {
      name: completedBy.name ?? '',
      image: completedBy.image ?? null,
      date: completedAt,
    };
  }

  private formatTodo(todo: TodoWithRelations): Todo {
    const vehicle = todo.vehicle;

    return {
      id: todo.id,
      vehicleData: vehicle,
      title: todo.title,
      description: todo.description,
      priority: todo.priority || null,
      isCompleted: todo.isCompleted,
      dueDate: this.formatDueDate(todo.dueDate),
      dueOdometer: this.formatDueOdometer(todo, vehicle),
      createdData: this.formatCreatedData(todo.createdBy, todo.createdAt),
      completedData: this.formatCompletedData(todo.isCompleted, todo.completedBy, todo.completedAt),
    };
  }

  private formatTodos(todos: TodoWithRelations[]): Todo[] {
    return todos.map((todo) => this.formatTodo(todo));
  }

  private getTodoInclude() {
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

  private getTodoOrderBy() {
    return [{ isCompleted: 'asc' as const }, { createdAt: 'desc' as const }];
  }
}
