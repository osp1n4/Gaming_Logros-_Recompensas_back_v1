import { Test, TestingModule } from '@nestjs/testing';
import { AchievementEventListener } from './achievement.event.listener';
import { AchievementService } from '../services/achievement.service';
import { PlayerEvent } from '../interfaces/event.interface';

/**
 * Achievement Event Listener Tests
 * TDD Cycle: RED - Tests written first
 * SOLID Principle S: Testing single responsibility (event listening)
 */
describe('AchievementEventListener', () => {
  let listener: AchievementEventListener;
  let mockAchievementService: jest.Mocked<AchievementService>;

  beforeEach(() => {
    mockAchievementService = {
      evaluateEvent: jest.fn(),
      getPlayerAchievements: jest.fn(),
      getAchievementProgress: jest.fn(),
      initializeAchievements: jest.fn(),
    } as any;

    listener = new AchievementEventListener(mockAchievementService);
  });

  describe('handlePlayerEvent', () => {
    it('should evaluate event when monster killed event is received', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'MONSTER_KILLED',
        value: 1,
        timestamp: new Date(),
      };

      mockAchievementService.evaluateEvent.mockResolvedValue([]);

      await listener.handlePlayerEvent(event);

      expect(mockAchievementService.evaluateEvent).toHaveBeenCalledWith(event);
    });

    it('should evaluate event when time played event is received', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'TIME_PLAYED',
        value: 60,
        timestamp: new Date(),
      };

      mockAchievementService.evaluateEvent.mockResolvedValue([]);

      await listener.handlePlayerEvent(event);

      expect(mockAchievementService.evaluateEvent).toHaveBeenCalledWith(event);
    });

    it('should handle errors during event processing', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'MONSTER_KILLED',
        value: 1,
      };

      const error = new Error('Database error');
      mockAchievementService.evaluateEvent.mockRejectedValue(error);

      // Should not throw, but log error instead
      await expect(listener.handlePlayerEvent(event)).resolves.not.toThrow();
    });

    it('should handle events with missing optional fields', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'MONSTER_KILLED',
        value: 1,
      };

      mockAchievementService.evaluateEvent.mockResolvedValue([]);

      await listener.handlePlayerEvent(event);

      expect(mockAchievementService.evaluateEvent).toHaveBeenCalledWith(event);
    });

    it('should handle concurrent events correctly', async () => {
      const event1: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'MONSTER_KILLED',
        value: 1,
      };

      const event2: PlayerEvent = {
        playerId: 'player-2',
        eventType: 'TIME_PLAYED',
        value: 60,
      };

      mockAchievementService.evaluateEvent.mockResolvedValue([]);

      await Promise.all([
        listener.handlePlayerEvent(event1),
        listener.handlePlayerEvent(event2),
      ]);

      expect(mockAchievementService.evaluateEvent).toHaveBeenCalledTimes(2);
      expect(mockAchievementService.evaluateEvent).toHaveBeenNthCalledWith(
        1,
        event1,
      );
      expect(mockAchievementService.evaluateEvent).toHaveBeenNthCalledWith(
        2,
        event2,
      );
    });

    it('should support different player IDs independently', async () => {
      const event1: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'MONSTER_KILLED',
        value: 1,
      };

      const event2: PlayerEvent = {
        playerId: 'player-2',
        eventType: 'MONSTER_KILLED',
        value: 2,
      };

      mockAchievementService.evaluateEvent.mockResolvedValue([]);

      await listener.handlePlayerEvent(event1);
      await listener.handlePlayerEvent(event2);

      expect(mockAchievementService.evaluateEvent).toHaveBeenCalledWith(event1);
      expect(mockAchievementService.evaluateEvent).toHaveBeenCalledWith(event2);
    });

    it('should return evaluation results when achievements are unlocked', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'MONSTER_KILLED',
        value: 10,
      };

      const evaluationResults = [
        {
          playerId: 'player-1',
          achievementId: 'ach-1',
          achievementCode: 'MONSTER_SLAYER',
          progress: 10,
          achieved: true,
          unlockedAt: new Date(),
        },
      ];

      mockAchievementService.evaluateEvent.mockResolvedValue(
        evaluationResults as any
      );

      const result = await listener.handlePlayerEvent(event);

      expect(result).toEqual(evaluationResults);
    });
  });

  describe('handlePlayerEventMessage', () => {
    it('should parse and handle RabbitMQ message correctly', async () => {
      const messageContent = {
        playerId: 'player-1',
        eventType: 'MONSTER_KILLED',
        value: 1,
      };

      mockAchievementService.evaluateEvent.mockResolvedValue([]);

      await listener.handlePlayerEventMessage(messageContent);

      expect(mockAchievementService.evaluateEvent).toHaveBeenCalledWith(
        messageContent
      );
    });

    it('should handle invalid message format gracefully', async () => {
      const invalidMessage = {
        playerId: 'player-1',
        // Missing required fields
      };

      await expect(
        listener.handlePlayerEventMessage(invalidMessage as any)
      ).resolves.not.toThrow();
    });
  });
});
