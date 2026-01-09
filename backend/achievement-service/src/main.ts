import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EventListenerService } from './services/event.listener';
import { EventPublisherService } from './services/event.publisher';

/**
 * Achievement Service - Main Entry Point
 * 
 * Responsibilities:
 * - Initialize the NestJS application
 * - Setup database connection with TypeORM
 * - Configure RabbitMQ listener for player events
 * - Start the HTTP server for REST API
 * - Enable CORS for cross-origin requests
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for cross-origin requests
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Get port from environment or use default
  const port = process.env.PORT || 3002;
  console.log(`[DEBUG] process.env.PORT = ${process.env.PORT}`);
  console.log(`[DEBUG] port variable = ${port}`);

  // Initialize RabbitMQ connections
  try {
    console.log('📡 Initializing RabbitMQ connections...');
    
    // Initialize Event Listener (consumer)
    const eventListener = app.get<EventListenerService>('EVENT_LISTENER');
    await eventListener.connect();
    console.log('✅ Event Listener connected to RabbitMQ');
    
    // Initialize Event Publisher (producer)
    const eventPublisher = app.get<EventPublisherService>('EVENT_PUBLISHER');
    await eventPublisher.connect();
    console.log('✅ Event Publisher connected to RabbitMQ');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ Warning: Could not connect to RabbitMQ:', errorMessage);
    console.warn('Service will continue without event processing');
  }

  await app.listen(port, '0.0.0.0');
  console.log(`🎯 Achievement Service is running on: http://0.0.0.0:${port}/api`);
  console.log(`📊 Health check: http://0.0.0.0:${port}/api/health`);
  console.log(`💡 Tip: Run seed-achievements.ps1 to populate initial test data`);
}

bootstrap();
