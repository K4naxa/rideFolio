import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UsersService } from 'src/user/user.service';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { profileUpdateSchema, ProfileUpdateValues } from '@repo/validation';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { ZodType } from 'zod';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

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
}
