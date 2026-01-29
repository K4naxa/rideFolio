import { Module } from '@nestjs/common';
import { LimitsService } from './limits.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { MaintenancePartTransformer } from 'src/logs/maintenance/maintenance-part.transformer';

@Module({
  imports: [],
  providers: [LimitsService, PrismaService, UnitConversionService, MaintenancePartTransformer],
  exports: [LimitsService],
})
export class LimitsModule {}
