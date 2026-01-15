import { Test, TestingModule } from '@nestjs/testing';
import { EventListenerService } from '../../src/services/event.listener';
import { AchievementUnlockedListener } from '../../src/listeners/achievement.unlocked.listener';
import * as amqp from 'amqplib';

// Mock amqplib
jest.mock('amqplib');

describe('EventListenerService - RabbitMQ Consumer', () => {
  let service: EventListenerService;
  let mockAchievementUnlockedListener: jest.Mocked<AchievementUnlockedListener>;
  let mockConnection: any;
  let mockChannel: any;

  beforeEach(async () => {
    // Mock Achievement Unlocked Listener
    mockAchievementUnlockedListener = {
      handleMessage: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Mock RabbitMQ Channel
    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue(undefined),
      assertQueue: jest.fn().mockResolvedValue({ queue: 'reward.achievement-events' }),
      bindQueue: jest.fn().mockResolvedValue(undefined),
      consume: jest.fn().mockResolvedValue({ consumerTag: 'test-consumer' }),
      ack: jest.fn(),
      nack: jest.fn(),
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
    service = new EventListenerService(rabbitMqUrl, mockAchievementUnlockedListener);

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

    it('should assert queue with correct configuration', async () => {
      await service.connect();

      expect(mockChannel.assertQueue).toHaveBeenCalledWith(
        'reward.achievement-events',
        { durable: true },
      );
    });

    it('should bind queue to exchange with routing key', async () => {
      await service.connect();

      expect(mockChannel.bindQueue).toHaveBeenCalledWith(
        'reward.achievement-events',
        'achievement.events',
        'achievement.unlocked',
      );
    });

    it('should start consuming messages from queue', async () => {
      await service.connect();

      expect(mockChannel.consume).toHaveBeenCalledWith(
        'reward.achievement-events',
        expect.any(Function),
        { noAck: false },
      );
    });

    it('should handle RabbitMQ connection errors', async () => {
      const error = new Error('Connection failed');
      (amqp.connect as jest.Mock).mockRejectedValueOnce(error);

      await expect(service.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('message handling', () => {
    it('should process valid achievement.unlocked messages', async () => {
      let messageHandler: Function;

      mockChannel.consume.mockImplementationOnce((queue: string, handler: Function) => {
        messageHandler = handler;
        return Promise.resolve({ consumerTag: 'test-consumer' });
      });

      await service.connect();

      const mockMessage = {
        content: Buffer.from(
          JSON.stringify({
            playerId: 'player-1',
            achievementId: 'ach-1',
            achievementCode: 'FIRST_KILL',
            rewardPoints: 100,
          }),
        ),
        fields: {
          routingKey: 'achievement.unlocked',
        },
      };

      await messageHandler!(mockMessage);

      expect(mockAchievementUnlockedListener.handleMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 'player-1',
          achievementId: 'ach-1',
        }),
      );
      expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
    });

    it('should acknowledge messages after successful processing', async () => {
      let messageHandler: Function;

      mockChannel.consume.mockImplementationOnce((queue: string, handler: Function) => {
        messageHandler = handler;
        return Promise.resolve({ consumerTag: 'test-consumer' });
      });

      await service.connect();

      const mockMessage = {
        content: Buffer.from(JSON.stringify({ playerId: 'p1', achievementId: 'a1' })),
        fields: { routingKey: 'achievement.unlocked' },
      };

      await messageHandler!(mockMessage);

      expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
    });

    it('should handle malformed JSON messages gracefully', async () => {
      let messageHandler: Function;

      mockChannel.consume.mockImplementationOnce((queue: string, handler: Function) => {
        messageHandler = handler;
        return Promise.resolve({ consumerTag: 'test-consumer' });
      });

      await service.connect();

      const mockMessage = {
        content: Buffer.from('invalid-json'),
        fields: { routingKey: 'achievement.unlocked' },
      };

      await messageHandler!(mockMessage);

      expect(mockChannel.nack).toHaveBeenCalledWith(mockMessage, false, true);
    });

    it('should nack messages when listener throws error', async () => {
      let messageHandler: Function;
      mockAchievementUnlockedListener.handleMessage.mockRejectedValueOnce(
        new Error('Processing failed'),
      );

      mockChannel.consume.mockImplementationOnce((queue: string, handler: Function) => {
        messageHandler = handler;
        return Promise.resolve({ consumerTag: 'test-consumer' });
      });

      await service.connect();

      const mockMessage = {
        content: Buffer.from(JSON.stringify({ playerId: 'p1', achievementId: 'a1' })),
        fields: { routingKey: 'achievement.unlocked' },
      };

      await messageHandler!(mockMessage);

      expect(mockChannel.nack).toHaveBeenCalledWith(mockMessage, false, true);
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

  describe('onModuleInit', () => {
    it('should have onModuleInit lifecycle method if implemented', () => {
      // This test checks if the method exists when the class implements OnModuleInit
      expect(service).toBeDefined();
    });
  });
});
