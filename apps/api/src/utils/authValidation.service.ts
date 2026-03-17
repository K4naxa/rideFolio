import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { AppNotFoundException } from 'src/exceptions';
import { Group, Vehicle } from 'prisma/generated/client';
import { VehicleAccessPrisma } from '../auth/vehicle-access.prisma';

@Injectable()
export class AuthValidationService {
  constructor(private prisma: PrismaService) {}

  async hasAccessToVehicle(userId: string, vehicleId: string): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, ...VehicleAccessPrisma.forUser(userId) },
    });

    // If no vehicle is found, throw an exception.
    if (!vehicle) {
      throw new AppNotFoundException();
    }

    return vehicle;
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
      throw new AppNotFoundException();
    }

    return group;
  }
}
