import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PlayerAchievement } from './player.achievement';

/**
 * Achievement Entity
 * SOLID Principle S: Represents only achievement data structure
 * Defines achievements that can be unlocked by players
 */
@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ name: 'title_key' })
  titleKey: string;

  @Column({ name: 'description_key' })
  descriptionKey: string;

  @Column({ name: 'required_value', type: 'integer' })
  requiredValue: number;

  @Column({ name: 'event_type' })
  eventType: string;

  @Column({ name: 'is_temporal', default: false })
  isTemporal: boolean;

  @Column({ name: 'temporal_window_start', type: 'timestamp', nullable: true })
  temporalWindowStart: Date | null;

  @Column({ name: 'temporal_window_end', type: 'timestamp', nullable: true })
  temporalWindowEnd: Date | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => PlayerAchievement, playerAchievement => playerAchievement.achievement)
  playerAchievements: PlayerAchievement[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

