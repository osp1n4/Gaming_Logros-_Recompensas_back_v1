import { EventPublisher } from './event.publisher';
import { GameEventType } from '../dtos/player.dto';
import * as amqp from 'amqplib';

/**
 * EventPublisher Tests
 * TDD Cycle: RED - Tests written first
 * SOLID Principle S: Testing single responsibility (event publishing)
 */
jest.mock('amqplib');

describe('EventPublisher', () => {
  let eventPublisher: EventPublisher;
  let mockConnection: any;
  let mockChannel: any;

  beforeEach(() => {
    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue(undefined),
      publish: jest.fn().mockReturnValue(true),
      close: jest.fn().mockResolvedValue(undefined),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue(undefined),
    };

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);

    eventPublisher = new EventPublisher('amqp://localhost:5672');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('should establish connection to RabbitMQ successfully', async () => {
      await eventPublisher.connect();

      expect(amqp.connect).toHaveBeenCalledWith('amqp://localhost:5672');
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        'player.events',
        'topic',
        { durable: true }
      );
    });

    it('should throw error if connection fails', async () => {
      (amqp.connect as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      await expect(eventPublisher.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('publishPlayerEvent', () => {
    beforeEach(async () => {
      await eventPublisher.connect();
    });

    it('should publish monster_killed event successfully', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const eventType = GameEventType.MONSTER_KILLED;
      const value = 5;

      await eventPublisher.publishPlayerEvent(playerId, eventType, value);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        'player.events',
        'player.event.monster_killed',
        expect.any(Buffer),
        { persistent: true }
      );

      const publishedData = JSON.parse(
        (mockChannel.publish as jest.Mock).mock.calls[0][2].toString()
      );

      expect(publishedData).toMatchObject({
        playerId,
        eventType: 'monster_killed',
        value,
      });
      expect(publishedData.timestamp).toBeDefined();
    });

    it('should publish time_played event successfully', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      const eventType = GameEventType.TIME_PLAYED;
      const value = 60;

      await eventPublisher.publishPlayerEvent(playerId, eventType, value);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        'player.events',
        'player.event.time_played',
        expect.any(Buffer),
        { persistent: true }
      );
    });

    it('should throw error if channel is not initialized', async () => {
      const newPublisher = new EventPublisher('amqp://localhost:5672');

      await expect(
        newPublisher.publishPlayerEvent('player-id', GameEventType.MONSTER_KILLED, 1)
      ).rejects.toThrow('Event publisher not connected');
    });
  });

  describe('disconnect', () => {
    it('should close channel and connection properly', async () => {
      await eventPublisher.connect();
      await eventPublisher.disconnect();

      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should handle disconnect when not connected', async () => {
      await expect(eventPublisher.disconnect()).resolves.not.toThrow();
    });
  });
});
