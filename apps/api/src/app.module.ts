import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './user/user.module';
import { VehiclesModule } from 'src/vehicles/vehicles.module';
import { PoolsController } from './pools/pools.controller';
import { PoolsModule } from './pools/pools.module';
import { LogsModule } from './logs/logs.module';
import { StatisticsController } from './statistics/statistics.controller';
import { StatisticsModule } from './statistics/statistics.module';
import { AppService } from 'src/app.service';
import { TodosModule } from './todos/todos.module';
import { NoteModule } from './note/note.module';
import { ShoppingListModule } from './shopping-list/shopping-list.module';
import { AuthGuard, AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth'; // Your Better Auth instance
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // isGlobal: true makes the ConfigService available everywhere.
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule.forRoot({ auth }),
    UsersModule,
    VehiclesModule,
    PoolsModule,
    LogsModule,
    StatisticsModule,
    TodosModule,
    NoteModule,
    ShoppingListModule,
  ],
  controllers: [AppController, PoolsController, StatisticsController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
