import { RewardStrategy, RewardComputation } from './reward.strategy';
import { RewardType } from '../entities/reward.entity';

const BONUS_BASE_COINS = 100;
const BONUS_BASE_POINTS = 50;
const DEFAULT_MULTIPLIER = 2;

export class BonusRewardStrategy implements RewardStrategy {
  computeReward(
    playerId: string,
    achievementId: string,
    playerBalance?: { totalCoins: number; totalPoints: number }
  ): RewardComputation {
    const multiplier = parseFloat(process.env.BONUS_MULTIPLIER || `${DEFAULT_MULTIPLIER}`);

    return {
      type: RewardType.COINS,
      amount: BONUS_BASE_COINS * multiplier,
      points: BONUS_BASE_POINTS * multiplier,
    };
  }
}
