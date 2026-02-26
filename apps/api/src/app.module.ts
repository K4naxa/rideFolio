import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './user/user.module';
import { VehiclesModule } from 'src/vehicles/vehicles.module';
import { PoolsController } from './pools/pools.controller';
import { PoolsModule } from './pools/pools.module';
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

@Module({
  imports: [
    // isGlobal: true makes the ConfigService available everywhere.
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule.forRootAsync({
      useFactory: (emailService: EmailService) => ({
        auth: createAuth(emailService), // Create auth instance with injected EmailService
      }),
      imports: [EmailModule],
      inject: [EmailService],
    }),
    UsersModule,
    VehiclesModule,
    PoolsModule,
    LogsModule,
    TodosModule,
    NoteModule,
    ShoppingListModule,
    EmailModule,
    QuicklinksModule,
    LimitsModule,
    NotificationsModule,
  ],
  controllers: [AppController, PoolsController, QuicklinksController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
