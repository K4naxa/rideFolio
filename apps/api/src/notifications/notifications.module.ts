import { Module, OnModuleInit } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationRegistry } from './registry/notification.registry';
import { NotificationService } from './notification.service';
import { POOL_NOTIFICATIONS } from './definitions/pool.notifications';

@Module({
  imports: [PrismaModule],
  providers: [NotificationRegistry, NotificationService],
  exports: [NotificationService, NotificationRegistry],
  controllers: [NotificationsController],
})
export class NotificationsModule implements OnModuleInit {
  constructor(private readonly registry: NotificationRegistry) {}

  onModuleInit() {
    // Dynamically import and register all notification definitions

    // ADD NEW NOTIFICATIONS HERE
    [...POOL_NOTIFICATIONS].forEach((def) => this.registry.register(def));
  }
}
