import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Unique } from 'typeorm';

@Entity('player_balances')
@Unique(['playerId'])
export class PlayerBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'player_id', type: 'uuid' })
  playerId: string;

  @Column({ name: 'total_coins', type: 'int', default: 0 })
  totalCoins: number = 0;

  @Column({ name: 'total_points', type: 'int', default: 0 })
  totalPoints: number = 0;

  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated: Date;
}
