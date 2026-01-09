import { Injectable } from '@nestjs/common';
import { RewardService } from '../services/reward.service';

/**
 * Achievement Unlocked Event Listener
 * SOLID Principles:
 * - S (Single Responsibility): Only handles achievement.unlocked events
 * - D (Dependency Inversion): Depends on RewardService abstraction
 */
@Injectable()
export class AchievementUnlockedListener {
  constructor(private readonly rewardService: RewardService) {}

  /**
   * Handles achievement.unlocked event from RabbitMQ
   * Assigns rewards to player based on achievement
   */
  async handleAchievementUnlocked(event: any): Promise<void> {
    try {
      console.log('🎁 Processing achievement.unlocked event:', event);

      const { playerId, achievementId, achievementCode, rewardPoints } = event;

      // Validate required fields
      if (!playerId || !achievementId) {
        console.error('❌ Invalid achievement.unlocked event: missing required fields');
        return;
      }

      // Assign reward using fixed strategy (can be extended to use dynamic strategy)
      await this.rewardService.assignReward(playerId, achievementId, 'fixed');

      console.log(`✅ Reward assigned to player ${playerId} for achievement ${achievementCode}`);
    } catch (error) {
      console.error('❌ Error processing achievement.unlocked event:', error);
      throw error;
    }
  }

  /**
   * Handles RabbitMQ message format
   */
  async handleMessage(message: any): Promise<void> {
    try {
      // Parse message if it's a string
      const event = typeof message === 'string' ? JSON.parse(message) : message;

      // Validate event structure
      if (!this.isValidEvent(event)) {
        console.error('❌ Invalid event structure:', event);
        return;
      }

      await this.handleAchievementUnlocked(event);
    } catch (error) {
      console.error('❌ Error handling achievement.unlocked message:', error);
      throw error;
    }
  }

  private isValidEvent(event: any): boolean {
    return (
      event &&
      typeof event === 'object' &&
      typeof event.playerId === 'string' &&
      typeof event.achievementId === 'string'
    );
  }
}
