import { Repository } from 'typeorm';
import { AchievementRepository } from './achievement.repository';
import { Achievement } from '../entities/achievement.entity';
import { PlayerAchievement } from '../entities/player.achievement';

describe('AchievementRepository', () => {
  let achievementRepository: AchievementRepository;
  let mockAchievementRepo: jest.Mocked<Repository<Achievement>>;
  let mockPlayerAchievementRepo: jest.Mocked<Repository<PlayerAchievement>>;

  beforeEach(() => {
    mockAchievementRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as any;

    mockPlayerAchievementRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
    } as any;

    achievementRepository = new AchievementRepository(
      mockAchievementRepo,
      mockPlayerAchievementRepo
    );
  });

  describe('findAll', () => {
    it('should return all achievements', async () => {
      const achievements: Partial<Achievement>[] = [
        { id: '1', code: 'MONSTER_SLAYER', requiredValue: 10 },
        { id: '2', code: 'TIME_WARRIOR', requiredValue: 300 },
      ];

      mockAchievementRepo.find.mockResolvedValue(achievements as Achievement[]);

      const result = await achievementRepository.findAll();

      expect(result).toEqual(achievements);
      expect(mockAchievementRepo.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return achievement by id', async () => {
      const achievement: Partial<Achievement> = {
        id: '1',
        code: 'MONSTER_SLAYER',
      };

      mockAchievementRepo.findOne.mockResolvedValue(achievement as Achievement);

      const result = await achievementRepository.findById('1');

      expect(result).toEqual(achievement);
      expect(mockAchievementRepo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('findByCode', () => {
    it('should return achievement by code', async () => {
      const achievement: Partial<Achievement> = {
        id: '1',
        code: 'MONSTER_SLAYER',
      };

      mockAchievementRepo.findOne.mockResolvedValue(achievement as Achievement);

      const result = await achievementRepository.findByCode('MONSTER_SLAYER');

      expect(result).toEqual(achievement);
      expect(mockAchievementRepo.findOne).toHaveBeenCalledWith({
        where: { code: 'MONSTER_SLAYER' },
      });
    });
  });

  describe('create', () => {
    it('should create and save a new achievement', async () => {
      const achievementData: Partial<Achievement> = {
        code: 'NEW_ACHIEVEMENT',
        requiredValue: 100,
      };

      const createdAchievement = {
        id: '1',
        ...achievementData,
      } as Achievement;

      mockAchievementRepo.create.mockReturnValue(createdAchievement);
      mockAchievementRepo.save.mockResolvedValue(createdAchievement);

      const result = await achievementRepository.create(achievementData);

      expect(result).toEqual(createdAchievement);
      expect(mockAchievementRepo.create).toHaveBeenCalledWith(achievementData);
      expect(mockAchievementRepo.save).toHaveBeenCalledWith(createdAchievement);
    });
  });

  describe('findByEventType', () => {
    it('should return achievements filtered by event type', async () => {
      const eventType = 'MONSTER_KILLED';
      const achievements: Partial<Achievement>[] = [
        { id: '1', code: 'MONSTER_SLAYER', eventType: 'MONSTER_KILLED' },
      ];

      mockAchievementRepo.find.mockResolvedValue(achievements as Achievement[]);

      const result = await achievementRepository.findByEventType(eventType);

      expect(result).toEqual(achievements);
      expect(mockAchievementRepo.find).toHaveBeenCalledWith({
        where: { eventType },
      });
    });
  });

  describe('findPlayerAchievement', () => {
    it('should return player achievement if exists', async () => {
      const playerId = 'player-1';
      const achievementId = 'ach-1';
      const playerAchievement: Partial<PlayerAchievement> = {
        playerId,
        achievementId,
        progress: 5,
        unlockedAt: null,
      };

      mockPlayerAchievementRepo.findOne.mockResolvedValue(
        playerAchievement as PlayerAchievement
      );

      const result = await achievementRepository.findPlayerAchievement(
        playerId,
        achievementId
      );

      expect(result).toEqual(playerAchievement);
      expect(mockPlayerAchievementRepo.findOne).toHaveBeenCalledWith({
        where: { playerId, achievementId },
      });
    });

    it('should return null if player achievement does not exist', async () => {
      mockPlayerAchievementRepo.findOne.mockResolvedValue(null);

      const result = await achievementRepository.findPlayerAchievement(
        'player-1',
        'ach-1'
      );

      expect(result).toBeNull();
    });
  });

  describe('createPlayerAchievement', () => {
    it('should create and save a new player achievement', async () => {
      const playerId = 'player-1';
      const achievementId = 'ach-1';
      const progress = 5;

      const createdEntity: Partial<PlayerAchievement> = {
        playerId,
        achievementId,
        progress,
        unlockedAt: null,
      };

      mockPlayerAchievementRepo.create.mockReturnValue(
        createdEntity as PlayerAchievement
      );
      mockPlayerAchievementRepo.save.mockResolvedValue(
        createdEntity as PlayerAchievement
      );

      const result = await achievementRepository.createPlayerAchievement(
        playerId,
        achievementId,
        progress
      );

      expect(result).toEqual(createdEntity);
      expect(mockPlayerAchievementRepo.create).toHaveBeenCalledWith({
        playerId,
        achievementId,
        progress,
        unlockedAt: null,
      });
      expect(mockPlayerAchievementRepo.save).toHaveBeenCalledWith(createdEntity);
    });
  });

  describe('updatePlayerAchievementProgress', () => {
    it('should update progress of existing player achievement', async () => {
      const playerId = 'player-1';
      const achievementId = 'ach-1';
      const playerAchievement: Partial<PlayerAchievement> = {
        playerId,
        achievementId,
        progress: 5,
        unlockedAt: null,
      };

      const updatedProgress = 10;

      mockPlayerAchievementRepo.findOne.mockResolvedValue(
        playerAchievement as PlayerAchievement
      );
      mockPlayerAchievementRepo.save.mockResolvedValue({
        ...playerAchievement,
        progress: updatedProgress,
      } as PlayerAchievement);

      const result =
        await achievementRepository.updatePlayerAchievementProgress(
          playerId,
          achievementId,
          updatedProgress
        );

      expect(result.progress).toBe(updatedProgress);
      expect(mockPlayerAchievementRepo.findOne).toHaveBeenCalledWith({
        where: { playerId, achievementId },
      });
      expect(mockPlayerAchievementRepo.save).toHaveBeenCalledWith({
        ...playerAchievement,
        progress: updatedProgress,
      });
    });

    it('should throw error if player achievement not found', async () => {
      mockPlayerAchievementRepo.findOne.mockResolvedValue(null);

      await expect(
        achievementRepository.updatePlayerAchievementProgress(
          'player-1',
          'ach-1',
          10
        )
      ).rejects.toThrow('PlayerAchievement not found');
    });
  });

  describe('unlockPlayerAchievement', () => {
    it('should set unlockedAt timestamp when unlocking achievement', async () => {
      const playerId = 'player-1';
      const achievementId = 'ach-1';
      const playerAchievement: Partial<PlayerAchievement> = {
        playerId,
        achievementId,
        progress: 10,
        unlockedAt: null,
      };

      const now = new Date();
      jest.spyOn(global, 'Date').mockImplementation(() => now as any);

      mockPlayerAchievementRepo.findOne.mockResolvedValue(
        playerAchievement as PlayerAchievement
      );
      mockPlayerAchievementRepo.save.mockResolvedValue({
        ...playerAchievement,
        unlockedAt: now,
      } as PlayerAchievement);

      const result = await achievementRepository.unlockPlayerAchievement(
        playerId,
        achievementId
      );

      expect(result.unlockedAt).toEqual(now);
      expect(mockPlayerAchievementRepo.findOne).toHaveBeenCalledWith({
        where: { playerId, achievementId },
      });
      expect(mockPlayerAchievementRepo.save).toHaveBeenCalledWith({
        ...playerAchievement,
        unlockedAt: now,
      });
    });

    it('should throw error if player achievement not found', async () => {
      mockPlayerAchievementRepo.findOne.mockResolvedValue(null);

      await expect(
        achievementRepository.unlockPlayerAchievement('player-1', 'ach-1')
      ).rejects.toThrow('PlayerAchievement not found');
    });
  });

  describe('findPlayerAchievements', () => {
    it('should return all achievements for a player with progress', async () => {
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

      mockPlayerAchievementRepo.find.mockResolvedValue(
        playerAchievements as PlayerAchievement[]
      );

      const result = await achievementRepository.findPlayerAchievements(playerId);

      expect(result).toEqual(playerAchievements);
      expect(mockPlayerAchievementRepo.find).toHaveBeenCalledWith({
        where: { playerId },
        relations: ['achievement'],
      });
    });
  });
});
