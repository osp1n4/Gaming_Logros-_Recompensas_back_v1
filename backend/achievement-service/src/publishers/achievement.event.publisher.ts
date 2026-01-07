import { Injectable, Inject } from '@nestjs/common';
import { AchievementEvaluationResult } from '../interfaces/event.interface';

/**
 * Achievement Event Publisher
 * SOLID Principles Application:
 * - Single Responsibility: Only publishes achievement.unlocked events to RabbitMQ
 * - Dependency Inversion: Depends on AMQP_CONNECTION injection token
 * - Open/Closed: Easy to extend for new event types without modifying this class
 */
@Injectable()
export class AchievementEventPublisher {
  private readonly EXCHANGE_NAME = 'achievement-service';
  private readonly ROUTING_KEY = 'achievement.unlocked';
  private readonly EXCHANGE_TYPE = 'topic';

  constructor(
    @Inject('AMQP_CONNECTION')
    private readonly amqpConnection: any,
  ) {}

  /**
   * Publish achievement.unlocked event to RabbitMQ
   * Only publishes if achievement was actually unlocked (achieved: true)
   *
   * @param result Achievement evaluation result
   * @param metadata Optional metadata to include in event
   */
  async publishAchievementUnlocked(
    result: AchievementEvaluationResult,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      // Only publish if achievement was unlocked
      if (!result.achieved) {
        return;
      }

      // Build and publish event
      const event = this.buildAchievementUnlockedEvent(result, metadata);
      await this.publishToExchange(event);
    } catch (error) {
      // Log error but don't throw - allow service to continue
      console.error('Error publishing achievement.unlocked event:', error);
    }
  }

  /**
   * Batch publish multiple achievement.unlocked events
   *
   * @param results Array of achievement evaluation results
   * @param metadata Optional metadata to include in each event
   */
  async publishAchievementUnlockedBatch(
    results: AchievementEvaluationResult[],
    metadata?: Record<string, any>,
  ): Promise<void> {
    for (const result of results) {
      await this.publishAchievementUnlocked(result, metadata);
    }
  }

  /**
   * Build achievement.unlocked event message
   * @private
   */
  private buildAchievementUnlockedEvent(
    result: AchievementEvaluationResult,
    metadata?: Record<string, any>,
  ): Record<string, any> {
    const event: Record<string, any> = {
      eventType: 'ACHIEVEMENT_UNLOCKED',
      playerId: result.playerId,
      achievementId: result.achievementId,
      achievementCode: result.achievementCode,
      progress: result.progress,
      timestamp: new Date().toISOString(),
    };

    if (metadata) {
      event.metadata = metadata;
    }

    return event;
  }

  /**
   * Publish event to RabbitMQ exchange
   * @private
   */
  private async publishToExchange(event: Record<string, any>): Promise<void> {
    const channel = await this.amqpConnection.createChannel();

    // Ensure exchange exists
    await channel.assertExchange(this.EXCHANGE_NAME, this.EXCHANGE_TYPE, {
      durable: true,
    });

    // Publish message to exchange
    channel.publish(
      this.EXCHANGE_NAME,
      this.ROUTING_KEY,
      Buffer.from(JSON.stringify(event)),
      {
        persistent: true,
        contentType: 'application/json',
      },
    );
  }
}
