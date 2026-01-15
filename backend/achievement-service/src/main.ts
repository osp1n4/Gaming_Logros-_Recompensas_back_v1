import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EventListenerService } from './services/event.listener';
import { EventPublisherService } from './services/event.publisher';

/**
 * Punto de entrada principal del servicio de logros
 * - Inicializa la app NestJS y la base de datos
 * - Configura RabbitMQ y el API REST
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Prefijo global para rutas
  app.setGlobalPrefix('api');

  // Puerto de la app
  const port = process.env.PORT || 3002;
  console.log(`[DEBUG] process.env.PORT = ${process.env.PORT}`);
  console.log(`[DEBUG] port variable = ${port}`);

  // Inicializa conexiones RabbitMQ
  try {
    console.log('📡 Inicializando conexiones RabbitMQ...');
    // Conecta listener de eventos
    const eventListener = app.get<EventListenerService>('EVENT_LISTENER');
    await eventListener.connect();
    console.log('✅ Listener conectado a RabbitMQ');
    // Conecta publicador de eventos
    const eventPublisher = app.get<EventPublisherService>('EVENT_PUBLISHER');
    await eventPublisher.connect();
    console.log('✅ Publisher conectado a RabbitMQ');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ No se pudo conectar a RabbitMQ:', errorMessage);
    console.warn('El servicio sigue, pero sin eventos');
  }

  await app.listen(port, '0.0.0.0');
  console.log(`🎯 Servicio de logros activo en: http://0.0.0.0:${port}/api`);
  console.log(`📊 Health: http://0.0.0.0:${port}/api/health`);
  console.log(`💡 Ejecuta seed-achievements.ps1 para cargar datos de prueba`);
}

bootstrap();
