import { BonusRewardStrategy } from '../../src/strategies/bonus.reward.strategy';
import { RewardType } from '../../src/entities/reward.entity';

describe('BonusRewardStrategy', () => {
  let strategy: BonusRewardStrategy;

  beforeEach(() => {
    strategy = new BonusRewardStrategy();
  });

  it('should apply bonus multiplier from environment variable', () => {
    process.env.BONUS_MULTIPLIER = '3';
    
    const result = strategy.computeReward('player-id', 'achievement-id');

    expect(result).toBeDefined();
    expect(result.type).toBe(RewardType.COINS);
    // Base 100 * 3 = 300
    expect(result.amount).toBe(300);
    // Base 50 * 3 = 150
    expect(result.points).toBe(150);

    delete process.env.BONUS_MULTIPLIER;
  });

  it('should use default multiplier of 2 when env var not set', () => {
    delete process.env.BONUS_MULTIPLIER;
    
    const result = strategy.computeReward('player-id', 'achievement-id');

    expect(result.amount).toBe(200); // 100 * 2
    expect(result.points).toBe(100);  // 50 * 2
  });

  it('should handle fractional multipliers', () => {
    process.env.BONUS_MULTIPLIER = '1.5';
    
    const result = strategy.computeReward('player-id', 'achievement-id');

    expect(result.amount).toBe(150); // 100 * 1.5
    expect(result.points).toBe(75);   // 50 * 1.5

    delete process.env.BONUS_MULTIPLIER;
  });
});
