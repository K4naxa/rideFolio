import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { VehicleTransformerService } from './../utils/vehicleTransformer.service';
import { VehicleRepository } from './../utils/vehicleRepository';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateVehicleBackendSchemaType, TAccessibleVehicle, TBasicVehicle, TStatCardData } from '@repo/validation';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { UserSession } from '@thallesp/nestjs-better-auth';

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

  async create(
    userSession: UserSession,
    vehicleData: CreateVehicleBackendSchemaType,
  ): Promise<{ newVehicleId: string }> {
    console.log('Starting vehicle transaction');
    try {
      // ** 1. Create the vehicle

      const odometer_is_distance_type = vehicleData.odometerType !== 'HOUR';
      let formattedDistanceOdometer: number | null = vehicleData.odometer;

      // Extract and remove the odometer value from vehicleData
      const { odometer, ...formattedVehicleData } = vehicleData;
      formattedDistanceOdometer = odometer;

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

      console.log('Vehicle created and linked to private pool successfully');
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

  // ***       UTILITY       ***
}
