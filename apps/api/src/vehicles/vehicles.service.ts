import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { VehicleTransformerService } from './vehicleTransformer.service';
import { VehicleRepository } from './vehicleRepository';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ActivityItem, TAccessibleVehicle, VehicleInput, VehicleType, BasicVehicle } from '@repo/validation';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { LimitsService } from 'src/limits/limits.service';
import { TodosService } from 'src/todos/todos.service';
import { TodoFormatterService } from 'src/todos/todoFormatter.service';

@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private unitConversion: UnitConversionService,
    private vehicleRepository: VehicleRepository,
    private vehicleTransformer: VehicleTransformerService,
    private authValidationService: AuthValidationService,
    private limitsService: LimitsService,
    private todoService: TodosService,
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
      const { odometer, image, ...formattedVehicleData } = vehicleData;
      formattedDistanceOdometer = odometer ? odometer : null;

      // Change the odometer values based on type
      // Only necessary if the odometer type is miles
      if (vehicleData.odometerType === 'MILE') {
        formattedDistanceOdometer = this.unitConversion.milesToKm(vehicleData.odometer);
      }

      const vehicle = await this.prisma.$transaction(async (tx) => {
        // Create vehicle
        const vehicle = await this.prisma.vehicle.create({
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

      // Link the vehicle to the user's private pool
    } catch (error) {
      Logger.error('Error creating vehicle:', error);
      throw new BadRequestException({
        message: 'Unexpected error',
      });
    }
  }

  async update(userSession: UserSession, vehicleId: string, vehicleData: VehicleInput) {
    // validate rights
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId, ownerId: userSession.user.id },
    });

    if (!vehicle) {
      throw new NotFoundException({
        message: 'Vehicle not found or access denied',
      });
    }

    await this.validateVehicleType(vehicleData.type);

    try {
      // Extract image to handle separately
      const { image, odometer, odometerType, ...updateData } = vehicleData;

      await this.prisma.vehicle.update({
        where: { id: vehicleId },
        data: updateData,
      });

      // TODO: Handle image upload separately if provided
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to update vehicle',
      });
    }
  }

  async delete(userSession: UserSession, vehicleId: string) {
    console.log('Deleting vehicle with ID:', vehicleId);

    // TODO: Delete images from storage and update storage usage accordingly
    try {
      const vehicle = await this.prisma.vehicle.findUniqueOrThrow({
        where: { id: vehicleId, ownerId: userSession.user.id },
        select: {
          sizeBytes: true,
          id: true,
          image: true,
          refills: { select: { sizeBytes: true } },
          maintenances: { select: { sizeBytes: true } },
          todos: { select: { sizeBytes: true } },
          notes: { select: { sizeBytes: true } },
          shoppingListItems: { select: { sizeBytes: true } },
        },
      });

      const vehicleBytes = vehicle.sizeBytes;
      const refillsBytes = vehicle.refills.reduce((acc, curr) => acc + curr.sizeBytes, 0);
      const maintenancesBytes = vehicle.maintenances.reduce((acc, curr) => acc + curr.sizeBytes, 0);
      const todosBytes = vehicle.todos.reduce((acc, curr) => acc + curr.sizeBytes, 0);
      const notesBytes = vehicle.notes.reduce((acc, curr) => acc + curr.sizeBytes, 0);
      const shoppingListItemsBytes = vehicle.shoppingListItems.reduce((acc, curr) => acc + curr.sizeBytes, 0);

      await this.prisma.$transaction(async (tx) => {
        await Promise.all([
          await tx.vehicle.delete({ where: { id: vehicle.id } }),
          await this.limitsService.decrementStorageUsage(tx, userSession.user.id, 'VEHICLE', vehicleBytes),
          refillsBytes > 0 &&
            (await this.limitsService.decrementStorageUsage(tx, userSession.user.id, 'REFILL', refillsBytes)),
          maintenancesBytes > 0 &&
            (await this.limitsService.decrementStorageUsage(tx, userSession.user.id, 'MAINTENANCE', maintenancesBytes)),
          todosBytes > 0 &&
            (await this.limitsService.decrementStorageUsage(tx, userSession.user.id, 'TODO', todosBytes)),
          notesBytes > 0 &&
            (await this.limitsService.decrementStorageUsage(tx, userSession.user.id, 'NOTE', notesBytes)),
          shoppingListItemsBytes > 0 &&
            (await this.limitsService.decrementStorageUsage(
              tx,
              userSession.user.id,
              'SHOPPING_LIST',
              shoppingListItemsBytes,
            )),
        ]);
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw new BadRequestException({
        message: 'Error deleting vehicle.',
      });
    }
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
      throw new BadRequestException({ message: 'Failed to fetch vehicle types.' });
    }
  }

  async getAccessibleVehicles(userSession: UserSession): Promise<TAccessibleVehicle[]> {
    try {
      // 1. Fetch vehicles with pools where the user is a member or owner
      const rawVehicles = await this.vehicleRepository.findAccessibleVehicles(userSession.user.id);

      return rawVehicles.map((v) => {
        return this.vehicleTransformer.toAccessibleVehicle(v, userSession.user.id);
      });
    } catch (error) {
      console.error('Error fetching accessible vehicles:', error);
      throw new BadRequestException({ message: 'Failed to fetch vehicles.' });
    }
  }

  async getVehicleById(userSession: UserSession, vehicleId: string): Promise<BasicVehicle> {
    await this.authValidationService.hasAccessToVehicle(userSession.user.id, vehicleId);

    const vehicle = await this.vehicleRepository.findVehicleById(vehicleId);
    return this.vehicleTransformer.toBasicVehicle(vehicle!);
  }

  async getUpcomingActivity(userSession: UserSession, vehicleId?: string): Promise<ActivityItem[]> {
    // If vehicleId is provided, validate access to that vehicle
    // If no vehicleId is provided, fetch upcoming events for all accessible vehicles
    const vehicles = vehicleId
      ? await this.authValidationService.hasAccessToVehicle(userSession.user.id, vehicleId)
      : await this.vehicleRepository.findAccessibleVehicles(userSession.user.id);

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
      throw new BadRequestException({
        message: 'Invalid vehicle type provided',
        field: 'type',
      });
    }
  }
}
