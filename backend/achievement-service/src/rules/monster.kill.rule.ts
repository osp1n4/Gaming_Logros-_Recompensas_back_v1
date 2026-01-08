import { Achievement } from '../entities/achievement.entity';
import { PlayerAchievement } from '../entities/player.achievement';
import { PlayerEvent } from '../interfaces/event.interface';
import { AchievementRule } from './achievement.rule';

/**
 * Monster Kill Rule
 * SOLID Principle S: Single Responsibility - evaluates only monster kill achievements
 * SOLID Principle O: Open/Closed - extends base rule without modifying it
 * SOLID Principle L: Liskov Substitution - can substitute base AchievementRule
 */
export class MonsterKillRule extends AchievementRule {
  private readonly EVENT_TYPE = 'MONSTER_KILLED';

  canApply(eventType: string): boolean {
    return eventType === this.EVENT_TYPE;
  }

  async evaluate(
    event: PlayerEvent,
    achievement: Achievement,
    playerAchievement: PlayerAchievement | null
  ): Promise<{ achieved: boolean; progress: number }> {
    // Already unlocked - return current progress
    if (playerAchievement?.unlockedAt) {
      return {
        achieved: false,
        progress: playerAchievement.progress,
      };
    }

    // Check temporal window
    if (!this.isWithinTemporalWindow(achievement)) {
      return {
        achieved: false,
        progress: 0,
      };
    }

    // Calculate new progress
    const previousProgress = playerAchievement?.progress || 0;
    const newProgress = previousProgress + event.value;

    // Check if achieved
    const achieved = this.isAchieved(newProgress, achievement.requiredValue);

    return {
      achieved,
      progress: this.calculateProgress(newProgress, achievement.requiredValue),
    };
  }
}

