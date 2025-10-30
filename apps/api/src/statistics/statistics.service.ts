import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { TConsumption_distance, TConsumption_hour, TVehicleMontlyStats } from '@repo/validation';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { UserSession } from '@thallesp/nestjs-better-auth';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authValidation: AuthValidationService,
    private unitConversion: UnitConversionService,
  ) {}

  async findVehicleMonthlyStats(
    userSession: UserSession,
    vehicleId: string,
    month: number,
    year: number,
  ): Promise<TVehicleMontlyStats | null> {
    await this.authValidation.hasAccessToVehicle(userSession.user.id, vehicleId);

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { odometerType: true },
    });
    if (!vehicle) {
      console.error('Vehicle not found for ID when getting vehicle stats:', vehicleId);
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userSession.user.id },
      select: {
        consumptionUnit_distance: true,
        consumptionUnit_hour: true,
        volumeUnit: true,
      },
    });
    if (!user) {
      console.error('User not found for ID when getting vehicle stats:', userSession.user.id);
      return null;
    }

    const stats = await this.prisma.vehicleMonthlyStatistics.findUnique({
      where: {
        vehicleId_year_month: {
          vehicleId,
          year: year,
          month: month,
        },
      },
    });

    if (!stats) {
      console.warn(`No statistics found for vehicle ID ${vehicleId} for month ${month} and year ${year}.`);
      return null;
    }

    // Format the average consumption based on the user's preferred consumption unit & vehicle's odometer type
    const isOdometerHourly = vehicle.odometerType === 'HOUR';
    const usersPreferredConsumptionUnit: TConsumption_hour | TConsumption_distance = isOdometerHourly
      ? user.consumptionUnit_hour
      : user.consumptionUnit_distance;

    // Format the stats based on the user's preferred consumption unit
    const formattedStats: TVehicleMontlyStats = {
      year: stats.year,
      month: stats.month,
      monthlyRunningCost: Number(stats.monthlyRunningCost.toFixed(2)),
      fuelData: {
        consumed: this.unitConversion.getVolumeDataByUnitType(stats.totalFuelConsumed_L, user.volumeUnit),
        cost: {
          value: Number(stats.totalFuelCost.toFixed(2)),
        },
      },
      totalOdometerData: this.unitConversion.getOdometerDataByType(
        isOdometerHourly ? stats.monthlyOdometerUnits_hour : stats.monthlyOdometerUnits_km,
        vehicle.odometerType,
      ),
      avgConsumptionData: this.unitConversion.getConsumptionData(
        isOdometerHourly ? stats.consumption_L_per_hour : stats.consumption_L_per_100km,
        usersPreferredConsumptionUnit,
        isOdometerHourly ? 'HOUR' : 'DISTANCE',
      ),
    };

    return formattedStats;
  }
}
