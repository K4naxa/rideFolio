import { Injectable } from '@nestjs/common';
import { RecentActivityQueryOptions } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { VehicleRepository } from 'src/utils/vehicleRepository';

@Injectable()
export class LogsService {
  constructor(
    private prisma: PrismaService,
    private vehicleRepository: VehicleRepository,
    private authValidation: AuthValidationService,
    private unitConversion: UnitConversionService,
  ) {}
}
