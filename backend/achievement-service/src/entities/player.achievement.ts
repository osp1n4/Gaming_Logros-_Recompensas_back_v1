import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Achievement } from './achievement.entity';

/**
 * PlayerAchievement Entity (Pivot/Junction Table)
 * SOLID Principle S: Represents only the player-achievement relationship
 * Tracks which achievements have been unlocked by which players
 */
@Entity('player_achievements')
@Index(['playerId', 'achievementId'], { unique: true })
export class PlayerAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @Column({ name: 'achievement_id', type: 'uuid' })
  achievementId: string;

  @Column({ type: 'integer', default: 0 })
  progress: number;

  @Column({ name: 'unlocked_at', type: 'timestamp', nullable: true })
  unlockedAt: Date | null;

  @ManyToOne(() => Achievement, achievement => achievement.playerAchievements)
  @JoinColumn({ name: 'achievement_id' })
  achievement: Achievement;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

