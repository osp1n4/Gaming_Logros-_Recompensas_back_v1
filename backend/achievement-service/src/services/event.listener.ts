import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { AchievementEventListener } from '../listeners/achievement.event.listener';

/**
 * Servicio que escucha eventos de RabbitMQ (Observer)
 * - Solo consume eventos y delega a AchievementEventListener
 */
@Injectable()
export class EventListenerService {
  private connection: any = null;
  private channel: any = null;
  private readonly exchangeName = 'player.events';
  private readonly queueName = 'achievement.player-events';

  constructor(
    private readonly rabbitMqUrl: string,
    private readonly achievementEventListener: AchievementEventListener,
  ) {}

  // Conecta a RabbitMQ y comienza a escuchar eventos
  async connect(): Promise<void> {
    try {
      console.log('🔌 Conectando a RabbitMQ:', this.rabbitMqUrl);
      this.connection = await amqp.connect(this.rabbitMqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
      await this.channel.assertQueue(this.queueName, { durable: true });
      await this.channel.bindQueue(this.queueName, this.exchangeName, 'player.event.*');
      console.log(`✅ Escuchando eventos en la cola: ${this.queueName}`);
      await this.startConsuming();
    } catch (error) {
      console.error('❌ Error al conectar a RabbitMQ:', error);
      throw error;
    }
  }

  // Comienza a consumir mensajes de la cola
  private async startConsuming(): Promise<void> {
    if (!this.channel) throw new Error('Canal no inicializado');
    await this.channel.consume(
      this.queueName,
      async (msg: any) => {
        if (msg) {
          try {
            const content = msg.content.toString();
            const event = JSON.parse(content);
            console.log('📥 Evento recibido:', event);
            // Delegar al listener de logros
            await this.achievementEventListener.handlePlayerEventMessage(event);
            this.channel.ack(msg);
          } catch (error) {
            console.error('❌ Error procesando mensaje:', error);
            this.channel.nack(msg, false, true);
          }
        }
      },
      { noAck: false },
    );
  }

  // Desconecta de RabbitMQ
  async disconnect(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      console.log('🔌 Desconectado de RabbitMQ');
    } catch (error) {
      console.error('❌ Error al desconectar:', error);
    }
  }
}
