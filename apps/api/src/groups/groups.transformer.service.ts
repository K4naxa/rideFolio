import { Injectable } from '@nestjs/common';
import { GroupDetails, GroupMemberRoleCode } from '@repo/validation';
import { Prisma } from 'prisma/generated/client';
import { VehicleRepository } from 'src/vehicles/vehicleRepository';
import { VehicleTransformerService } from 'src/vehicles/vehicleTransformer.service';

@Injectable()
export class GroupsTransformerService {
  constructor(
    private readonly vehicleTransformer: VehicleTransformerService,
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  DB_GroupDetails_Include() {
    return {
      members: {
        select: {
          role: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      vehicles: {
        select: {
          addedAt: true,
          vehicle: {
            include: {
              ...this.vehicleTransformer.DBInclude_BasicVehicle,
              owner: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      invites: {
        select: {
          id: true,
          receiver: {
            select: {
              email: true,
            },
          },
          roleToGrant: true,
          status: true,
          createdAt: true,
        },
      },
    } satisfies Prisma.GroupInclude;
  }

  toGroupDetails(group: DB_GroupDetails, currentUserId: string): GroupDetails {
    const userRole = group.members.find((m) => m.user.id === currentUserId)?.role as GroupMemberRoleCode;
    const userCanManageGroup = userRole === 'OWNER' || userRole === 'ADMIN';

    const groupInvites = group.invites.map((invite) => ({
      id: invite.id,
      email: invite.receiver.email,
      roleToGrant: invite.roleToGrant,
      createdAt: invite.createdAt,
      state: invite.status,
    }));

    const groupMembers = group.members.map((member) => {
      return userCanManageGroup ? member : { ...member, user: { ...member.user, email: undefined } };
    });

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      createdAt: group.createdAt,
      userRole: userRole,
      members: groupMembers,
      rules: {
        membersCanAddVehicles: group.membersCanAddVehicles,
      },
      vehicles: group.vehicles.map((v) => ({
        addedAt: v.addedAt,
        isCurrentUserOwner: v.vehicle.owner.id === currentUserId,
        data: this.vehicleTransformer.toBasicVehicle(v.vehicle),
        owner: v.vehicle.owner,
      })),

      invites: userCanManageGroup ? groupInvites : undefined,
    };
  }
}

export type DB_GroupDetails = Prisma.GroupGetPayload<{
  include: ReturnType<GroupsTransformerService['DB_GroupDetails_Include']>;
}>;
