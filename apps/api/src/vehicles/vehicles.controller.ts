import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { VehiclesService } from 'src/vehicles/vehicles.service';

import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import {
  CreateVehicleBackendSchema,
  CreateVehicleBackendSchemaType,
  TAccessibleVehicle,
  TBasicVehicle,
} from '@repo/validation';
import { ZodType } from 'zod';
import { AllowAnonymous, Session, UserSession } from '@thallesp/nestjs-better-auth';

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @AllowAnonymous()
  @Get('types')
  async getVehicleTypes(): Promise<string[]> {
    return await this.vehiclesService.getVehicleTypes();
  }

  @Post('new')
  async createVehicle(
    @Session() userSession: UserSession,
    @Body(new ZodValidationPipe(CreateVehicleBackendSchema as ZodType))
    vehicleDto: CreateVehicleBackendSchemaType,
  ) {
    return await this.vehiclesService.create(userSession, vehicleDto);
  }

  @Get('accessible')
  async getAccessibleVehicles(@Session() userSession: UserSession): Promise<TAccessibleVehicle[]> {
    console.log('Getting accessible vehicles for user:', userSession.user);
    const vehicles = await this.vehiclesService.getAccessibleVehicles(userSession);
    console.log('found vehicle count: ', vehicles.length);
    return vehicles;
  }

  @Get('own')
  async getOwnVehicles(@Session() userSession: UserSession): Promise<TBasicVehicle[]> {
    const ownVehicles = await this.vehiclesService.getOwnVehicles(userSession);
    return ownVehicles;
  }

  @Get(':id/stat-card')
  async getStatCardData(@Session() userSession: UserSession, @Param('id') vehicleId: string) {
    return this.vehiclesService.getStatCardData(userSession, vehicleId);
  }
}
