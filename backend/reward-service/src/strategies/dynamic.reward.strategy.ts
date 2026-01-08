import { RewardStrategy, RewardComputation } from './reward.strategy';
import { RewardType } from '../entities/reward.entity';

const DYNAMIC_BASE_COINS = 50;
const DYNAMIC_BASE_POINTS = 25;
const DYNAMIC_SCALE_FACTOR = 0.01; // 1% of current balance

export class DynamicRewardStrategy implements RewardStrategy {
  computeReward(
    playerId: string,
    achievementId: string,
    playerBalance?: { totalCoins: number; totalPoints: number }
  ): RewardComputation {
    const bonusCoins = playerBalance 
      ? Math.floor(playerBalance.totalCoins * DYNAMIC_SCALE_FACTOR) 
      : 0;
    const bonusPoints = playerBalance 
      ? Math.floor(playerBalance.totalPoints * DYNAMIC_SCALE_FACTOR) 
      : 0;

    return {
      type: RewardType.COINS,
      amount: DYNAMIC_BASE_COINS + bonusCoins,
      points: DYNAMIC_BASE_POINTS + bonusPoints,
    };
  }
}
