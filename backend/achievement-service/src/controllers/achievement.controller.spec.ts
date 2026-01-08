import { AchievementController } from './achievement.controller';
import { AchievementService } from '../services/achievement.service';
import { IAchievementRepository } from '../interfaces/achievement-repository.interface';
import { Achievement } from '../entities/achievement.entity';

describe('AchievementController', () => {
  let controller: AchievementController;
  let mockAchievementService: any;
  let mockAchievementRepository: any;

  beforeEach(async () => {
    // Mock AchievementService
    mockAchievementService = {
      initializeAchievements: jest.fn().mockResolvedValue(undefined),
      getAchievementProgress: jest.fn(),
      getPlayerAchievements: jest.fn(),
    };

    // Mock AchievementRepository
    mockAchievementRepository = {
      findAll: jest.fn(),
    };

    // Create controller directly without TestingModule for simpler mocking
    controller = new AchievementController(
      mockAchievementService,
      mockAchievementRepository,
    );
  });

  describe('getAchievements', () => {
    it('should return all achievements', async () => {
      const mockAchievements: Partial<Achievement>[] = [
        {
          id: 'ach-1',
          code: 'FIRST_KILL',
          titleKey: 'achievement.first_kill.title',
          descriptionKey: 'achievement.first_kill.description',
          requiredValue: 1,
          eventType: 'MONSTER_KILLED',
          isTemporal: false,
          isActive: true,
        },
        {
          id: 'ach-2',
          code: 'TIME_MASTER',
          titleKey: 'achievement.time_master.title',
          descriptionKey: 'achievement.time_master.description',
          requiredValue: 300,
          eventType: 'TIME_PLAYED',
          isTemporal: true,
          isActive: true,
        },
      ];

      mockAchievementRepository.findAll.mockResolvedValue(mockAchievements);

      const result = await controller.getAchievements();

      expect(mockAchievementRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockAchievements);
    });
  });

  describe('getAchievementProgress', () => {
    it('should return achievement progress for a player', async () => {
      const mockProgress = {
        achievementId: 'ach-1',
        playerId: 'player-1',
        progress: 45,
        unlocked: false,
      };

      mockAchievementService.getAchievementProgress.mockResolvedValue(
        mockProgress,
      );

      const result = await controller.getAchievementProgress(
        'player-1',
        'ach-1',
      );

      expect(mockAchievementService.getAchievementProgress).toHaveBeenCalledWith(
        'player-1',
        'ach-1',
      );
      expect(result).toEqual(mockProgress);
    });

    it('should return null if achievement progress not found', async () => {
      mockAchievementService.getAchievementProgress.mockResolvedValue(null);

      const result = await controller.getAchievementProgress(
        'player-unknown',
        'ach-unknown',
      );

      expect(result).toBeNull();
    });
  });

  describe('getPlayerAchievements', () => {
    it('should return all achievements for a player', async () => {
      const mockPlayerAchievements = [
        {
          achievementId: 'ach-1',
          achievementCode: 'FIRST_KILL',
          progress: 100,
          unlocked: true,
          unlockedAt: new Date('2026-01-01'),
        },
        {
          achievementId: 'ach-2',
          achievementCode: 'TIME_MASTER',
          progress: 150,
          unlocked: false,
          unlockedAt: null,
        },
      ];

      mockAchievementService.getPlayerAchievements.mockResolvedValue(
        mockPlayerAchievements,
      );

      const result = await controller.getPlayerAchievements('player-1');

      expect(mockAchievementService.getPlayerAchievements).toHaveBeenCalledWith(
        'player-1',
      );
      expect(result).toEqual(mockPlayerAchievements);
    });

    it('should return empty array if player has no achievements', async () => {
      mockAchievementService.getPlayerAchievements.mockResolvedValue([]);

      const result = await controller.getPlayerAchievements('player-new');

      expect(result).toEqual([]);
    });

    it('should include unlock status and dates', async () => {
      const mockPlayerAchievements = [
        {
          achievementId: 'ach-1',
          achievementCode: 'FIRST_KILL',
          progress: 100,
          unlocked: true,
          unlockedAt: new Date('2026-01-01T12:00:00Z'),
        },
      ];

      mockAchievementService.getPlayerAchievements.mockResolvedValue(
        mockPlayerAchievements,
      );

      const result = await controller.getPlayerAchievements('player-1');

      expect(result[0].unlocked).toBe(true);
      expect(result[0].unlockedAt).toBeDefined();
    });
  });

  describe('initializeAchievements', () => {
    it('should initialize achievements and return success message', async () => {
      mockAchievementService.initializeAchievements.mockResolvedValue(
        undefined,
      );

      const result = await controller.initializeAchievements('player-1');

      expect(mockAchievementService.initializeAchievements).toHaveBeenCalledWith(
        'player-1',
      );
      expect(result).toEqual({
        message: 'Achievements initialized successfully',
        playerId: 'player-1',
      });
    });

    it('should handle initialization errors gracefully', async () => {
      const mockError = new Error('Database connection failed');
      mockAchievementService.initializeAchievements.mockRejectedValueOnce(
        mockError,
      );

      await expect(
        controller.initializeAchievements('player-1'),
      ).rejects.toThrow(mockError);
    });
  });

  describe('error handling', () => {
    it('should handle service errors in getPlayerAchievements', async () => {
      const mockError = new Error('Service error');
      mockAchievementService.getPlayerAchievements.mockRejectedValueOnce(
        mockError,
      );

      await expect(
        controller.getPlayerAchievements('player-1'),
      ).rejects.toThrow(mockError);
    });

    it('should handle service errors in getAchievementProgress', async () => {
      const mockError = new Error('Service error');
      mockAchievementService.getAchievementProgress.mockRejectedValueOnce(
        mockError,
      );

      await expect(
        controller.getAchievementProgress('player-1', 'ach-1'),
      ).rejects.toThrow(mockError);
    });
  });
});
