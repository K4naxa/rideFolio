import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MaintenanceSchema, RefillSchema, RefillSchemaOutput, TMaintenanceSchema } from '@repo/validation';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { ZodType } from 'zod';

import { LogsService } from './logs.service';
import { RefillsService } from './refills.service';
import { MaintenanceService } from 'src/logs/maintenance/maintenance.service';
import { AllowAnonymous, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { VehicleType } from 'prisma/generated/prisma/client';

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
    @Param('vehicleId') vehicleId: string,
    @Param('limit') limit: Date,
  ) {
    return await this.refillService.getRefillsForChart(SessionUser, vehicleId, limit);
  }

  // ** MAINTENANCE **
  @AllowAnonymous() // Allow anonymous access
  @Get('maintenance/categories/:vehicleTypeCode')
  async getCategoriesAndParts(@Param('vehicleTypeCode') vehicleType: VehicleType['code']) {
    console.log('fetching maintenance categories and parts for vehicle type:', vehicleType);
    return await this.maintenanceService.getCategoriesAndParts(vehicleType);
  }

  @Post('maintenance')
  async createMaintenance(
    @Session() SessionUser: UserSession,
    @Body(new ZodValidationPipe(MaintenanceSchema as ZodType))
    maintenanceDto: TMaintenanceSchema,
  ) {
    await this.maintenanceService.createMaintenance(SessionUser, maintenanceDto);
    return { status: 'success' };
  }
}
