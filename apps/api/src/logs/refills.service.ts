import { UnitConversionService } from './../utils/unit-conversion.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Refill, User, Vehicle } from 'prisma/generated/prisma/client';
import { RefillSchemaOutput, TRefillForClient } from '@repo/validation';
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

    // 2. Fetch user, vehicle and previous log data
    const [user, vehicle, previousLog] = (await Promise.all([
      this.prisma.user.findUnique({
        where: { id: UserSession.user.id },
        select: {
          volumeUnit: true,
        },
      }),
      this.prisma.vehicle.findUnique({
        where: { id: refillData.vehicleId },
        select: { odometerType: true, initialOdometer_km: true, initialOdometer_hour: true, id: true },
      }),
      this.prisma.refill.findFirst({
        where: { vehicleId: refillData.vehicleId },
        orderBy: { date: 'desc' },
      }),
    ])) as [
      { volumeUnit: User['volumeUnit'] } | null,
      {
        odometerType: Vehicle['odometerType'];
        initialOdometer_km: Vehicle['initialOdometer_km'];
        initialOdometer_hour: Vehicle['initialOdometer_hour'];
        id: Vehicle['id'];
      } | null,
      Refill | null,
    ];
    if (!user || !vehicle) {
      // Should never happen, but just to satisfy TypeScript
      throw new Error('User or Vehicle not found');
    }

    const isOdometerHourly = vehicle.odometerType === 'HOUR';
    const normalizedOdometer = this.unitConversion.normalizeOdometer(refillData.odometer, vehicle.odometerType);
    const fuelLiters = this.unitConversion.normalizeFuelAmount(refillData.fuelAmount, user.volumeUnit);

    // validate odometer increase
    this.validateOdometerIncrease(previousLog, normalizedOdometer, isOdometerHourly);

    // 4. Start prisma transaction
    await this.prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
      let consumptionResult: { consumption: number | null; validFuel: number | null; validUnits: number | null } = {
        consumption: null,
        validFuel: null,
        validUnits: null,
      };

      if (refillData.fullRefill) {
        consumptionResult = await this.calculateConsumption(
          prisma,
          refillData,
          normalizedOdometer,
          fuelLiters,
          isOdometerHourly,
        );
      }

      // Create refill
      await prisma.refill.create({
        data: {
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
          consumption_L_per_100km: isOdometerHourly ? null : consumptionResult.consumption,
          consumption_L_per_hour: isOdometerHourly ? consumptionResult.consumption : null,
        },
      });

      // Update vehicle odometer
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

  async getRefillsForChart(UserSession: UserSession, vehicleId: string, dateLimit: Date): Promise<TRefillForClient[]> {
    await this.authValidation.hasAccessToVehicle(UserSession.user.id, vehicleId);

    const [vehicle, user, refills] = (await Promise.all([
      this.prisma.vehicle.findUnique({
        where: { id: vehicleId },
        select: { odometerType: true },
      }),
      this.prisma.user.findUnique({
        where: { id: UserSession.user.id },
        select: { consumptionUnitCode_hour: true, consumptionUnitCode_distance: true, volumeUnit: true },
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
        consumptionUnitCode_hour: User['consumptionUnitCode_hour'];
        consumptionUnitCode_distance: User['consumptionUnitCode_distance'];
        volumeUnit: User['volumeUnit'];
      } | null,
      Array<Extend<Refill, { user: { id: string; name: string; image: string | null } }>>,
    ];

    const isVehicleHourly = vehicle?.odometerType === 'HOUR';
    const userUnit = isVehicleHourly ? user!.consumptionUnitCode_hour : user!.consumptionUnitCode_distance;

    // Single-pass grouping with running average
    return refills.map((refill) => {
      const rawConsumption = isVehicleHourly ? refill.consumption_L_per_hour : refill.consumption_L_per_100km;

      const convertedConsumption = this.unitConversion.getConsumptionData(
        rawConsumption,
        userUnit,
        isVehicleHourly ? 'HOUR' : 'DISTANCE',
      );
      return {
        id: refill.id,
        vehicleId: refill.vehicleId,
        creator: {
          id: refill.user.id,
          name: refill.user.name,
          image: refill.user.image,
        },
        date: refill.date,
        consumption: convertedConsumption,
        odometer: this.unitConversion.getOdometerDataByType(
          isVehicleHourly ? refill.odometer_hour : refill.odometer_km,
          vehicle!.odometerType,
        ),
        fullRefill: refill.fullRefill,
        skippedRefill: refill.skippedRefill,
        fuelVolume: this.unitConversion.getVolumeDataByUnitType(refill.fuelAmount_L, user!.volumeUnit),
        pricePerUnit: refill.pricePerUnit,
        costTotal: refill.costTotal,
        notes: refill.notes,
      };
    });
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

  private async calculateConsumption(
    prisma: Prisma.TransactionClient,
    currentRefill: RefillSchemaOutput,
    currentOdometer: number,
    currentFuelLiters: number,
    isOdometerHourly: boolean,
  ): Promise<{ consumption: number | null; validFuel: number | null; validUnits: number | null }> {
    // Find the previous full refill
    const previousFullRefill = await prisma.refill.findFirst({
      where: {
        vehicleId: currentRefill.vehicleId,
        date: { lt: currentRefill.date },
        fullRefill: true,
      },
      orderBy: { date: 'desc' },
    });
    if (!previousFullRefill) return { consumption: null, validFuel: null, validUnits: null };

    const refillsBackwards = await prisma.refill.findMany({
      where: {
        vehicleId: currentRefill.vehicleId,
        date: { lt: currentRefill.date, gt: previousFullRefill.date },
      },
      orderBy: { date: 'desc' },
      select: {
        date: true,
        odometer_km: true,
        odometer_hour: true,
        fullRefill: true,
        skippedRefill: true,
        fuelAmount_L: true,
      },
    });

    console.log('previous full refill:', previousFullRefill);
    console.log('refills backwards:', refillsBackwards);
    console.log('currentOdometer:', currentOdometer);

    // find the last full refill and check for skipped refills in between
    const refillsInPeriod: Array<{
      date: Date;
      odometer_km: number | null;
      odometer_hour: number | null;
      fullRefill: boolean;
      skippedRefill: boolean;
      fuelAmount_L: number;
    }> = [];

    for (const refill of refillsBackwards) {
      // if we find a skipped refill before finding a full refill, period is invalid
      if (refill.skippedRefill) {
        return { consumption: null, validFuel: null, validUnits: null };
      }

      refillsInPeriod.push(refill);
    }

    // Calculate total fuel in the period
    const totalFuel =
      refillsInPeriod.reduce(
        (sum: number, refill: { fuelAmount_L: number | null }) => sum + (refill.fuelAmount_L ?? 0),
        0,
      ) + currentFuelLiters;

    // calculate distance/hours traveled
    const lastOdometer = isOdometerHourly
      ? (previousFullRefill.odometer_hour ?? 0)
      : (previousFullRefill.odometer_km ?? 0);
    const units = currentOdometer - lastOdometer;

    if (units <= 0) {
      return { consumption: null, validFuel: null, validUnits: null };
    }

    // Calculate consumption
    const consumption = isOdometerHourly ? totalFuel / units : (totalFuel / units) * 100;

    return {
      consumption,
      validFuel: totalFuel,
      validUnits: units,
    };
  }

  private formatRefillForClient(
    refill: Extend<Refill, { user: { id: string; name: string; image: string | null } }>,
    vehicle: Pick<Vehicle, 'odometerType'>,
    user: Pick<User, 'consumptionUnitCode_hour' | 'consumptionUnitCode_distance' | 'volumeUnit'>,
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
        vehicle.odometerType === 'HOUR' ? user.consumptionUnitCode_hour : user.consumptionUnitCode_distance,
        vehicle.odometerType === 'HOUR' ? 'HOUR' : 'DISTANCE',
      ),
    };
  }
}
