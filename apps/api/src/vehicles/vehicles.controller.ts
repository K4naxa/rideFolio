import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { VehiclesService } from 'src/vehicles/vehicles.service';

import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { BasicVehicle, TAccessibleVehicle, VehicleInput, VehicleInputSchema, VehicleType } from '@repo/validation';
import { ZodType } from 'zod';
import { AllowAnonymous, Session, UserSession } from '@thallesp/nestjs-better-auth';

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @AllowAnonymous()
  @Get('types')
  async getVehicleTypes(): Promise<VehicleType[]> {
    return await this.vehiclesService.getVehicleTypes();
  }

  @Post('')
  async createVehicle(
    @Session() userSession: UserSession,
    @Body(new ZodValidationPipe(VehicleInputSchema as ZodType))
    vehicleDto: VehicleInput,
  ) {
    return await this.vehiclesService.create(userSession, vehicleDto);
  }

  @Put(':vehicleId')
  async updateVehicle(
    @Session() userSession: UserSession,
    @Param('vehicleId') vehicleId: string,
    @Body(new ZodValidationPipe(VehicleInputSchema as ZodType)) vehicleDTO: VehicleInput,
  ) {
    return await this.vehiclesService.update(userSession, vehicleId, vehicleDTO);
  }

  @Delete(':vehicleId')
  async deleteVehicle(@Session() userSession: UserSession, @Param('vehicleId') vehicleId: string) {
    console.log('Received request to delete vehicle with ID:', vehicleId);

    return await this.vehiclesService.delete(userSession, vehicleId);
  }

  @Get('by-id/:vehicleId')
  async getVehicleById(
    @Session() userSession: UserSession,
    @Param('vehicleId') vehicleId: string,
  ): Promise<BasicVehicle> {
    return await this.vehiclesService.getVehicleById(userSession, vehicleId);
  }

  @Get('accessible')
  async getAccessibleVehicles(@Session() userSession: UserSession): Promise<TAccessibleVehicle[]> {
    return this.vehiclesService.getAccessibleVehicles(userSession);
  }

  @Get('upcoming-activity')
  async getUpcomingActivity(@Session() userSession: UserSession) {
    return await this.vehiclesService.getUpcomingActivity(userSession);
  }

  @Get('upcoming-activity/:vehicleId')
  async getUpcomingActivityForVehicle(@Session() userSession: UserSession, @Param('vehicleId') vehicleId: string) {
    return await this.vehiclesService.getUpcomingActivity(userSession, vehicleId);
  }
}
