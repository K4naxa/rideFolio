import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationService } from 'src/notifications/notification.service';
import { UsersController } from 'src/user/user.controller';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, NotificationService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
