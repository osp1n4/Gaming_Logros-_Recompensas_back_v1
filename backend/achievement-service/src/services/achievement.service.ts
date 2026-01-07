import { Injectable } from '@nestjs/common';
import { IAchievementRepository } from '../interfaces/achievement-repository.interface';
import { AchievementRule } from '../rules/achievement.rule';
import { PlayerEvent, AchievementEvaluationResult } from '../interfaces/event.interface';
import { PlayerAchievement } from '../entities/player.achievement';

/**
 * Achievement Service
 * SOLID Principle S: Single Responsibility - Orchestrates rule evaluation and persistence
 * SOLID Principle D: Dependency Inversion - Depends on IAchievementRepository interface
 */
@Injectable()
export class AchievementService {
  constructor(
    private readonly repository: IAchievementRepository,
    private readonly rules: AchievementRule[],
  ) {}

  /**
   * Evaluate player event against all applicable achievement rules
   * SOLID Principle O: Open/Closed - extensible by adding new rules without modifying this method
   */
  async evaluateEvent(event: PlayerEvent): Promise<AchievementEvaluationResult[]> {
    // Find achievements applicable to this event type
    const achievements = await this.repository.findByEventType(event.eventType);
    const results: AchievementEvaluationResult[] = [];

    // Get applicable rules for this event type
    const applicableRules = this.rules.filter((rule) =>
      rule.canApply(event.eventType),
    );

    for (const achievement of achievements) {
      for (const rule of applicableRules) {
        // Get or create player achievement progress
        let playerAchievement = await this.repository.findPlayerAchievement(
          event.playerId,
          achievement.id,
        );

        if (!playerAchievement) {
          playerAchievement = await this.repository.createPlayerAchievement(
            event.playerId,
            achievement.id,
            0,
          );
        }

        // Skip if already unlocked (prevent duplicate progression)
        if (playerAchievement.unlockedAt) {
          continue;
        }

        // Evaluate rule
        const evaluationResult = await rule.evaluate(
          event,
          achievement,
          playerAchievement,
        );

        // Update progress
        const updated = await this.repository.updatePlayerAchievementProgress(
          event.playerId,
          achievement.id,
          evaluationResult.progress,
        );

        // Unlock if condition met
        if (evaluationResult.achieved) {
          const unlocked = await this.repository.unlockPlayerAchievement(
            event.playerId,
            achievement.id,
          );
          results.push({
            playerId: event.playerId,
            achievementId: achievement.id,
            achievementCode: achievement.code,
            progress: unlocked.progress,
            achieved: true,
            unlockedAt: unlocked.unlockedAt,
          });
        } else {
          results.push({
            playerId: event.playerId,
            achievementId: achievement.id,
            achievementCode: achievement.code,
            progress: updated.progress,
            achieved: false,
          });
        }
      }
    }

    return results;
  }

  /**
   * Get all achievements for a player with their progress
   */
  async getPlayerAchievements(
    playerId: string,
  ): Promise<PlayerAchievement[]> {
    return this.repository.findPlayerAchievements(playerId);
  }

  /**
   * Get progress for a specific achievement
   */
  async getAchievementProgress(
    playerId: string,
    achievementId: string,
  ): Promise<PlayerAchievement | null> {
    return this.repository.findPlayerAchievement(playerId, achievementId);
  }

  /**
   * Initialize all achievements for a new player
   * SOLID Principle L: Liskov Substitution - Different rule types are interchangeable
   */
  async initializeAchievements(playerId: string): Promise<void> {
    const allAchievements = await this.repository.findAll();

    for (const achievement of allAchievements) {
      const existing = await this.repository.findPlayerAchievement(
        playerId,
        achievement.id,
      );

      if (!existing) {
        await this.repository.createPlayerAchievement(
          playerId,
          achievement.id,
          0,
        );
      }
    }
  }
}
