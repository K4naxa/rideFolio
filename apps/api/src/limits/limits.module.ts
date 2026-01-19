import { Module } from '@nestjs/common';
import { LimitsService } from './limits.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';

@Module({
  providers: [LimitsService, PrismaService, UnitConversionService],
  exports: [LimitsService],
})
export class LimitsModule {}
