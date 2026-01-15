import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

/**
 * Publicador de eventos de logros
 * - Solo publica eventos de logro desbloqueado
 */
@Injectable()
export class EventPublisherService {
  private connection: any = null;
  private channel: any = null;
  private readonly exchangeName = 'achievement.events';

  constructor(private readonly rabbitMqUrl: string) {}

  // Conecta a RabbitMQ
  async connect(): Promise<void> {
    try {
      console.log('🔌 Conectando publisher a RabbitMQ:', this.rabbitMqUrl);
      this.connection = await amqp.connect(this.rabbitMqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
      console.log(`✅ Publisher conectado a exchange: ${this.exchangeName}`);
    } catch (error) {
      console.error('❌ Error al conectar publisher:', error);
      throw error;
    }
  }

  // Publica evento de logro desbloqueado
  async publishAchievementUnlocked(
    playerId: string,
    achievementId: string,
    achievementCode: string,
    rewardPoints: number,
  ): Promise<void> {
    if (!this.channel) {
      console.warn('⚠️ Publisher no inicializado, se omite evento');
      return;
    }
    try {
      const routingKey = 'achievement.unlocked';
      const message = {
        playerId,
        achievementId,
        achievementCode,
        rewardPoints,
        timestamp: new Date().toISOString(),
      };
      const buffer = Buffer.from(JSON.stringify(message));
      this.channel.publish(this.exchangeName, routingKey, buffer, { persistent: true });
      console.log('📤 Evento de logro publicado:', message);
    } catch (error) {
      console.error('❌ Error publicando evento de logro:', error);
    }
  }

  // Desconecta publisher de RabbitMQ
  async disconnect(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      console.log('🔌 Publisher desconectado de RabbitMQ');
    } catch (error) {
      console.error('❌ Error al desconectar publisher:', error);
    }
  }
}
