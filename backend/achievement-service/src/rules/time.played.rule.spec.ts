import { TimePlayedRule } from './time.played.rule';
import { Achievement } from '../entities/achievement.entity';
import { PlayerAchievement } from '../entities/player.achievement';
import { PlayerEvent } from '../interfaces/event.interface';

/**
 * TimePlayedRule Tests
 * TDD Cycle: RED - Tests written first
 */
describe('TimePlayedRule', () => {
  let rule: TimePlayedRule;

  beforeEach(() => {
    rule = new TimePlayedRule();
  });

  describe('canApply', () => {
    it('should return true for TIME_PLAYED event type', () => {
      const achievement: Partial<Achievement> = {
        eventType: 'TIME_PLAYED',
        requiredValue: 300,
      };

      const result = rule.canApply('TIME_PLAYED');

      expect(result).toBe(true);
    });

    it('should return false for other event types', () => {
      const achievement: Partial<Achievement> = {
        eventType: 'MONSTER_KILLED',
        requiredValue: 10,
      };

      const result = rule.canApply('MONSTER_KILLED');

      expect(result).toBe(false);
    });
  });

  describe('evaluate', () => {
    it('should unlock achievement when required time reached (5 hours = 300 minutes)', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'TIME_PLAYED',
        value: 300, // minutes
      };

      const achievement: Partial<Achievement> = {
        id: 'ach-2',
        code: 'TIME_VETERAN',
        eventType: 'TIME_PLAYED',
        requiredValue: 300,
        isTemporal: false,
      };

      const result = await rule.evaluate(
        event,
        achievement as Achievement,
        null
      );

      expect(result.achieved).toBe(true);
      expect(result.progress).toBe(300);
    });

    it('should accumulate time from previous sessions', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'TIME_PLAYED',
        value: 60,
      };

      const achievement: Partial<Achievement> = {
        id: 'ach-2',
        code: 'TIME_VETERAN',
        eventType: 'TIME_PLAYED',
        requiredValue: 300,
        isTemporal: false,
      };

      const playerAchievement: Partial<PlayerAchievement> = {
        progress: 250,
        unlockedAt: null,
      };

      const result = await rule.evaluate(
        event,
        achievement as Achievement,
        playerAchievement as PlayerAchievement
      );

      expect(result.achieved).toBe(true);
      expect(result.progress).toBe(310);
    });
  });
});
