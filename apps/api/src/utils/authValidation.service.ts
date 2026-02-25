import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Pool, Vehicle } from 'prisma/generated/prisma/client';

@Injectable()
export class AuthValidationService {
  constructor(private prisma: PrismaService) {}

  async hasAccessToVehicle(userId: string, vehicleId: string): Promise<void> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        OR: [
          // Condition 1: user owns the vehicle
          { ownerId: userId },
          // Condition 2: user is in a pool that contains the vehicle
          {
            pools: {
              some: {
                pool: {
                  members: {
                    some: {
                      userId,
                    },
                  },
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    // If no vehicle is found, throw an exception.
    if (!vehicle) {
      console.error('Access denied: user does not have access to the vehicle.');
      throw new NotFoundException({
        code: 'NOT_FOUND_OR_ACCESS_DENIED',
        message: 'Vehicle not found or access denied.',
      });
    }
  }

  async hasAccessToPool(userId: string, poolId: string): Promise<void> {
    const count = await this.prisma.poolMember.count({
      where: {
        pool: { id: poolId },
        userId,
      },
    });

    if (count === 0) {
      console.error('Access denied: user does not have access to the pool.');
      throw new NotFoundException(`Pool not found or access denied.`);
    }
  }

  async canAddVehiclesToPool(userId: string, poolId: string): Promise<Pool> {
    const pool = await this.prisma.pool.findUnique({
      where: {
        id: poolId,
        OR: [
          // User is an owner or admin of the pool
          { members: { some: { userId, OR: [{ role: 'OWNER' }, { role: 'ADMIN' }] } } },
          {
            membersCanAddVehicles: true,
            members: { some: { userId, role: 'MEMBER' } },
          },
        ],
      },
    });

    if (!pool) {
      Logger.error(
        'Permission denied: user: ' + userId + ' does not have permission to add vehicles to pool: ' + poolId,
      );
      throw new NotFoundException('Pool not found or access denied.');
    }

    return pool;
  }

  async canCreateLogs(userId: string, vehicleId?: string | null): Promise<Vehicle> {
    if (!vehicleId) {
      throw new NotFoundException('Vehicle not found or access denied.');
    }
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        OR: [
          // Condition 1: user owns the vehicle
          { ownerId: userId },
          // Condition 2: user is in a pool that contains the vehicle
          {
            pools: {
              some: {
                pool: {
                  membersCanAddLogs: true,
                  members: {
                    some: {
                      userId,
                    },
                  },
                },
              },
            },
          },
          // Condition 3: user is an admin or owner of the pool where the vehicle is registered
          {
            pools: {
              some: {
                pool: {
                  members: {
                    some: {
                      userId,
                      role: { in: ['ADMIN', 'OWNER'] },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    });

    if (!vehicle) {
      Logger.error(
        'Permission denied: user: ' + userId + ' does not have permission to create logs for vehicle: ' + vehicleId,
      );
      throw new NotFoundException('Vehicle not found or access denied.');
    }
    // If we reach here, the user has permission to create logs.
    console.log('Permission to create logs granted.');
    return vehicle;
  }

  async canEditLogs(userId: string, vehicleId?: string | null): Promise<Vehicle> {
    if (!vehicleId) {
      throw new NotFoundException('Vehicle not found or access denied.');
    }
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        OR: [
          // Condition 1: user owns the vehicle
          { ownerId: userId },
          // Condition 2: user is in a pool that contains the vehicle
          {
            pools: {
              some: {
                pool: {
                  membersCanEditLogs: true,
                  members: {
                    some: {
                      userId,
                    },
                  },
                },
              },
            },
          },
          // Condition 3: user is an admin or owner of the pool where the vehicle is registered
          {
            pools: {
              some: {
                pool: {
                  members: {
                    some: {
                      userId,
                      role: { in: ['ADMIN', 'OWNER'] },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    });

    if (!vehicle) {
      Logger.error(
        'Permission denied: user: ' + userId + ' does not have permission to delete logs for vehicle: ' + vehicleId,
      );
      throw new NotFoundException('Vehicle not found or access denied.');
    }
    return vehicle;
  }
  async canDeleteLogs(userId: string, vehicleId?: string | null): Promise<Vehicle> {
    if (!vehicleId) {
      throw new NotFoundException('Vehicle not found or access denied.');
    }
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        OR: [
          // Condition 1: user owns the vehicle
          { ownerId: userId },
          // Condition 2: user is in a pool that contains the vehicle
          {
            pools: {
              some: {
                pool: {
                  membersCanDeleteLogs: true,
                  members: {
                    some: {
                      userId,
                    },
                  },
                },
              },
            },
          },
          // Condition 3: user is an admin or owner of the pool where the vehicle is registered
          {
            pools: {
              some: {
                pool: {
                  members: {
                    some: {
                      userId,
                      role: { in: ['ADMIN', 'OWNER'] },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    });

    if (!vehicle) {
      Logger.error(
        'Permission denied: user: ' + userId + ' does not have permission to delete logs for vehicle: ' + vehicleId,
      );
      throw new NotFoundException('Vehicle not found or access denied.');
    }
    return vehicle;
  }
}
