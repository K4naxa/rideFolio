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
  getProfile(@Session() session: UserSession) {
    return this.usersService.getBasicProfile(session.user.id);
  }
}
