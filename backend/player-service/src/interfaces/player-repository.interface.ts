import { Player } from '../entities/player.entity';

/**
 * Player Repository Interface
 * SOLID Principle D (Dependency Inversion): Depend on abstractions, not concretions
 */
export interface IPlayerRepository {
  create(username: string, email: string): Promise<Player>;
  findById(id: string): Promise<Player | null>;
  findByUsername(username: string): Promise<Player | null>;
  findByEmail(email: string): Promise<Player | null>;
  updateMonsterKills(playerId: string, increment: number): Promise<Player>;
  updateTimePlayed(playerId: string, increment: number): Promise<Player>;
  findAll(): Promise<Player[]>;
}
