import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersController } from 'src/user/user.controller';

@Module({
  imports: [PrismaModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
