import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app.module';
import { EventPublisher } from './events/event.publisher';

/**
 * Player Service - Main Entry Point
 * SOLID Principle S: Only responsible for application bootstrap
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS for development
  app.enableCors();

  // Initialize Event Publisher
  const eventPublisher = app.get<EventPublisher>('IEventPublisher');
  await eventPublisher.connect();

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🎮 Player Service is running on port ${port}`);
}

bootstrap();

