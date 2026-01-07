import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { GameEventType } from '../dtos/player.dto';
import { IEventPublisher } from '../interfaces/event-publisher.interface';

/**
 * Event Publisher Implementation
 * SOLID Principles:
 * - S (Single Responsibility): Only handles event publishing to RabbitMQ
 * - D (Dependency Inversion): Implements IEventPublisher interface
 * - O (Open/Closed): Can be extended without modifying existing code
 */
@Injectable()
export class EventPublisher implements IEventPublisher {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly exchangeName = 'player.events';

  constructor(private readonly rabbitMqUrl: string) {}

  async connect(): Promise<void> {
    this.connection = await amqp.connect(this.rabbitMqUrl);
    this.channel = await this.connection.createChannel();
    
    await this.channel.assertExchange(this.exchangeName, 'topic', {
      durable: true,
    });
  }

  async publishPlayerEvent(
    playerId: string,
    eventType: GameEventType,
    value: number,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('Event publisher not connected');
    }

    const routingKey = `player.event.${eventType}`;
    const message = {
      playerId,
      eventType,
      value,
      timestamp: new Date().toISOString(),
    };

    const buffer = Buffer.from(JSON.stringify(message));
    
    this.channel.publish(this.exchangeName, routingKey, buffer, {
      persistent: true,
    });
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}
