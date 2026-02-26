import { Body, Controller, Get, Patch } from '@nestjs/common';
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
import { ZodType } from 'zod';
import { LimitsService } from 'src/limits/limits.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private limitsService: LimitsService,
  ) {}

  @Get('me')
  async getProfile(@Session() session: UserSession) {
    const value = await this.usersService.getBasicProfile(session.user.id);
    return value;
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

  @Get('storageBreakdown')
  async getStorageBreakdown(@Session() session: UserSession) {
    return await this.limitsService.getStorageBreakdown(session.user.id);
  }
}
