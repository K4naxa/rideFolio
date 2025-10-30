import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { OdometerService } from 'src/utils/odometer.service';
import { VehicleRepository } from 'src/utils/vehicleRepository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [TodosController],
  providers: [
    TodosService,
    UnitConversionService,
    AuthValidationService,
    OdometerService,
    VehicleRepository,
    PrismaService,
  ],
})
export class TodosModule {}
