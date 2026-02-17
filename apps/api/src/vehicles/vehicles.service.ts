import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { VehicleTransformerService } from './../utils/vehicleTransformer.service';
import { VehicleRepository } from './../utils/vehicleRepository';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  Maintenance,
  MaintenancePart,
  Prisma,
  Refill,
  Vehicle,
  VehiclePart,
  VehiclePartLocation,
} from 'prisma/generated/prisma/client';
import {
  MaintenanceActivityData,
  RecentActivityInfiniteResponse,
  RecentActivityItem,
  TAccessibleVehicle,
  TStatCardData,
  VehicleInput,
  VehicleType,
} from '@repo/validation';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { Extend } from 'zod/v4/core/util.cjs';
import { LimitsService } from 'src/limits/limits.service';
import { TodosService } from 'src/todos/todos.service';

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
  ) {}

  // ***       Management       ***

  async create(userSession: UserSession, vehicleData: VehicleInput): Promise<{ newVehicleId: string }> {
    try {
      // Validate that the vehicle type exists
      const vehicleType = await this.prisma.vehicleType.findUnique({
        where: { code: vehicleData.type, isActive: true },
      });
      if (!vehicleType) {
        throw new BadRequestException({
          message: 'Invalid vehicle type provided',
          field: 'type',
        });
      }

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
      console.error('Error creating vehicle:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = error.meta?.target as string;

        if (target?.includes('name')) {
          throw new BadRequestException({
            message: 'Ajoneuvon nimi on jo käytössä',
            field: 'name',
          });
        }
      }
      console.error('Error creating vehicle:', error);
      throw new BadRequestException({
        message: 'Ajoneuvon luonti epäonnistui',
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

  async getStatCardData(userSession: UserSession, vehicleId: string): Promise<TStatCardData> {
    await this.authValidationService.hasAccessToVehicle(userSession.user.id, vehicleId);

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const isHourlyBased = vehicle.odometerType === 'HOUR';

    const user = await this.prisma.user.findUnique({
      where: { id: userSession.user.id },
      select: { volumeUnit: true, consumptionUnitCode_distance: true, consumptionUnitCode_hour: true },
    });
    if (!user) throw new NotFoundException('user not found');

    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const monthlyData = await this.prisma.vehicleMonthlyStatistics.findUnique({
      where: { vehicleId_year_month: { vehicleId, year, month } },
      select: {
        monthlyRunningCost: true,
      },
    });

    const averageConsumptionValue = this.unitConversion.getBaseConsumptionFromBaseUnits(
      vehicle.lifetimeTotalValidFuelForConsumption_L || 0,
      isHourlyBased
        ? vehicle.lifetimeTotalValidUnitsForConsumption_hour || 0
        : vehicle.lifetimeTotalValidUnitsForConsumption_km || 0,
      isHourlyBased,
    );

    const resData: TStatCardData = {
      trackedUnits: this.unitConversion.getOdometerDataByType(
        isHourlyBased ? vehicle.lifetimeTotalTrackedUnits_hour : vehicle.lifetimeTotalTrackedUnits_km,
        vehicle.odometerType,
      ),
      averageConsumption: this.unitConversion.getConsumptionData(
        averageConsumptionValue,
        isHourlyBased ? user.consumptionUnitCode_hour : user.consumptionUnitCode_distance,
        isHourlyBased ? 'HOUR' : 'DISTANCE',
      ),
      monthlyRunningCost: monthlyData?.monthlyRunningCost || 0,
    };

    return resData;
  }

  // Used in vehicle page activities tab and recent activities on dashboard
  // used with tanstack useInfiniteQuery
  async getVehicleActivities(
    userSession: UserSession,
    vehicleId: string,
    cursor: string,
    limit: number,
  ): Promise<RecentActivityInfiniteResponse> {
    await this.authValidationService.hasAccessToVehicle(userSession.user.id, vehicleId);
    const user = await this.prisma.user.findUnique({
      where: { id: userSession.user.id },
      select: { volumeUnit: true, consumptionUnitCode_distance: true, consumptionUnitCode_hour: true },
    });
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { odometerType: true },
    });
    if (!user) throw new NotFoundException('user not found');
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    const isHourlyOdometer = vehicle.odometerType === 'HOUR';
    limit = Number(limit);

    const cursorDate = cursor === 'initial' ? new Date() : new Date(cursor);

    const activities = await this.prisma.$transaction(async (tx) => {
      type DBVehicleSelect = { name: Vehicle['name']; image: Vehicle['image']; type: Vehicle['type'] };
      type RefillDBSelect = Extend<Refill, { vehicle: DBVehicleSelect }>;
      type MaintenanceDBSelect = Extend<
        Maintenance,
        {
          vehicle: DBVehicleSelect;
          parts: {
            part: { code: VehiclePart['code']; id: VehiclePart['id'] };
            location: { code: VehiclePartLocation['code'] } | null;
            label: MaintenancePart['label'];
            groupId: MaintenancePart['groupId'];
            description: MaintenancePart['description'];
            customName: MaintenancePart['customName'];
          }[];
        }
      >;
      // Get refills from dateFilter backwards
      const refillActivities: RefillDBSelect[] = await tx.refill.findMany({
        where: {
          vehicleId,
          date: { lt: cursorDate },
        },
        include: {
          vehicle: { select: { name: true, type: true, image: true } },
        },
        orderBy: { date: 'desc' },
        take: limit,
      });

      // Get maintenance activities from dateFilter backwards
      const maintenanceActivities: MaintenanceDBSelect[] = await tx.maintenance.findMany({
        where: {
          vehicleId,
          date: { lt: cursorDate },
        },
        include: {
          vehicle: { select: { name: true, type: true, image: true, vehicleType: true } },
          parts: {
            select: {
              label: true,
              groupId: true,
              description: true,
              customName: true,
              part: { select: { code: true, id: true } },
              location: { select: { code: true } },
            },
          },
        },
        orderBy: { date: 'desc' },
        take: limit,
      });

      // Normalize refills
      const normalizedRefills: RecentActivityItem[] = refillActivities.map((r) => ({
        type: 'refill',
        date: r.date,
        vehicle: r.vehicle,
        data: {
          id: r.id,
          fullRefill: r.fullRefill,
          date: r.date,
          skippedRefill: r.skippedRefill,
          fuelAmount: this.unitConversion.getVolumeDataByUnitType(r.fuelAmount_L, user.volumeUnit),
          costTotal: r.costTotal,
          notes: r.notes,
          consumption: this.unitConversion.getConsumptionData(
            isHourlyOdometer ? r.consumption_L_per_hour : r.consumption_L_per_100km,
            isHourlyOdometer ? user.consumptionUnitCode_hour : user.consumptionUnitCode_distance,
            isHourlyOdometer ? 'HOUR' : 'DISTANCE',
          ),
          // convenience odometer field depending on vehicle odometerType
          odometer: this.unitConversion.getOdometerDataByType(
            isHourlyOdometer ? r.odometer_hour : r.odometer_km,
            vehicle.odometerType,
          ),
        },
      }));

      // Normalize maintenance
      const normalizedMaintenance: RecentActivityItem[] = maintenanceActivities.map((m) => {
        // combine parts into their partGroups
        const partGroups: Record<string, MaintenanceActivityData['parts'][0]> = {};

        m.parts.forEach((p) => {
          const existing = partGroups[p.groupId];

          if (!existing || existing === undefined || existing === null) {
            partGroups[p.groupId] = {
              groupId: p.groupId,
              partId: p.part.id,
              partCode: p.part.code,
              label: p.label || null,
              locations: p.location ? [p.location.code] : [],
            };
          } else {
            partGroups[p.groupId] = {
              ...existing, // now safe, because TS knows `existing` is not undefined
              locations: p.location ? [...existing.locations, p.location.code] : existing.locations,
            };
          }
        });
        const partGroupArray = Object.values(partGroups);

        const data: MaintenanceActivityData = {
          id: m.id,
          date: m.date,
          title: m.title,
          costTotal: m.costTotal,
          notes: m.notes,
          parts: partGroupArray,
          odometer: this.unitConversion.getOdometerDataByType(
            isHourlyOdometer ? m.odometer_hour : m.odometer_km,
            vehicle.odometerType,
          ),
        };

        return {
          type: 'maintenance',
          date: m.date,
          vehicle: m.vehicle,
          data: data,
        };
      });

      // Combine, sort by date desc and limit to requested count
      const combinedActivities = [...normalizedRefills, ...normalizedMaintenance]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, limit);

      return combinedActivities;
    });

    const nextCursor = activities.length === limit ? activities[activities.length - 1].date.toISOString() : null;
    return {
      items: activities,
      nextCursor,
    };
  }

  async getUpcomingEvents(userSession: UserSession, vehicleId?: string) {
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
      include: {
        vehicle: { select: { name: true, image: true } },
      },
    });

    return upcomingTodos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      description: todo.description,
      dueDate: this.todoService.formatDueDate(todo.dueDate),
      dueOdometer: this.todoService.formatDueOdometer(todo, vehicles.find((v) => v.id === todo.vehicleId) as Vehicle),
      vehicle: {
        name: todo.vehicle.name,
        image: todo.vehicle.image,
      },
    }));
  }
}
