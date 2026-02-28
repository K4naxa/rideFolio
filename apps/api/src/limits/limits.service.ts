import { ForbiddenException, Injectable } from '@nestjs/common';
import { MaintenanceInput, StorageBreakdown, VehicleInput } from '@repo/validation';
import { Prisma, StorageUsageCategory } from 'prisma/generated/client';
import { MaintenancePartTransformer } from 'src/logs/maintenance/maintenance-part.transformer';
import { PrismaService } from 'src/prisma/prisma.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';

const CREATION_SYSTEM_OVERHEAD_BUFFER: number = 250; // Estimated overhead per database row in bytes
const STORAGE_SYNC_THRESHOLD_BYTES: number = 250; // Used for high frequency updates ( Notes )

@Injectable()
export class LimitsService {
  constructor(
    private prisma: PrismaService,
    private unitConversion: UnitConversionService,
    private partTransformer: MaintenancePartTransformer,
  ) {}

  calculateSizeBytes(data: unknown): number {
    if (data === null || data === undefined) return CREATION_SYSTEM_OVERHEAD_BUFFER;

    const payloadBytes = Buffer.byteLength(JSON.stringify(data), 'utf8');
    return payloadBytes;
  }

  calculateSizeWithChildrenBytes(parentData: unknown, children: unknown[] = []): number {
    const parentSize = this.calculateSizeBytes(parentData);
    const childrenSize = children.reduce<number>((sum, child) => sum + this.calculateSizeBytes(child), 0);
    return parentSize + childrenSize;
  }

