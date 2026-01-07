import { Injectable } from '@nestjs/common';
import { AchievementService } from '../services/achievement.service';
import { PlayerEvent } from '../interfaces/event.interface';

/**
 * SOLID Principles Application:
 * - Single Responsibility: Only handles RabbitMQ event consumption and delegation
 * - Dependency Inversion: Depends on AchievementService abstraction (injected)
 * - Open/Closed: Easy to extend for new event types without modifying this class
 */
@Injectable()
export class AchievementEventListener {
  constructor(private readonly achievementService: AchievementService) {}

  /**
   * Handles PlayerEvent from RabbitMQ
   * Evaluates all applicable achievements and returns results
   *
   * @param event The player event to process
   * @returns Array of achievement evaluation results or empty array if no achievements unlocked
   */
  async handlePlayerEvent(event: PlayerEvent): Promise<any[]> {
    try {
      // Delegate to service for achievement evaluation
      const results = await this.achievementService.evaluateEvent(event);
      return results;
    } catch (error) {
      // Log error but don't throw - allow message processing to continue
      console.error(
        `Error processing player event for player ${event.playerId}:`,
        error,
      );
      return [];
    }
  }

  /**
   * Handles RabbitMQ message format
   * Parses message and delegates to handlePlayerEvent
   *
   * @param message The message containing PlayerEvent
   * @returns Array of achievement evaluation results
   */
  async handlePlayerEventMessage(message: any): Promise<any[]> {
    try {
      // If message has content buffer (RabbitMQ format), parse it; otherwise use as-is
      let event: PlayerEvent;
      
      if (message.content && typeof message.content.toString === 'function') {
        // RabbitMQ message format
        event = JSON.parse(message.content.toString());
      } else {
        // Direct object format (for testing or direct calls)
        event = message as PlayerEvent;
      }

      // Validate required fields
      if (!event.playerId || !event.eventType) {
        console.warn('Invalid message format - missing required fields');
        return [];
      }

      // Delegate to handlePlayerEvent for processing
      return await this.handlePlayerEvent(event);
    } catch (error) {
      console.error('Error parsing message:', error);
      return [];
    }
  }
}
