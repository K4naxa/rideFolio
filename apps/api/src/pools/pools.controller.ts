import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { AccessiblePool, PoolSchema, PoolSchemaValues, PoolDetails } from '@repo/validation';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';

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
  @Get(':poolId')
  async getPoolDetails(@Session() userSession: UserSession, @Param('poolId') poolId: string): Promise<PoolDetails> {
    return await this.poolsService.getPoolDetails(userSession, poolId);
  }

  @Post('')
  async createNewPool(
    @Session() userSession: UserSession,
    @Body(new ZodValidationPipe(PoolSchema as ZodType)) newPoolDto: PoolSchemaValues,
  ) {
    const createdPool = await this.poolsService.createNewPool(userSession, newPoolDto);
    return createdPool;
  }

  @Delete(':id')
  async deletePool(@Session() userSession: UserSession, @Param('id') id: string) {
    return await this.poolsService.deletePool(userSession, id);
  }
}
