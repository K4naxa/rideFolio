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
} from '@prisma/client';
import {
  MaintenanceActivityData,
  RecentActivityInfiniteResponse,
  RecentActivityItem,
  TAccessibleVehicle,
  TBasicVehicle,
  TStatCardData,
  VehicleSchemaType,
} from '@repo/validation';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { Extend } from 'zod/v4/core/util.cjs';

@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private unitConversion: UnitConversionService,
    private vehicleRepository: VehicleRepository,
    private vehicleTransformer: VehicleTransformerService,
    private authValidationService: AuthValidationService,
  ) {}

  // ***       Management       ***

  async create(userSession: UserSession, vehicleData: VehicleSchemaType): Promise<{ newVehicleId: string }> {
    try {
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

      const vehicle = await this.prisma.vehicle.create({
        data: {
          ...formattedVehicleData,
          ownerId: userSession.user.id,

          initialOdometer_km: odometer_is_distance_type ? formattedDistanceOdometer : null,
          odometer_km: odometer_is_distance_type ? formattedDistanceOdometer : null,

          initialOdometer_hour: !odometer_is_distance_type ? formattedDistanceOdometer : null,
          odometer_hour: !odometer_is_distance_type ? formattedDistanceOdometer : null,
        },
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
    try {
      await this.prisma.vehicle.delete({
        where: {
          id: vehicleId,
          ownerId: userSession.user.id,
        },
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw new BadRequestException({
        message: 'Error deleting vehicle.',
      });
    }
  }
  // ***       FETCH       ***
  async getVehicleTypes(): Promise<string[]> {
    try {
      const vehicleTypes = await this.prisma.vehicleType.findMany({
        select: {
          code: true,
        },
      });
      return vehicleTypes.map((v) => v.code);
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

  async getOwnVehicles(userSession: UserSession): Promise<TBasicVehicle[]> {
    try {
      const rawVehicles = await this.vehicleRepository.findOwnVehicles(userSession.user.id);

      if (!rawVehicles || rawVehicles.length === 0) {
        throw new NotFoundException('No vehicles found for the user');
      }

      return rawVehicles.map((v) => this.vehicleTransformer.toBasicVehicle(v));
    } catch (error) {
      console.error('Error fetching own vehicles:', error);
      throw new BadRequestException({
        message: 'Failed to fetch own vehicles.',
      });
    }
  }

  async getStatCardData(userSession: UserSession, vehicleId: string): Promise<TStatCardData> {
    await this.authValidationService.hasAccessToVehicle(userSession.user.id, vehicleId);

    const rawVehicle = await this.vehicleRepository.findVehicleById(vehicleId);
    if (!rawVehicle) throw new NotFoundException('Vehicle not found');

    const isHourlyBased = rawVehicle.odometerType === 'HOUR';

    const user = await this.prisma.user.findUnique({
      where: { id: userSession.user.id },
      select: { volumeUnit: true, consumptionUnit_distance: true, consumptionUnit_hour: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const monthlyData = await this.prisma.vehicleMonthlyStatistics.findUnique({
      where: { vehicleId_year_month: { vehicleId, year, month } },
    });

    const previousYear = month === 1 ? year - 1 : year;
    const previousMonth = month === 1 ? 12 : month - 1;

    const previousMonthData = await this.prisma.vehicleMonthlyStatistics.findUnique({
      where: { vehicleId_year_month: { vehicleId, year: previousYear, month: previousMonth } },
    });

    let consumptionTrendPrecentage: number | null = null;

    if (monthlyData && previousMonthData) {
      if (isHourlyBased) {
        if (previousMonthData.consumption_L_per_hour && previousMonthData.consumption_L_per_hour > 0) {
          consumptionTrendPrecentage =
            ((monthlyData.consumption_L_per_hour - previousMonthData.consumption_L_per_hour) /
              previousMonthData.consumption_L_per_hour) *
            100;
        } else {
          consumptionTrendPrecentage = null;
        }
      } else {
        if (previousMonthData.consumption_L_per_100km && previousMonthData.consumption_L_per_100km > 0) {
          consumptionTrendPrecentage =
            ((monthlyData.consumption_L_per_100km - previousMonthData.consumption_L_per_100km) /
              previousMonthData.consumption_L_per_100km) *
            100;
        } else {
          consumptionTrendPrecentage = null;
        }
      }
    }

    const currentMonthConsumptionData = this.unitConversion.getConsumptionData(
      monthlyData ? (isHourlyBased ? monthlyData.consumption_L_per_hour : monthlyData.consumption_L_per_100km) : null,
      isHourlyBased ? user.consumptionUnit_hour : user.consumptionUnit_distance,
      isHourlyBased ? 'HOUR' : 'DISTANCE',
    );

    const resData: TStatCardData = {
      trackedUnits: this.unitConversion.getOdometerDataByType(
        isHourlyBased ? rawVehicle.lifetimeTotalTrackedUnits_hour : rawVehicle.lifetimeTotalTrackedUnits_km,
        rawVehicle.odometerType,
      ),
      monthlyAverageConsumption: {
        ...currentMonthConsumptionData,
        trend: consumptionTrendPrecentage !== null ? (consumptionTrendPrecentage < 0 ? 'down' : 'up') : undefined,
        trendValue: consumptionTrendPrecentage,
      },
      monthlyRunningCost: {
        value: monthlyData?.monthlyRunningCost || 0,
      },
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
      select: { volumeUnit: true, consumptionUnit_distance: true, consumptionUnit_hour: true },
    });
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { odometerType: true },
    });
    if (!user) throw new NotFoundException('User not found');
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
            customPartLabel: MaintenancePart['customPartLabel'];
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
              customPartLabel: true,
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
            isHourlyOdometer ? user.consumptionUnit_hour : user.consumptionUnit_distance,
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
          maintenanceType: m.maintenanceType,
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
}
