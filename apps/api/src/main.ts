import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // required for Better-Auth
  });
  const configService = app.get(ConfigService); // Get ConfigService instance for env variables
  app.useGlobalPipes(new ValidationPipe()); // for DTO validation
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL'),
    methods: 'GET,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(configService.get<number>('PORT') ?? 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
