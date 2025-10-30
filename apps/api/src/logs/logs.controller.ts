import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  MaintenanceBackendSchema,
  RecentActivityInfiniteResponse,
  RecentActivityQueryOptions,
  RefillSchema,
  RefillSchemaOutput,
  TMaintenanceBackendSchema,
  TVehicleTypeCode,
} from '@repo/validation';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { ZodType } from 'zod';

import { LogsService } from './logs.service';
import { RefillsService } from './refills.service';
import { MaintenanceService } from 'src/logs/maintenance/maintenance.service';
import { AllowAnonymous, Session, UserSession } from '@thallesp/nestjs-better-auth';

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

  // ** MAINTENANCE **
  @AllowAnonymous() // Allow anonymous access
  @Get('maintenance/maintenance-categories-and-parts')
  async getCategoriesAndParts(@Query('vehicleTypeCode') vehicleType: TVehicleTypeCode) {
    console.log('fetching maintenance categories and parts for vehicle type:', vehicleType);
    return await this.maintenanceService.getCategoriesAndParts(vehicleType);
  }

  @Post('maintenance')
  async createMaintenance(
    @Session() SessionUser: UserSession,
    @Body(new ZodValidationPipe(MaintenanceBackendSchema as ZodType))
    maintenanceDto: TMaintenanceBackendSchema,
  ) {
    await this.maintenanceService.createMaintenance(SessionUser, maintenanceDto);
    return { status: 'success' };
  }

  // ** RECENT ACTIVITY (INFINITE) **
  @Get('recent-activity')
  async getRecentActivity(
    @Session() SessionUser: UserSession,
    @Query('vehicleId') vehicleId?: string,
    @Query('poolId') poolId?: string,
    @Query('take') take?: string,
    @Query('cursorDate') cursorDate?: string,
    @Query('cursorId') cursorId?: string,
    @Query('owned') owned?: boolean,
  ): Promise<RecentActivityInfiniteResponse> {
    const options: RecentActivityQueryOptions = {
      vehicleId: vehicleId || undefined,
      poolId: poolId || undefined,
      owned: owned ?? false,
      take: take ? Math.min(Math.max(parseInt(take, 10) || 20, 1), 100) : 20,
      cursor: cursorDate && cursorId ? { date: cursorDate, id: cursorId } : undefined,
    };
    return this.logsService.getRecentActivity(SessionUser, options);
  }
}
