import { Module, forwardRef } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { OdometerService } from 'src/utils/odometer.service';
import { MaintenanceService } from './maintenance/maintenance.service';
import { RefillsService } from './refills.service';
import { VehicleRepository } from 'src/utils/vehicleRepository';
import { LimitsModule } from 'src/limits/limits.module';
import { MaintenancePartTransformer } from 'src/logs/maintenance/maintenance-part.transformer';

@Module({
  imports: [PrismaModule, forwardRef(() => LimitsModule)],
  exports: [LogsService, RefillsService, MaintenancePartTransformer],
  controllers: [LogsController],
  providers: [
    LogsService,
    UnitConversionService,
    AuthValidationService,
    OdometerService,
    MaintenanceService,
    RefillsService,
    VehicleRepository,
    MaintenancePartTransformer,
  ],
})
export class LogsModule {}
