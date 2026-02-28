import { Module } from '@nestjs/common';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';
import { PrismaService } from '../prisma/prisma.service';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { AuthValidationService } from '../utils/authValidation.service';
import { LogsModule } from '../logs/logs.module';
import { TodosModule } from '../todos/todos.module';

@Module({
  imports: [VehiclesModule, LogsModule, TodosModule],
  controllers: [TimelineController],
  providers: [TimelineService, PrismaService, AuthValidationService],
})
export class TimelineModule {}
