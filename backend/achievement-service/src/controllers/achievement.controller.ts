import { Controller, Get, Param, Post } from '@nestjs/common';
import { AchievementService } from '../services/achievement.service';
import { IAchievementRepository } from '../interfaces/achievement-repository.interface';

/**
 * Achievement Controller
 * 
 * REST API endpoints for Achievement Service
 * SOLID Principles Application:
 * - Single Responsibility: Only handles HTTP requests and responses for achievements
 * - Dependency Inversion: Depends on AchievementService and IAchievementRepository abstractions
 * - Open/Closed: Easy to add new endpoints without modifying service logic
 * 
 * Endpoints:
 * - GET  /achievements                                    - Get all achievements
 * - GET  /achievements/players/:playerId                  - Get player's achievements with progress
 * - GET  /achievements/players/:playerId/:achievementId/progress - Get specific achievement progress
 * - POST /achievements/initialize/:playerId               - Initialize achievements for new player
 */
@Controller('achievements')
export class AchievementController {
  constructor(
    private readonly achievementService: AchievementService,
    private readonly achievementRepository: IAchievementRepository,
  ) {}

  /**
   * GET /achievements
   * Returns all available achievements in the system
   */
  @Get()
  async getAchievements(): Promise<any[]> {
    return await this.achievementRepository.findAll();
  }

  /**
   * GET /achievements/players/:playerId
   * Returns all achievements for a specific player with their progress
   */
  @Get('players/:playerId')
  async getPlayerAchievements(@Param('playerId') playerId: string): Promise<any[]> {
    return await this.achievementService.getPlayerAchievements(playerId);
  }

  /**
   * GET /achievements/players/:playerId/:achievementId/progress
   * Returns progress for a specific achievement for a player
   */
  @Get('players/:playerId/:achievementId/progress')
  async getAchievementProgress(
    @Param('playerId') playerId: string,
    @Param('achievementId') achievementId: string,
  ): Promise<any> {
    return await this.achievementService.getAchievementProgress(
      playerId,
      achievementId,
    );
  }

  /**
   * POST /achievements/initialize/:playerId
   * Initializes all achievements for a specific player
   * Returns success message
   */
  @Post('initialize/:playerId')
  async initializeAchievements(
    @Param('playerId') playerId: string,
  ): Promise<any> {
    await this.achievementService.initializeAchievements(playerId);
    return {
      message: 'Achievements initialized successfully',
      playerId,
    };
  }
}
