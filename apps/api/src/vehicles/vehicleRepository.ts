import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VehicleRepository {
  constructor(private prisma: PrismaService) {}

  // Base vehicle query - reusable across all methods

  // Complex query builder for vehicles with group data
  private getVehicleWithGroupsQuery(userId: string) {
    return {
      where: {
        OR: [
          { ownerId: userId },
          {
            groups: {
              some: { group: { members: { some: { userId } } } },
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
        groups: {
          where: {
            group: {
              members: { some: { userId } },
            },
          },
          select: {
            membersCanAddLogs: true,
            membersCanEditLogs: true,
            membersCanDeleteLogs: true,
            group: {
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

  private getGroupVehiclesQuery(groupId: string) {
    return {
      where: { group: { id: groupId } },
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
            groups: {
              some: { group: { members: { some: { userId } } } },
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

  async findGroupVehicles(groupId: string) {
    return this.prisma.groupVehicle.findMany(this.getGroupVehiclesQuery(groupId));
  }

  async findAccessibleVehicles(userId: string) {
    return this.prisma.vehicle.findMany(this.getVehicleWithGroupsQuery(userId));
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
