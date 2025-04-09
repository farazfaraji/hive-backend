import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors();

  // Use PORT from environment variable or default to 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
