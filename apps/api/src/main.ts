import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // required for Better-Auth
  });
  const configService = app.get(ConfigService); // Get ConfigService instance for env variables

  // Get local network IP for development
  const isDevelopment = process.env.NODE_ENV !== 'production';

  app.setGlobalPrefix('api'); // All routes will start with /api
  app.useGlobalPipes(new ValidationPipe()); // for DTO validation
  app.enableCors({
    origin: isDevelopment
      ? true // Allow all origins in development
      : [configService.get<string>('FRONTEND_URL')], // Restrict in production
    methods: 'GET,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(configService.get<number>('PORT') ?? 3001);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
