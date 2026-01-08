import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

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

  await app.listen(port, '0.0.0.0');
  console.log(`🎯 Achievement Service is running on: http://0.0.0.0:${port}/api`);
  console.log(`📊 Health check: http://0.0.0.0:${port}/api/health`);
}

bootstrap();
