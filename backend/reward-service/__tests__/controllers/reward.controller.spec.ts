import { Test, TestingModule } from '@nestjs/testing';
import { RewardController } from '../../src/controllers/reward.controller';
import { RewardService } from '../../src/services/reward.service';
import { Reward, RewardType } from '../../src/entities/reward.entity';
import { PlayerBalance } from '../../src/entities/player.balance';

describe('RewardController', () => {
  let controller: RewardController;
  let service: RewardService;

  const mockRewardService = {
    assignReward: jest.fn(),
    getAllRewards: jest.fn(),
    getPlayerRewards: jest.fn(),
    getPlayerBalance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardController],
      providers: [
        {
          provide: RewardService,
          useValue: mockRewardService,
        },
      ],
    }).compile();

    controller = module.get<RewardController>(RewardController);
    service = module.get<RewardService>(RewardService);

    jest.clearAllMocks();
  });

  describe('POST /api/rewards/assign', () => {
    it('should assign reward and return created reward', async () => {
      const assignDto = {
        playerId: 'player-1',
        achievementId: 'achievement-1',
        strategy: 'fixed',
      };

      const mockReward: Reward = {
        id: 'reward-1',
        playerId: 'player-1',
        achievementId: 'achievement-1',
        rewardType: RewardType.COINS,
        rewardAmount: 100,
        awardedAt: new Date(),
        isClaimed: false,
      };

      mockRewardService.assignReward.mockResolvedValue(mockReward);

      const result = await controller.assignReward(assignDto);

      expect(mockRewardService.assignReward).toHaveBeenCalledWith(
        'player-1',
        'achievement-1',
        'fixed',
      );
      expect(result).toEqual(mockReward);
    });
  });

  describe('GET /api/rewards', () => {
    it('should return all rewards', async () => {
      const mockRewards: Reward[] = [
        {
          id: 'reward-1',
          playerId: 'player-1',
          achievementId: 'achievement-1',
          rewardType: RewardType.COINS,
          rewardAmount: 100,
          awardedAt: new Date(),
          isClaimed: false,
        },
      ];

      mockRewardService.getAllRewards.mockResolvedValue(mockRewards);

      const result = await controller.getAllRewards();

      expect(mockRewardService.getAllRewards).toHaveBeenCalled();
      expect(result).toEqual(mockRewards);
    });
  });

  describe('GET /api/rewards/players/:playerId', () => {
    it('should return rewards for specific player', async () => {
      const playerId = 'player-1';
      const mockRewards: Reward[] = [
        {
          id: 'reward-1',
          playerId,
          achievementId: 'achievement-1',
          rewardType: RewardType.COINS,
          rewardAmount: 100,
          awardedAt: new Date(),
          isClaimed: false,
        },
      ];

      mockRewardService.getPlayerRewards.mockResolvedValue(mockRewards);

      const result = await controller.getPlayerRewards(playerId);

      expect(mockRewardService.getPlayerRewards).toHaveBeenCalledWith(playerId);
      expect(result).toEqual(mockRewards);
    });
  });

  describe('GET /api/rewards/balance/:playerId', () => {
    it('should return player balance', async () => {
      const playerId = 'player-1';
      const mockBalance: PlayerBalance = {
        id: 'balance-1',
        playerId,
        totalCoins: 100,
        totalPoints: 50,
        lastUpdated: new Date(),
      };

      mockRewardService.getPlayerBalance.mockResolvedValue(mockBalance);

      const result = await controller.getPlayerBalance(playerId);

      expect(mockRewardService.getPlayerBalance).toHaveBeenCalledWith(playerId);
      expect(result).toEqual(mockBalance);
    });
  });
});
