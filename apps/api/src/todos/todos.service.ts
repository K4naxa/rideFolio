import { Injectable, NotFoundException } from '@nestjs/common';
import { Vehicle } from 'prisma/generated/client';
import { BaseTodo, TodoSchemaType, TodoWithVehicle } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { VehicleRepository } from 'src/vehicles/vehicleRepository';
import { LimitsService } from 'src/limits/limits.service';
import { VehicleTransformerService } from 'src/vehicles/vehicleTransformer.service';
import { TodoFormatterService } from 'src/todos/todoFormatter.service';

@Injectable()
export class TodosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly unitConversion: UnitConversionService,
    private readonly vehicleRepo: VehicleRepository,
    private readonly authValidation: AuthValidationService,
    private readonly limitsService: LimitsService,
    private readonly vehicleTransformer: VehicleTransformerService,
    private readonly todoFormatter: TodoFormatterService,
  ) {}

  async createTodo(userSession: UserSession, todoDto: TodoSchemaType): Promise<BaseTodo> {
    // validate and enforce access
    const vehicle = await this.authValidation.canCreateLogs(userSession.user.id, todoDto.vehicleId);
    const sizeBytes = await this.limitsService.canCreateLog(userSession.user.id, vehicle.ownerId, todoDto);

    const { dueOdometer_km, dueOdometer_hour } = this.normalizeOdometerForStorage(todoDto.dueOdometer, vehicle);

    const newTodo = await this.prisma.$transaction(async (tx) => {
      await this.limitsService.incrementStorageUsage(tx, vehicle.ownerId, 'TODO', sizeBytes);
      return tx.todo.create({
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
          sizeBytes,
        },
        include: this.todoFormatter.DB_include_baseTodo(),
      });
    });

    return this.todoFormatter.toBaseTodo(newTodo);
  }

  async getUserTodosWithVehicles(userSession: UserSession): Promise<TodoWithVehicle[]> {
    // Get all accessible vehicles for the user

    const vehicles = await this.vehicleRepo.findAccessibleVehicles(userSession.user.id);
    const vehicleIds = vehicles.map((v) => v.id);
    if (vehicleIds.length === 0) return [];

    // Fetch todos for all accessible vehicles
    const todos = await this.prisma.todo.findMany({
      where: { vehicleId: { in: vehicleIds } },

      include: this.todoFormatter.DB_include_todoWithVehicle(),
      orderBy: this.getTodoOrderBy(),
    });

    // Format todos with proper odometer calculations
    return todos.map((todo) => {
      return {
        ...this.todoFormatter.toBaseTodo(todo),
        vehicle: this.vehicleTransformer.toMinimalVehicle(todo.vehicle),
      };
    });
  }

  async getTodoById(userSession: UserSession, todoId: string): Promise<BaseTodo> {
    const todo = await this.prisma.todo.findUnique({
      where: { id: todoId },
      include: this.todoFormatter.DB_include_baseTodo(),
    });
    if (!todo) {
      throw new Error('Todo not found');
    }
    await this.authValidation.hasAccessToVehicle(userSession.user.id, todo.vehicleId);
    return this.todoFormatter.toBaseTodo(todo);
  }

  async getVehicleTodos(userSession: UserSession, vehicleId: string): Promise<BaseTodo[]> {
    await this.authValidation.hasAccessToVehicle(userSession.user.id, vehicleId);
    const vehicle = await this.vehicleRepo.findVehicleById(vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');

    // fetch todos with related user data
    const todos = await this.prisma.todo.findMany({
      where: { vehicleId },
      include: this.todoFormatter.DB_include_baseTodo(),
      orderBy: this.getTodoOrderBy(),
    });

    return todos.map((todo) => this.todoFormatter.toBaseTodo(todo));
  }

  async toggleTodoCompletion(userSession: UserSession, todoId: string, complete: boolean): Promise<BaseTodo> {
    const todo = await this.prisma.todo.findUnique({
      where: { id: todoId },
      include: { vehicle: { select: { id: true } } },
    });
    if (!todo) {
      throw new Error('Todo not found');
    }

    await this.authValidation.canCreateLogs(userSession.user.id, todo.vehicle.id);

    // if toggling !complete
    if (!complete) {
      const updatedTodo = await this.prisma.todo.update({
        where: { id: todoId },
        data: {
          isCompleted: complete,
          completedById: null,
          completedAt_date: null,
          completedAt_km: null,
          completedAt_hour: null,
        },
        include: this.todoFormatter.DB_include_baseTodo(),
      });
      return this.todoFormatter.toBaseTodo(updatedTodo);
    }

    // We are completing the todo

    // Vehicle odometer for completed data
    const vehicleOdometer = await this.prisma.vehicle.findUnique({
      where: { id: todo.vehicle.id },
      select: { odometer_km: true, odometer_hour: true, odometerType: true },
    });

    const updatedTodo = await this.prisma.todo.update({
      where: { id: todoId },
      data: {
        isCompleted: true,
        completedById: userSession.user.id,
        completedAt_date: new Date(),
        completedAt_km: vehicleOdometer?.odometerType === 'HOUR' ? null : vehicleOdometer?.odometer_km || 0,
        completedAt_hour: vehicleOdometer?.odometerType === 'HOUR' ? vehicleOdometer?.odometer_hour || 0 : null,
      },
      include: this.todoFormatter.DB_include_baseTodo(),
    });
    return this.todoFormatter.toBaseTodo(updatedTodo);
  }

  async deleteTodo(userSession: UserSession, todoId: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id: todoId },
      include: { vehicle: { select: { id: true } } },
    });
    if (!todo) {
      throw new Error('Todo not found');
    }
    const vehicle = await this.authValidation.canDeleteLogs(userSession.user.id, todo.vehicle.id);

    await this.prisma.$transaction(async (tx) => {
      await this.limitsService.decrementStorageUsage(tx, vehicle.ownerId, 'TODO', todo.sizeBytes);
      await tx.todo.delete({ where: { id: todoId } });
    });
  }

  async updateTodo(userSession: UserSession, todoId: string, todoDto: TodoSchemaType): Promise<BaseTodo> {
    const vehicle = await this.authValidation.canEditLogs(userSession.user.id, todoDto.vehicleId);
    const oldTodo = await this.prisma.todo.findUnique({ where: { id: todoId } });
    if (!oldTodo) throw new NotFoundException('Todo not found');
    const newSizeBytes = await this.limitsService.canUpdateLog(
      userSession.user.id,
      vehicle.ownerId,
      oldTodo?.sizeBytes,
      {
        ...oldTodo,
        ...todoDto,
      },
    );

    const { dueOdometer, dueDate, ...directFields } = todoDto;
    const { dueOdometer_km, dueOdometer_hour } = this.normalizeOdometerForStorage(dueOdometer, vehicle);

    const updatedTodo = await this.prisma.$transaction(async (tx) => {
      await this.limitsService.syncStorageUsage(tx, vehicle.ownerId, 'TODO', oldTodo.sizeBytes, newSizeBytes);
      return tx.todo.update({
        where: { id: todoId },
        data: {
          ...directFields,
          dueDate: todoDto.dueDate ? new Date(todoDto.dueDate) : null,
          dueOdometer_km,
          dueOdometer_hour,
          sizeBytes: newSizeBytes,
        },
        include: this.todoFormatter.DB_include_baseTodo(),
      });
    });

    return this.todoFormatter.toBaseTodo(updatedTodo);
  }

  //// HELPERS

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

  private getTodoOrderBy() {
    return [{ isCompleted: 'asc' as const }, { createdAt: 'asc' as const }];
  }
}
