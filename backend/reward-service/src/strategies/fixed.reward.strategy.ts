import { RewardStrategy, RewardComputation } from './reward.strategy';
import { RewardType } from '../entities/reward.entity';

const FIXED_COINS_AMOUNT = 100;
const FIXED_POINTS_AMOUNT = 50;

export class FixedRewardStrategy implements RewardStrategy {
  computeReward(
    playerId: string,
    achievementId: string,
    playerBalance?: { totalCoins: number; totalPoints: number }
  ): RewardComputation {
    return {
      type: RewardType.COINS,
      amount: FIXED_COINS_AMOUNT,
      points: FIXED_POINTS_AMOUNT,
    };
  }
}
