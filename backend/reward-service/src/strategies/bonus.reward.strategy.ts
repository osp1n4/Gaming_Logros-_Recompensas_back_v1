import { RewardStrategy, RewardComputation } from './reward.strategy';
import { RewardType } from '../entities/reward.entity';

export class BonusRewardStrategy implements RewardStrategy {
  computeReward(
    playerId: string,
    achievementId: string,
    playerBalance?: { totalCoins: number; totalPoints: number }
  ): RewardComputation {
    const baseCoins = 100;
    const basePoints = 50;
    const multiplier = parseFloat(process.env.BONUS_MULTIPLIER || '2');

    return {
      type: RewardType.COINS,
      amount: baseCoins * multiplier,
      points: basePoints * multiplier,
    };
  }
}
