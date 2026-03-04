import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Group, Vehicle } from 'prisma/generated/client';

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
          // Condition 2: user is in a group that contains the vehicle
          {
            groups: {
              some: {
                group: {
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

  async hasAccessToGroup(userId: string, groupId: string): Promise<void> {
    const count = await this.prisma.groupMember.count({
      where: {
        group: { id: groupId },
        userId,
      },
    });

    if (count === 0) {
      console.error('Access denied: user does not have access to the group.');
      throw new NotFoundException(`Group not found or access denied.`);
    }
  }

  async canAddVehiclesToGroup(userId: string, groupId: string): Promise<Group> {
    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId,
        OR: [
          // User is an owner or admin of the group
          { members: { some: { userId, OR: [{ role: 'OWNER' }, { role: 'ADMIN' }] } } },
          {
            membersCanAddVehicles: true,
            members: { some: { userId, role: 'MEMBER' } },
          },
        ],
      },
    });

    if (!group) {
      Logger.error(
        'Permission denied: user: ' + userId + ' does not have permission to add vehicles to group: ' + groupId,
      );
      throw new NotFoundException('Group not found or access denied.');
    }

    return group;
  }

  async canCreateLogs(userId: string, vehicleId: string): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        OR: [
          // Condition 1: user owns the vehicle
          { ownerId: userId },
          // Condition 2: user is in a group that contains the vehicle
          {
            groups: {
              some: {
                group: {
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
          // Condition 3: user is an admin or owner of the group where the vehicle is registered
          {
            groups: {
              some: {
                group: {
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
          // Condition 2: user is in a group that contains the vehicle
          {
            groups: {
              some: {
                group: {
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
          // Condition 3: user is an admin or owner of the group where the vehicle is registered
          {
            groups: {
              some: {
                group: {
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
          // Condition 2: user is in a group that contains the vehicle
          {
            groups: {
              some: {
                group: {
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
          // Condition 3: user is an admin or owner of the group where the vehicle is registered
          {
            groups: {
              some: {
                group: {
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
