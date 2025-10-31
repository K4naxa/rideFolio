import { Controller, Get } from '@nestjs/common';
import { UsersService } from 'src/user/user.service';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('basicProfile')
  async getMyBasicProfile(@Session() userSession: UserSession) {
    return await this.usersService.getBasicProfile(userSession.user.id);
  }

  @Get('me')
  async getProfile(@Session() session: UserSession) {
    const value = await this.usersService.getBasicProfile(session.user.id);
    console.log('User profile requested:', value);
    return value;
  }
}
