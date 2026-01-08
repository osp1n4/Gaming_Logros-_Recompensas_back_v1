import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RewardService } from './reward.service';
import * as amqp from 'amqplib';

interface AchievementUnlockedEvent {
  playerId: string;
  achievementId: string;
  timestamp?: string;
}

@Injectable()
export class EventListener implements OnModuleInit {
  private readonly logger = new Logger(EventListener.name);
  private connection: any;
  private channel: any;
  private readonly queueName = 'achievement.unlocked';
  private readonly rabbitmqUrl = `amqp://${process.env.RABBITMQ_USER || 'guest'}:${
    process.env.RABBITMQ_PASSWORD || 'guest'
  }@${process.env.RABBITMQ_HOST || 'rabbitmq'}:${process.env.RABBITMQ_PORT || 5672}`;

  constructor(private readonly rewardService: RewardService) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.connect();
      await this.startConsuming();
    } catch (error) {
      this.logger.error('Failed to initialize event listener', error);
      // Retry after delay
      setTimeout(() => this.onModuleInit(), 5000);
    }
  }

  private async connect(): Promise<void> {
    this.connection = await amqp.connect(this.rabbitmqUrl);
    this.channel = await this.connection.createChannel();
    this.logger.log('Connected to RabbitMQ');
  }

  private async startConsuming(): Promise<void> {
    await this.channel.assertQueue(this.queueName);
    this.logger.log(`Listening for messages on queue ${this.queueName}`);

    await this.channel.consume(
      this.queueName,
      async (msg: any) => {
        if (!msg) return;

        try {
          const event: AchievementUnlockedEvent = JSON.parse(msg.content.toString());
          this.logger.log(`Received event: ${JSON.stringify(event)}`);

          await this.rewardService.assignReward(
            event.playerId,
            event.achievementId,
            'fixed',
          );

          this.channel.ack(msg);
          this.logger.log('Event processed successfully');
        } catch (error) {
          this.logger.error('Error processing event', error);
          this.channel.nack(msg, false, true);
        }
      },
    );
  }
}
