import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UsersService } from 'src/user/user.service';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import {
  profileUpdateSchema,
  ProfileUpdateValues,
  TBasicProfile,
  UpdatePreferenceSchema,
  UpdatePreferenceValues,
} from '@repo/validation';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import z, { ZodType } from 'zod';
import { NotificationService } from 'src/notifications/notification.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private notificationService: NotificationService,
  ) {}

  @Get('me')
  async getProfile(@Session() session: UserSession) {
    const value = await this.usersService.getBasicProfile(session.user.id);
    return value;
  }

  @Get('notifications')
  async getNotifications(@Session() session: UserSession) {
    return await this.notificationService.getUserNotifications(session);
  }
  @Patch('notifications/:notificationId/read')
  async markNotificationAsRead(
    @Session() session: UserSession,
    @Param('notificationId', new ZodValidationPipe(z.cuid())) notificationId: string,
  ) {
    return await this.notificationService.markNotificationAsRead(session, notificationId);
  }

  @Patch('profile')
  async updateProfile(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(profileUpdateSchema as ZodType)) data: ProfileUpdateValues,
  ) {
    await this.usersService.updateProfile(session.user.id, data);
  }

  @Patch('preferences')
  async updatePreferences(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(UpdatePreferenceSchema as ZodType)) data: UpdatePreferenceValues,
  ): Promise<TBasicProfile> {
    return await this.usersService.updatePreferences(session.user.id, data);
  }
}
