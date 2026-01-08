import { RewardStrategy, RewardComputation } from './reward.strategy';
import { RewardType } from '../entities/reward.entity';

export class DynamicRewardStrategy implements RewardStrategy {
  computeReward(
    playerId: string,
    achievementId: string,
    playerBalance?: { totalCoins: number; totalPoints: number }
  ): RewardComputation {
    const baseCoins = 50;
    const basePoints = 25;
    const scaleFactor = 0.01; // 1% of current balance

    const bonusCoins = playerBalance 
      ? Math.floor(playerBalance.totalCoins * scaleFactor) 
      : 0;
    const bonusPoints = playerBalance 
      ? Math.floor(playerBalance.totalPoints * scaleFactor) 
      : 0;

    return {
      type: RewardType.COINS,
      amount: baseCoins + bonusCoins,
      points: basePoints + bonusPoints,
    };
  }
}
