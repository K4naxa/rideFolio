import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { OdometerService } from 'src/utils/odometer.service';
import { VehicleRepository } from 'src/utils/vehicleRepository';
import { PrismaService } from 'src/prisma/prisma.service';
import { LimitsModule } from 'src/limits/limits.module';
import { TodosService } from 'src/todos/todos.service';

@Module({
  imports: [LimitsModule],
  controllers: [TodosController],
  providers: [
    TodosService,
    UnitConversionService,
    AuthValidationService,
    OdometerService,
    VehicleRepository,
    PrismaService,
  ],
  exports: [TodosService],
})
export class TodosModule {}
