import { Injectable } from '@nestjs/common';
import { IAchievementRepository } from '../interfaces/achievement-repository.interface';
import { AchievementRule } from '../rules/achievement.rule';
import { PlayerEvent, AchievementEvaluationResult } from '../interfaces/event.interface';
import { Achievement } from '../entities/achievement.entity';
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
    const applicableRules = this.getApplicableRules(event.eventType);

    for (const achievement of achievements) {
      const evaluationResults = await this.evaluateAchievementForEvent(
        event,
        achievement,
        applicableRules,
      );
      results.push(...evaluationResults);
    }

    return results;
  }

  /**
   * Evaluate a single achievement against all applicable rules
   */
  private async evaluateAchievementForEvent(
    event: PlayerEvent,
    achievement: Achievement,
    rules: AchievementRule[],
  ): Promise<AchievementEvaluationResult[]> {
    const results: AchievementEvaluationResult[] = [];

    for (const rule of rules) {
      const result = await this.evaluateRuleForAchievement(event, achievement, rule);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Evaluate a specific rule for an achievement
   */
  private async evaluateRuleForAchievement(
    event: PlayerEvent,
    achievement: Achievement,
    rule: AchievementRule,
  ): Promise<AchievementEvaluationResult | null> {
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
      return null;
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
      return {
        playerId: event.playerId,
        achievementId: achievement.id,
        achievementCode: achievement.code,
        progress: unlocked.progress,
        achieved: true,
        unlockedAt: unlocked.unlockedAt,
      };
    }

    return {
      playerId: event.playerId,
      achievementId: achievement.id,
      achievementCode: achievement.code,
      progress: updated.progress,
      achieved: false,
    };
  }

  /**
   * Get applicable rules for an event type
   * SOLID Principle O: Open/Closed - extensible by adding new rules without modifying service
   */
  private getApplicableRules(eventType: string): AchievementRule[] {
    return this.rules.filter((rule) => rule.canApply(eventType));
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
