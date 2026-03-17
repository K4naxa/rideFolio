import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { VehicleTransformerService } from './vehicleTransformer.service';
import { VehicleRepository } from './vehicleRepository';
import { Injectable, Logger } from '@nestjs/common';
import { AppBadRequestException, AppNotFoundException } from 'src/exceptions';
import { ActivityItem, BasicVehicle, TAccessibleVehicle, VehicleDetails, VehicleInput, VehicleType } from '@repo/validation';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { LimitsService } from 'src/limits/limits.service';
import { TodoFormatterService } from 'src/todos/todoFormatter.service';
import { Vehicle } from 'prisma/generated/client';
import { VehicleAccessPrisma } from '../auth/vehicle-access.prisma';

@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private unitConversion: UnitConversionService,
    private vehicleRepository: VehicleRepository,
    private vehicleTransformer: VehicleTransformerService,
    private authValidationService: AuthValidationService,
    private limitsService: LimitsService,
    private todoFormatter: TodoFormatterService,
  ) {}

  // ***       Management       ***

  async create(userSession: UserSession, vehicleData: VehicleInput): Promise<{ newVehicleId: string }> {
    try {
      // Validate that the vehicle type exists
      await this.validateVehicleType(vehicleData.type);

      // Validate that user can create more vehicles
      const byteSize = await this.limitsService.canCreateVehicle(userSession.user.id, vehicleData);

      // ** 1. Create the vehicle
      const odometer_is_distance_type = vehicleData.odometerType !== 'HOUR';
      let formattedDistanceOdometer: number | null = vehicleData.odometer || null;

      // Extract and remove the odometer value from vehicleData
      // TODO: add image logic later
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { odometer, image, ...formattedVehicleData } = vehicleData;
      formattedDistanceOdometer = odometer ? odometer : null;

      // Change the odometer values based on type
      // Only necessary if the odometer type is miles
      if (vehicleData.odometerType === 'MILE') {
        formattedDistanceOdometer = this.unitConversion.milesToKm(vehicleData.odometer);
      }

      const vehicle = await this.prisma.$transaction(async (tx) => {
        // Create vehicle
        const vehicle = await tx.vehicle.create({
          data: {
            ...formattedVehicleData,

            ownerId: userSession.user.id,
            sizeBytes: byteSize,

            initialOdometer_km: odometer_is_distance_type ? formattedDistanceOdometer : null,
            odometer_km: odometer_is_distance_type ? formattedDistanceOdometer : null,

            initialOdometer_hour: !odometer_is_distance_type ? formattedDistanceOdometer : null,
            odometer_hour: !odometer_is_distance_type ? formattedDistanceOdometer : null,
          },
        });

        // Update user's storage usage
        await this.limitsService.incrementStorageUsage(tx, userSession.user.id, 'VEHICLE', byteSize);

        return vehicle;
      });
      return { newVehicleId: vehicle.id };

      // Link the vehicle to the user's private group
    } catch (error) {
      Logger.error('Error creating vehicle:', error);
      throw AppBadRequestException.unknown();
    }
  }

  async update(userSession: UserSession, vehicleId: string, vehicleData: VehicleInput) {
    await this.validateVehicleType(vehicleData.type);

    // Extract image to handle separately
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { image, odometer, odometerType, ...updateData } = vehicleData;

    const result = await this.prisma.vehicle.update({
      where: { id: vehicleId, ownerId: userSession.user.id },
      data: updateData,
    });

    if (!result)
      throw new AppNotFoundException();
  }

  async delete(userSession: UserSession, vehicleId: string) {
    // TODO: Delete images from storage and update storage usage accordingly

    const [vehicle, refillsSum, maintenancesSum, todosSum, notesSum, shoppingSum] = await Promise.all([
      this.prisma.vehicle.findUnique({
        where: { id: vehicleId, ownerId: userSession.user.id },
        select: { sizeBytes: true, id: true, image: true },
      }),
      this.prisma.refill.aggregate({ where: { vehicleId }, _sum: { sizeBytes: true } }),
      this.prisma.maintenance.aggregate({ where: { vehicleId }, _sum: { sizeBytes: true } }),
      this.prisma.todo.aggregate({ where: { vehicleId }, _sum: { sizeBytes: true } }),
      this.prisma.note.aggregate({ where: { vehicleId }, _sum: { sizeBytes: true } }),
      this.prisma.shoppingListItem.aggregate({ where: { vehicleId }, _sum: { sizeBytes: true } }),
    ]);

    if (!vehicle)
      throw new AppNotFoundException();

    const vehicleBytes = vehicle.sizeBytes;
    const refillsBytes = refillsSum._sum.sizeBytes ?? 0;
    const maintenancesBytes = maintenancesSum._sum.sizeBytes ?? 0;
    const todosBytes = todosSum._sum.sizeBytes ?? 0;
    const notesBytes = notesSum._sum.sizeBytes ?? 0;
    const shoppingListItemsBytes = shoppingSum._sum.sizeBytes ?? 0;

    await this.prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.vehicle.delete({ where: { id: vehicle.id } }),
        this.limitsService.decrementStorageUsage(tx, userSession.user.id, 'VEHICLE', vehicleBytes),
        refillsBytes > 0
          ? this.limitsService.decrementStorageUsage(tx, userSession.user.id, 'REFILL', refillsBytes)
          : Promise.resolve(),
        maintenancesBytes > 0
          ? this.limitsService.decrementStorageUsage(tx, userSession.user.id, 'MAINTENANCE', maintenancesBytes)
          : Promise.resolve(),
        todosBytes > 0
          ? this.limitsService.decrementStorageUsage(tx, userSession.user.id, 'TODO', todosBytes)
          : Promise.resolve(),
        notesBytes > 0
          ? this.limitsService.decrementStorageUsage(tx, userSession.user.id, 'NOTE', notesBytes)
          : Promise.resolve(),
        shoppingListItemsBytes > 0
          ? this.limitsService.decrementStorageUsage(tx, userSession.user.id, 'SHOPPING_LIST', shoppingListItemsBytes)
          : Promise.resolve(),
      ]);
    });
  }
  async getVehicleDetails(userSession: UserSession, vehicleId: string): Promise<VehicleDetails> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        ...VehicleAccessPrisma.forUser(userSession.user.id),
      },
      include: {
        ...this.vehicleTransformer.DBInclude_BasicVehicle,
        owner: { select: { id: true, name: true } },
        _count: {
          select: {
            refills: true,
            maintenances: true,
            todos: true,
            notes: true,
            shoppingListItems: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new AppNotFoundException();
    }

    const [refillsSum, maintenancesSum, todosSum, notesSum, shoppingSum] = await Promise.all([
      this.prisma.refill.aggregate({ where: { vehicleId }, _sum: { sizeBytes: true } }),
      this.prisma.maintenance.aggregate({ where: { vehicleId }, _sum: { sizeBytes: true } }),
      this.prisma.todo.aggregate({ where: { vehicleId }, _sum: { sizeBytes: true } }),
      this.prisma.note.aggregate({ where: { vehicleId }, _sum: { sizeBytes: true } }),
      this.prisma.shoppingListItem.aggregate({ where: { vehicleId }, _sum: { sizeBytes: true } }),
    ]);

    const refillBytes = refillsSum._sum.sizeBytes ?? 0;
    const maintenanceBytes = maintenancesSum._sum.sizeBytes ?? 0;
    const todoBytes = todosSum._sum.sizeBytes ?? 0;
    const noteBytes = notesSum._sum.sizeBytes ?? 0;
    const shoppingBytes = shoppingSum._sum.sizeBytes ?? 0;

    return {
      vehicle: this.vehicleTransformer.toBasicVehicle(vehicle),
      owner: { id: vehicle.owner.id, name: vehicle.owner.name },
      createdAt: vehicle.createdAt.toISOString(),

      lifetimeStats: {
        totalFuelConsumed: vehicle.lifetimeTotalFuelConsumed_L,
        totalCost: vehicle.lifetimeTotalCost,
        totalTrackedDistance: vehicle.lifetimeTotalTrackedUnits_km,
        totalTrackedHours: vehicle.lifetimeTotalTrackedUnits_hour,
      },

      counts: {
        refills: vehicle._count.refills,
        maintenances: vehicle._count.maintenances,
        todos: vehicle._count.todos,
        notes: vehicle._count.notes,
        shoppingItems: vehicle._count.shoppingListItems,
      },

      storage: {
        vehicleBytes: vehicle.sizeBytes,
        refillBytes,
        maintenanceBytes,
        todoBytes,
        noteBytes,
        shoppingBytes,
        totalBytes: vehicle.sizeBytes + refillBytes + maintenanceBytes + todoBytes + noteBytes + shoppingBytes,
      },
    };
  }

  // ***       FETCH       ***
  async getVehicleTypes(): Promise<VehicleType[]> {
    try {
      return await this.prisma.vehicleType.findMany({
        where: { isActive: true },
        select: {
          code: true,
          nameKey: true,
          icon: true,
        },

        orderBy: { sortOrder: 'asc' },
      });
    } catch (error) {
      console.error('Error fetching vehicle types:', error);
      throw AppBadRequestException.formError('Failed to fetch vehicle types.');
    }
  }

  async getAccessibleVehicles(userSession: UserSession): Promise<TAccessibleVehicle[]> {
    try {
      // 1. Fetch vehicles with groups where the user is a member or owner
      const rawVehicles = await this.vehicleRepository.findAccessibleVehicles(userSession.user.id);

      return rawVehicles.map((v) => {
        return this.vehicleTransformer.toAccessibleVehicle(v, userSession.user.id);
      });
    } catch (error) {
      console.error('Error fetching accessible vehicles:', error);
      throw AppBadRequestException.formError('Failed to fetch vehicles.');
    }
  }

  async getVehicleById(userSession: UserSession, vehicleId: string): Promise<BasicVehicle> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        ...VehicleAccessPrisma.forUser(userSession.user.id),
      },
      include: this.vehicleTransformer.DBInclude_BasicVehicleWithGroups(userSession.user.id),
    });

    return this.vehicleTransformer.toBasicVehicle(vehicle!);
  }

  async getUpcomingActivity(userSession: UserSession, vehicleId?: string): Promise<ActivityItem[]> {
    // If vehicleId is provided, validate access to that vehicle
    // If no vehicleId is provided, fetch upcoming events for all accessible vehicles
    let vehicles: Vehicle[] = [];

    if (vehicleId) vehicles.push(await this.authValidationService.hasAccessToVehicle(userSession.user.id, vehicleId));
    else vehicles = await this.vehicleRepository.findAccessibleVehicles(userSession.user.id);

    if (!vehicles || vehicles.length === 0) return [];

    const vehicleIds = vehicles.map((v) => v.id);

    const upcomingTodos = await this.prisma.todo.findMany({
      where: {
        vehicleId: { in: vehicleIds },
        OR: [
          { dueDate: { not: null } }, // either dueDate is set
          { dueOdometer_hour: { not: null, gt: 0 } }, // or dueOdometer_hour is set and greater than 0
          { dueOdometer_km: { not: null, gt: 0 } }, // or dueOdometer_km is set and greater than 0
        ],
        isCompleted: false,
      },
      orderBy: { dueDate: 'asc' },
      include: this.todoFormatter.DB_include_todoWithVehicle(),
    });

    return upcomingTodos.map((todo) => {
      return {
        type: 'todo',
        data: this.todoFormatter.toBaseTodo(todo),
        vehicle: this.vehicleTransformer.toMinimalVehicle(todo.vehicle),
      };
    });
  }

  private async validateVehicleType(typeCode: string): Promise<void> {
    const vehicleType = await this.prisma.vehicleType.findUnique({
      where: { code: typeCode, isActive: true },
    });
    if (!vehicleType) {
      throw AppBadRequestException.fieldError('type', 'Invalid vehicle type provided');
    }
  }
}
