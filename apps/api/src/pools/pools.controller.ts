import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';

import {
  AccessiblePool,
  PoolDetails,
  PoolInviteSchema,
  PoolInviteValues,
  PoolSchema,
  PoolSchemaValues,
} from '@repo/validation';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { PoolMemberRole } from 'prisma/generated/prisma/enums';

import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { PoolsService } from 'src/pools/pools.service';
import z, { ZodType } from 'zod';

@Controller('pools')
export class PoolsController {
  constructor(private poolsService: PoolsService) {}

  @Get('accessible')
  async getAccessiblePools(@Session() userSession: UserSession): Promise<AccessiblePool[]> {
    const pools = await this.poolsService.getAccessiblePools(userSession.user.id);
    return pools;
  }
  @Get(':poolId')
  async getPoolDetails(
    @Session() userSession: UserSession,
    @Param('poolId', new ZodValidationPipe(z.cuid())) poolId: string,
  ): Promise<PoolDetails> {
    return await this.poolsService.getPoolDetails(userSession, poolId);
  }

  @Post('')
  async createNewPool(
    @Session() userSession: UserSession,
    @Body(new ZodValidationPipe(PoolSchema as ZodType)) newPoolDto: PoolSchemaValues,
  ) {
    return await this.poolsService.createNewPool(userSession, newPoolDto);
  }

  @Put(':poolId')
  async updatePool(
    @Session() userSession: UserSession,
    @Param('poolId', new ZodValidationPipe(z.cuid())) poolId: string,
    @Body(new ZodValidationPipe(PoolSchema as ZodType)) updateData: PoolSchemaValues,
  ) {
    return await this.poolsService.updatePool(userSession, poolId, updateData);
  }

  @Delete(':poolId')
  async deletePool(
    @Session() userSession: UserSession,
    @Param('poolId', new ZodValidationPipe(z.cuid())) poolId: string,
  ) {
    return await this.poolsService.deletePool(userSession, poolId);
  }

  @Post('leave/:poolId')
  async leavePool(
    @Session() userSession: UserSession,
    @Param('poolId', new ZodValidationPipe(z.cuid())) poolId: string,
  ) {
    return await this.poolsService.leavePool(userSession, poolId);
  }

  @Patch(':poolId/members/:userId/role')
  async updateUserRoleInPool(
    @Session() userSession: UserSession,
    @Param('poolId', new ZodValidationPipe(z.cuid())) poolId: string,
    @Param('userId', new ZodValidationPipe(z.string())) userId: string,
    @Body('role', new ZodValidationPipe(z.enum(PoolMemberRole))) role: PoolMemberRole,
  ) {
    return await this.poolsService.updateUserRoleInPool(userSession, poolId, userId, role);
  }

  @Patch('vehicles/add/:poolId')
  async addVehiclesToPool(
    @Session() userSession: UserSession,
    @Param('poolId', new ZodValidationPipe(z.cuid())) poolId: string,
    @Body('vehicleIds', new ZodValidationPipe(z.array(z.cuid()))) vehicleIds: string[],
  ): Promise<PoolDetails> {
    return await this.poolsService.addVehiclesToPool(userSession, poolId, vehicleIds);
  }

  @Patch('vehicle/remove/:poolId')
  async removeVehicleFromPool(
    @Session() userSession: UserSession,
    @Param('poolId', new ZodValidationPipe(z.cuid())) poolId: string,
    @Body('vehicleId', new ZodValidationPipe(z.cuid())) vehicleId: string,
  ) {
    return await this.poolsService.removeVehicleFromPool(userSession, poolId, vehicleId);
  }

  @Delete(':poolId/members/:userId')
  async removeMemberFromPool(
    @Session() userSession: UserSession,
    @Param('poolId', new ZodValidationPipe(z.cuid())) poolId: string,
    @Param('userId', new ZodValidationPipe(z.string())) userId: string,
  ) {
    return await this.poolsService.removeMemberFromPool(userSession, poolId, userId);
  }

  // INVITE LOGIC
  @Post(':poolId/invite')
  async inviteToPool(
    @Session() userSession: UserSession,
    @Body(new ZodValidationPipe(PoolInviteSchema as ZodType)) inviteData: PoolInviteValues,
  ) {
    return await this.poolsService.sendPoolInvite(userSession, inviteData);
  }

  @Post('invites/:inviteId/accept')
  async acceptPoolInvite(
    @Session() userSession: UserSession,
    @Param('inviteId', new ZodValidationPipe(z.cuid())) inviteId: string,
  ) {
    return await this.poolsService.acceptPoolInvite(userSession, inviteId);
  }

  @Post('invites/:inviteId/deny')
  async denyPoolInvite(
    @Session() userSession: UserSession,
    @Param('inviteId', new ZodValidationPipe(z.cuid())) inviteId: string,
  ) {
    return await this.poolsService.denyPoolInvite(userSession, inviteId);
  }

  @Delete('invites/:inviteId')
  async cancelPoolInvite(
    @Session() userSession: UserSession,
    @Param('inviteId', new ZodValidationPipe(z.cuid())) inviteId: string,
  ) {
    return await this.poolsService.cancelPoolInvite(userSession, inviteId);
  }
}
