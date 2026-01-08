import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from '../entities/reward.entity';
import { PlayerBalance } from '../entities/player.balance';
import { RewardStrategy } from '../strategies/reward.strategy';
import { FixedRewardStrategy } from '../strategies/fixed.reward.strategy';
import { DynamicRewardStrategy } from '../strategies/dynamic.reward.strategy';
import { BonusRewardStrategy } from '../strategies/bonus.reward.strategy';

@Injectable()
export class RewardService {
  private strategies: Map<string, RewardStrategy> = new Map();

  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(PlayerBalance)
    private readonly balanceRepository: Repository<PlayerBalance>,
  ) {
    this.strategies.set('fixed', new FixedRewardStrategy());
    this.strategies.set('dynamic', new DynamicRewardStrategy());
    this.strategies.set('bonus', new BonusRewardStrategy());
  }

  private getStrategy(strategyName: string): RewardStrategy {
    const strategy = this.strategies.get(strategyName.toLowerCase());
    if (!strategy) {
      throw new Error(`Unknown reward strategy: ${strategyName}`);
    }
    return strategy;
  }

  async assignReward(
    playerId: string,
    achievementId: string,
    strategyName: string = 'fixed',
  ): Promise<Reward> {
    // Get or create player balance
    let balance = await this.balanceRepository.findOne({
      where: { playerId },
    });

    if (!balance) {
      balance = this.balanceRepository.create({
        playerId,
        totalCoins: 0,
        totalPoints: 0,
      });
      balance = await this.balanceRepository.save(balance);
    }

    // Compute reward using strategy
    const strategy = this.getStrategy(strategyName);
    const computation = strategy.computeReward(playerId, achievementId, balance);

    // Create and save reward
    const reward = this.rewardRepository.create({
      playerId,
      achievementId,
      rewardType: computation.type,
      rewardAmount: computation.amount,
      isClaimed: false,
    });
    const savedReward = await this.rewardRepository.save(reward);

    // Update balance
    balance.totalCoins += computation.amount;
    balance.totalPoints += computation.points;
    await this.balanceRepository.save(balance);

    return savedReward;
  }

  async getAllRewards(): Promise<Reward[]> {
    return this.rewardRepository.find();
  }

  async getPlayerRewards(playerId: string): Promise<Reward[]> {
    return this.rewardRepository.find({ where: { playerId } });
  }

  async getPlayerBalance(playerId: string): Promise<PlayerBalance> {
    let balance = await this.balanceRepository.findOne({
      where: { playerId },
    });

    if (!balance) {
      balance = this.balanceRepository.create({
        playerId,
        totalCoins: 0,
        totalPoints: 0,
      });
      balance = await this.balanceRepository.save(balance);
    }

    return balance;
  }
}
