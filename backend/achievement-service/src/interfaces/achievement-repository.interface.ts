import { Achievement } from '../entities/achievement.entity';
import { PlayerAchievement } from '../entities/player.achievement';

/**
 * Achievement Repository Interface
 * SOLID Principle D: Dependency Inversion - depend on abstractions
 * SOLID Principle I: Interface Segregation - specific interface for achievement operations
 */
export interface IAchievementRepository {
  findAll(): Promise<Achievement[]>;
  findById(id: string): Promise<Achievement | null>;
  findByCode(code: string): Promise<Achievement | null>;
  findByEventType(eventType: string): Promise<Achievement[]>;
  create(achievement: Partial<Achievement>): Promise<Achievement>;
  
  // Player Achievement operations
  findPlayerAchievement(playerId: string, achievementId: string): Promise<PlayerAchievement | null>;
  findPlayerAchievements(playerId: string): Promise<PlayerAchievement[]>;
  createPlayerAchievement(playerId: string, achievementId: string, progress: number): Promise<PlayerAchievement>;
  updatePlayerAchievementProgress(playerId: string, achievementId: string, progress: number): Promise<PlayerAchievement>;
  unlockPlayerAchievement(playerId: string, achievementId: string): Promise<PlayerAchievement>;
}
