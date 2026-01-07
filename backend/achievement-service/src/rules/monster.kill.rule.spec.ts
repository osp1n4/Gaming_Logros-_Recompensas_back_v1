import { MonsterKillRule } from './monster.kill.rule';
import { Achievement } from '../entities/achievement.entity';
import { PlayerAchievement } from '../entities/player.achievement';
import { PlayerEvent } from '../interfaces/event.interface';

/**
 * MonsterKillRule Tests
 * TDD Cycle: RED - Tests written first
 * SOLID Principle S: Testing single responsibility (rule evaluation)
 */
describe('MonsterKillRule', () => {
  let rule: MonsterKillRule;

  beforeEach(() => {
    rule = new MonsterKillRule();
  });

  describe('canApply', () => {
    it('should return true for MONSTER_KILLED event type', () => {
      const achievement: Partial<Achievement> = {
        eventType: 'MONSTER_KILLED',
        requiredValue: 10,
      };

      const result = rule.canApply('MONSTER_KILLED');

      expect(result).toBe(true);
    });

    it('should return false for other event types', () => {
      const achievement: Partial<Achievement> = {
        eventType: 'TIME_PLAYED',
        requiredValue: 300,
      };

      const result = rule.canApply('TIME_PLAYED');

      expect(result).toBe(false);
    });
  });

  describe('evaluate', () => {
    it('should unlock achievement when required kills reached', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'MONSTER_KILLED',
        value: 10,
      };

      const achievement: Partial<Achievement> = {
        id: 'ach-1',
        code: 'MONSTER_SLAYER',
        eventType: 'MONSTER_KILLED',
        requiredValue: 10,
        isTemporal: false,
      };

      const playerAchievement: Partial<PlayerAchievement> | null = null;

      const result = await rule.evaluate(
        event,
        achievement as Achievement,
        playerAchievement as unknown as PlayerAchievement
      );

      expect(result.achieved).toBe(true);
      expect(result.progress).toBe(10);
    });

    it('should not unlock achievement when required kills not reached', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'MONSTER_KILLED',
        value: 5,
      };

      const achievement: Partial<Achievement> = {
        id: 'ach-1',
        code: 'MONSTER_SLAYER',
        eventType: 'MONSTER_KILLED',
        requiredValue: 10,
        isTemporal: false,
      };

      const result = await rule.evaluate(
        event,
        achievement as Achievement,
        null as unknown as PlayerAchievement
      );

      expect(result.achieved).toBe(false);
      expect(result.progress).toBe(5);
    });

    it('should accumulate progress from previous attempts', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'MONSTER_KILLED',
        value: 3,
      };

      const achievement: Partial<Achievement> = {
        id: 'ach-1',
        code: 'MONSTER_SLAYER',
        eventType: 'MONSTER_KILLED',
        requiredValue: 10,
        isTemporal: false,
      };

      const playerAchievement: Partial<PlayerAchievement> = {
        progress: 8,
        unlockedAt: null,
      };

      const result = await rule.evaluate(
        event,
        achievement as Achievement,
        playerAchievement as PlayerAchievement
      );

      expect(result.achieved).toBe(true);
      expect(result.progress).toBe(11);
    });

    it('should not evaluate if already unlocked', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'MONSTER_KILLED',
        value: 5,
      };

      const achievement: Partial<Achievement> = {
        id: 'ach-1',
        code: 'MONSTER_SLAYER',
        eventType: 'MONSTER_KILLED',
        requiredValue: 10,
        isTemporal: false,
      };

      const playerAchievement: Partial<PlayerAchievement> = {
        progress: 10,
        unlockedAt: new Date(),
      };

      const result = await rule.evaluate(
        event,
        achievement as Achievement,
        playerAchievement as PlayerAchievement
      );

      expect(result.achieved).toBe(false);
      expect(result.progress).toBe(10);
    });

    it('should respect temporal windows', async () => {
      const event: PlayerEvent = {
        playerId: 'player-1',
        eventType: 'MONSTER_KILLED',
        value: 10,
      };

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const achievement: Partial<Achievement> = {
        id: 'ach-1',
        code: 'MONSTER_SLAYER_EVENT',
        eventType: 'MONSTER_KILLED',
        requiredValue: 10,
        isTemporal: true,
        temporalWindowStart: pastDate,
        temporalWindowEnd: new Date(pastDate.getTime() + 86400000), // +1 day (expired)
      };

      const result = await rule.evaluate(
        event,
        achievement as Achievement,
        null
      );

      expect(result.achieved).toBe(false);
      expect(result.progress).toBe(0);
    });
  });
});
