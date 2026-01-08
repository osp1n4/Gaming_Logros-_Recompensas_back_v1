import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RewardService } from '../../src/services/reward.service';
import { Reward, RewardType } from '../../src/entities/reward.entity';
import { PlayerBalance } from '../../src/entities/player.balance';

describe('RewardService - assignReward', () => {
  let service: RewardService;
  let rewardRepository: Repository<Reward>;
  let balanceRepository: Repository<PlayerBalance>;

  const mockRewardRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockBalanceRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardService,
        {
          provide: getRepositoryToken(Reward),
          useValue: mockRewardRepository,
        },
        {
          provide: getRepositoryToken(PlayerBalance),
          useValue: mockBalanceRepository,
        },
      ],
    }).compile();

    service = module.get<RewardService>(RewardService);
    rewardRepository = module.get<Repository<Reward>>(getRepositoryToken(Reward));
    balanceRepository = module.get<Repository<PlayerBalance>>(getRepositoryToken(PlayerBalance));

    jest.clearAllMocks();
  });

  describe('assignReward with Fixed strategy', () => {
    it('should create new balance and assign fixed reward for new player', async () => {
      const playerId = 'player-1';
      const achievementId = 'achievement-1';
      
      mockBalanceRepository.findOne.mockResolvedValue(null);
      mockBalanceRepository.create.mockReturnValue({
        playerId,
        totalCoins: 0,
        totalPoints: 0,
      });
      mockBalanceRepository.save.mockImplementation((balance) => Promise.resolve(balance));
      
      mockRewardRepository.create.mockReturnValue({
        playerId,
        achievementId,
        rewardType: RewardType.COINS,
        rewardAmount: 100,
        isClaimed: false,
      });
      mockRewardRepository.save.mockImplementation((reward) => Promise.resolve({
        ...reward,
        id: 'reward-id-1',
        awardedAt: new Date(),
      }));

      const result = await service.assignReward(playerId, achievementId, 'fixed');

      expect(mockBalanceRepository.findOne).toHaveBeenCalledWith({ where: { playerId } });
      expect(mockBalanceRepository.create).toHaveBeenCalled();
      expect(mockRewardRepository.create).toHaveBeenCalled();
      expect(mockRewardRepository.save).toHaveBeenCalled();
      expect(result.rewardAmount).toBe(100);
      expect(result.playerId).toBe(playerId);
    });

    it('should update existing balance when assigning reward', async () => {
      const playerId = 'player-2';
      const achievementId = 'achievement-2';
      const existingBalance = {
        id: 'balance-1',
        playerId,
        totalCoins: 200,
        totalPoints: 100,
      };
      
      mockBalanceRepository.findOne.mockResolvedValue(existingBalance);
      mockBalanceRepository.save.mockImplementation((balance) => Promise.resolve(balance));
      
      mockRewardRepository.create.mockReturnValue({
        playerId,
        achievementId,
        rewardType: RewardType.COINS,
        rewardAmount: 100,
        isClaimed: false,
      });
      mockRewardRepository.save.mockImplementation((reward) => Promise.resolve({
        ...reward,
        id: 'reward-id-2',
        awardedAt: new Date(),
      }));

      await service.assignReward(playerId, achievementId, 'fixed');

      expect(mockBalanceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          totalCoins: 300, // 200 + 100
          totalPoints: 150, // 100 + 50
        })
      );
    });
  });

  describe('assignReward with Dynamic strategy', () => {
    it('should scale reward based on existing balance', async () => {
      const playerId = 'player-3';
      const achievementId = 'achievement-3';
      const existingBalance = {
        id: 'balance-3',
        playerId,
        totalCoins: 1000,
        totalPoints: 500,
      };
      
      mockBalanceRepository.findOne.mockResolvedValue(existingBalance);
      mockBalanceRepository.save.mockImplementation((balance) => Promise.resolve(balance));
      
      mockRewardRepository.create.mockReturnValue({
        playerId,
        achievementId,
        rewardType: RewardType.COINS,
        rewardAmount: 60, // 50 + 1% of 1000
        isClaimed: false,
      });
      mockRewardRepository.save.mockImplementation((reward) => Promise.resolve({
        ...reward,
        id: 'reward-id-3',
        awardedAt: new Date(),
      }));

      const result = await service.assignReward(playerId, achievementId, 'dynamic');

      expect(result.rewardAmount).toBe(60);
      expect(mockBalanceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          totalCoins: 1060, // 1000 + 60
          totalPoints: 530,  // 500 + 30
        })
      );
    });
  });
});
