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
        eventType: 'MONSTER_KILLED',
        value: 1,
      };

      const achievement: Partial<Achievement> = {
        id: 'ach-1',
        code: 'MONSTER_SLAYER',
        eventType: 'MONSTER_KILLED',
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
        eventType: 'MONSTER_KILLED',
        value: 1,
      };

      const achievement: Partial<Achievement> = {
        id: 'ach-1',
        code: 'MONSTER_SLAYER',
        eventType: 'MONSTER_KILLED',
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
        progress: 1,
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
        eventType: 'MONSTER_KILLED',
        value: 10,
      };

      const achievement: Partial<Achievement> = {
        id: 'ach-1',
        code: 'MONSTER_SLAYER',
        eventType: 'MONSTER_KILLED',
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
        eventType: 'MONSTER_KILLED',
        value: 1,
      };

      const achievement: Partial<Achievement> = {
        id: 'ach-1',
        code: 'MONSTER_SLAYER',
        eventType: 'MONSTER_KILLED',
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

      await service.evaluateEvent(event);

      expect(mockRepository.updatePlayerAchievementProgress).not.toHaveBeenCalled();
    });
  });

  describe('getPlayerAchievements', () => {
    it('should return all player achievements with progress', async () => {
      const playerId = 'player-1';
      const playerAchievements: Partial<PlayerAchievement>[] = [
        {
          playerId,
          achievementId: 'ach-1',
          progress: 10,
          unlockedAt: new Date(),
        },
        {
          playerId,
          achievementId: 'ach-2',
          progress: 5,
          unlockedAt: null,
        },
      ];

      mockRepository.findPlayerAchievements.mockResolvedValue(
        playerAchievements as PlayerAchievement[]
      );

      const result = await service.getPlayerAchievements(playerId);

      expect(result).toEqual(playerAchievements);
      expect(mockRepository.findPlayerAchievements).toHaveBeenCalledWith(
        playerId
      );
    });
  });

  describe('getAchievementProgress', () => {
    it('should return achievement progress for player', async () => {
      const playerId = 'player-1';
      const achievementId = 'ach-1';
      const playerAchievement: Partial<PlayerAchievement> = {
        playerId,
        achievementId,
        progress: 5,
        unlockedAt: null,
      };

      mockRepository.findPlayerAchievement.mockResolvedValue(
        playerAchievement as PlayerAchievement
      );

      const result = await service.getAchievementProgress(
        playerId,
        achievementId
      );

      expect(result).toEqual(playerAchievement);
      expect(mockRepository.findPlayerAchievement).toHaveBeenCalledWith(
        playerId,
        achievementId
      );
    });

    it('should return null if achievement progress not found', async () => {
      mockRepository.findPlayerAchievement.mockResolvedValue(null);

      const result = await service.getAchievementProgress('player-1', 'ach-1');

      expect(result).toBeNull();
    });
  });

  describe('initializeAchievements', () => {
    it('should create initial achievements for player', async () => {
      const playerId = 'player-1';
      const achievements: Partial<Achievement>[] = [
        {
          id: 'ach-1',
          code: 'MONSTER_SLAYER',
          requiredValue: 10,
        },
        {
          id: 'ach-2',
          code: 'TIME_WARRIOR',
          requiredValue: 300,
        },
      ];

      mockRepository.findAll.mockResolvedValue(achievements as Achievement[]);
      mockRepository.findPlayerAchievement.mockResolvedValue(null);
      mockRepository.createPlayerAchievement.mockResolvedValue({} as PlayerAchievement);

      await service.initializeAchievements(playerId);

      expect(mockRepository.createPlayerAchievement).toHaveBeenCalledTimes(2);
      expect(mockRepository.createPlayerAchievement).toHaveBeenNthCalledWith(
        1,
        playerId,
        'ach-1',
        0
      );
      expect(mockRepository.createPlayerAchievement).toHaveBeenNthCalledWith(
        2,
        playerId,
        'ach-2',
        0
      );
    });

    it('should skip existing achievements', async () => {
      const playerId = 'player-1';
      const achievements: Partial<Achievement>[] = [
        {
          id: 'ach-1',
          code: 'MONSTER_SLAYER',
          requiredValue: 10,
        },
      ];

      const existingPlayerAchievement: Partial<PlayerAchievement> = {
        playerId,
        achievementId: 'ach-1',
        progress: 0,
      };

      mockRepository.findAll.mockResolvedValue(achievements as Achievement[]);
      mockRepository.findPlayerAchievement.mockResolvedValue(
        existingPlayerAchievement as PlayerAchievement
      );

      await service.initializeAchievements(playerId);

      expect(mockRepository.createPlayerAchievement).not.toHaveBeenCalled();
    });
  });
});
