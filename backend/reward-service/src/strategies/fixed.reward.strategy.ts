import { RewardStrategy, RewardComputation } from './reward.strategy';
import { RewardType } from '../entities/reward.entity';

export class FixedRewardStrategy implements RewardStrategy {
  computeReward(
    playerId: string,
    achievementId: string,
    playerBalance?: { totalCoins: number; totalPoints: number }
  ): RewardComputation {
    return {
      type: RewardType.COINS,
      amount: 100,
      points: 50,
    };
  }
}
