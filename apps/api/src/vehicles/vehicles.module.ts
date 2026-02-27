import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VehiclesService } from 'src/vehicles/vehicles.service';
import { VehiclesController } from 'src/vehicles/vehicles.controller';
import { VehicleTransformerService } from 'src/vehicles/vehicleTransformer.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { LimitsModule } from 'src/limits/limits.module';
import { TodosModule } from 'src/todos/todos.module';
import { VehicleRepository } from 'src/vehicles/vehicleRepository';
import { OdometerService } from 'src/utils/odometer.service';

@Module({
  imports: [PrismaModule, LimitsModule, forwardRef(() => TodosModule)],
  providers: [
    VehiclesService,
    VehicleRepository,
    VehicleTransformerService,
    OdometerService,
    UnitConversionService,
    AuthValidationService,
  ],
  exports: [VehiclesService, VehicleRepository, VehicleTransformerService],
  controllers: [VehiclesController],
})
export class VehiclesModule {}
