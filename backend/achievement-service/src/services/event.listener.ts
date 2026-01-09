import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { AchievementEventListener } from '../listeners/achievement.event.listener';

/**
 * Event Listener Service (Observer Pattern)
 * SOLID Principles:
 * - S (Single Responsibility): Only handles RabbitMQ consumption
 * - D (Dependency Inversion): Depends on AchievementEventListener abstraction
 * - O (Open/Closed): Can be extended for new event types
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

  async connect(): Promise<void> {
    try {
      console.log('🔌 Connecting to RabbitMQ:', this.rabbitMqUrl);
      this.connection = await amqp.connect(this.rabbitMqUrl);
      this.channel = await this.connection.createChannel();

      // Assert exchange
      await this.channel.assertExchange(this.exchangeName, 'topic', {
        durable: true,
      });

      // Assert queue
      await this.channel.assertQueue(this.queueName, {
        durable: true,
      });

      // Bind queue to exchange with routing patterns
      await this.channel.bindQueue(
        this.queueName,
        this.exchangeName,
        'player.event.*',
      );

      console.log(`✅ Achievement Service listening on queue: ${this.queueName}`);

      // Start consuming messages
      await this.startConsuming();
    } catch (error) {
      console.error('❌ Failed to connect Achievement Service to RabbitMQ:', error);
      throw error;
    }
  }

  private async startConsuming(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    await this.channel.consume(
      this.queueName,
      async (msg: any) => {
        if (msg) {
          try {
            const content = msg.content.toString();
            const event = JSON.parse(content);

            console.log('📥 Received player event:', event);

            // Delegate to achievement event listener
            await this.achievementEventListener.handlePlayerEventMessage(event);

            // Acknowledge message
            this.channel.ack(msg);
          } catch (error) {
            console.error('❌ Error processing message:', error);
            // Reject and requeue message
            this.channel.nack(msg, false, true);
          }
        }
      },
      { noAck: false },
    );
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('🔌 Achievement Service disconnected from RabbitMQ');
    } catch (error) {
      console.error('❌ Error disconnecting from RabbitMQ:', error);
    }
  }
}
