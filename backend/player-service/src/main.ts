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

  const portEnv = process.env.PORT;
  const port = portEnv ? parseInt(portEnv, 10) : 3001;
  
  console.log(`📌 Environment PORT=${portEnv}, Using port ${port}`);
  
  try {
    // Initialize Event Publisher
    const eventPublisher = app.get<EventPublisher>('IEventPublisher');
    console.log('📡 Initializing Event Publisher...');
    await eventPublisher.connect();
    console.log('✅ Event Publisher connected to RabbitMQ');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ Warning: Could not connect to RabbitMQ:', errorMessage);
    console.warn('Service will continue without event publishing');
  }

  console.log(`🎮 Player Service is starting on port ${port}...`);
  await app.listen(port);
  
  console.log(`🎮 Player Service is running on port ${port}`);
}

bootstrap();

