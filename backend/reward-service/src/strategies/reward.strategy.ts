import { RewardType } from '../entities/reward.entity';

export interface RewardComputation {
  type: RewardType;
  amount: number;
  points: number;
}

export interface RewardStrategy {
  computeReward(
    playerId: string,
    achievementId: string,
    playerBalance?: { totalCoins: number; totalPoints: number }
  ): RewardComputation;
}
