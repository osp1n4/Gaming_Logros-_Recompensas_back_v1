import { Test, TestingModule } from '@nestjs/testing';
import { AchievementService } from './achievement.service';
import { IAchievementRepository } from '../interfaces/achievement-repository.interface';
import { MonsterKillRule } from '../rules/monster.kill.rule';
import { TimePlayedRule } from '../rules/time.played.rule';
import { Achievement } from '../entities/achievement.entity';
import { PlayerAchievement } from '../entities/player.achievement';
import { PlayerEvent } from '../interfaces/event.interface';

describe('AchievementService', () => {
  let service: AchievementService;
  let mockRepository: jest.Mocked<IAchievementRepository>;
  let monsterKillRule: MonsterKillRule;
  let timePlayedRule: TimePlayedRule;

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      findByEventType: jest.fn(),
      create: jest.fn(),
      findPlayerAchievement: jest.fn(),
      findPlayerAchievements: jest.fn(),
      createPlayerAchievement: jest.fn(),
      updatePlayerAchievementProgress: jest.fn(),
      unlockPlayerAchievement: jest.fn(),
    } as any;

    const mockEventPublisher = {
      publishAchievementUnlocked: jest.fn(),
    } as any;

    monsterKillRule = new MonsterKillRule();
    timePlayedRule = new TimePlayedRule();

    service = new AchievementService(
      mockRepository,
      [monsterKillRule, timePlayedRule],
      mockEventPublisher,
    );
  });

  describe('evaluateEvent', () => {
    it('should evaluate event against applicable rules', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'monster_killed',
        value: 1,
      };
      const achievement: Partial<Achievement> = {
        id: 'ach-1',
        code: 'MONSTER_SLAYER',
        eventType: 'monster_killed',
        requiredValue: 10,
        isTemporal: false,
      };
      const playerAchievement: Partial<PlayerAchievement> = {
        playerId: 'player-1',
        achievementId: 'ach-1',
        progress: 0,
        unlockedAt: null,
      };
      mockRepository.findByEventType.mockResolvedValue([
        achievement as Achievement,
      ]);
      mockRepository.findPlayerAchievement.mockResolvedValue(
        playerAchievement as PlayerAchievement
      );
      mockRepository.updatePlayerAchievementProgress.mockResolvedValue({
        ...playerAchievement,
        progress: 1,
      } as PlayerAchievement);
      const result = await service.evaluateEvent(event);
      expect(mockRepository.findByEventType).toHaveBeenCalledWith('MONSTER_KILLED');
      expect(result).toBeDefined();
    });

    it('should create player achievement if not exists', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'monster_killed',
        value: 1,
      };
      const achievement: Partial<Achievement> = {
        id: 'ach-1',
        code: 'MONSTER_SLAYER',
        eventType: 'monster_killed',
        requiredValue: 10,
        isTemporal: false,
      };
      mockRepository.findByEventType.mockResolvedValue([
        achievement as Achievement,
      ]);
      mockRepository.findPlayerAchievement.mockResolvedValue(null);
      mockRepository.createPlayerAchievement.mockResolvedValue({
        playerId: 'player-1',
        achievementId: 'ach-1',
        progress: 0,
        unlockedAt: null,
      } as PlayerAchievement);
      mockRepository.updatePlayerAchievementProgress.mockResolvedValue({
        playerId: 'player-1',
        achievementId: 'ach-1',
        progress: 1,
        unlockedAt: null,
      } as PlayerAchievement);
      await service.evaluateEvent(event);
      expect(mockRepository.createPlayerAchievement).toHaveBeenCalledWith(
        'player-1',
        'ach-1',
        0
      );
    });

    it('should unlock achievement when condition is met', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'monster_killed',
        value: 10,
      };
      const achievement: Partial<Achievement> = {
        id: 'ach-1',
        code: 'MONSTER_SLAYER',
        eventType: 'monster_killed',
        requiredValue: 10,
        isTemporal: false,
      };
      const playerAchievement: Partial<PlayerAchievement> = {
        playerId: 'player-1',
        achievementId: 'ach-1',
        progress: 0,
        unlockedAt: null,
      };
      mockRepository.findByEventType.mockResolvedValue([
        achievement as Achievement,
      ]);
      mockRepository.findPlayerAchievement.mockResolvedValue(
        playerAchievement as PlayerAchievement
      );
      mockRepository.updatePlayerAchievementProgress.mockResolvedValue({
        ...playerAchievement,
        progress: 10,
      } as PlayerAchievement);
      mockRepository.unlockPlayerAchievement.mockResolvedValue({
        ...playerAchievement,
        progress: 10,
        unlockedAt: new Date(),
      } as PlayerAchievement);
      const result = await service.evaluateEvent(event);
      expect(mockRepository.unlockPlayerAchievement).toHaveBeenCalledWith(
        'player-1',
        'ach-1'
      );
      expect(result).toBeDefined();
    });

    it('should skip already unlocked achievements', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'monster_killed',
        value: 1,
      };
      const achievement: Partial<Achievement> = {
        id: 'ach-1',
        code: 'MONSTER_SLAYER',
        eventType: 'monster_killed',
        requiredValue: 10,
        isTemporal: false,
      };
      const playerAchievement: Partial<PlayerAchievement> = {
        playerId: 'player-1',
        achievementId: 'ach-1',
        progress: 10,
        unlockedAt: new Date(),
      };
      mockRepository.findByEventType.mockResolvedValue([
        achievement as Achievement,
      ]);
      mockRepository.findPlayerAchievement.mockResolvedValue(
        playerAchievement as PlayerAchievement
      );
      const result = await service.evaluateEvent(event);
      expect(result).toEqual([]);
    });

    it('should handle publisher error gracefully', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'monster_killed',
        value: 10,
      };
      const achievement: Partial<Achievement> = {
        id: 'ach-1',
        code: 'MONSTER_SLAYER',
        eventType: 'monster_killed',
        requiredValue: 10,
        isTemporal: false,
      };
      const playerAchievement: Partial<PlayerAchievement> = {
        playerId: 'player-1',
        achievementId: 'ach-1',
        progress: 0,
        unlockedAt: null,
      };
      mockRepository.findByEventType.mockResolvedValue([
        achievement as Achievement,
      ]);
      mockRepository.findPlayerAchievement.mockResolvedValue(
        playerAchievement as PlayerAchievement
      );
      mockRepository.updatePlayerAchievementProgress.mockResolvedValue({
        ...playerAchievement,
        progress: 10,
      } as PlayerAchievement);
      mockRepository.unlockPlayerAchievement.mockResolvedValue({
        ...playerAchievement,
        progress: 10,
        unlockedAt: new Date(),
      } as PlayerAchievement);
      // Simular error en el publisher
      service['eventPublisher'].publishAchievementUnlocked = jest.fn().mockRejectedValue(new Error('fail'));
      const result = await service.evaluateEvent(event);
      expect(result[0].achieved).toBe(true);
    });
  });
});