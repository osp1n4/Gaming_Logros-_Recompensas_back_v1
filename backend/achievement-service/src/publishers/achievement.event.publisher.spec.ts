import { Test, TestingModule } from '@nestjs/testing';
import { AchievementEventPublisher } from './achievement.event.publisher';
import { AchievementEvaluationResult } from '../interfaces/event.interface';

describe('AchievementEventPublisher', () => {
  let publisher: AchievementEventPublisher;
  let mockAmqpConnection: any;

  beforeEach(async () => {
    // Mock AMQP connection
    mockAmqpConnection = {
      createChannel: jest.fn(),
    };

    const mockChannel = {
      assertExchange: jest.fn().mockResolvedValue(undefined),
      publish: jest.fn().mockReturnValue(true),
    };

    mockAmqpConnection.createChannel.mockResolvedValue(mockChannel);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementEventPublisher,
        {
          provide: 'AMQP_CONNECTION',
          useValue: mockAmqpConnection,
        },
      ],
    }).compile();

    publisher = module.get<AchievementEventPublisher>(AchievementEventPublisher);
  });

  describe('publishAchievementUnlocked', () => {
    it('should publish achievement.unlocked event when achievement is unlocked', async () => {
      const result: AchievementEvaluationResult = {
        achieved: true,
        progress: 100,
        achievementId: 'ach-1',
        achievementCode: 'FIRST_KILL',
        playerId: 'player-1',
      };

      const channel = await mockAmqpConnection.createChannel();

      await publisher.publishAchievementUnlocked(result);

      expect(channel.assertExchange).toHaveBeenCalledWith(
        'achievement-service',
        'topic',
        { durable: true },
      );

      expect(channel.publish).toHaveBeenCalled();
      const publishCall = channel.publish.mock.calls[0];
      expect(publishCall[0]).toBe('achievement-service');
      expect(publishCall[1]).toBe('achievement.unlocked');

      const messageBuffer = publishCall[2];
      const messageData = JSON.parse(messageBuffer.toString());
      expect(messageData.playerId).toBe('player-1');
      expect(messageData.achievementCode).toBe('FIRST_KILL');
      expect(messageData.achievementId).toBe('ach-1');
      expect(messageData.timestamp).toBeDefined();
    });

    it('should not publish if achievement is not unlocked', async () => {
      const result: AchievementEvaluationResult = {
        achieved: false,
        progress: 50,
        achievementId: 'ach-1',
        achievementCode: 'FIRST_KILL',
        playerId: 'player-1',
      };

      const channel = await mockAmqpConnection.createChannel();

      await publisher.publishAchievementUnlocked(result);

      expect(channel.publish).not.toHaveBeenCalled();
    });

    it('should handle RabbitMQ connection errors gracefully', async () => {
      const result: AchievementEvaluationResult = {
        achieved: true,
        progress: 100,
        achievementId: 'ach-1',
        achievementCode: 'FIRST_KILL',
        playerId: 'player-1',
      };

      const mockError = new Error('RabbitMQ connection failed');
      mockAmqpConnection.createChannel.mockRejectedValueOnce(mockError);

      // Should not throw
      await expect(
        publisher.publishAchievementUnlocked(result),
      ).resolves.not.toThrow();
    });

    it('should include correct message structure for achievement.unlocked event', async () => {
      const result: AchievementEvaluationResult = {
        achieved: true,
        progress: 100,
        achievementId: 'ach-123',
        achievementCode: 'MONSTER_SLAYER',
        playerId: 'player-456',
      };

      const channel = await mockAmqpConnection.createChannel();

      await publisher.publishAchievementUnlocked(result);

      const publishCall = channel.publish.mock.calls[0];
      const messageData = JSON.parse(publishCall[2].toString());

      expect(messageData).toEqual(
        expect.objectContaining({
          playerId: 'player-456',
          achievementId: 'ach-123',
          achievementCode: 'MONSTER_SLAYER',
          eventType: 'ACHIEVEMENT_UNLOCKED',
        }),
      );
    });

    it('should batch publish multiple achievement.unlocked events', async () => {
      const results: AchievementEvaluationResult[] = [
        {
          achieved: true,
          progress: 100,
          achievementId: 'ach-1',
          achievementCode: 'FIRST_KILL',
          playerId: 'player-1',
        },
        {
          achieved: true,
          progress: 100,
          achievementId: 'ach-2',
          achievementCode: 'MASTER_SLAYER',
          playerId: 'player-1',
        },
        {
          achieved: false,
          progress: 75,
          achievementId: 'ach-3',
          achievementCode: 'TIME_MASTER',
          playerId: 'player-1',
        },
      ];

      const channel = await mockAmqpConnection.createChannel();

      await publisher.publishAchievementUnlockedBatch(results);

      // Only 2 events published (the ones with achieved: true)
      expect(channel.publish).toHaveBeenCalledTimes(2);
    });

    it('should set correct message options for RabbitMQ', async () => {
      const result: AchievementEvaluationResult = {
        achieved: true,
        progress: 100,
        achievementId: 'ach-1',
        achievementCode: 'FIRST_KILL',
        playerId: 'player-1',
      };

      const channel = await mockAmqpConnection.createChannel();

      await publisher.publishAchievementUnlocked(result);

      const publishCall = channel.publish.mock.calls[0];
      const options = publishCall[3];

      expect(options).toEqual(
        expect.objectContaining({
          persistent: true,
          contentType: 'application/json',
        }),
      );
    });

    it('should handle publishing with additional metadata', async () => {
      const result: AchievementEvaluationResult = {
        achieved: true,
        progress: 100,
        achievementId: 'ach-1',
        achievementCode: 'FIRST_KILL',
        playerId: 'player-1',
      };

      const channel = await mockAmqpConnection.createChannel();

      await publisher.publishAchievementUnlocked(result, {
        source: 'achievement-service',
        version: '1.0',
      });

      const publishCall = channel.publish.mock.calls[0];
      const messageData = JSON.parse(publishCall[2].toString());

      expect(messageData.metadata).toEqual({
        source: 'achievement-service',
        version: '1.0',
      });
    });
  });
});
