import { UnitConversionService } from './../utils/unit-conversion.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Refill, User, Vehicle } from '@prisma/client';
import { RefillSchemaOutput, TConversionResult, TRefillDatesForChart, TRefillForClient } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { Extend } from 'zod/v4/core/util.cjs';

@Injectable()
export class RefillsService {
  constructor(
    private prisma: PrismaService,
    private unitConversion: UnitConversionService,
    private authValidation: AuthValidationService,
  ) {}

  async createRefill(UserSession: UserSession, refillData: RefillSchemaOutput): Promise<void> {
    // 1. Check if the user has permission to create logs for the vehicle
    await this.authValidation.canCreateLogs(UserSession.user.id, refillData.vehicleId);

    // 2. Fetch user and vehicle details
    const user = await this.prisma.user.findUnique({
      where: { id: UserSession.user.id },
    });
    if (!user) {
      // Should never happen, but just to satisfy TypeScript
      throw new Error('User not found.');
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: refillData.vehicleId },
    });
    if (!vehicle) {
      // Should never happen, but just to satisfy TypeScript
      throw new Error('Vehicle not found.');
    }

    // 3. Fetch previousLog for validating odometer input (will be validated in validateOdometerIncrease)
    const previousLog = await this.prisma.refill.findFirst({
      where: { vehicleId: refillData.vehicleId },
      orderBy: { date: 'desc' },
    });

    const isOdometerHourly = vehicle.odometerType === 'HOUR';
    const normalizedOdometer = this.unitConversion.normalizeOdometer(refillData.odometer, vehicle.odometerType);

    console.log('Refill Creation odometer', refillData.odometer);
    console.log('Normalized Odometer: ', normalizedOdometer);

    const fuelLiters = this.unitConversion.normalizeFuelAmount(refillData.fuelAmount, user.volumeUnit);

    // validate odometer increase
    this.validateOdometerIncrease(previousLog, normalizedOdometer, isOdometerHourly);

    // 4. Start prisma transaction
    await this.prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
      // Get last full refill
      const lastFullRefill = await prisma.refill.findFirst({
        where: {
          vehicleId: refillData.vehicleId,
          fullRefill: true,
          date: { lte: refillData.date },
        },
      });

      const legDistance = previousLog
        ? normalizedOdometer - (isOdometerHourly ? (previousLog.odometer_hour ?? 0) : (previousLog.odometer_km ?? 0))
        : 0;

      let consumptionValue: number | null = null;
      let isValidConsumptionPeriod = false;

      // Check if current period is valid for consumption calculations
      if (refillData.fullRefill && lastFullRefill) {
        isValidConsumptionPeriod = await this.isConsumptionPeriodValid(prisma, refillData, lastFullRefill);
      }

      // Calculate consumption if the period is valid
      if (isValidConsumptionPeriod) {
        consumptionValue = await this.calculateConsumption(
          prisma,
          refillData,
          lastFullRefill as Refill,
          normalizedOdometer,
          fuelLiters,
          isOdometerHourly,
        );
      }

      const refillCreateData = {
        vehicleId: refillData.vehicleId,
        userId: UserSession.user.id,
        date: refillData.date,
        odometer_hour: isOdometerHourly ? normalizedOdometer : null,
        odometer_km: isOdometerHourly ? null : normalizedOdometer,
        fullRefill: refillData.fullRefill,
        skippedRefill: refillData.skippedRefill,
        fuelAmount_L: fuelLiters,
        pricePerUnit: refillData.pricePerUnit,
        costTotal: refillData.costTotal,
        notes: refillData.notes,
        consumption_L_per_100km: isOdometerHourly ? null : consumptionValue,
        consumption_L_per_hour: isOdometerHourly ? consumptionValue : null,
        unitsSinceLastRefill_km: isOdometerHourly ? null : legDistance,
        unitsSinceLastRefill_hour: isOdometerHourly ? legDistance : null,
      };

      // 6. Create refill
      await prisma.refill.create({
        data: refillCreateData,
      });

      // 7. Update monthly stats
      await this.updateMonthlyStats(
        prisma,
        refillData.vehicleId,
        fuelLiters,
        refillData.costTotal || 0,
        refillData.date,
        legDistance,
        isOdometerHourly,
        isValidConsumptionPeriod ? fuelLiters : null,
        isValidConsumptionPeriod ? legDistance : null,
      );

      // 8. Update vehicles odometer units (vehicle odometer & tracked units)
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          odometer_hour: isOdometerHourly ? normalizedOdometer : null,
          odometer_km: isOdometerHourly ? null : normalizedOdometer,

          lifetimeTotalTrackedUnits_km: isOdometerHourly
            ? null
            : (normalizedOdometer || 0) - (vehicle.initialOdometer_km || 0),
          lifetimeTotalTrackedUnits_hour: isOdometerHourly
            ? (normalizedOdometer || 0) - (vehicle.initialOdometer_hour || 0)
            : null,

          lastRefillOdometer_hour: isOdometerHourly ? normalizedOdometer : null,
          lastRefillOdometer_km: isOdometerHourly ? null : normalizedOdometer,
        },
      });
    });
  }

  async getRefillsForChart(
    UserSession: UserSession,
    vehicleId: string,
    dateLimit: Date,
  ): Promise<TRefillDatesForChart[]> {
    await this.authValidation.hasAccessToVehicle(UserSession.user.id, vehicleId);

    const [vehicle, user, refills] = (await Promise.all([
      this.prisma.vehicle.findUnique({
        where: { id: vehicleId },
        select: { odometerType: true },
      }),
      this.prisma.user.findUnique({
        where: { id: UserSession.user.id },
        select: { consumptionUnit_hour: true, consumptionUnit_distance: true, volumeUnit: true },
      }),
      this.prisma.refill.findMany({
        where: {
          vehicleId,
          date: { gte: dateLimit },
          OR: [{ consumption_L_per_100km: { not: null } }, { consumption_L_per_hour: { not: null } }],
        },
        orderBy: { date: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
    ])) as [
      { odometerType: Vehicle['odometerType'] } | null,
      {
        consumptionUnit_hour: User['consumptionUnit_hour'];
        consumptionUnit_distance: User['consumptionUnit_distance'];
        volumeUnit: User['volumeUnit'];
      } | null,
      Array<Extend<Refill, { user: { id: string; name: string; image: string | null } }>>,
    ];

    const isVehicleHourly = vehicle?.odometerType === 'HOUR';
    const userUnit = isVehicleHourly ? user!.consumptionUnit_hour : user!.consumptionUnit_distance;

    // Single-pass grouping with running average
    const groupedByDate = refills.reduce(
      (map, refill) => {
        const dateKey = refill.date.toISOString().split('T')[0];

        const rawConsumption = isVehicleHourly ? refill.consumption_L_per_hour : refill.consumption_L_per_100km;

        const convertedConsumption = this.unitConversion.getConsumptionData(
          rawConsumption,
          userUnit,
          isVehicleHourly ? 'HOUR' : 'DISTANCE',
        );

        if (!map.has(dateKey)) {
          map.set(dateKey, {
            date: dateKey,
            consumption: { ...convertedConsumption }, // Clone to avoid reference issues
            refills: [this.formatRefillForClient(refill, vehicle!, user!)],
            sumConsumption: convertedConsumption.value, // Track sum for easier avg calculation
          });
        } else {
          const group = map.get(dateKey)!;
          group.sumConsumption += convertedConsumption.value;
          group.refills.push(this.formatRefillForClient(refill, vehicle!, user!));
          group.consumption.value = Number((group.sumConsumption / group.refills.length).toFixed(2));
        }

        return map;
      },
      new Map<
        string,
        {
          date: string;
          consumption: TConversionResult;
          refills: TRefillForClient[];
          sumConsumption: number;
        }
      >(),
    );

    // Convert to array and remove the helper sumConsumption property
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return Array.from(groupedByDate.values()).map(({ sumConsumption, ...rest }) => rest);
  }

  /* ===== HELPER METHODS ===== */

  private validateOdometerIncrease(previousLog: Refill | null, newOdometer: number, isOdometerHourly: boolean): void {
    if (!previousLog) return;

    const prevValue = isOdometerHourly ? previousLog.odometer_hour : previousLog.odometer_km;
    if (!prevValue) return;

    if (newOdometer <= (prevValue ?? 0)) {
      throw new BadRequestException({
        message: `must be greater than last value`,
        field: 'odometer',
      });
    }
  }

  private async isConsumptionPeriodValid(
    prisma: Prisma.TransactionClient,
    refillData: RefillSchemaOutput,
    lastFullrefill: Refill | null,
  ) {
    // Returns a boolean indicating if the consumption period is valid
    const skippedRefill = await prisma.refill.count({
      where: {
        vehicleId: refillData.vehicleId,
        skippedRefill: true,
        date: {
          gte: lastFullrefill?.date,
          lte: refillData.date,
        },
      },
    });

    return skippedRefill === 0;
  }

  private async calculateConsumption(
    prisma: Prisma.TransactionClient,
    refillData: RefillSchemaOutput,
    lastFullRefill: Refill,
    currentOdometer: number,
    fuelLiters: number,
    isOdometerHourly: boolean,
  ): Promise<number | null> {
    const logsInPeriod = await prisma.refill.findMany({
      where: {
        vehicleId: refillData.vehicleId,
        date: { gte: lastFullRefill.date, lte: refillData.date },
      },
    });

    const totalFuel = logsInPeriod.reduce((sum, log) => sum + log.fuelAmount_L, 0) + fuelLiters;

    if (isOdometerHourly) {
      // Return hourly consumption (Liters per hour)
      const hours = currentOdometer - (lastFullRefill.odometer_hour ?? 0);
      return hours > 0 ? totalFuel / hours : null;
    } else {
      // Return distance-based consumption (Liters per 100 km)
      const distance = currentOdometer - (lastFullRefill.odometer_km ?? 0);
      return distance > 0 ? (totalFuel / distance) * 100 : null;
    }
  }

  private async updateMonthlyStats(
    prisma: Prisma.TransactionClient,
    vehicleId: string,
    fuelLiters: number,
    totalCost: number,
    date: Date,
    legDistance: number,
    isOdometerHourly: boolean,
    validFuel: number | null,
    validUnits: number | null,
  ) {
    const refillDate = new Date(date);
    const month = refillDate.getMonth() + 1; // Months are zero-based
    const year = refillDate.getFullYear();

    let monthlyStats = await prisma.vehicleMonthlyStatistics.findUnique({
      where: { vehicleId_year_month: { vehicleId, year, month } },
    });

    // Create new montly stats if one doesnt already exist
    if (!monthlyStats) {
      monthlyStats = await prisma.vehicleMonthlyStatistics.create({
        data: { vehicleId, year, month },
      });
    }

    // add basic stats (are always added, even when consumption calculation is not valid)
    const updateData: Prisma.VehicleMonthlyStatisticsUpdateInput = {
      totalFuelCost: (monthlyStats.totalFuelCost || 0) + totalCost,
      monthlyRunningCost: (monthlyStats.monthlyRunningCost || 0) + totalCost,
      totalFuelConsumed_L: (monthlyStats.totalFuelConsumed_L || 0) + fuelLiters,
      monthlyOdometerUnits_hour: (monthlyStats.monthlyOdometerUnits_hour || 0) + (isOdometerHourly ? legDistance : 0),
      monthlyOdometerUnits_km: (monthlyStats.monthlyOdometerUnits_km || 0) + (isOdometerHourly ? 0 : legDistance),
    };

    // add validated leg data
    if (validFuel !== null && validUnits !== null && validUnits > 0) {
      if (isOdometerHourly) {
        // Calculate hourly consumption
        updateData.monthlyValidUnitsForConsumption_hour =
          (monthlyStats.monthlyValidUnitsForConsumption_hour || 0) + validUnits;

        updateData.monthlyValidFuelForConsumption_L = (monthlyStats.monthlyValidFuelForConsumption_L || 0) + validFuel;

        updateData.consumption_L_per_hour =
          updateData.monthlyValidFuelForConsumption_L / updateData.monthlyValidUnitsForConsumption_hour;
      } else {
        // Calculate distance-based consumption
        updateData.monthlyValidFuelForConsumption_L = (monthlyStats.monthlyValidFuelForConsumption_L || 0) + validFuel;

        updateData.monthlyValidUnitsForConsumption_km =
          (monthlyStats.monthlyValidUnitsForConsumption_km || 0) + validUnits;

        updateData.consumption_L_per_100km =
          (updateData.monthlyValidFuelForConsumption_L / (updateData.monthlyValidUnitsForConsumption_km || 1)) * 100;
      }
    }

    // Update the monthly statistics in the database
    await prisma.vehicleMonthlyStatistics.update({
      where: { id: monthlyStats.id },
      data: updateData,
    });
  }
  private formatRefillForClient(
    refill: Extend<Refill, { user: { id: string; name: string; image: string | null } }>,
    vehicle: Pick<Vehicle, 'odometerType'>,
    user: Pick<User, 'consumptionUnit_hour' | 'consumptionUnit_distance' | 'volumeUnit'>,
  ): TRefillForClient {
    return {
      id: refill.id,
      vehicleId: refill.vehicleId,
      creator: {
        id: refill.user.id,
        name: refill.user.name,
        image: refill.user.image,
      },
      date: refill.date,
      odometer: this.unitConversion.getOdometerDataByType(
        vehicle.odometerType === 'HOUR' ? refill.odometer_hour : refill.odometer_km,
        vehicle.odometerType,
      ),
      fullRefill: refill.fullRefill,
      skippedRefill: refill.skippedRefill,
      fuelVolume: this.unitConversion.getVolumeDataByUnitType(refill.fuelAmount_L, user.volumeUnit),
      pricePerUnit: refill.pricePerUnit,
      costTotal: refill.costTotal,
      notes: refill.notes,
      consumption: this.unitConversion.getConsumptionData(
        vehicle.odometerType === 'HOUR' ? refill.consumption_L_per_hour : refill.consumption_L_per_100km,
        vehicle.odometerType === 'HOUR' ? user.consumptionUnit_hour : user.consumptionUnit_distance,
        vehicle.odometerType === 'HOUR' ? 'HOUR' : 'DISTANCE',
      ),
    };
  }
}
