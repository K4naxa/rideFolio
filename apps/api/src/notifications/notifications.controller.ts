import { Controller, Get, Param, Post } from '@nestjs/common';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { NotificationService } from './notification.service';
import z from 'zod';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(@Session() userSession: UserSession) {
    return await this.notificationService.getUserNotifications(userSession);
  }

  @Post(':notificationId/read')
  async markNotificationAsRead(
    @Session() userSession: UserSession,
    @Param('notificationId', new ZodValidationPipe(z.cuid())) notificationId: string,
  ) {
    await this.notificationService.markAsRead(userSession, notificationId);
  }
}
