import { Injectable } from '@nestjs/common';
import { PoolDetails, PoolMemberRoleCode } from '@repo/validation';
import { Prisma } from 'prisma/generated/client';
import { VehicleRepository } from 'src/vehicles/vehicleRepository';
import { VehicleTransformerService } from 'src/vehicles/vehicleTransformer.service';

@Injectable()
export class PoolsTransformerService {
  constructor(
    private readonly vehicleTransformer: VehicleTransformerService,
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  DB_PoolDetails_Inlcude() {
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
          membersCanAddLogs: true,
          membersCanDeleteLogs: true,
          membersCanEditLogs: true,
          vehicle: {
            include: {
              ...this.vehicleRepository.DBInclude_BasicVehicle,
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
    } satisfies Prisma.PoolInclude;
  }

  toPoolDetails(pool: DB_PoolDetails, currentUserId: string): PoolDetails {
    const userRole = pool.members.find((m) => m.user.id === currentUserId)?.role as PoolMemberRoleCode;
    const userCanManagePool = userRole === 'OWNER' || userRole === 'ADMIN';

    const poolInvites = pool.invites.map((invite) => ({
      id: invite.id,
      email: invite.receiver.email,
      roleToGrant: invite.roleToGrant,
      createdAt: invite.createdAt,
      state: invite.status,
    }));

    const poolMembers = pool.members.map((member) => {
      return userCanManagePool ? member : { ...member, user: { ...member.user, email: undefined } };
    });

    return {
      id: pool.id,
      type: pool.type,
      name: pool.name,
      description: pool.description,
      createdAt: pool.createdAt,
      userRole: userRole,
      members: poolMembers,
      rules: {
        membersCanAddLogs: pool.membersCanAddLogs,
        membersCanAddVehicles: pool.membersCanAddVehicles,
        membersCanEditLogs: pool.membersCanEditLogs,
        membersCanDeleteLogs: pool.membersCanDeleteLogs,
      },
      vehicles: pool.vehicles.map((v) => ({
        addedAt: v.addedAt,
        isCurrentUserOwner: v.vehicle.owner.id === currentUserId,
        data: this.vehicleTransformer.toBasicVehicle(v.vehicle),
        owner: v.vehicle.owner,
      })),

      invites: userCanManagePool ? poolInvites : undefined,
    };
  }
}

export type DB_PoolDetails = Prisma.PoolGetPayload<{
  include: ReturnType<PoolsTransformerService['DB_PoolDetails_Inlcude']>;
}>;
