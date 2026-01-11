import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entidad de Jugador - Representa un jugador en el sistema de juego
 * Principio SOLID S (Responsabilidad Única): Solo maneja la estructura de datos del jugador
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
  timePlayed: number; // en minutos

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

