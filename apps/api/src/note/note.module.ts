import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LimitsModule } from 'src/limits/limits.module';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [LimitsModule, VehiclesModule],
  providers: [NoteService, AuthValidationService, PrismaService],
  controllers: [NoteController],
})
export class NoteModule {}
