import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VehicleRepository {
  constructor(private prisma: PrismaService) {}

  // Base vehicle query - reusable across all methods
  private getBaseVehicleQuery() {
    return {
      id: true,
      name: true,
      ownerId: true,
      type: true,
      fuelType: true,
      odometerType: true,
      make: true,
      model: true,
      year: true,
      vin: true,
      licensePlate: true,
      image: true,
      notes: true,
      initialOdometer_km: true,
      initialOdometer_hour: true,
      odometer_km: true,
      odometer_hour: true,
      lastRefillOdometer_km: true,
      lastRefillOdometer_hour: true,
      lifetimeTotalTrackedUnits_km: true,
      lifetimeTotalTrackedUnits_hour: true,

      createdAt: true,
      updatedAt: true,
    };
  }

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
      select: {
        ...this.getBaseVehicleQuery(),
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
          select: {
            ...this.getBaseVehicleQuery(),
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
      select: this.getBaseVehicleQuery(),
    });
  }

  async findVehicleById(vehicleId: string) {
    return await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: {
        ...this.getBaseVehicleQuery(),
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
