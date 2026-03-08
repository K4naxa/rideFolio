import { forwardRef, Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { OdometerService } from 'src/utils/odometer.service';
import { MaintenanceService } from './maintenance/maintenance.service';
import { RefillsService } from './refills/refills.service';
import { LimitsModule } from 'src/limits/limits.module';
import { MaintenancePartTransformer } from 'src/logs/maintenance/maintenance-part.transformer';
import { RefillsTransformerService } from './refills/refills.transformer.service';
import { MaintenanceTransformerService } from './maintenance/maintenance.transformer.service';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [PrismaModule, forwardRef(() => LimitsModule), forwardRef(() => VehiclesModule)],
  exports: [
    LogsService,
    RefillsService,
    MaintenancePartTransformer,
    MaintenanceTransformerService,
    RefillsTransformerService,
  ],
  controllers: [LogsController],
  providers: [
    LogsService,
    UnitConversionService,
    AuthValidationService,
    OdometerService,
    MaintenanceService,
    RefillsService,
    MaintenancePartTransformer,
    MaintenanceTransformerService,
    RefillsTransformerService,
  ],
})
export class LogsModule {}
