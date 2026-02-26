import { Module } from '@nestjs/common';
import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VehicleRepository } from 'src/vehicles/vehicleRepository';
import { VehicleTransformerService } from 'src/vehicles/vehicleTransformer.service';
import { OdometerService } from 'src/utils/odometer.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { PoolsTransformerService } from './pools.transformer.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  exports: [PoolsService, PoolsTransformerService],
  controllers: [PoolsController],
  providers: [
    PoolsService,
    PrismaService,
    VehicleRepository,
    VehicleTransformerService,
    OdometerService,
    UnitConversionService,
    AuthValidationService,
    PoolsTransformerService,
  ],
})
export class PoolsModule {}
