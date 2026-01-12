import { Module } from '@nestjs/common';
import { QuicklinksService } from './quicklinks.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [QuicklinksService],
  exports: [QuicklinksService],
})
export class QuicklinksModule {}
