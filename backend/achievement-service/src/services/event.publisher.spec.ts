import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisherService } from './event.publisher';
import * as amqp from 'amqplib';

// Mock amqplib
jest.mock('amqplib');

describe('EventPublisherService', () => {
  let service: EventPublisherService;
  let mockConnection: any;
  let mockChannel: any;

  beforeEach(async () => {
    // Mock RabbitMQ Channel
    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue(undefined),
      publish: jest.fn().mockReturnValue(true),
      close: jest.fn().mockResolvedValue(undefined),
    };

    // Mock RabbitMQ Connection
    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    };

    // Mock amqp.connect
    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);

    const rabbitMqUrl = 'amqp://localhost:5672';
    service = new EventPublisherService(rabbitMqUrl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('should connect to RabbitMQ successfully', async () => {
      await service.connect();

      expect(amqp.connect).toHaveBeenCalledWith('amqp://localhost:5672');
      expect(mockConnection.createChannel).toHaveBeenCalled();
    });

    it('should assert exchange with correct configuration', async () => {
      await service.connect();

      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        'achievement.events',
        'topic',
        { durable: true },
      );
    });

    it('should handle connection errors gracefully', async () => {
      const error = new Error('Connection failed');
      (amqp.connect as jest.Mock).mockRejectedValueOnce(error);

      await expect(service.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('publishAchievementUnlocked', () => {
    beforeEach(async () => {
      await service.connect();
    });

    it('should publish achievement.unlocked event successfully', async () => {
      const playerId = 'player-1';
      const achievementId = 'ach-1';
      const achievementCode = 'FIRST_KILL';
      const rewardPoints = 100;

      await service.publishAchievementUnlocked(
        playerId,
        achievementId,
        achievementCode,
        rewardPoints,
      );

      expect(mockChannel.publish).toHaveBeenCalledWith(
        'achievement.events',
        'achievement.unlocked',
        expect.any(Buffer),
        {
          persistent: true,
        },
      );

      const publishCall = mockChannel.publish.mock.calls[0];
      const messageData = JSON.parse(publishCall[2].toString());
      expect(messageData).toEqual(
        expect.objectContaining({
          playerId,
          achievementId,
          achievementCode,
          rewardPoints,
          timestamp: expect.any(String),
        }),
      );
    });

    it('should not throw when channel is not initialized', async () => {
      const service2 = new EventPublisherService('amqp://localhost:5672');

      await expect(
        service2.publishAchievementUnlocked('p1', 'a1', 'CODE', 100),
      ).resolves.not.toThrow();
    });

    it('should handle publish errors gracefully', async () => {
      mockChannel.publish.mockImplementationOnce(() => {
        throw new Error('Publish failed');
      });

      await expect(
        service.publishAchievementUnlocked('p1', 'a1', 'CODE', 100),
      ).resolves.not.toThrow();
    });
  });

  describe('disconnect', () => {
    it('should close channel and connection gracefully', async () => {
      await service.connect();
      await service.disconnect();

      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should handle disconnect errors gracefully', async () => {
      await service.connect();
      mockChannel.close.mockRejectedValueOnce(new Error('Close failed'));

      await expect(service.disconnect()).resolves.not.toThrow();
    });

    it('should handle disconnect when not connected', async () => {
      await expect(service.disconnect()).resolves.not.toThrow();
    });
  });

  describe('publish without connect', () => {
    it('should handle publish when not connected', async () => {
      await expect(
        service.publishAchievementUnlocked('p1', 'a1', 'CODE', 100),
      ).resolves.not.toThrow();
    });
  });
});
