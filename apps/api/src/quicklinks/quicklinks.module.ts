import { Module } from '@nestjs/common';
import { QuicklinksService } from './quicklinks.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LimitsModule } from 'src/limits/limits.module';

@Module({
  imports: [PrismaModule, LimitsModule],
  providers: [QuicklinksService],
  exports: [QuicklinksService],
})
export class QuicklinksModule {}
