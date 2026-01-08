import { Achievement } from '../entities/achievement.entity';
import { PlayerAchievement } from '../entities/player.achievement';
import { PlayerEvent } from '../interfaces/event.interface';

/**
 * Achievement Rule Interface
 * SOLID Principle I: Interface Segregation - specific interface for rule evaluation
 * SOLID Principle O: Open/Closed - open for extension, closed for modification
 */
export interface IAchievementRule {
  evaluate(
    event: PlayerEvent,
    achievement: Achievement,
    playerAchievement: PlayerAchievement | null
  ): Promise<{ achieved: boolean; progress: number }>;
  
  canApply(eventType: string): boolean;
}

/**
 * Base Achievement Rule Class
 * SOLID Principle S: Single Responsibility - only rule evaluation logic
 * SOLID Principle L: Liskov Substitution - all rules are substitutable
 */
export abstract class AchievementRule implements IAchievementRule {
  abstract evaluate(
    event: PlayerEvent,
    achievement: Achievement,
    playerAchievement: PlayerAchievement | null
  ): Promise<{ achieved: boolean; progress: number }>;

  abstract canApply(eventType: string): boolean;

  /**
   * Check if achievement is within temporal window
   */
  protected isWithinTemporalWindow(achievement: Achievement): boolean {
    if (!achievement.isTemporal) {
      return true;
    }

    const now = new Date();
    const start = achievement.temporalWindowStart;
    const end = achievement.temporalWindowEnd;

    if (start && now < start) {
      return false;
    }

    if (end && now > end) {
      return false;
    }

    return true;
  }

  /**
   * Calculate current progress
   */
  protected calculateProgress(
    currentValue: number,
    requiredValue: number
  ): number {
    return currentValue; // Return actual progress, not capped
  }

  /**
   * Check if achievement is unlocked
   */
  protected isAchieved(currentValue: number, requiredValue: number): boolean {
    return currentValue >= requiredValue;
  }
}

