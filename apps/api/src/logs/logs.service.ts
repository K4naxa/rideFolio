import { Injectable, NotFoundException } from '@nestjs/common';
import { OdometerTypes } from '@prisma/client';
import { RecentActivityInfiniteResponse, RecentActivityQueryOptions, TVehicleTypeCode } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { VehicleRepository } from 'src/utils/vehicleRepository';

interface RecentActivityItem {
  type: 'refill' | 'maintenance';
  date: Date;
  vehicle: { name: string; type: TVehicleTypeCode; odometerType: string };
  data: any; // normalized payload
}

@Injectable()
export class LogsService {
  constructor(
    private prisma: PrismaService,
    private vehicleRepository: VehicleRepository,
    private authValidation: AuthValidationService,
    private unitConversion: UnitConversionService,
  ) {}

  async getRecentActivity(
    userSession: UserSession,
    options: RecentActivityQueryOptions,
  ): Promise<RecentActivityInfiniteResponse> {
    const { take, cursor } = options;
    if (take <= 0) return { items: [], nextCursor: null, name: null };

    console.log('getRecentActivity called with options:', options);
    // Scope vehicles

    const { vehicleIds, name } = await this.getVehicleIdsAndName(options, userSession);

    const user = await this.prisma.user.findUnique({
      where: { id: userSession.user.id },
      select: { volumeUnit: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const dateFilter = cursor
      ? {
          OR: [
            { date: { lt: new Date(cursor.date) } },
            { AND: [{ date: { equals: new Date(cursor.date) } }, { id: { lt: cursor.id } }] },
          ],
        }
      : {};

    const fetchSize = take * 2; // over fetch to compensate merge

    type VehicleSelect = { name: string; type: string; odometerType: string };
    type RefillSelect = {
      id: string;
      date: Date;
      odometer_km: number | null;
      odometer_hour: number | null;
      fullRefill: boolean;
      skippedRefill: boolean;
      consumption_L_per_100km: number | null;
      consumption_L_per_hour: number | null;
      fuelAmount_L: number;
      totalCost: number | null;
      notes: string | null;
      vehicle: VehicleSelect;
    };
    type MaintenanceSelect = {
      id: string;
      date: Date;
      odometer_km: number | null;
      odometer_hour: number | null;
      maintenanceType: string;
      costTotal: number | null;
      notes: string | null;
      vehicle: VehicleSelect;
      parts: Array<{
        part: { code: string };
        quantity: number;
        cost: number | null;
        location: { code: string };
      }>;
    };

    const [refills, maintenances] = await Promise.all([
      this.prisma.refill.findMany({
        where: { vehicleId: { in: vehicleIds }, ...dateFilter },
        select: {
          id: true,
          date: true,
          odometer_km: true,
          odometer_hour: true,
          fullRefill: true,
          skippedRefill: true,
          consumption_L_per_100km: true,
          consumption_L_per_hour: true,
          fuelAmount_L: true,
          totalCost: true,
          notes: true,
          vehicle: { select: { name: true, type: true, odometerType: true } },
        },
        orderBy: [{ date: 'desc' }, { id: 'desc' }],
        take: fetchSize,
      }),
      this.prisma.maintenance.findMany({
        where: { vehicleId: { in: vehicleIds }, ...dateFilter },
        select: {
          id: true,
          date: true,
          odometer_km: true,
          odometer_hour: true,
          maintenanceType: true,
          costTotal: true,
          notes: true,
          parts: {
            select: {
              part: { select: { code: true } },
              location: { select: { code: true } },
            },
          },
          vehicle: { select: { name: true, type: true, odometerType: true } },
        },
        orderBy: [{ date: 'desc' }, { id: 'desc' }],
        take: fetchSize,
      }),
    ]);

    const merged: RecentActivityItem[] = [
      ...refills.map((r) => ({
        type: 'refill' as const,
        date: r.date,
        vehicle: {
          name: r.vehicle.name,
          type: r.vehicle.type as TVehicleTypeCode,
          odometerType: r.vehicle.odometerType,
        },
        data: r,
      })),
      ...maintenances.map((m) => ({
        type: 'maintenance' as const,
        date: m.date,
        vehicle: {
          name: m.vehicle.name,
          type: m.vehicle.type as TVehicleTypeCode,
          odometerType: m.vehicle.odometerType,
        },
        data: m,
      })),
    ].sort((a, b) => {
      const diff = b.date.getTime() - a.date.getTime();
      if (diff !== 0) return diff;
      const bId = (b.data as { id: string }).id;
      const aId = (a.data as { id: string }).id;
      return bId.localeCompare(aId);
    });

    const pageItems = merged.slice(0, take);

    const normalized = pageItems.map((item) => {
      if (item.type === 'refill') {
        const log = item.data as RefillSelect;
        const isHourly = item.vehicle.odometerType === 'HOUR';
        return {
          ...item,
          data: {
            id: log.id,
            date: log.date,
            notes: log.notes,
            odometerData: this.unitConversion.getOdometerDataByType(
              isHourly ? log.odometer_hour : log.odometer_km,
              item.vehicle.odometerType as OdometerTypes,
            ),
            fullRefill: log.fullRefill,
            skippedRefill: log.skippedRefill,
            fuelAmountData: this.unitConversion.getVolumeDataByUnitType(log.fuelAmount_L, user.volumeUnit),
            totalCost: log.totalCost,
          },
        } as RecentActivityItem;
      } else {
        const log = item.data as MaintenanceSelect;
        const isHourly = item.vehicle.odometerType === 'HOUR';
        return {
          ...item,
          data: {
            id: log.id,
            date: log.date,
            notes: log.notes,
            odometerData: this.unitConversion.getOdometerDataByType(
              isHourly ? log.odometer_hour : log.odometer_km,
              item.vehicle.odometerType as OdometerTypes,
            ),
            maintenanceType: log.maintenanceType,
            costTotal: log.costTotal,
            parts: log.parts,
          },
        } as RecentActivityItem;
      }
    });

    let nextCursor: { date: string; id: string } | null = null;
    const lastItem = pageItems[pageItems.length - 1] as (RecentActivityItem & { data: { id: string } }) | undefined;
    const hasMore =
      merged.length > pageItems.length || refills.length === fetchSize || maintenances.length === fetchSize;
    if (hasMore && lastItem) {
      nextCursor = { date: lastItem.date.toISOString(), id: (lastItem.data as { id: string }).id };
    }

    return { items: normalized, nextCursor, name: name };
  }

  private async getVehicleIdsAndName(
    options: RecentActivityQueryOptions,
    UserSession: UserSession,
  ): Promise<{ vehicleIds: string[]; name: string | null }> {
    const { vehicleId, poolId, owned } = options;
    let name: string | null = null;
    let targetVehicleIds: string[] = [];

    console.log('owned value:', owned, 'type:', typeof owned);

    if (vehicleId) {
      await this.authValidation.hasAccessToVehicle(UserSession.user.id, vehicleId);
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { name: true } });
      name = vehicle?.name || null;
      return { vehicleIds: [vehicleId], name: name };
    }
    // pool id provided
    else if (poolId) {
      await this.authValidation.hasAccessToPool(UserSession.user.id, poolId);
      const [poolVehicles, pool] = await Promise.all([
        this.vehicleRepository.findPoolVehicles(poolId),
        this.prisma.pool.findUnique({ where: { id: poolId }, select: { name: true } }),
      ]);
      name = pool?.name || null;
      targetVehicleIds = poolVehicles.map((pv) => pv.vehicle.id);
      return { vehicleIds: targetVehicleIds, name: name };
    }
    // owned vehicles
    else if (owned === 'true' || owned === true) {
      const ownedVehicles = await this.vehicleRepository.findOwnVehicles(UserSession.user.id);
      targetVehicleIds = ownedVehicles.map((v) => v.id);
      name = 'Owned Vehicles';
      return { vehicleIds: targetVehicleIds, name: name };
    }
    // all accessible vehicles
    else {
      const accessible = await this.vehicleRepository.findAccessibleVehicles(UserSession.user.id);
      targetVehicleIds = accessible.map((v) => v.id);
      name = 'All Vehicles';
      return { vehicleIds: targetVehicleIds, name: name };
    }
  }
}
