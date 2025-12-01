import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import {
  TPoolMember,
  AccessiblePool,
  PoolMemberRole,
  TPoolVehicle,
  NewPoolServerSchema,
  TNewPoolServerOutput,
} from '@repo/validation';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { Pool } from 'prisma/generated/prisma/client';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { PoolsService } from 'src/pools/pools.service';
import { ZodType } from 'zod';

@Controller('pools')
export class PoolsController {
  constructor(private poolsService: PoolsService) {}

  @Get('accessible')
  async getAccessiblePools(@Session() userSession: UserSession): Promise<AccessiblePool[]> {
    const pools = await this.poolsService.getAccessiblePools(userSession.user.id);
    return pools;
  }

  @Get(':id/info')
  async getPoolInfo(@Session() userSession: UserSession, @Param('id') id: string): Promise<Pool | null> {
    console.log(`Fetching info for pool with id: ${id}`);
    return await this.poolsService.getPoolInfo(userSession, id);
  }

  @Get(':id/role')
  async getUserPoolRole(
    @Session() userSession: UserSession,
    @Param('id') id: string,
  ): Promise<{ role: PoolMemberRole }> {
    console.log(`Fetching user role for pool with id: ${id}`);
    return await this.poolsService.getUserPoolRole(userSession, id);
  }

  @Get(':id/members')
  async getPoolMembers(@Session() userSession: UserSession, @Param('id') id: string): Promise<TPoolMember[]> {
    console.log(`Fetching members for pool with id: ${id}`);
    return await this.poolsService.getPoolMembers(userSession, id);
  }

  @Get(':id/vehicles')
  async getPoolVehicles(@Session() userSession: UserSession, @Param('id') id: string): Promise<TPoolVehicle[]> {
    console.log(`Fetching vehicles for pool with id: ${id}`);
    return await this.poolsService.getPoolVehicles(userSession, id);
  }

  @Post('new')
  async createNewPool(
    @Session() userSession: UserSession,
    @Body(new ZodValidationPipe(NewPoolServerSchema as ZodType)) newPoolDto: TNewPoolServerOutput,
  ) {
    const createdPool = await this.poolsService.createNewPool(userSession, newPoolDto);
    return createdPool;
  }

  @Delete(':id')
  async deletePool(@Session() userSession: UserSession, @Param('id') id: string) {
    return await this.poolsService.deletePool(userSession, id);
  }
}
