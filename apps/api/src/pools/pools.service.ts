import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Pool, PoolMemberRole, Prisma } from 'prisma/generated/prisma/client';
import { AccessiblePool, PoolMemberRoleCode, PoolSchemaValues, PoolDetails, PoolInviteValues } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { NotificationService } from 'src/notifications/notification.service';
import { PoolsTransformerService } from './pools.transformer.service';
import { POOL_INVITE_NOTIFICATION } from 'src/notifications/definitions/pool.notifications';

@Injectable()
export class PoolsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authValidationService: AuthValidationService,
    private readonly notificationService: NotificationService,
    private readonly poolTransformer: PoolsTransformerService,
  ) {}

  async createNewPool(userSession: UserSession, newPoolDto: PoolSchemaValues): Promise<{ newPoolId: string }> {
    const { vehicleIds, ...poolData } = newPoolDto;
    let createdPool: Pool | undefined;

    try {
      createdPool = await this.prisma.$transaction(async (prisma) => {
        // 1. Create new pool
        const pool = await prisma.pool.create({
          data: {
            ...poolData,
          },
        });

        // 2. Add the creator into the pool as a creator
        await this.addUserToPool(prisma, userSession.user.id, pool.id, 'OWNER');

        // 3. Add optional vehicles to the pool if provided
        if (vehicleIds && vehicleIds.length > 0) {
          for (const id of vehicleIds) {
            await prisma.poolVehicle.create({
              data: {
                poolId: pool.id,
                vehicleId: id,
              },
            });
          }
        }

        console.log(`Created new pool with id: ${pool.id}`);
        return pool;
      });
    } catch (error) {
      console.error('ERROR creating a pool: ', error);

      throw new BadRequestException({
        message: 'Error creating a new pool',
      });
    }

    if (!createdPool) {
      throw new BadRequestException({
        message: 'Failed to create pool',
      });
    }

    return { newPoolId: createdPool.id };
  }

  async updatePool(userSession: UserSession, poolId: string, updateDate: PoolSchemaValues): Promise<PoolDetails> {
    const { vehicleIds, ...poolData } = updateDate;
    // TODO: add logic for updating vehicles in the pool. Send notification to users if their vehicle has been removed

    const pool = await this.prisma.pool.findUnique({
      where: {
        id: poolId,
        members: {
          some: {
            userId: userSession.user.id,
            OR: [{ role: 'OWNER' }, { role: 'ADMIN' }],
          },
        },
      },
      include: {
        vehicles: {
          select: {
            vehicleId: true,
          },
        },
      },
    });

    if (!pool) throw new NotFoundException(`Pool not found or access denied.`);

    const vehiclesToRemove = pool.vehicles
      .filter((v) => !vehicleIds.some((id) => id === v.vehicleId))
      .map((v) => v.vehicleId);

    const updatedPool = await this.prisma.$transaction(async (tx) => {
      if (vehiclesToRemove.length > 0) {
        await tx.poolVehicle.deleteMany({
          where: {
            poolId,
            vehicleId: { in: vehiclesToRemove },
          },
        });
      }

      // If changing from SHARED to PRIVATE,
      if (pool.type === 'SHARED' && poolData.type === 'PRIVATE') {
        // remove all members except owner
        await tx.poolMember.deleteMany({
          where: {
            poolId,
            role: { not: 'OWNER' },
          },
        });
        // remove all pending invites
        await tx.poolInvite.deleteMany({
          where: {
            poolId,
          },
        });
        // remove all notifications related to the pool invites
        await tx.notification.deleteMany({
          where: {
            type: 'POOL_INVITE',
            metadata: {
              path: ['poolId'],
              equals: poolId,
            },
          },
        });
      }

      // update pool details
      return await tx.pool.update({
        where: { id: poolId },
        data: { ...poolData },
        include: this.poolTransformer.DB_PoolDetails_Inlcude(),
      });
    });

    return this.poolTransformer.toPoolDetails(updatedPool, userSession.user.id);
  }

  async addVehiclesToPool(userSession: UserSession, poolId: string, vehicleIds: string[]): Promise<PoolDetails> {
    // Find the pool and validate that the user has permission to add vehicles
    await this.authValidationService.canAddVehiclesToPool(userSession.user.id, poolId);

    const updatedPool = await this.prisma.$transaction(async (tx) => {
      await tx.poolVehicle.createMany({
        data: vehicleIds.map((vehicleId) => ({
          poolId,
          vehicleId,
        })),
      });

      return await tx.pool.findUnique({
        where: { id: poolId },
        include: this.poolTransformer.DB_PoolDetails_Inlcude(),
      });
    });

    if (!updatedPool) {
      throw new Error('Unexpected error occurred while adding vehicles to the pool.');
    }

    return this.poolTransformer.toPoolDetails(updatedPool, userSession.user.id);
  }

  async removeVehicleFromPool(userSession: UserSession, poolId: string, vehicleId: string): Promise<void> {
    // Find the pool and validate that the user has permission to remove vehicles
    const pool = await this.prisma.pool.findUnique({
      where: {
        id: poolId,
        OR: [
          // User is an admin or owner of the pool
          { members: { some: { userId: userSession.user.id, OR: [{ role: 'OWNER' }, { role: 'ADMIN' }] } } },
          // Vehicle belongs to the user
          { vehicles: { some: { vehicleId, vehicle: { ownerId: userSession.user.id } } } },
        ],
      },
    });

    if (!pool) throw new NotFoundException('Pool not found or access denied.');

    await this.prisma.poolVehicle.delete({
      where: { poolId_vehicleId: { poolId, vehicleId } },
    });
  }

  async removeMemberFromPool(userSession: UserSession, poolId: string, userId: string): Promise<void> {
    // Validate that the current user has permission to remove members from the pool
    const pool = await this.prisma.pool.findUnique({
      where: {
        id: poolId,
        members: { some: { userId: userSession.user.id, OR: [{ role: 'OWNER' }, { role: 'ADMIN' }] } },
      },
      include: {
        vehicles: {
          select: {
            vehicle: true,
          },
        },
        members: true,
      },
    });

    // Prevent removing the owner of the pool
    const memberToRemove = pool?.members.find((member) => member.userId === userId);
    if (!memberToRemove) throw new NotFoundException('Member not found in the pool.');
    if (memberToRemove.role === 'OWNER') throw new BadRequestException('Cannot remove the owner of the pool.');

    const leavingUserVehicles = pool?.vehicles.filter((v) => v.vehicle.ownerId === userId) || [];

    await this.prisma.$transaction(async (tx) => {
      // 1. Remove the member from the pool
      await tx.poolMember.delete({
        where: { poolId_userId: { poolId, userId } },
      });
      // 2. Remove the member's vehicles from the pool
      for (const v of leavingUserVehicles) {
        await tx.poolVehicle.delete({
          where: { poolId_vehicleId: { poolId, vehicleId: v.vehicle.id } },
        });
      }
    });

    // TODO: Send notification to the removed user about their removal from the pool
  }
  async getAccessiblePools(currentUserId: string): Promise<AccessiblePool[]> {
    const pools = await this.prisma.pool.findMany({
      // 1. Find all pools where the current user is a member
      where: {
        members: {
          some: {
            userId: currentUserId,
          },
        },
      },
      // 2. Use `include` to fetch related data.
      select: {
        id: true,
        type: true,
        name: true,
        membersCanAddLogs: true,
        membersCanDeleteLogs: true,
        membersCanEditLogs: true,
        membersCanAddVehicles: true,

        // 3. Include the 'members' relation, but ONLY the one for the current user.
        // This is the key to getting the role efficiently.
        members: {
          where: {
            userId: currentUserId, // Filter to get just this user's membership
          },
          select: {
            role: true, // We only need their role from this record
          },
        },

        // Include the count of vehicles and members for UI purposes.
        _count: {
          select: {
            vehicles: true,
            members: true,
          },
        },
        // You can also include a snippet of vehicle info if needed for the UI
        vehicles: {
          select: {
            vehicle: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // 4. Transform the data for a cleaner frontend experience.
    const transformedPools = pools.map((pool) => {
      const currentUserRole = pool.members[0]?.role || null;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { members, vehicles, ...restOfPool } = pool;

      return {
        ...restOfPool,
        userRole: currentUserRole as PoolMemberRoleCode, // Add the role to the top level
        vehicles: vehicles.map((v) => v.vehicle), // Flatten the vehicle structure
      };
    });

    return transformedPools;
  }

  async getPoolDetails(userSession: UserSession, poolId: string): Promise<PoolDetails> {
    // Validate that the user has access to the pool

    const poolDetails = await this.prisma.pool.findUnique({
      where: { id: poolId, members: { some: { userId: userSession.user.id } } },
      include: this.poolTransformer.DB_PoolDetails_Inlcude(),
    });

    if (!poolDetails) throw new NotFoundException(`Pool not found or access denied.`);
    return this.poolTransformer.toPoolDetails(poolDetails, userSession.user.id);
  }

  async updateUserRoleInPool(
    userSession: UserSession,
    poolId: string,
    userId: string,
    role: PoolMemberRole,
  ): Promise<void> {
    // 1. Validate that the current user has permission to update roles in the pool
    await this.canUserManagePool(userSession, poolId);

    if (role === 'OWNER') {
      // Validate that current user is the OWNER of the pool
      const isOwner = await this.prisma.poolMember.findUnique({
        where: {
          poolId_userId: { poolId, userId: userSession.user.id },
          role: 'OWNER',
        },
      });
      if (!isOwner) {
        throw new ForbiddenException(`Only the current OWNER can transfer ownership.`);
      }

      await this.prisma.$transaction(async (tx) => {
        // 1. Update the current OWNER to ADMIN
        await tx.poolMember.update({
          where: { poolId_userId: { poolId, userId: userSession.user.id } },
          data: { role: 'ADMIN' },
        });
        // 2. Update the new OWNER
        await tx.poolMember.update({
          where: { poolId_userId: { poolId, userId } },
          data: { role: 'OWNER' },
        });
      });
    } else {
      await this.prisma.poolMember.update({
        where: { poolId_userId: { poolId, userId } },
        data: { role },
      });
    }
  }

  async deletePool(userSession: UserSession, poolId: string): Promise<void> {
    const validatedPoolId = await this.prisma.poolMember.findUnique({
      where: {
        poolId_userId: {
          poolId: poolId,
          userId: userSession.user.id,
        },
        role: 'OWNER', // Ensure the user is an OWNER
      },
      select: {
        poolId: true,
      },
    });

    if (!validatedPoolId) {
      throw new ForbiddenException(`Pool not found or access denied.`);
    }

    await this.prisma.pool.delete({
      where: { id: validatedPoolId.poolId },
    });
  }

  async leavePool(userSession: UserSession, poolId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Remove the user from the pool members
      await tx.poolMember.delete({
        where: { poolId_userId: { poolId, userId: userSession.user.id } },
      });

      // Remove users vehicles from the pool
      await tx.poolVehicle.deleteMany({
        where: {
          poolId,
          vehicle: {
            ownerId: userSession.user.id,
          },
        },
      });
    });
  }

  // Invite handling
  async sendPoolInvite(userSession: UserSession, inviteData: PoolInviteValues) {
    // 1. Validate that the current user has permission to invite to the pool
    await this.canUserManagePool(userSession, inviteData.poolId);
    // 2. Find the user by email
    const receiver = await this.prisma.user.findUnique({
      where: { email: inviteData.email },
      select: { id: true },
    });
    if (!receiver) throw new NotFoundException(`user not found.`);

    // 3. Create the pool invite
    const poolInvite = await this.prisma.poolInvite.create({
      data: {
        poolId: inviteData.poolId,
        senderId: userSession.user.id,
        receiverId: receiver.id,
        roleToGrant: inviteData.roleToGrant,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // expires in 7 days
      },
      include: {
        sender: {
          select: {
            name: true,
            image: true,
          },
        },
        pool: {
          select: {
            name: true,
            description: true,
            membersCanAddVehicles: true,
          },
        },
      },
    });

    // 4. create a notification for the invite
    await this.notificationService.create({
      type: POOL_INVITE_NOTIFICATION.type,
      userId: receiver.id,
      meta: {
        poolId: inviteData.poolId,
        poolName: poolInvite.pool.name,
        poolDescription: poolInvite.pool.description,
        membersCanAddVehicles: poolInvite.pool.membersCanAddVehicles,
        inviteId: poolInvite.id,
        sender: poolInvite.sender,
        roleToGrant: inviteData.roleToGrant,
      },
    });
  }

  async cancelPoolInvite(userSession: UserSession, inviteId: string) {
    // 1. Validate that the current user has permission to cancel the invite
    const invite = await this.prisma.poolInvite.findFirstOrThrow({
      where: { id: inviteId },
      select: { poolId: true, receiverId: true },
    });
    await this.canUserManagePool(userSession, invite.poolId);

    await this.prisma.$transaction(async (tx) => {
      // 2. Delete the pool invite
      await tx.poolInvite.delete({
        where: { id: inviteId },
      });
      // 3. Delete the notification related to the invite
      await tx.notification.deleteMany({
        where: {
          type: 'POOL_INVITE',
          userId: invite.receiverId,
          metadata: {
            path: ['inviteId'],
            equals: inviteId,
          },
        },
      });
    });
  }

  async acceptPoolInvite(userSession: UserSession, inviteId: string) {
    // 1. Find the invite and validate it
    const invite = await this.prisma.poolInvite.findUnique({
      where: { id: inviteId, receiverId: userSession.user.id },
    });
    if (!invite) throw new NotFoundException(`Invite not found or access denied.`);

    // Add user to the accepted pool
    await this.prisma.$transaction(async (tx) => {
      await this.addUserToPool(tx, userSession.user.id, invite.poolId, invite.roleToGrant);
      await tx.poolInvite.delete({ where: { id: invite.id } });
    });
  }

  async denyPoolInvite(userSession: UserSession, inviteId: string) {
    // 1. Find the invite and validate it
    const invite = await this.prisma.poolInvite.findUnique({
      where: { id: inviteId, receiverId: userSession.user.id },
    });
    if (!invite) throw new NotFoundException(`Invite not found or access denied.`);
    // 2. Delete the invite
    await this.prisma.poolInvite.delete({
      where: { id: invite.id },
    });
  }

  /////////////////////////////////////
  // HELPERS
  ////////////////////////////////////

  private async canUserManagePool(userSession: UserSession, poolId: string): Promise<void> {
    console.log('Checking invite permissions for user:', userSession.user.id, 'on pool/invite:', poolId);
    const user = await this.prisma.poolMember.findUnique({
      where: {
        poolId_userId: { poolId, userId: userSession.user.id },
        OR: [{ role: 'ADMIN' }, { role: 'OWNER' }],
      },
    });
    console.log('user invite permissions:', user);
    if (!user) throw new ForbiddenException('You do not have permission to invite users to this pool.');
  }

  private async addUserToPool(
    prisma: Prisma.TransactionClient,
    userId: string,
    poolId: string,
    roleToGrant: PoolMemberRole,
  ) {
    await prisma.poolMember.create({
      data: {
        poolId,
        userId,
        role: roleToGrant,
      },
    });
  }
}
