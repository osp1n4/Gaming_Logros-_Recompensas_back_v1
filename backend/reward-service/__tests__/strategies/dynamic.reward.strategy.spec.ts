import { DynamicRewardStrategy } from '../../src/strategies/dynamic.reward.strategy';
import { RewardType } from '../../src/entities/reward.entity';

describe('DynamicRewardStrategy', () => {
  let strategy: DynamicRewardStrategy;

  beforeEach(() => {
    strategy = new DynamicRewardStrategy();
  });

  it('should scale reward based on player balance (1% of current balance)', () => {
    const playerBalance = { totalCoins: 1000, totalPoints: 500 };
    
    const result = strategy.computeReward('player-id', 'achievement-id', playerBalance);

    expect(result).toBeDefined();
    expect(result.type).toBe(RewardType.COINS);
    // Base 50 + 1% of 1000 = 50 + 10 = 60
    expect(result.amount).toBe(60);
    // Base 25 + 1% of 500 = 25 + 5 = 30
    expect(result.points).toBe(30);
  });

  it('should return base reward when no balance provided', () => {
    const result = strategy.computeReward('player-id', 'achievement-id');

    expect(result.amount).toBe(50);
    expect(result.points).toBe(25);
  });

  it('should return base reward when balance is zero', () => {
    const playerBalance = { totalCoins: 0, totalPoints: 0 };
    
    const result = strategy.computeReward('player-id', 'achievement-id', playerBalance);

    expect(result.amount).toBe(50);
    expect(result.points).toBe(25);
  });
});
