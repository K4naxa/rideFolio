import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VehicleRepository } from 'src/vehicles/vehicleRepository';
import { VehicleTransformerService } from 'src/vehicles/vehicleTransformer.service';
import { OdometerService } from 'src/utils/odometer.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { GroupsTransformerService } from './groups.transformer.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  exports: [GroupsService, GroupsTransformerService],
  controllers: [GroupsController],
  providers: [
    GroupsService,
    PrismaService,
    VehicleRepository,
    VehicleTransformerService,
    OdometerService,
    UnitConversionService,
    AuthValidationService,
    GroupsTransformerService,
  ],
})
export class GroupsModule {}
