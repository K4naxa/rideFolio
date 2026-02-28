import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VehicleRepository {
  constructor(private prisma: PrismaService) {}

  // Base vehicle query - reusable across all methods

  // Complex query builder for vehicles with pool data
  private getVehicleWithPoolsQuery(userId: string) {
    return {
      where: {
        OR: [
          { ownerId: userId },
          {
            pools: {
              some: { pool: { members: { some: { userId } } } },
            },
          },
        ],
      },
      include: {
        vehicleType: {
          select: {
            code: true,
            nameKey: true,
            icon: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        pools: {
          where: {
            pool: {
              members: { some: { userId } },
            },
          },
          select: {
            membersCanAddLogs: true,
            membersCanEditLogs: true,
            membersCanDeleteLogs: true,
            pool: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc' as const,
      },
    };
  }

  private getPoolVehiclesQuery(poolId: string) {
    return {
      where: { pool: { id: poolId } },
      select: {
        addedAt: true,
        vehicle: {
          include: {
            vehicleType: {
              select: {
                code: true,
                nameKey: true,
                icon: true,
              },
            },
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    };
  }

  DBInclude_BasicVehicle: Prisma.VehicleInclude = {
    vehicleType: {
      select: {
        code: true,
        nameKey: true,
        icon: true,
      },
    },
  };

  async findAccessibleVehicleIds(userId: string): Promise<string[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            pools: {
              some: { pool: { members: { some: { userId } } } },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });
    return vehicles.map((v) => v.id);
  }

  async findPoolVehicles(poolId: string) {
    return this.prisma.poolVehicle.findMany(this.getPoolVehiclesQuery(poolId));
  }

  async findAccessibleVehicles(userId: string) {
    return this.prisma.vehicle.findMany(this.getVehicleWithPoolsQuery(userId));
  }

  async findOwnVehicles(userId: string) {
    return this.prisma.vehicle.findMany({
      where: { ownerId: userId },
      include: {
        vehicleType: {
          select: {
            code: true,
            nameKey: true,
            icon: true,
          },
        },
      },
    });
  }

  async findVehicleById(vehicleId: string) {
    return this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        vehicleType: {
          select: {
            code: true,
            nameKey: true,
            icon: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }
}
