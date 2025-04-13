import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Get port from environment variable
  const port = process.env.PORT || 3000; // App Engine uses port 8080 by default

  // Listen on all network interfaces
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
