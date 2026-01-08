import { FixedRewardStrategy } from '../../src/strategies/fixed.reward.strategy';
import { RewardType } from '../../src/entities/reward.entity';

describe('FixedRewardStrategy', () => {
  let strategy: FixedRewardStrategy;

  beforeEach(() => {
    strategy = new FixedRewardStrategy();
  });

  it('should return fixed 100 coins and 50 points for any player', () => {
    const result = strategy.computeReward('test-player-id', 'test-achievement-id');

    expect(result).toBeDefined();
    expect(result.type).toBe(RewardType.COINS);
    expect(result.amount).toBe(100);
    expect(result.points).toBe(50);
  });

  it('should return same reward regardless of player balance', () => {
    const playerBalance = { totalCoins: 1000, totalPoints: 500 };
    
    const result = strategy.computeReward('player-id', 'achievement-id', playerBalance);

    expect(result.amount).toBe(100);
    expect(result.points).toBe(50);
  });
});