  private async getUserWithPlan(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        storageUsageBytes: true,
        plan: {
          select: {
            maxStorageBytes: true,
            maxVehicles: true,
          },
        },
      },
    });
    const vehicleCount = await this.prisma.vehicle.count({
      where: {
        ownerId: userId,
      },
    });

    if (!user) throw new ForbiddenException('user not found');
    return { ...user, vehicleCount };
  }

  // LIMIT CHECKING
  private isUnlimited(limit: bigint | number): boolean {
    return BigInt(limit) === BigInt(-1);
  }

  isUpdateExceedingSyncThreshold(oldSizeBytes: number, newSizeBytes: number): boolean {
    return Math.abs(newSizeBytes - oldSizeBytes) > STORAGE_SYNC_THRESHOLD_BYTES;
  }

  // enforcer to check and enforce limits
  // Throws ForbiddenException if limit exceeded
  private async enforceStorageLimit(userId: string, storageOwnerId: string, bytesToAdd: number): Promise<void> {
    const isStorageOwner = userId === storageOwnerId;

    const storageOwner = await this.getUserWithPlan(storageOwnerId);
    // Admin or unlimited plan === always allowed
    if (this.isUnlimited(storageOwner.plan.maxStorageBytes)) return;

    const projectedUsage = storageOwner.storageUsageBytes + BigInt(bytesToAdd);
    if (projectedUsage > storageOwner.plan.maxStorageBytes) {
      const usedMB = this.unitConversion.getMBFromBytes(storageOwner.storageUsageBytes);
      const limitMB = this.unitConversion.getMBFromBytes(storageOwner.plan.maxStorageBytes);
      throw new ForbiddenException({
        code: 'STORAGE_LIMIT_EXCEEDED',
        message: isStorageOwner
          ? `Storage limit exceeded (${usedMB.toFixed(2)} MB / ${limitMB.toFixed(2)} MB). Please upgrade your plan.`
          : `Vehicle owner's storage limit exceeded. The owner needs to upgrade their plan or free up space.`,
      });
    }
  }

  private async enforceVehicleLimit(userId: string): Promise<void> {
    const user = await this.getUserWithPlan(userId);
    if (this.isUnlimited(user.plan.maxVehicles)) return;

    if (user.vehicleCount >= user.plan.maxVehicles) {
      throw new ForbiddenException({
        code: 'VEHICLE_LIMIT_EXCEEDED',
        message: `Vehicle limit reached (${user.vehicleCount}/${user.plan.maxVehicles}). Please upgrade your plan.`,
      });
    }
  }

  // COMBINED VALIDATORS
  async canCreateVehicle(userId: string, data: VehicleInput): Promise<number> {
    await this.enforceVehicleLimit(userId);
    const sizeBytes = this.calculateSizeBytes(data) + CREATION_SYSTEM_OVERHEAD_BUFFER;
    await this.enforceStorageLimit(userId, userId, sizeBytes);
    return sizeBytes;
  }

  async canCreateMaintenance(userId: string, storageOwnerId: string, data: MaintenanceInput): Promise<number> {
    const { parts, ...maintenanceData } = data;

    // Estimate size including parts
    const partsDbFormat = this.partTransformer.toDbFormat('temp-id', parts); // 'temp-id' since we only need size

    const sizeBytes =
      this.calculateSizeWithChildrenBytes(maintenanceData, partsDbFormat) + CREATION_SYSTEM_OVERHEAD_BUFFER;
    await this.enforceStorageLimit(userId, storageOwnerId, sizeBytes);
    return sizeBytes;
  }

  async canCreateLog(userId: string, storageOwnerId: string, data: unknown): Promise<number> {
    const sizeBytes = this.calculateSizeBytes(data) + CREATION_SYSTEM_OVERHEAD_BUFFER;
    await this.enforceStorageLimit(userId, storageOwnerId, sizeBytes);
    return sizeBytes;
  }

  // Throws ForbiddenException if limit exceeded
  async canUpdateLog(userId: string, storageOwnerId: string, oldSizeBytes: number, data: unknown): Promise<number> {
    const newSize = this.calculateSizeBytes(data);
    const delta = newSize - oldSizeBytes;
    // Enforce only if size is increasing
    if (delta > 0) await this.enforceStorageLimit(userId, storageOwnerId, delta);
    return newSize;
  }

  // STORAGE USAGE UPDATES
  async incrementStorageUsage(
    tx: Prisma.TransactionClient,
    storageOwnerId: string,
    category: StorageUsageCategory,
    bytesToAdd: number,
  ): Promise<void> {
    await tx.user.update({
      where: { id: storageOwnerId },
      data: {
        storageUsageBytes: { increment: BigInt(bytesToAdd) },
      },
    });
    await tx.storageUsage.upsert({
      where: { userId_category: { userId: storageOwnerId, category } },
      update: {
        bytes: { increment: BigInt(bytesToAdd) },
      },
      create: {
        userId: storageOwnerId,
        category,
        bytes: BigInt(bytesToAdd),
      },
    });
  }

  async decrementStorageUsage(
    tx: Prisma.TransactionClient,
    storageOwnerId: string | null | undefined,
    category: StorageUsageCategory,
    bytesToSubtract: number,
  ): Promise<void> {
    if (!storageOwnerId) return;
    await tx.user.update({
      where: { id: storageOwnerId },
      data: {
        storageUsageBytes: { decrement: BigInt(bytesToSubtract) },
      },
    });

    await tx.storageUsage.update({
      where: { userId_category: { userId: storageOwnerId, category } },
      data: {
        bytes: { decrement: BigInt(bytesToSubtract) },
      },
    });
  }

  // Checking if sync is needed based on threshold
  shouldSyncStorage(oldSizeBytes: number, newSizeBytes: number): boolean {
    return Math.abs(newSizeBytes - oldSizeBytes) >= STORAGE_SYNC_THRESHOLD_BYTES;
  }

  syncStorageUsage = async (
    tx: Prisma.TransactionClient,
    storageOwnerId: string,
    category: StorageUsageCategory,
    oldsizeBytes: number,
    newSizeBytes: number,
  ): Promise<void> => {
    const delta = newSizeBytes - oldsizeBytes;
    if (delta === 0) return; // No change

    await Promise.all([
      tx.user.update({
        where: { id: storageOwnerId },
        data: {
          storageUsageBytes: delta > 0 ? { increment: BigInt(delta) } : { decrement: BigInt(-delta) },
        },
      }),

      tx.storageUsage.update({
        where: { userId_category: { userId: storageOwnerId, category } },
        data: {
          bytes: delta > 0 ? { increment: BigInt(delta) } : { decrement: BigInt(-delta) },
        },
      }),
    ]);
  };

  // USAGE SUMMARY FOR FRONTEND
  async getStorageBreakdown(userId: string): Promise<StorageBreakdown> {
    const user = await this.getUserWithPlan(userId);
    const isUnlimited = this.isUnlimited(user.plan.maxStorageBytes);

    const storageUsage = await this.prisma.storageUsage.findMany({
      where: { userId },
      select: {
        category: true,
        bytes: true,
      },
    });

    const formattedUsage = storageUsage
      .map((usage) => {
        return {
          category: usage.category,
          bytes: Number(usage.bytes),
        };
      })
      .sort((a, b) => b.bytes - a.bytes);

    return {
      usage: Number(user.storageUsageBytes),
      breakdown: formattedUsage,
    };
  }
}
