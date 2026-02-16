import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VehiclesService } from 'src/vehicles/vehicles.service';
import { VehiclesController } from 'src/vehicles/vehicles.controller';
import { VehicleTransformerService } from 'src/utils/vehicleTransformer.service';
import { VehicleRepository } from 'src/utils/vehicleRepository';
import { OdometerService } from 'src/utils/odometer.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { LimitsModule } from 'src/limits/limits.module';
import { TodosService } from 'src/todos/todos.service';

@Module({
  imports: [PrismaModule, LimitsModule],
  providers: [
    VehiclesService,
    VehicleRepository,
    VehicleTransformerService,
    OdometerService,
    UnitConversionService,
    AuthValidationService,
    TodosService,
  ],
  exports: [VehiclesService, VehicleRepository],
  controllers: [VehiclesController],
})
export class VehiclesModule {}
