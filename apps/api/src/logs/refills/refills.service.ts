import { UnitConversionService } from '../../utils/unit-conversion.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Refill, Vehicle } from 'prisma/generated/client';
import { RefillSchemaOutput, TRefillForClient } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { LimitsService } from 'src/limits/limits.service';
import { RefillsTransformerService } from './refills.transformer.service';

@Injectable()
export class RefillsService {
  constructor(
    private prisma: PrismaService,
    private unitConversion: UnitConversionService,
    private authValidation: AuthValidationService,
    private limitsService: LimitsService,
    private refillTransformer: RefillsTransformerService,
  ) {}

  async createRefill(UserSession: UserSession, refillData: RefillSchemaOutput): Promise<void> {
    // 1. Check if the user has permission to create logs for the vehicle
    const vehicle: Vehicle = await this.authValidation.canCreateLogs(UserSession.user.id, refillData.vehicleId);
    // validate user storage limits
    const byteSize = await this.limitsService.canCreateLog(UserSession.user.id, vehicle.ownerId, refillData);

    // 2. Fetch user, vehicle and previous log data
    const [user, previousLog] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: UserSession.user.id },
        select: {
          volumeUnit: true,
        },
      }),

      this.prisma.refill.findFirst({
        where: { vehicleId: refillData.vehicleId },
        orderBy: { date: 'desc' },
      }),
    ]);

    if (!user || !vehicle) {
      // Should never happen, but just to satisfy TypeScript
      throw new Error('user or Vehicle not found');
    }

    const isOdometerHourly = vehicle.odometerType === 'HOUR';
    const normalizedOdometer = this.unitConversion.normalizeOdometer(refillData.odometer, vehicle.odometerType);
    const fuelLiters = this.unitConversion.normalizeFuelAmount(refillData.fuelAmount, user.volumeUnit);

    // validate odometer increase
    this.validateOdometerIncrease(previousLog, normalizedOdometer, isOdometerHourly);
    const odometerDelta = this.calculateOdometerDelta(previousLog, normalizedOdometer, isOdometerHourly);
    // 4. Start prisma transaction
    await this.prisma.$transaction(async (tx) => {
      let consumptionResult: { consumption: number | null; validFuel: number | null; validUnits: number | null } = {
        consumption: null,
        validFuel: null,
        validUnits: null,
      };

      // Calculate consumption only if full refill
      if (refillData.fullRefill) {
        consumptionResult = await this.calculateConsumption(
          tx,
          refillData,
          normalizedOdometer,
          fuelLiters,
          isOdometerHourly,
        );
      }

      // Create refill
      await tx.refill.create({
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
          sizeBytes: byteSize,
        },
      });

      // Update vehicle with new odometer + lifetime stats
      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: {
          // Current odometer
          odometer_hour: isOdometerHourly ? normalizedOdometer : null,
          odometer_km: isOdometerHourly ? null : normalizedOdometer,

          // Tracked units (distance from initial odometer)
          lifetimeTotalTrackedUnits_km: isOdometerHourly
            ? null
            : (normalizedOdometer || 0) - (vehicle.initialOdometer_km || 0),
          lifetimeTotalTrackedUnits_hour: isOdometerHourly
            ? (normalizedOdometer || 0) - (vehicle.initialOdometer_hour || 0)
            : null,

          // Last refill odometer (for validation)
          lastRefillOdometer_hour: isOdometerHourly ? normalizedOdometer : null,
          lastRefillOdometer_km: isOdometerHourly ? null : normalizedOdometer,

          // Update lifetime totals
          lifetimeTotalFuelConsumed_L: { increment: fuelLiters },
          lifetimeTotalCost: { increment: refillData.costTotal ?? 0 },
          lifetimeTotalValidFuelForConsumption_L: { increment: consumptionResult.validFuel ?? 0 },
          lifetimeTotalValidUnitsForConsumption_km: {
            increment: isOdometerHourly ? 0 : (consumptionResult.validUnits ?? 0),
          },
          lifetimeTotalValidUnitsForConsumption_hour: {
            increment: isOdometerHourly ? (consumptionResult.validUnits ?? 0) : 0,
          },
        },
      });

      //  Update monthly statistics
      await this.updateMonthlyStatistics(
        tx,
        refillData.vehicleId,
        refillData.date,
        fuelLiters,
        refillData.costTotal ?? 0,
        consumptionResult,
        odometerDelta,
        isOdometerHourly,
      );

      // Update user's storage usage
      await this.limitsService.incrementStorageUsage(tx, vehicle.ownerId, 'REFILL', byteSize);
    });
  }

  async getRefillsForChart(UserSession: UserSession, vehicleId: string, dateLimit: Date): Promise<TRefillForClient[]> {
    await this.authValidation.hasAccessToVehicle(UserSession.user.id, vehicleId);

    const [user, refills] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: UserSession.user.id },
      }),

      this.prisma.refill.findMany({
        where: {
          vehicleId,
          date: { gte: dateLimit },
          OR: [{ consumption_L_per_100km: { not: null } }, { consumption_L_per_hour: { not: null } }],
        },
        orderBy: { date: 'asc' },
        select: this.refillTransformer.DB_refill_select(),
      }),
    ]);

    if (!user) throw new BadRequestException('User not found');

    // Single-pass grouping with running average
    return refills.map((refill) => {
      return this.refillTransformer.toClientRefill(refill, user);
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

  private calculateOdometerDelta(
    previousLog: Refill | null,
    currentOdometer: number,
    isOdometerHourly: boolean,
  ): { deltaKm: number; deltaHour: number } {
    if (!previousLog) {
      // First refill - no delta to calculate
      return { deltaKm: 0, deltaHour: 0 };
    }

    const previousOdometer = isOdometerHourly ? (previousLog.odometer_hour ?? 0) : (previousLog.odometer_km ?? 0);

    const delta = currentOdometer - previousOdometer;

    // Ensure delta is positive (should be guaranteed by validation, but safety check)
    const safeDelta = Math.max(0, delta);

    return {
      deltaKm: isOdometerHourly ? 0 : safeDelta,
      deltaHour: isOdometerHourly ? safeDelta : 0,
    };
  }

  private async updateMonthlyStatistics(
    prisma: Prisma.TransactionClient,
    vehicleId: string,
    refillDate: Date,
    fuelLiters: number,
    costTotal: number,
    consumptionResult: { consumption: number | null; validFuel: number | null; validUnits: number | null },
    odometerDelta: { deltaKm: number; deltaHour: number },
    isOdometerHourly: boolean,
  ): Promise<void> {
    const year = refillDate.getFullYear();
    const month = refillDate.getMonth() + 1; // Months are zero-based

    // Calculate monthly running cost (fuel + maintenance)

    // Upsert monthly statistics
    await prisma.vehicleMonthlyStatistics.upsert({
      where: {
        vehicleId_year_month: {
          vehicleId,
          year,
          month,
        },
      },
      create: {
        vehicleId,
        year,
        month,
        totalFuelConsumed_L: fuelLiters,
        totalFuelCost: costTotal,
        monthlyValidFuelForConsumption_L: consumptionResult.validFuel ?? 0,
        monthlyValidUnitsForConsumption_km: isOdometerHourly ? 0 : (consumptionResult.validUnits ?? 0),
        monthlyValidUnitsForConsumption_hour: isOdometerHourly ? (consumptionResult.validUnits ?? 0) : 0,
        monthlyOdometerUnits_km: odometerDelta.deltaKm,
        monthlyOdometerUnits_hour: odometerDelta.deltaHour,
        monthlyRunningCost: costTotal,
      },
      update: {
        totalFuelConsumed_L: { increment: fuelLiters },
        totalFuelCost: { increment: costTotal },
        monthlyValidFuelForConsumption_L: { increment: consumptionResult.validFuel ?? 0 },
        monthlyValidUnitsForConsumption_km: { increment: isOdometerHourly ? 0 : (consumptionResult.validUnits ?? 0) },
        monthlyValidUnitsForConsumption_hour: { increment: isOdometerHourly ? (consumptionResult.validUnits ?? 0) : 0 },
        monthlyOdometerUnits_km: { increment: odometerDelta.deltaKm },
        monthlyOdometerUnits_hour: { increment: odometerDelta.deltaHour },
        monthlyRunningCost: { increment: costTotal },
      },
    });
  }
}
