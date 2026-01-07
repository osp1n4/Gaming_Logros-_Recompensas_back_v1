import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Player Entity - Represents a player in the gaming system
 * SOLID Principle S (Single Responsibility): Only handles player data structure
 */
@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ type: 'int', default: 0 })
  monstersKilled: number;

  @Column({ type: 'int', default: 0 })
  timePlayed: number; // in minutes

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

