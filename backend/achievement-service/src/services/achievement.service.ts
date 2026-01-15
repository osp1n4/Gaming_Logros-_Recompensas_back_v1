import { Injectable, Inject } from '@nestjs/common';
import { IAchievementRepository } from '../interfaces/achievement-repository.interface';
import { AchievementRule } from '../rules/achievement.rule';
import { PlayerEvent, AchievementEvaluationResult } from '../interfaces/event.interface';
import { Achievement } from '../entities/achievement.entity';
import { PlayerAchievement } from '../entities/player.achievement';
import { EventPublisherService } from './event.publisher';

/**
 * Servicio principal de logros
 * - Orquesta evaluación de reglas y persistencia
 */
@Injectable()
export class AchievementService {
  constructor(
    @Inject('IAchievementRepository')
    private readonly repository: IAchievementRepository,
    @Inject('ACHIEVEMENT_RULES')
    private readonly rules: AchievementRule[],
    @Inject('EVENT_PUBLISHER')
    private readonly eventPublisher: EventPublisherService,
  ) {}

  /**
   * Evalúa un evento de jugador contra todas las reglas de logros
   */
  async evaluateEvent(event: PlayerEvent): Promise<AchievementEvaluationResult[]> {
    // Convert event type to uppercase to match database format (MONSTER_KILLED instead of monster_killed)
    const normalizedEventType = event.eventType.toUpperCase();
    
    // Find achievements applicable to this event type
    const achievements = await this.repository.findByEventType(normalizedEventType);
    const results: AchievementEvaluationResult[] = [];

    // Get applicable rules for this event type (rules use original format)
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
   * Evalúa un logro contra todas las reglas
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
   * Evalúa una regla específica para un logro
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
      
      // Publish achievement.unlocked event
      try {
        await this.eventPublisher.publishAchievementUnlocked(
          event.playerId,
          achievement.id,
          achievement.code,
          achievement.rewardPoints,
        );
      } catch (error) {
        console.error('Failed to publish achievement.unlocked event:', error);
      }
      
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
   * Obtiene reglas aplicables para un tipo de evento
   */
  private getApplicableRules(eventType: string): AchievementRule[] {
    return this.rules.filter((rule) => rule.canApply(eventType));
  }

  /**
   * Retorna todos los logros y progreso de un jugador
   */
  async getPlayerAchievements(
    playerId: string,
  ): Promise<PlayerAchievement[]> {
    return this.repository.findPlayerAchievements(playerId);
  }

  /**
   * Retorna el progreso de un logro específico
   */
  async getAchievementProgress(
    playerId: string,
    achievementId: string,
  ): Promise<PlayerAchievement | null> {
    return this.repository.findPlayerAchievement(playerId, achievementId);
  }

  /**
   * Inicializa todos los logros para un jugador nuevo
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
