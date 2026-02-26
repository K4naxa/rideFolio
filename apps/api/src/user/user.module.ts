import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { UsersController } from 'src/user/user.controller';
import { LimitsModule } from 'src/limits/limits.module';
import { VehiclesModule } from 'src/vehicles/vehicles.module';

@Module({
  imports: [PrismaModule, LimitsModule, VehiclesModule, NotificationsModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
