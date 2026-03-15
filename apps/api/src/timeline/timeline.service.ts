import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimelineItem, TimelineQueryInput, TimelineResponse } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { VehicleRepository } from '../vehicles/vehicleRepository';
import { AuthValidationService } from '../utils/authValidation.service';
import { RefillsTransformerService } from '../logs/refills/refills.transformer.service';
import { MaintenanceTransformerService } from '../logs/maintenance/maintenance.transformer.service';
import { TodoFormatterService } from '../todos/todoFormatter.service';

@Injectable()
export class TimelineService {
  constructor(
    private prisma: PrismaService,
    private vehicleRepo: VehicleRepository,
    private authValidation: AuthValidationService,
    private refillTransformer: RefillsTransformerService,
    private maintenanceTransformer: MaintenanceTransformerService,
    private todoTransformer: TodoFormatterService,
  ) {}

  async getTimeline(session: UserSession, query: TimelineQueryInput): Promise<TimelineResponse> {
    const { vehicleId, cursor, limit = 20, eventTypes, startDate, endDate } = query;

    let vehicles: string[] = [];

    if (vehicleId) {
      // If vehicle id is provided > validate users access
      await this.authValidation.hasAccessToVehicle(session.user.id, vehicleId);
      vehicles = [vehicleId];
    } else {
      // If no vehicle id is provided > fetch accessible vehicles
      vehicles = await this.vehicleRepo.findAccessibleVehicleIds(session.user.id);
    }

    if (vehicles.length === 0) {
      return {
        items: [],
        nextCursor: null,
        hasMore: false,
      };
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
    });

    const items: TimelineItem[] = [];
    const cursorDate = cursor ? new Date(cursor) : new Date();

    // Build filter for event types
    const shouldInclude = {
      refills: !eventTypes || eventTypes.includes('refill'),
      maintenances: !eventTypes || eventTypes.includes('maintenance'),
      todosCreated: !eventTypes || eventTypes.includes('todo-created'),
      todosCompleted: !eventTypes || eventTypes.includes('todo-completed'),
    };

    // Fetch refills
    if (shouldInclude.refills) {
      const refills = await this.prisma.refill.findMany({
        where: {
          vehicleId: { in: vehicles },
          date: {
            lt: cursorDate,
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        },
        select: this.refillTransformer.DB_refill_select(),
        orderBy: { date: 'desc' },
        take: limit,
      });

      items.push(
        ...refills.map((refill) => ({
          type: 'refill' as const,
          timestamp: refill.date,
          data: this.refillTransformer.toClientRefill(refill, user),
        })),
      );
    }

    // Fetch maintenances
    if (shouldInclude.maintenances) {
      const maintenances = await this.prisma.maintenance.findMany({
        where: {
          vehicleId: { in: vehicles },
          date: {
            lt: cursorDate,
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        },
        orderBy: { date: 'desc' },
        take: limit,
        include: this.maintenanceTransformer.DB_ClientMaintenance_include(),
      });

      items.push(
        ...maintenances.map((maintenance) => ({
          type: 'maintenance' as const,
          timestamp: maintenance.date,
          data: this.maintenanceTransformer.toClientFormat(maintenance),
        })),
      );
    }

    // Fetch todos (created)
    if (shouldInclude.todosCreated) {
      const todos = await this.prisma.todo.findMany({
        where: {
          vehicleId: { in: vehicles },
          createdAt: {
            lt: cursorDate,
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        },
        include: this.todoTransformer.DB_include_baseTodo(),
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      items.push(
        ...todos.map((todo) => ({
          type: 'todo-created' as const,
          timestamp: todo.createdAt,
          data: this.todoTransformer.toBaseTodo(todo),
        })),
      );
    }

    // Fetch todos (completed)
    if (shouldInclude.todosCompleted) {
      const completedTodos = await this.prisma.todo.findMany({
        where: {
          vehicleId: { in: vehicles },
          completedAt_date: {
            not: null,
            lt: cursorDate,
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        },
        orderBy: { completedAt_date: 'desc' },
        include: this.todoTransformer.DB_include_baseTodo(),
        take: limit,
      });

      items.push(
        ...completedTodos.map((todo) => ({
          type: 'todo-completed' as const,
          timestamp: todo.completedAt_date!,
          data: this.todoTransformer.toBaseTodo(todo),
        })),
      );
    }

    // Sort all items by timestamp descending
    items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Take only the limit amount
    const paginatedItems = items.slice(0, limit);
    const hasMore = items.length > limit;

    // Get the next cursor from the last item's timestamp
    const nextCursor =
      hasMore && paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1].timestamp.toISOString() : null;

    return {
      items: paginatedItems,
      nextCursor,
      hasMore,
    };
  }
}
