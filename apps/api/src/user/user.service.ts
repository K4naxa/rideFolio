import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CurrencyCode, ProfileUpdateValues, TBasicProfile, UpdatePreferenceValues } from '@repo/validation';
import { LimitsService } from 'src/limits/limits.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private limitsService: LimitsService,
  ) {}

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
      },
    });

    if (!user) {
      // This should never happen
      throw new NotFoundException(`User not found or unauthorized access`);
    }

    const basicProfile: TBasicProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      limits: await this.limitsService.getUsageSummary(user.id),
      preferences: {
        volumeUnit: user.volumeUnit,
        consumptionUnitCode_distance: user.consumptionUnitCode_distance,
        consumptionUnitCode_hour: user.consumptionUnitCode_hour,
        currency: user.currency as CurrencyCode,
      },
    };

    return basicProfile;
  }

  async updateProfile(id: string, data: ProfileUpdateValues): Promise<void> {
    console.log('Updating user profile for user ID:', id, 'with data:', data);
    await this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
      },
    });

    const updatedUser = await this.prisma.user.findUnique({
      where: { id },
    });
    console.log('Updated user profile:', updatedUser);
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
