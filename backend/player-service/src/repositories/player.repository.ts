import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../entities/player.entity';
import { IPlayerRepository } from '../interfaces/player-repository.interface';

/**
 * Player Repository Implementation
 * SOLID Principles:
 * - S (Single Responsibility): Only handles data access for players
 * - D (Dependency Inversion): Implements IPlayerRepository interface
 * - L (Liskov Substitution): Can be substituted by any IPlayerRepository implementation
 */
@Injectable()
export class PlayerRepository implements IPlayerRepository {
  constructor(
    @InjectRepository(Player)
    private readonly repository: Repository<Player>,
  ) {}

  async create(username: string, email: string): Promise<Player> {
    const player = this.repository.create({ username, email });
    return this.repository.save(player);
  }

  async findById(id: string): Promise<Player | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<Player | null> {
    return this.repository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<Player | null> {
    return this.repository.findOne({ where: { email } });
  }

  async updateMonsterKills(playerId: string, increment: number): Promise<Player> {
    const player = await this.findById(playerId);
    
    if (!player) {
      throw new Error('Player not found');
    }

    player.monstersKilled += increment;
    return this.repository.save(player);
  }

  async updateTimePlayed(playerId: string, increment: number): Promise<Player> {
    const player = await this.findById(playerId);
    
    if (!player) {
      throw new Error('Player not found');
    }

    player.timePlayed += increment;
    return this.repository.save(player);
  }

  async findAll(): Promise<Player[]> {
    return this.repository.find({ where: { isActive: true } });
  }
}

