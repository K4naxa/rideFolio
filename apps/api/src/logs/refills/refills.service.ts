import { UnitConversionService } from '../../utils/unit-conversion.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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

  async createRefill(userSession: UserSession, refillData: RefillSchemaOutput): Promise<void> {
    // 1. Check if the user has permission to create logs for the vehicle
    const vehicle = await this.authValidation.hasAccessToVehicle(userSession.user.id, refillData.vehicleId);

    // validate user storage limits
    const byteSize = await this.limitsService.canCreateLog(userSession.user.id, vehicle.ownerId, refillData);

    // 2. Fetch user, vehicle and previous log data
    const [user, previousRefill, nextRefill] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userSession.user.id },
        select: {
          volumeUnit: true,
        },
      }),

      this.prisma.refill.findFirst({
        where: { vehicleId: refillData.vehicleId, date: { lt: refillData.date } },
        orderBy: { date: 'desc' },
      }),
      this.prisma.refill.findFirst({
        where: { vehicleId: vehicle.id, date: { gt: refillData.date } },
        orderBy: { date: 'asc' },
      }),
    ]);

    if (!user || !vehicle) {
      // Should never happen, but just to satisfy TypeScript
      throw new Error('user or Vehicle not found');
    }

    const isOdometerHourly = vehicle.odometerType === 'HOUR';
    const normalizedOdometer = this.unitConversion.normalizeOdometer(refillData.odometer, vehicle.odometerType);
    const fuelLiters = this.unitConversion.normalizeFuelAmount(refillData.fuelAmount, user.volumeUnit);

    // validate odometer compared to adjacent refills for date (use normalized value to compare against stored normalized values)
    this.validateOdometerValue(normalizedOdometer, previousRefill, nextRefill, isOdometerHourly);

    await this.prisma.$transaction(async (tx) => {
      const oldNextFullRefill = await this.getNextFullRefillSnaphot({
        tx: tx,
        vehicleId: refillData.vehicleId,
        date: refillData.date,
        vehicle,
      });

      const currentConsumptionResult = refillData.fullRefill
        ? await this.calculateConsumption(tx, refillData, normalizedOdometer, fuelLiters, isOdometerHourly)
        : null;

      // Create a new refill
      await tx.refill.create({
        data: {
          vehicleId: refillData.vehicleId,
          userId: userSession.user.id,
          date: refillData.date,
          odometer_hour: isOdometerHourly ? normalizedOdometer : null,
          odometer_km: isOdometerHourly ? null : normalizedOdometer,
          fullRefill: refillData.fullRefill,
          skippedRefill: refillData.skippedRefill,
          fuelAmount_L: fuelLiters,
          pricePerUnit: refillData.pricePerUnit,
          costTotal: refillData.costTotal,
          notes: refillData.notes,
          consumption_L_per_100km: isOdometerHourly ? null : currentConsumptionResult?.consumption,
          consumption_L_per_hour: isOdometerHourly ? currentConsumptionResult?.consumption : null,
          sizeBytes: byteSize,
        },
      });

      let updatedNextRefillConsumption: ConsumptionResult = null;
      if (oldNextFullRefill) {
        // If the next full refill exists, we need to recalculate the updated consumption
        updatedNextRefillConsumption = await this.recalculateConsumption({
          tx: tx,
          oldRefill: oldNextFullRefill.refill,
          vehicle,
        });
      }

      const { validFuelDelta, validUnitsDelta } = this.calculateLifetimeStatsDeltas({
        currentConsumption: currentConsumptionResult,
        oldNextRefillConsumption: oldNextFullRefill?.consumption,
        newNextRefillConsumption: updatedNextRefillConsumption,
      });

      let vehicleUpdateData: Prisma.VehicleUpdateInput = {};

      vehicleUpdateData = {
        lifetimeTotalValidFuelForConsumption_L:
          validFuelDelta > 0 ? { increment: validFuelDelta } : { decrement: Math.abs(validFuelDelta) },

        lifetimeTotalValidUnitsForConsumption_km: isOdometerHourly
          ? null
          : validUnitsDelta > 0
            ? { increment: validUnitsDelta }
            : { decrement: Math.abs(validUnitsDelta) },
        lifetimeTotalValidUnitsForConsumption_hour: isOdometerHourly
          ? validUnitsDelta > 0
            ? { increment: validUnitsDelta }
            : { decrement: Math.abs(validUnitsDelta) }
          : null,

        lifetimeTotalCost: { increment: refillData.costTotal ?? 0 },
        lifetimeTotalFuelConsumed_L: { increment: fuelLiters },
      };

      if (!nextRefill) {
        vehicleUpdateData = {
          ...vehicleUpdateData,
          // Current odometer
          odometer_hour: isOdometerHourly ? normalizedOdometer : null,
          odometer_km: isOdometerHourly ? null : normalizedOdometer,

          // Tracked units (distance from initial odometer)
          lifetimeTotalTrackedUnits_km: isOdometerHourly
            ? null
            : normalizedOdometer - (vehicle.initialOdometer_km || 0),
          lifetimeTotalTrackedUnits_hour: isOdometerHourly
            ? normalizedOdometer - (vehicle.initialOdometer_hour || 0)
            : null,

          // Last refill odometer
          lastRefillOdometer_hour: isOdometerHourly ? normalizedOdometer : null,
          lastRefillOdometer_km: isOdometerHourly ? null : normalizedOdometer,
        };
      }

      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: vehicleUpdateData,
      });

      // Update monthly statistics
      await this.updateMonthlyStatistics(tx, vehicle, refillData.date, {
        validUnitsForConsumption: validUnitsDelta,
        validFuelForConsumption: validFuelDelta,
        totalFuelConsumed: fuelLiters,
        totalFuelCost: refillData.costTotal ?? 0,
      });

      // Update user's storage usage
      await this.limitsService.incrementStorageUsage(tx, vehicle.ownerId, 'REFILL', byteSize);
    });
  }

  private async updateMonthlyStatistics(
    tx: Prisma.TransactionClient,
    vehicle: Vehicle,
    date: Date,
    deltas: {
      validUnitsForConsumption: number;
      validFuelForConsumption: number;
      totalFuelConsumed: number;
      totalFuelCost: number;
    },
  ) {
    const month = date.getMonth() + 1; // schema uses 1-12
    const year = date.getFullYear();
    const isHourly = vehicle.odometerType === 'HOUR';

    const vehicleId = vehicle.id;

    await tx.vehicleMonthlyStatistics.upsert({
      where: { vehicleId_year_month: { vehicleId, year, month } },
      update: {
        monthlyValidUnitsForConsumption_km: isHourly ? undefined : { increment: deltas.validUnitsForConsumption },
        monthlyValidUnitsForConsumption_hour: isHourly ? { increment: deltas.validUnitsForConsumption } : undefined,
        monthlyValidFuelForConsumption_L: { increment: deltas.validFuelForConsumption },
        totalFuelConsumed_L: { increment: deltas.totalFuelConsumed },
        totalFuelCost: { increment: deltas.totalFuelCost },
      },
      create: {
        vehicleId,
        year,
        month,
        monthlyValidUnitsForConsumption_km: isHourly ? 0 : deltas.validUnitsForConsumption,
        monthlyValidUnitsForConsumption_hour: isHourly ? deltas.validUnitsForConsumption : 0,
        monthlyValidFuelForConsumption_L: deltas.validFuelForConsumption,
        totalFuelConsumed_L: deltas.totalFuelConsumed,
        totalFuelCost: deltas.totalFuelCost,
      },
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

  private validateOdometerValue(
    normalizedOdometer: number,
    previousRefill: Refill | null,
    nextRefill: Refill | null,
    isHourly: boolean,
  ): void {
    if (!previousRefill && !nextRefill) return;

    const minValue = previousRefill ? this.getOdometerValue(previousRefill, isHourly) : null;
    const maxValue = nextRefill ? this.getOdometerValue(nextRefill, isHourly) : null;

    const isBelowMin = minValue !== null && normalizedOdometer <= minValue;
    const isAboveMax = maxValue !== null && normalizedOdometer >= maxValue;

    if (isBelowMin || isAboveMax) {
      let message: string;
      if (minValue !== null && maxValue !== null) {
        message = `Odometer must be between ${minValue} and ${maxValue} for the selected date.`;
      } else if (minValue !== null) {
        message = `Odometer must be greater than ${minValue} for the selected date.`;
      } else {
        message = `Odometer must be less than ${maxValue} for the selected date.`;
      }

      throw new BadRequestException({ message, field: 'odometer' });
    }
  }

  private getOdometerValue(refill: Refill, isHourly: boolean): number {
    const value = isHourly ? refill.odometer_hour : refill.odometer_km;
    if (!value) {
      Logger.error('odometer value is null', 'getOdometerValue', {
        refill: refill,
        isHourly: isHourly,
      });
      throw new BadRequestException({
        message: `Something went wrong. Please try again.`,
      });
    }

    return value;
  }

  // Returns the next full refill snapshot after the given date, or null if there is a skipped refill in between or no future refills
  // Used to determine if the next full refill needs to be synced to the new refill consumption or if the period is invalid due to a skipped refill
  private async getNextFullRefillSnaphot({
    tx,
    vehicleId,
    date,
    vehicle,
  }: {
    tx: Prisma.TransactionClient;
    vehicleId: string;
    date: Date;
    vehicle: Pick<Vehicle, 'odometerType'>;
  }): Promise<{
    refill: Refill;
    consumption: ConsumptionResult;
  } | null> {
    const refill = await tx.refill.findFirst({
      where: {
        vehicleId,
        date: { gt: date },
        OR: [{ fullRefill: true }, { skippedRefill: true }],
      },
      orderBy: { date: 'asc' },
    });

    // No future full/skipped refill or a skipped refill invalidates the period
    if (!refill || refill.skippedRefill) return null;

    const isHourly = vehicle.odometerType === 'HOUR';
    const currentOdometer = this.getOdometerValue(refill, isHourly);
    const consumption = await this.calculateConsumption(tx, refill, currentOdometer, refill.fuelAmount_L, isHourly);

    return {
      refill,
      consumption,
    };
  }

  // Recalculates the consumption for an existing refill
  // Used to validate next Full refill consumption when mutating or creating refill in between old ones
  private async recalculateConsumption({
    tx,
    oldRefill,
    vehicle,
  }: {
    tx: Prisma.TransactionClient;
    oldRefill: Refill;
    vehicle: Pick<Vehicle, 'odometerType'>;
  }): Promise<ConsumptionResult> {
    // Find the next full refill or skipped refill

    const isHourly = vehicle.odometerType === 'HOUR';
    const currentOdometer = this.getOdometerValue(oldRefill, isHourly);
    const fuelLiters = oldRefill.fuelAmount_L;

    const consumptionResult = await this.calculateConsumption(tx, oldRefill, currentOdometer, fuelLiters, isHourly);

    const consumptionHour = isHourly ? (consumptionResult ? consumptionResult.consumption : null) : null;
    const consumptionKm = isHourly ? null : consumptionResult ? consumptionResult.consumption : null;

    await tx.refill.update({
      where: { id: oldRefill.id },
      data: {
        consumption_L_per_100km: consumptionKm,
        consumption_L_per_hour: consumptionHour,
      },
    });

    return consumptionResult;
  }

  private async calculateConsumption(
    prisma: Prisma.TransactionClient,
    currentRefill: RefillSchemaOutput | Refill,
    currentOdometer: number,
    currentFuelLiters: number,
    isOdometerHourly: boolean,
  ): Promise<ConsumptionResult> {
    // Find the last full or skipped refill
    const firstHitBackwards = await prisma.refill.findFirst({
      where: {
        vehicleId: currentRefill.vehicleId,
        date: { lt: currentRefill.date },
        OR: [{ fullRefill: true }, { skippedRefill: true }],
      },
      orderBy: { date: 'desc' },
    });

    // No consumption calculations possible if there is no previous full refill or a skipped refill is hit first (invalidates the period)
    if (!firstHitBackwards || firstHitBackwards.skippedRefill) return null;

    const refillsBackwards = await prisma.refill.findMany({
      where: {
        vehicleId: currentRefill.vehicleId,
        date: { lt: currentRefill.date, gt: firstHitBackwards.date },
      },
      orderBy: { date: 'desc' },
      select: {
        fuelAmount_L: true,
      },
    });

    // Calculate total fuel in the period
    const totalFuel =
      refillsBackwards.reduce((sum: number, refill) => sum + refill.fuelAmount_L, 0) + currentFuelLiters;

    // calculate distance/hours traveled
    const lastOdometer = this.getOdometerValue(firstHitBackwards, isOdometerHourly);
    const units = currentOdometer - lastOdometer;

    if (units <= 0) {
      return null;
    }

    // Calculate consumption
    const consumption = isOdometerHourly ? totalFuel / units : (totalFuel / units) * 100;

    return {
      consumption,
      validFuel: totalFuel,
      validUnits: units,
    };
  }

  /**
   * Calculates the delta for valid fuel and valid units when a refill is added/updated/deleted.
   *
   * @param currentConsumption - The consumption result for the new refill (if full).
   * @param oldNextRefillConsumption - The consumption result for the next refill BEFORE the change.
   * @param newNextRefillConsumption - The consumption result for the next refill AFTER the change.
   */
  private calculateLifetimeStatsDeltas({
    currentConsumption,
    oldNextRefillConsumption,
    newNextRefillConsumption,
  }: {
    currentConsumption?: ConsumptionResult | null;
    oldNextRefillConsumption?: ConsumptionResult | null;
    newNextRefillConsumption?: ConsumptionResult | null;
  }): { validFuelDelta: number; validUnitsDelta: number } {
    const addedFuel = (currentConsumption?.validFuel ?? 0) + (newNextRefillConsumption?.validFuel ?? 0);
    const addedUnits = (currentConsumption?.validUnits ?? 0) + (newNextRefillConsumption?.validUnits ?? 0);

    const removedFuel = oldNextRefillConsumption?.validFuel ?? 0;
    const removedUnits = oldNextRefillConsumption?.validUnits ?? 0;

    return {
      validFuelDelta: addedFuel - removedFuel,
      validUnitsDelta: addedUnits - removedUnits,
    };
  }
}

type ConsumptionResult = {
  consumption: number;
  validFuel: number;
  validUnits: number;
} | null;
