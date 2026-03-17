import { Injectable } from '@nestjs/common';
import { AppBadRequestException, AppForbiddenException, AppNotFoundException } from 'src/exceptions';
import { Group, GroupMemberRole, Prisma } from 'prisma/generated/client';
import { AccessibleGroup, GroupDetails, GroupInviteValues, GroupSchemaValues } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { NotificationService } from 'src/notifications/notification.service';
import { GroupsTransformerService } from './groups.transformer.service';
import {
  GROUP_DISBANDED_NOTIFICATION,
  GROUP_INVITE_NOTIFICATION,
  GROUP_ROLE_UPDATED_NOTIFICATION,
  GROUP_VEHICLE_REMOVED_NOTIFICATION,
} from 'src/notifications/definitions/group.notifications';

@Injectable()
export class GroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authValidationService: AuthValidationService,
    private readonly notificationService: NotificationService,
    private readonly groupTransformer: GroupsTransformerService,
  ) {}

  async createNewGroup(userSession: UserSession, newGroupDto: GroupSchemaValues): Promise<{ newGroupId: string }> {
    const { vehicleIds, ...groupData } = newGroupDto;
    let createdGroup: Group | undefined;

    try {
      createdGroup = await this.prisma.$transaction(async (prisma) => {
        // 1. Create a new group
        const group = await prisma.group.create({
          data: {
            ...groupData,
          },
        });

        // 2. Add the creator into the group as a creator
        await this.addUserToGroup(prisma, userSession.user.id, group.id, 'OWNER');

        // 3. Add optional vehicles to the group if provided
        if (vehicleIds && vehicleIds.length > 0) {
          await prisma.groupVehicle.createMany({
            data: vehicleIds.map((id) => ({
              groupId: group.id,
              vehicleId: id,
            })),
          });
        }

        console.log(`Created new group with id: ${group.id}`);
        return group;
      });
    } catch (error) {
      console.error('ERROR creating a group: ', error);

      throw AppBadRequestException.formError('Error creating a new group');
    }

    if (!createdGroup) {
      throw AppBadRequestException.formError('Failed to create group');
    }

    return { newGroupId: createdGroup.id };
  }

  async updateGroup(userSession: UserSession, groupId: string, updateDate: GroupSchemaValues): Promise<GroupDetails> {
    const { vehicleIds, ...groupData } = updateDate;

    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId,
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
            vehicle: {
              select: {
                ownerId: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!group) throw new AppNotFoundException();

    const vehiclesToRemove = group.vehicles.filter((v) => !vehicleIds.some((id) => id === v.vehicleId));

    const vehicleToRemoveIds = vehiclesToRemove.map((v) => v.vehicleId);

    const updatedGroup = await this.prisma.$transaction(async (tx) => {
      if (vehiclesToRemove.length > 0) {
        // delete vehicles from the group
        await tx.groupVehicle.deleteMany({
          where: {
            groupId,
            vehicleId: { in: vehicleToRemoveIds },
          },
        });

        //   Notify users about the removal of vehicles
        const vehicleRemovalNotifications = vehiclesToRemove
          .filter((vehicle) => userSession.user.id !== vehicle.vehicle.ownerId)
          .map((vehicle) => ({
            type: GROUP_VEHICLE_REMOVED_NOTIFICATION.type as typeof GROUP_VEHICLE_REMOVED_NOTIFICATION.type,
            userId: vehicle.vehicle.ownerId,
            meta: {
              groupId,
              groupName: group.name,
              vehicleName: vehicle.vehicle.name,
            },
          }));

        await this.notificationService.createMany(vehicleRemovalNotifications, tx);
      }

      // update group details
      return tx.group.update({
        where: { id: groupId },
        data: { ...groupData },
        include: this.groupTransformer.DB_GroupDetails_Include(),
      });
    });

    return this.groupTransformer.toGroupDetails(updatedGroup, userSession.user.id);
  }

  async addVehiclesToGroup(userSession: UserSession, groupId: string, vehicleIds: string[]): Promise<GroupDetails> {
    // Find the group and validate that the user has permission to add vehicles
    await this.authValidationService.canAddVehiclesToGroup(userSession.user.id, groupId);

    const updatedGroup = await this.prisma.$transaction(async (tx) => {
      await tx.groupVehicle.createMany({
        data: vehicleIds.map((vehicleId) => ({
          groupId,
          vehicleId,
        })),
      });

      return tx.group.findUnique({
        where: { id: groupId },
        include: this.groupTransformer.DB_GroupDetails_Include(),
      });
    });

    if (!updatedGroup) {
      throw new Error('Unexpected error occurred while adding vehicles to the group.');
    }

    return this.groupTransformer.toGroupDetails(updatedGroup, userSession.user.id);
  }

  async removeVehicleFromGroup(userSession: UserSession, groupId: string, vehicleId: string): Promise<void> {
    // Find the group and validate that the user has permission to remove vehicles
    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId,
        OR: [
          // User is an admin or owner of the group
          { members: { some: { userId: userSession.user.id, OR: [{ role: 'OWNER' }, { role: 'ADMIN' }] } } },
          // Vehicle belongs to the user
          { vehicles: { some: { vehicleId, vehicle: { ownerId: userSession.user.id } } } },
        ],
      },
      select: {
        id: true,
        name: true,
      },
    });

    const groupVehicle = await this.prisma.groupVehicle.findUnique({
      where: { groupId_vehicleId: { groupId, vehicleId } },
      select: {
        vehicle: {
          select: {
            ownerId: true,
            name: true,
          },
        },
      },
    });

    if (!group || !groupVehicle) throw new AppNotFoundException();

    await this.prisma.$transaction(async (tx) => {
      // Delete the vehicle
      await tx.groupVehicle.delete({
        where: { groupId_vehicleId: { groupId, vehicleId } },
      });

      // Notify the vehicle owner of the removal
      if (groupVehicle.vehicle.ownerId !== userSession.user.id) {
        await this.notificationService.create({
          type: GROUP_VEHICLE_REMOVED_NOTIFICATION.type,
          userId: groupVehicle.vehicle.ownerId,
          meta: {
            groupId: group.id,
            groupName: group.name,
            vehicleName: groupVehicle.vehicle.name,
          },
          transactionClient: tx,
        });
      }
    });
  }

  async removeMemberFromGroup(userSession: UserSession, groupId: string, userId: string): Promise<void> {
    // Validate that the current user has permission to remove members from the group
    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId,
        members: { some: { userId: userSession.user.id, OR: [{ role: 'OWNER' }, { role: 'ADMIN' }] } },
      },
      include: {
        vehicles: {
          select: {
            vehicle: {
              select: { id: true, ownerId: true },
            },
          },
        },
        members: {
          select: { userId: true, role: true },
        },
      },
    });

    // Prevent removing the owner of the group
    const memberToRemove = group?.members.find((member) => member.userId === userId);
    if (!memberToRemove) throw new AppNotFoundException();
    if (memberToRemove.role === 'OWNER') throw AppBadRequestException.formError('Cannot remove the owner of the group.');

    const leavingUserVehicles = group?.vehicles.filter((v) => v.vehicle.ownerId === userId) || [];

    await this.prisma.$transaction(async (tx) => {
      // 1. Remove the member from the group
      await tx.groupMember.delete({
        where: { groupId_userId: { groupId, userId } },
      });
      // 2. Remove the member's vehicles from the group
      if (leavingUserVehicles.length > 0) {
        await tx.groupVehicle.deleteMany({
          where: {
            groupId,
            vehicleId: { in: leavingUserVehicles.map((v) => v.vehicle.id) },
          },
        });
      }
    });

    // TODO: Send notification to the removed user about their removal from the group
  }

  async getAccessibleGroups(currentUserId: string): Promise<AccessibleGroup[]> {
    return this.prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: currentUserId,
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getGroupDetails(userSession: UserSession, groupId: string): Promise<GroupDetails> {
    // Validate that the user has access to the group
    const groupDetails = await this.prisma.group.findUnique({
      where: { id: groupId, members: { some: { userId: userSession.user.id } } },
      include: this.groupTransformer.DB_GroupDetails_Include(),
    });

    if (!groupDetails) throw new AppNotFoundException();
    return this.groupTransformer.toGroupDetails(groupDetails, userSession.user.id);
  }

  async updateUserRoleInGroup(
    userSession: UserSession,
    groupId: string,
    userId: string,
    role: GroupMemberRole,
  ): Promise<void> {
    // 1. Validate that the current user has permission to update roles in the group
    await this.canUserManageGroup(userSession, groupId);

    if (role === 'OWNER') {
      await this.prisma.$transaction(async (tx) => {
        // Validate that the current user is the OWNER of the group
        const isOwner = await tx.groupMember.findUnique({
          where: {
            groupId_userId: { groupId, userId: userSession.user.id },
            role: 'OWNER',
          },
        });
        if (!isOwner) {
          throw new AppForbiddenException();
        }

        // 1. Update the current OWNER to ADMIN
        await tx.groupMember.update({
          where: { groupId_userId: { groupId, userId: userSession.user.id } },
          data: { role: 'ADMIN' },
        });
        // 2. Update the new OWNER
        await tx.groupMember.update({
          where: { groupId_userId: { groupId, userId } },
          data: { role: 'OWNER' },
        });
      });
    } else {
      await this.prisma.groupMember.update({
        where: { groupId_userId: { groupId, userId } },
        data: { role },
      });
    }

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { name: true },
    });
    if (!group) throw new AppNotFoundException();

    // Notify the user about the role update if he did not do it himself (admins)
    if (userSession.user.id !== userId) {
      await this.notificationService.create({
        type: GROUP_ROLE_UPDATED_NOTIFICATION.type,
        userId,
        meta: {
          groupId: groupId,
          groupName: group.name,
          newRole: role,
        },
      });
    }
  }

  async deleteGroup(userSession: UserSession, groupId: string): Promise<void> {
    const groupToDelete = await this.prisma.group.findUnique({
      where: { id: groupId, members: { some: { userId: userSession.user.id, role: 'OWNER' } } },
      include: {
        members: true,
      },
    });

    if (!groupToDelete) {
      throw new AppForbiddenException();
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Clean up any stale notifications referencing this group
      await tx.notification.deleteMany({
        where: {
          metadata: {
            path: ['groupId'],
            equals: groupId,
          },
        },
      });

      // 2. Notify members that the group has been disbanded
      const disbandNotifications = groupToDelete.members
        .filter((member) => member.userId !== userSession.user.id)
        .map((member) => ({
          type: GROUP_DISBANDED_NOTIFICATION.type as typeof GROUP_DISBANDED_NOTIFICATION.type,
          userId: member.userId,
          meta: {
            groupName: groupToDelete.name,
          },
        }));

      await this.notificationService.createMany(disbandNotifications, tx);

      // 3. Delete the group
      await tx.group.delete({
        where: { id: groupId },
      });
    });
  }

  async leaveGroup(userSession: UserSession, groupId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Remove the user from the group members
      await tx.groupMember.delete({
        where: { groupId_userId: { groupId, userId: userSession.user.id } },
      });

      // Remove users vehicles from the group
      await tx.groupVehicle.deleteMany({
        where: {
          groupId,
          vehicle: {
            ownerId: userSession.user.id,
          },
        },
      });
    });
  }

  // Invite handling
  async sendGroupInvite(userSession: UserSession, inviteData: GroupInviteValues) {
    // 1. Validate that the current user has permission to invite to the group
    await this.canUserManageGroup(userSession, inviteData.groupId);
    // 2. Find the user by email
    const receiver = await this.prisma.user.findUnique({
      where: { email: inviteData.email },
      select: { id: true },
    });
    if (!receiver) throw new AppNotFoundException();

    // 3. Create the group invite
    const groupInvite = await this.prisma.groupInvite.create({
      data: {
        groupId: inviteData.groupId,
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
        group: {
          select: {
            name: true,
            description: true,
            membersCanAddVehicles: true,
            _count: {
              select: {
                members: true,
                vehicles: true,
              },
            },
          },
        },
      },
    });

    // 4. create a notification for the invite
    await this.notificationService.create({
      type: GROUP_INVITE_NOTIFICATION.type,
      userId: receiver.id,
      meta: {
        groupId: inviteData.groupId,
        groupName: groupInvite.group.name,
        groupDescription: groupInvite.group.description,
        membersCanAddVehicles: groupInvite.group.membersCanAddVehicles,
        inviteId: groupInvite.id,
        sender: groupInvite.sender,
        roleToGrant: inviteData.roleToGrant,
        memberCount: groupInvite.group._count.members,
        vehicleCount: groupInvite.group._count.vehicles,
      },
    });
  }

  async cancelGroupInvite(userSession: UserSession, inviteId: string) {
    // 1. Validate that the current user has permission to cancel the invite
    const invite = await this.prisma.groupInvite.findFirstOrThrow({
      where: { id: inviteId },
      select: { groupId: true, receiverId: true },
    });
    await this.canUserManageGroup(userSession, invite.groupId);

    await this.prisma.$transaction(async (tx) => {
      // 2. Delete the group invite
      await tx.groupInvite.delete({
        where: { id: inviteId },
      });
      // 3. Delete the notification related to the invite
      await tx.notification.deleteMany({
        where: {
          type: GROUP_INVITE_NOTIFICATION.type,
          userId: invite.receiverId,
          metadata: {
            path: ['inviteId'],
            equals: inviteId,
          },
        },
      });
    });
  }

  async acceptGroupInvite(userSession: UserSession, inviteId: string) {
    // 1. Find the invite and validate it
    const invite = await this.prisma.groupInvite.findUnique({
      where: { id: inviteId, receiverId: userSession.user.id },
    });
    if (!invite) throw new AppNotFoundException();

    // Add user to the accepted group
    await this.prisma.$transaction(async (tx) => {
      await this.addUserToGroup(tx, userSession.user.id, invite.groupId, invite.roleToGrant);
      await tx.groupInvite.delete({ where: { id: invite.id } });
    });
  }

  async denyGroupInvite(userSession: UserSession, inviteId: string) {
    // 1. Find the invite and validate it
    const invite = await this.prisma.groupInvite.findUnique({
      where: { id: inviteId, receiverId: userSession.user.id },
    });
    if (!invite) throw new AppNotFoundException();
    // 2. Delete the invite
    await this.prisma.groupInvite.delete({
      where: { id: invite.id },
    });
  }

  /////////////////////////////////////
  // HELPERS
  ////////////////////////////////////

  private async canUserManageGroup(userSession: UserSession, groupId: string): Promise<void> {
    console.log('Checking invite permissions for user:', userSession.user.id, 'on group/invite:', groupId);
    const user = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: userSession.user.id },
        OR: [{ role: 'ADMIN' }, { role: 'OWNER' }],
      },
    });
    console.log('user invite permissions:', user);
    if (!user) throw new AppForbiddenException();
  }

  private async addUserToGroup(
    prisma: Prisma.TransactionClient,
    userId: string,
    groupId: string,
    roleToGrant: GroupMemberRole,
  ) {
    await prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role: roleToGrant,
      },
    });
  }
}
