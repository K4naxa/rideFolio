import { Injectable } from '@nestjs/common';
import { AppNotFoundException } from 'src/exceptions';
import { PrismaService } from 'src/prisma/prisma.service';
import { CurrencyCode, TBasicProfile, UpdatePreferenceValues } from '@repo/validation';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // =================================================================
  // ==  GET USER PROFILE DATA ==
  // =================================================================

  async getBasicProfile(id: string): Promise<TBasicProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        volumeUnit: true,
        consumptionUnitCode_distance: true,
        consumptionUnitCode_hour: true,
        currency: true,
        plan: {
          select: {
            id: true,
            code: true,
            nameKey: true,
            maxStorageBytes: true,
            maxVehicles: true,
            priceCents: true,
          },
        },
        storageUsageBytes: true,
        _count: {
          select: {
            ownedVehicles: true,
          },
        },
      },
    });

    if (!user) {
      // This should never happen
      throw new AppNotFoundException();
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      usedStorageBytes: Number(user.storageUsageBytes),
      usedVehicles: user._count.ownedVehicles,
      createdAt: user.createdAt,
      preferences: {
        volumeUnit: user.volumeUnit,
        consumptionUnitCode_distance: user.consumptionUnitCode_distance,
        consumptionUnitCode_hour: user.consumptionUnitCode_hour,
        currency: user.currency as CurrencyCode,
      },
      subscriptionPlan: {
        id: user.plan.id,
        code: user.plan.code,
        nameKey: user.plan.nameKey,
        maxStorageBytes: Number(user.plan.maxStorageBytes),
        maxVehicles: user.plan.maxVehicles,
        priceCents: user.plan.priceCents,
      },
    };
  }

  async updatePreferences(userId: string, data: UpdatePreferenceValues): Promise<TBasicProfile> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        [data.key]: data.value,
      },
    });

    return this.getBasicProfile(userId);
  }
}
