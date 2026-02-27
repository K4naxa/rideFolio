import { forwardRef, Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { OdometerService } from 'src/utils/odometer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LimitsModule } from 'src/limits/limits.module';
import { TodosService } from 'src/todos/todos.service';
import { VehiclesModule } from 'src/vehicles/vehicles.module';
import { TodoFormatterService } from 'src/todos/todoFormatter.service';

@Module({
  imports: [LimitsModule, forwardRef(() => VehiclesModule)],
  controllers: [TodosController],
  providers: [
    TodosService,
    UnitConversionService,
    AuthValidationService,
    OdometerService,
    PrismaService,
    TodoFormatterService,
  ],
  exports: [TodosService, TodoFormatterService],
})
export class TodosModule {}
