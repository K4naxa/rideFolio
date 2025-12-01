import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CurrencyCode, ProfileUpdateValues, TBasicProfile, UpdatePreferenceValues } from '@repo/validation';

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

        odometerType: true,
        volumeUnit: true,
        consumptionUnit_distance: true,
        consumptionUnit_hour: true,
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
      preferences: {
        odometerType: user.odometerType,
        volumeUnit: user.volumeUnit,
        consumptionUnit_distance: user.consumptionUnit_distance,
        consumptionUnit_Hour: user.consumptionUnit_hour,
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
