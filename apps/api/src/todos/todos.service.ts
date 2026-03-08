import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Vehicle } from 'prisma/generated/client';
import { BaseTodo, TodoSchemaType } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { LimitsService } from 'src/limits/limits.service';
import { TodoFormatterService } from 'src/todos/todoFormatter.service';
import { VehicleAccessPrisma } from '../auth/vehicle-access.prisma';
import { safeDelete } from '../prisma/prisma.utils';

@Injectable()
export class TodosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly unitConversion: UnitConversionService,
    private readonly authValidation: AuthValidationService,
    private readonly limitsService: LimitsService,
    private readonly todoFormatter: TodoFormatterService,
  ) {}

  async createTodo(userSession: UserSession, todoDto: TodoSchemaType): Promise<BaseTodo> {
    // validate and enforce access
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: todoDto.vehicleId, ...VehicleAccessPrisma.forUser(userSession.user.id) },
    });

    if (!vehicle) throw new ForbiddenException({ code: 'NOT_FOUND_OR_ACCESS_DENIED' });

    const sizeBytes = await this.limitsService.canCreateLog(userSession.user.id, vehicle.ownerId, todoDto);

    const { dueOdometer_km, dueOdometer_hour } = this.normalizeOdometerForStorage(todoDto.dueOdometer, vehicle);

    const newTodo = await this.prisma.$transaction(async (tx) => {
      await this.limitsService.incrementStorageUsage(tx, vehicle.ownerId, 'TODO', sizeBytes);
      return tx.todo.create({
        data: {
          vehicleId: todoDto.vehicleId,
          title: todoDto.title,
          description: todoDto.description,
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

  async getAllTodos(userSession: UserSession): Promise<BaseTodo[]> {
    // Fetch todos for all accessible vehicles
    const todos = await this.prisma.todo.findMany({
      where: { ...VehicleAccessPrisma.nestedForUser(userSession.user.id) },
      include: this.todoFormatter.DB_include_baseTodo(),
      orderBy: this.getTodoOrderBy(),
    });

    // Format todos with proper odometer calculations
    return todos.map((todo) => {
      return {
        ...this.todoFormatter.toBaseTodo(todo),
      };
    });
  }

  async getTodoById(userSession: UserSession, todoId: string): Promise<BaseTodo> {
    const todo = await this.prisma.todo.findUnique({
      where: { id: todoId, ...VehicleAccessPrisma.nestedForUser(userSession.user.id) },
      include: this.todoFormatter.DB_include_baseTodo(),
    });

    if (!todo) throw new NotFoundException({ code: 'NOT_FOUND_OR_ACCESS_DENIED' });

    return this.todoFormatter.toBaseTodo(todo);
  }

  async getVehicleTodos(userSession: UserSession, vehicleId: string): Promise<BaseTodo[]> {
    // Validate vehicle access
    await this.authValidation.hasAccessToVehicle(userSession.user.id, vehicleId);

    // fetch todos
    const todos = await this.prisma.todo.findMany({
      where: { vehicleId },
      include: this.todoFormatter.DB_include_baseTodo(),
      orderBy: this.getTodoOrderBy(),
    });

    return todos.map((todo) => this.todoFormatter.toBaseTodo(todo));
  }

  async toggleTodoCompletion(userSession: UserSession, todoId: string, complete: boolean): Promise<BaseTodo> {
    // validate user access and return a vehicle object
    const vehicle = await this.prisma.todo
      .findUnique({
        where: { id: todoId, ...VehicleAccessPrisma.nestedForUser(userSession.user.id) },
        select: { vehicle: { select: { odometerType: true, odometer_km: true, odometer_hour: true } } },
      })
      .then((r) => r?.vehicle);
    if (!vehicle) throw new NotFoundException({ code: 'NOT_FOUND_OR_ACCESS_DENIED' });

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

    const updatedTodo = await this.prisma.todo.update({
      where: { id: todoId },
      data: {
        isCompleted: true,
        completedById: userSession.user.id,
        completedAt_date: new Date(),
        completedAt_km: vehicle.odometerType === 'HOUR' ? null : vehicle.odometer_km || 0,
        completedAt_hour: vehicle.odometerType === 'HOUR' ? vehicle.odometer_hour || 0 : null,
      },
      include: this.todoFormatter.DB_include_baseTodo(),
    });
    return this.todoFormatter.toBaseTodo(updatedTodo);
  }

  async deleteTodo(userSession: UserSession, todoId: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id: todoId, ...VehicleAccessPrisma.nestedForUser(userSession.user.id) },
      include: { vehicle: { select: { ownerId: true } } },
    });
    if (!todo) throw new NotFoundException({ code: 'NOT_FOUND_OR_ACCESS_DENIED' });

    await this.prisma.$transaction(async (tx) => {
      await tx.todo.delete({
        where: {
          id: todoId,
          ...VehicleAccessPrisma.nestedForUser(userSession.user.id),
        },
      });

      // Decrement vehicle owner's storage usage
      await this.limitsService.decrementStorageUsage(tx, todo.vehicle.ownerId, 'TODO', todo.sizeBytes);
    });
  }

  async updateTodo(userSession: UserSession, todoId: string, todoDto: TodoSchemaType): Promise<BaseTodo> {
    const oldTodo = await this.prisma.todo.findUnique({
      where: { id: todoId, ...VehicleAccessPrisma.nestedForUser(userSession.user.id) },
      include: { vehicle: true },
    });
    if (!oldTodo) throw new NotFoundException({ code: 'NOT_FOUND_OR_ACCESS_DENIED' });

    const ownerId = oldTodo.vehicle.ownerId;

    const newSizeBytes = await this.limitsService.canUpdateLog(userSession.user.id, ownerId, oldTodo?.sizeBytes, {
      ...oldTodo,
      ...todoDto,
    });

    const { dueOdometer, dueDate, ...directFields } = todoDto;
    const { dueOdometer_km, dueOdometer_hour } = this.normalizeOdometerForStorage(dueOdometer, oldTodo.vehicle);

    const updatedTodo = await this.prisma.$transaction(async (tx) => {
      await this.limitsService.syncStorageUsage(tx, ownerId, 'TODO', oldTodo.sizeBytes, newSizeBytes);
      return tx.todo.update({
        where: { id: todoId },
        data: {
          ...directFields,
          dueDate: dueDate ? new Date(dueDate) : null,
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
