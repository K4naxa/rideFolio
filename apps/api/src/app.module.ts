import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { UsersModule } from './user/user.module';
import { VehiclesModule } from 'src/vehicles/vehicles.module';
import { GroupsController } from './groups/groups.controller';
import { GroupsModule } from './groups/groups.module';
import { LogsModule } from './logs/logs.module';
import { AppService } from 'src/app.service';
import { TodosModule } from './todos/todos.module';
import { NoteModule } from './note/note.module';
import { ShoppingListModule } from './shopping-list/shopping-list.module';
import { AuthGuard, AuthModule } from '@thallesp/nestjs-better-auth';
import { createAuth } from './auth/auth'; // Better Auth instance
import { APP_GUARD } from '@nestjs/core';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';
import { QuicklinksController } from './quicklinks/quicklinks.controller';
import { QuicklinksModule } from './quicklinks/quicklinks.module';
import { LimitsModule } from './limits/limits.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TimelineModule } from './timeline/timeline.module';

@Module({
  imports: [
    // isGlobal: true makes the ConfigService available everywhere.
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1-minute window
        limit: 60, // 100 requests per IP per window
      },
    ]),
    AuthModule.forRootAsync({
      useFactory: (emailService: EmailService) => ({
        auth: createAuth(emailService), // Create the auth instance with injected EmailService
      }),
      imports: [EmailModule],
      inject: [EmailService],
    }),
    UsersModule,
    VehiclesModule,
    GroupsModule,
    LogsModule,
    TodosModule,
    NoteModule,
    ShoppingListModule,
    EmailModule,
    QuicklinksModule,
    LimitsModule,
    NotificationsModule,
    TimelineModule,
  ],
  controllers: [AppController, GroupsController, QuicklinksController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
