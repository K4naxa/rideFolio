import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StatisticsController } from 'src/statistics/statistics.controller';
import { StatisticsService } from 'src/statistics/statistics.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { VehicleRepository } from 'src/utils/vehicleRepository';

@Module({
  imports: [PrismaModule],
  providers: [StatisticsService, AuthValidationService, UnitConversionService, VehicleRepository],
  exports: [StatisticsService],
  controllers: [StatisticsController],
})
export class StatisticsModule {}
