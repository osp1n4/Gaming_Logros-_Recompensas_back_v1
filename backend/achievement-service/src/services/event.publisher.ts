import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

/**
 * Event Publisher for Achievement Service
 * SOLID Principles:
 * - S (Single Responsibility): Only handles achievement.unlocked event publishing
 * - O (Open/Closed): Can be extended for new event types
 */
@Injectable()
export class EventPublisherService {
  private connection: any = null;
  private channel: any = null;
  private readonly exchangeName = 'achievement.events';

  constructor(private readonly rabbitMqUrl: string) {}

  async connect(): Promise<void> {
    try {
      console.log('🔌 Connecting Achievement Publisher to RabbitMQ:', this.rabbitMqUrl);
      this.connection = await amqp.connect(this.rabbitMqUrl);
      this.channel = await this.connection.createChannel();

      // Assert exchange for achievement events
      await this.channel.assertExchange(this.exchangeName, 'topic', {
        durable: true,
      });

      console.log(`✅ Achievement Publisher connected to exchange: ${this.exchangeName}`);
    } catch (error) {
      console.error('❌ Failed to connect Achievement Publisher to RabbitMQ:', error);
      throw error;
    }
  }

  async publishAchievementUnlocked(
    playerId: string,
    achievementId: string,
    achievementCode: string,
    rewardPoints: number,
  ): Promise<void> {
    if (!this.channel) {
      console.warn('⚠️ Publisher channel not initialized, skipping event');
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

      this.channel.publish(this.exchangeName, routingKey, buffer, {
        persistent: true,
      });

      console.log('📤 Published achievement.unlocked event:', message);
    } catch (error) {
      console.error('❌ Error publishing achievement event:', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('🔌 Achievement Publisher disconnected from RabbitMQ');
    } catch (error) {
      console.error('❌ Error disconnecting Achievement Publisher:', error);
    }
  }
}
