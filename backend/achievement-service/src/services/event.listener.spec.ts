import { Test, TestingModule } from '@nestjs/testing';
import { EventListenerService } from './event.listener';
import { AchievementEventListener } from '../listeners/achievement.event.listener';
import * as amqp from 'amqplib';

// Mock amqplib
jest.mock('amqplib');

describe('EventListenerService', () => {
  let service: EventListenerService;
  let mockAchievementListener: jest.Mocked<AchievementEventListener>;
  let mockConnection: any;
  let mockChannel: any;

  beforeEach(async () => {
    // Mock Achievement Event Listener
    mockAchievementListener = {
      handlePlayerEventMessage: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Mock RabbitMQ Channel
    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue(undefined),
      assertQueue: jest.fn().mockResolvedValue({ queue: 'achievement.player-events' }),
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
    service = new EventListenerService(rabbitMqUrl, mockAchievementListener);
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
        'player.events',
        'topic',
        { durable: true },
      );
    });

    it('should assert queue with correct configuration', async () => {
      await service.connect();

      expect(mockChannel.assertQueue).toHaveBeenCalledWith(
        'achievement.player-events',
        { durable: true },
      );
    });

    it('should bind queue to exchange with routing pattern', async () => {
      await service.connect();

      expect(mockChannel.bindQueue).toHaveBeenCalledWith(
        'achievement.player-events',
        'player.events',
        'player.event.*',
      );
    });

    it('should start consuming messages from queue', async () => {
      await service.connect();

      expect(mockChannel.consume).toHaveBeenCalledWith(
        'achievement.player-events',
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
    it('should process valid player event messages', async () => {
      let messageHandler: Function;

      mockChannel.consume.mockImplementationOnce((queue: string, handler: Function) => {
        messageHandler = handler;
        return Promise.resolve({ consumerTag: 'test-consumer' });
      });

      await service.connect();

      const mockMessage = {
        content: Buffer.from(
          JSON.stringify({
            eventType: 'player.event.monster_killed',
            playerId: 'player-1',
            data: { monsterId: 'monster-1' },
          }),
        ),
        fields: {
          routingKey: 'player.event.monster_killed',
        },
      };

      await messageHandler!(mockMessage);

      expect(mockAchievementListener.handlePlayerEventMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'player.event.monster_killed',
          playerId: 'player-1',
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
        content: Buffer.from(JSON.stringify({ eventType: 'test.event' })),
        fields: { routingKey: 'test.event' },
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
        fields: { routingKey: 'test.event' },
      };

      await messageHandler!(mockMessage);

      expect(mockChannel.nack).toHaveBeenCalledWith(mockMessage, false, false);
    });

    it('should nack messages when listener throws error', async () => {
      let messageHandler: Function;
      mockAchievementListener.handlePlayerEventMessage.mockRejectedValueOnce(
        new Error('Processing failed'),
      );

      mockChannel.consume.mockImplementationOnce((queue: string, handler: Function) => {
        messageHandler = handler;
        return Promise.resolve({ consumerTag: 'test-consumer' });
      });

      await service.connect();

      const mockMessage = {
        content: Buffer.from(JSON.stringify({ eventType: 'test.event' })),
        fields: { routingKey: 'test.event' },
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
});
