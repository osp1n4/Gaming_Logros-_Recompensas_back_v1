import { Controller, Post, Put, Get, Delete, Body, Param, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { PlayerService } from '../services/player.service';
import { CreatePlayerDto, UpdatePlayerDto, GameEventDto, PlayerResponseDto } from '../dtos/player.dto';
import { Player } from '../entities/player.entity';

/**
 * Player Controller - HTTP Request Handler
 * SOLID Principles:
 * - S (Single Responsibility): Only handles HTTP requests/responses
 * - D (Dependency Inversion): Depends on PlayerService abstraction
 */
@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  /**
   * PUT /players
   * Register a new player
   */
  @Put()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(ValidationPipe) createPlayerDto: CreatePlayerDto,
  ): Promise<Player> {
    return this.playerService.registerPlayer(createPlayerDto);
  }

  /**
   * GET /players/:id
   * Get player information by ID
   */
  @Get(':id')
  async getPlayer(@Param('id') id: string): Promise<Player> {
    return this.playerService.getPlayerById(id);
  }

  /**
   * POST /players/events
   * Submit a game event for processing
   */
  @Post('events')
  @HttpCode(HttpStatus.OK)
  async submitGameEvent(
    @Body(ValidationPipe) gameEventDto: GameEventDto,
  ): Promise<Player> {
    return this.playerService.processGameEvent(gameEventDto);
  }

  /**
   * GET /players
   * Get all active players
   */
  @Get()
  async getAllPlayers(): Promise<Player[]> {
    return this.playerService.getAllPlayers();
  }

  /**
   * POST /players/:id
   * Update player information
   */
  @Post(':id')
  @HttpCode(HttpStatus.OK)
  async updatePlayer(
    @Param('id') id: string,
    @Body(ValidationPipe) updatePlayerDto: UpdatePlayerDto,
  ): Promise<Player> {
    return this.playerService.updatePlayer(id, updatePlayerDto);
  }

  /**
   * DELETE /players/:id
   * Delete a player (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePlayer(@Param('id') id: string): Promise<void> {
    return this.playerService.deletePlayer(id);
  }
}

