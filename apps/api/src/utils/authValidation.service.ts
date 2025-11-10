import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AuthValidationService {
  constructor(private prisma: PrismaService) {}

  async hasAccessToVehicle(userId: string, vehicleId: string): Promise<void> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        OR: [
          // Condition 1: User owns the vehicle
          { ownerId: userId },
          // Condition 2: User is in a pool that contains the vehicle
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
      console.error('Access denied: User does not have access to the vehicle.');
      throw new NotFoundException('Vehicle not found or access denied.');
    }

    // If we reach here, the user has access. The function implicitly returns.
    console.log('Access granted to vehicle.');
  }

  async hasAccessToPool(userId: string, poolId: string): Promise<void> {
    const count = await this.prisma.poolMember.count({
      where: {
        pool: { id: poolId },
        userId,
      },
    });

    if (count === 0) {
      console.error('Access denied: User does not have access to the pool.');
      throw new NotFoundException(`Pool not found or access denied.`);
    }
    // If we reach here, the user has access to the pool.
    console.log('Access granted to pool.');
  }

  async canCreateLogs(userId: string, vehicleId?: string | null): Promise<void> {
    if (!vehicleId) {
      throw new NotFoundException('Vehicle not found or access denied.');
    }
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        OR: [
          // Condition 1: User owns the vehicle
          { ownerId: userId },
          // Condition 2: User is in a pool that contains the vehicle
          {
            pools: {
              some: {
                pool: {
                  allowMembersToAddLogs: true,
                  members: {
                    some: {
                      userId,
                    },
                  },
                },
              },
            },
          },
          // Condition 3: User is an admin or owner of the pool where the vehicle is registered
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
      select: {
        id: true,
      },
    });

    if (!vehicle) {
      console.error('Permission denied: User does not have permission to create logs for the vehicle.');
      throw new NotFoundException('Vehicle not found or access denied.');
    }
    // If we reach here, the user has permission to create logs.
    console.log('Permission to create logs granted.');
  }

  async canEditLogs(userId: string, vehicleId?: string | null): Promise<void> {
    if (!vehicleId) {
      throw new NotFoundException('Vehicle not found or access denied.');
    }
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        OR: [
          // Condition 1: User owns the vehicle
          { ownerId: userId },
          // Condition 2: User is in a pool that contains the vehicle
          {
            pools: {
              some: {
                pool: {
                  allowMembersToEditLogs: true,
                  members: {
                    some: {
                      userId,
                    },
                  },
                },
              },
            },
          },
          // Condition 3: User is an admin or owner of the pool where the vehicle is registered
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
      select: {
        id: true,
      },
    });

    if (!vehicle) {
      console.error('Permission denied: User does not have permission to create logs for the vehicle.');
      throw new NotFoundException('Vehicle not found or access denied.');
    }
    // If we reach here, the user has permission to create logs.
    console.log('Permission to create logs granted.');
  }
  async canDeleteLogs(userId: string, vehicleId?: string | null): Promise<void> {
    if (!vehicleId) {
      throw new NotFoundException('Vehicle not found or access denied.');
    }
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        OR: [
          // Condition 1: User owns the vehicle
          { ownerId: userId },
          // Condition 2: User is in a pool that contains the vehicle
          {
            pools: {
              some: {
                pool: {
                  allowMembersToDeleteLogs: true,
                  members: {
                    some: {
                      userId,
                    },
                  },
                },
              },
            },
          },
          // Condition 3: User is an admin or owner of the pool where the vehicle is registered
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
      select: {
        id: true,
      },
    });

    if (!vehicle) {
      console.error('Permission denied: User does not have permission to create logs for the vehicle.');
      throw new NotFoundException('Vehicle not found or access denied.');
    }
    // If we reach here, the user has permission to create logs.
    console.log('Permission to create logs granted.');
  }
}
