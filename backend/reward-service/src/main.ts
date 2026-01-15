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

  // Habilita CORS para el frontend
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix(API_PREFIX);

  // Inicializa la conexión con RabbitMQ
  try {
    console.log('📡 Inicializando conexión con RabbitMQ...');
    const eventListener = app.get<EventListenerService>('EVENT_LISTENER');
    await eventListener.connect();
    console.log('✅ Listener de eventos conectado a RabbitMQ');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ Advertencia: No se pudo conectar a RabbitMQ:', errorMessage);
    console.warn('El servicio continuará sin procesar eventos');
  }

  await app.listen(APP_PORT);
  logger.log(`🎁 Servicio de recompensas iniciado en el puerto ${APP_PORT}`);
}

bootstrap();
