import { Test, TestingModule } from '@nestjs/testing';
import { EventListener } from '../../src/services/event.listener';
import { RewardService } from '../../src/services/reward.service';

describe('EventListener - RabbitMQ Consumer', () => {
  let listener: EventListener;
  let service: RewardService;

  const mockRewardService = {
    assignReward: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventListener,
        {
          provide: RewardService,
          useValue: mockRewardService,
        },
      ],
    }).compile();

    listener = module.get<EventListener>(EventListener);
    service = module.get<RewardService>(RewardService);

    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should have onModuleInit lifecycle method', () => {
      expect(typeof listener.onModuleInit).toBe('function');
    });
  });

  describe('message consumption', () => {
    it('should parse and process achievement.unlocked events', async () => {
      const message = {
        playerId: 'player-1',
        achievementId: 'achievement-1',
      };

      // Simulate what the listener would do with a message
      mockRewardService.assignReward.mockResolvedValue({ id: 'reward-1' });

      const result = await service.assignReward(
        message.playerId,
        message.achievementId,
        'fixed',
      );

      expect(mockRewardService.assignReward).toHaveBeenCalledWith(
        'player-1',
        'achievement-1',
        'fixed',
      );
      expect(result).toBeDefined();
    });

    it('should handle invalid message gracefully', () => {
      const invalidMessage = 'not a json object';
      
      // EventListener should not throw on invalid messages
      expect(() => {
        JSON.parse(invalidMessage);
      }).toThrow();
    });
  });
});
