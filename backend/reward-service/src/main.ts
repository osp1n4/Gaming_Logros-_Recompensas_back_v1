import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { RewardModule } from './modules/reward.module';
import { EventListenerService } from './services/event.listener';

const logger = new Logger('RewardService');
const DEFAULT_APP_PORT = 3003;
const API_PREFIX = 'api';
const APP_PORT = parseInt(process.env.APP_PORT || String(DEFAULT_APP_PORT), 10);

async function bootstrap() {
  const app = await NestFactory.create(RewardModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix(API_PREFIX);

  // Initialize RabbitMQ connection
  try {
    console.log('📡 Initializing RabbitMQ connection...');
    const eventListener = app.get<EventListenerService>('EVENT_LISTENER');
    await eventListener.connect();
    console.log('✅ Event Listener connected to RabbitMQ');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ Warning: Could not connect to RabbitMQ:', errorMessage);
    console.warn('Service will continue without event processing');
  }

  await app.listen(APP_PORT);
  logger.log(`🎁 Reward Service started on port ${APP_PORT}`);
}

bootstrap();
