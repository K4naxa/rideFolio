import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TBasicProfile } from '@repo/validation';

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
        currency: user.currency,
      },
    };

    return basicProfile;
  }
}
