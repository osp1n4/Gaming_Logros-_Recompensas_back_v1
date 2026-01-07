import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from '../entities/achievement.entity';
import { PlayerAchievement } from '../entities/player.achievement';
import { IAchievementRepository } from '../interfaces/achievement-repository.interface';

@Injectable()
export class AchievementRepository implements IAchievementRepository {
  private readonly achievementRepo: Repository<Achievement>;
  private readonly playerAchievementRepo: Repository<PlayerAchievement>;

  constructor(
    @InjectRepository(Achievement) 
    achievementRepo: Repository<Achievement>,
    @InjectRepository(PlayerAchievement) 
    playerAchievementRepo: Repository<PlayerAchievement>
  ) {
    this.achievementRepo = achievementRepo;
    this.playerAchievementRepo = playerAchievementRepo;
  }

  async findAll(): Promise<Achievement[]> {
    return this.achievementRepo.find();
  }

  async findById(id: string): Promise<Achievement | null> {
    return this.achievementRepo.findOne({ where: { id } });
  }

  async findByCode(code: string): Promise<Achievement | null> {
    return this.achievementRepo.findOne({ where: { code } });
  }

  async findByEventType(eventType: string): Promise<Achievement[]> {
    return this.achievementRepo.find({ where: { eventType } });
  }

  async create(achievement: Partial<Achievement>): Promise<Achievement> {
    const newAchievement = this.achievementRepo.create(achievement);
    return this.achievementRepo.save(newAchievement);
  }

  async findPlayerAchievement(
    playerId: string,
    achievementId: string
  ): Promise<PlayerAchievement | null> {
    return this.playerAchievementRepo.findOne({
      where: { playerId, achievementId },
    });
  }

  async createPlayerAchievement(
    playerId: string,
    achievementId: string,
    progress: number
  ): Promise<PlayerAchievement> {
    const playerAchievement = this.playerAchievementRepo.create({
      playerId,
      achievementId,
      progress,
      unlockedAt: null,
    });
    return this.playerAchievementRepo.save(playerAchievement);
  }

  async updatePlayerAchievementProgress(
    playerId: string,
    achievementId: string,
    progress: number
  ): Promise<PlayerAchievement> {
    const playerAchievement = await this.findPlayerAchievement(playerId, achievementId);
    if (!playerAchievement) {
      throw new Error('PlayerAchievement not found');
    }
    playerAchievement.progress = progress;
    return this.playerAchievementRepo.save(playerAchievement);
  }

  async unlockPlayerAchievement(
    playerId: string,
    achievementId: string
  ): Promise<PlayerAchievement> {
    const playerAchievement = await this.findPlayerAchievement(playerId, achievementId);
    if (!playerAchievement) {
      throw new Error('PlayerAchievement not found');
    }
    playerAchievement.unlockedAt = new Date();
    return this.playerAchievementRepo.save(playerAchievement);
  }

  async findPlayerAchievements(playerId: string): Promise<PlayerAchievement[]> {
    return this.playerAchievementRepo.find({
      where: { playerId },
      relations: ['achievement'],
    });
  }
}
