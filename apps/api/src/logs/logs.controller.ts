import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MaintenanceInput, MaintenanceSchema, RefillSchema, RefillSchemaOutput } from '@repo/validation';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import z, { ZodType } from 'zod';

import { LogsService } from './logs.service';
import { RefillsService } from './refills/refills.service';
import { MaintenanceService } from 'src/logs/maintenance/maintenance.service';
import { AllowAnonymous, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { VehicleType } from 'prisma/generated/client';

@Controller('logs')
export class LogsController {
  constructor(
    private logsService: LogsService,
    private maintenanceService: MaintenanceService,
    private refillService: RefillsService,
  ) {}

  // ** REFILL **
  @Post('refill')
  async createRefill(
    @Session() SessionUser: UserSession,
    @Body(new ZodValidationPipe(RefillSchema as ZodType))
    refillDto: RefillSchemaOutput,
  ) {
    await this.refillService.createRefill(SessionUser, refillDto);
    return { status: 'success' };
  }

  @Get('refills/chart/:vehicleId/:limit')
  async getRefills(
    @Session() SessionUser: UserSession,
    @Param('vehicleId', new ZodValidationPipe(z.cuid())) vehicleId: string,
    @Param('limit', new ZodValidationPipe(z.string().datetime())) limit: string,
  ) {
    const limitDate = new Date(limit);
    return await this.refillService.getRefillsForChart(SessionUser, vehicleId, limitDate);
  }

  // ** MAINTENANCE **
  @AllowAnonymous() // Allow anonymous access
  @Get('maintenance/categories/:vehicleTypeCode')
  async getCategoriesAndParts(
    @Param('vehicleTypeCode', new ZodValidationPipe(z.string().min(1))) vehicleType: VehicleType['code'],
  ) {
    return await this.maintenanceService.getCategoriesWithParts(vehicleType);
  }

  @Post('maintenance')
  async createMaintenance(
    @Session() SessionUser: UserSession,
    @Body(new ZodValidationPipe(MaintenanceSchema as ZodType))
    maintenanceDto: MaintenanceInput,
  ) {
    await this.maintenanceService.createMaintenance(SessionUser, maintenanceDto);
    return { status: 'success' };
  }
}
