import { Injectable } from '@nestjs/common';
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
            allowMembersToAddLogs: true,
            allowMembersToEditLogs: true,
            allowMembersToDeleteLogs: true,
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

  async findPoolVehicles(poolId: string) {
    return await this.prisma.poolVehicle.findMany(this.getPoolVehiclesQuery(poolId));
  }

  async findAccessibleVehicles(userId: string) {
    return await this.prisma.vehicle.findMany(this.getVehicleWithPoolsQuery(userId));
  }

  async findOwnVehicles(userId: string) {
    return await this.prisma.vehicle.findMany({
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
    return await this.prisma.vehicle.findUnique({
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
