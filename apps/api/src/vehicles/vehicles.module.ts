import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VehiclesService } from 'src/vehicles/vehicles.service';
import { VehiclesController } from 'src/vehicles/vehicles.controller';
import { VehicleTransformerService } from 'src/utils/vehicleTransformer.service';
import { VehicleRepository } from 'src/utils/vehicleRepository';
import { OdometerService } from 'src/utils/odometer.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { LimitsService } from 'src/limits/limits.service';

@Module({
  imports: [PrismaModule],
  providers: [
    VehiclesService,
    VehicleRepository,
    VehicleTransformerService,
    OdometerService,
    UnitConversionService,
    AuthValidationService,
    LimitsService,
  ],
  exports: [VehiclesService],
  controllers: [VehiclesController],
})
export class VehiclesModule {}
