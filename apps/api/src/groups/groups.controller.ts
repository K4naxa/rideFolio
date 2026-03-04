import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';

import {
  AccessibleGroup,
  GroupDetails,
  GroupInviteSchema,
  GroupInviteValues,
  GroupSchema,
  GroupSchemaValues,
} from '@repo/validation';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { GroupMemberRole } from 'prisma/generated/client';

import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { GroupsService } from 'src/groups/groups.service';
import z, { ZodType } from 'zod';

@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Get('accessible')
  async getAccessibleGroups(@Session() userSession: UserSession): Promise<AccessibleGroup[]> {
    return await this.groupsService.getAccessibleGroups(userSession.user.id);
  }
  @Get(':groupId')
  async getGroupDetails(
    @Session() userSession: UserSession,
    @Param('groupId', new ZodValidationPipe(z.cuid())) groupId: string,
  ): Promise<GroupDetails> {
    return await this.groupsService.getGroupDetails(userSession, groupId);
  }

  @Post('')
  async createNewGroup(
    @Session() userSession: UserSession,
    @Body(new ZodValidationPipe(GroupSchema as ZodType)) newGroupDto: GroupSchemaValues,
  ) {
    return await this.groupsService.createNewGroup(userSession, newGroupDto);
  }

  @Put(':groupId')
  async updateGroup(
    @Session() userSession: UserSession,
    @Param('groupId', new ZodValidationPipe(z.cuid())) groupId: string,
    @Body(new ZodValidationPipe(GroupSchema as ZodType)) updateData: GroupSchemaValues,
  ) {
    return await this.groupsService.updateGroup(userSession, groupId, updateData);
  }

  @Delete(':groupId')
  async deleteGroup(
    @Session() userSession: UserSession,
    @Param('groupId', new ZodValidationPipe(z.cuid())) groupId: string,
  ) {
    return await this.groupsService.deleteGroup(userSession, groupId);
  }

  @Post('leave/:groupId')
  async leaveGroup(
    @Session() userSession: UserSession,
    @Param('groupId', new ZodValidationPipe(z.cuid())) groupId: string,
  ) {
    return await this.groupsService.leaveGroup(userSession, groupId);
  }

  @Patch(':groupId/members/:userId/role')
  async updateUserRoleInGroup(
    @Session() userSession: UserSession,
    @Param('groupId', new ZodValidationPipe(z.cuid())) groupId: string,
    @Param('userId', new ZodValidationPipe(z.string())) userId: string,
    @Body('role', new ZodValidationPipe(z.enum(GroupMemberRole))) role: GroupMemberRole,
  ) {
    return await this.groupsService.updateUserRoleInGroup(userSession, groupId, userId, role);
  }

  @Patch('vehicles/add/:groupId')
  async addVehiclesToGroup(
    @Session() userSession: UserSession,
    @Param('groupId', new ZodValidationPipe(z.cuid())) groupId: string,
    @Body('vehicleIds', new ZodValidationPipe(z.array(z.cuid()))) vehicleIds: string[],
  ): Promise<GroupDetails> {
    return await this.groupsService.addVehiclesToGroup(userSession, groupId, vehicleIds);
  }

  @Patch('vehicle/remove/:groupId')
  async removeVehicleFromGroup(
    @Session() userSession: UserSession,
    @Param('groupId', new ZodValidationPipe(z.cuid())) groupId: string,
    @Body('vehicleId', new ZodValidationPipe(z.cuid())) vehicleId: string,
  ) {
    return await this.groupsService.removeVehicleFromGroup(userSession, groupId, vehicleId);
  }

  @Delete(':groupId/members/:userId')
  async removeMemberFromGroup(
    @Session() userSession: UserSession,
    @Param('groupId', new ZodValidationPipe(z.cuid())) groupId: string,
    @Param('userId', new ZodValidationPipe(z.string())) userId: string,
  ) {
    return await this.groupsService.removeMemberFromGroup(userSession, groupId, userId);
  }

  // INVITE LOGIC
  @Post(':groupId/invites')
  async inviteToGroup(
    @Session() userSession: UserSession,
    @Body(new ZodValidationPipe(GroupInviteSchema as ZodType)) inviteData: GroupInviteValues,
  ) {
    return await this.groupsService.sendGroupInvite(userSession, inviteData);
  }

  @Post('invites/:inviteId/accept')
  async acceptGroupInvite(
    @Session() userSession: UserSession,
    @Param('inviteId', new ZodValidationPipe(z.cuid())) inviteId: string,
  ) {
    return await this.groupsService.acceptGroupInvite(userSession, inviteId);
  }

  @Post('invites/:inviteId/deny')
  async denyGroupInvite(
    @Session() userSession: UserSession,
    @Param('inviteId', new ZodValidationPipe(z.cuid())) inviteId: string,
  ) {
    return await this.groupsService.denyGroupInvite(userSession, inviteId);
  }

  @Delete('invites/:inviteId')
  async cancelGroupInvite(
    @Session() userSession: UserSession,
    @Param('inviteId', new ZodValidationPipe(z.cuid())) inviteId: string,
  ) {
    return await this.groupsService.cancelGroupInvite(userSession, inviteId);
  }
}
