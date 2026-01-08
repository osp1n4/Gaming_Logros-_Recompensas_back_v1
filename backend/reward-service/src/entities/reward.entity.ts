import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum RewardType {
  COINS = 'coins',
  POINTS = 'points',
  BADGE = 'badge',
  ITEM = 'item',
}

@Entity('rewards')
@Index(['player_id'])
@Index(['achievement_id'])
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @Column({ name: 'achievement_id', type: 'uuid' })
  achievementId: string;

  @Column({
    name: 'reward_type',
    type: 'enum',
    enum: RewardType,
  })
  rewardType: RewardType;

  @Column({ name: 'reward_amount', type: 'int' })
  rewardAmount: number;

  @CreateDateColumn({ name: 'awarded_at' })
  awardedAt: Date;

  @Column({ name: 'is_claimed', type: 'boolean', default: false })
  isClaimed: boolean;
}
