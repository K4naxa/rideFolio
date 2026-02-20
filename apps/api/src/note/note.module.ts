import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VehicleRepository } from 'src/vehicles/vehicleRepository';
import { LimitsModule } from 'src/limits/limits.module';

@Module({
  imports: [LimitsModule],
  providers: [NoteService, AuthValidationService, PrismaService, VehicleRepository],
  controllers: [NoteController],
})
export class NoteModule {}
