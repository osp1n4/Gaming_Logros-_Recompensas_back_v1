import { Injectable, Inject, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { IPlayerRepository } from '../interfaces/player-repository.interface';
import { IEventPublisher } from '../interfaces/event-publisher.interface';
import { CreatePlayerDto, UpdatePlayerDto, GameEventDto, GameEventType, PlayerResponseDto } from '../dtos/player.dto';
import { Player } from '../entities/player.entity';

/**
 * Player Service - Business Logic Layer
 * SOLID Principles:
 * - S (Single Responsibility): Handles only player-related business logic
 * - D (Dependency Inversion): Depends on abstractions (interfaces), not concretions
 * - O (Open/Closed): Open for extension, closed for modification
 */
@Injectable()
export class PlayerService {
  constructor(
    @Inject('IPlayerRepository')
    private readonly playerRepository: IPlayerRepository,
    @Inject('IEventPublisher')
    private readonly eventPublisher: IEventPublisher,
  ) {}

  /**
   * Registers a new player
   * Validates uniqueness of username and email
   */
  async registerPlayer(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const { username, email } = createPlayerDto;

    // Check if username already exists
    const existingUsername = await this.playerRepository.findByUsername(username);
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await this.playerRepository.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    return this.playerRepository.create(username, email);
  }

  /**
   * Retrieves a player by ID
   */
  async getPlayerById(id: string): Promise<Player> {
    const player = await this.playerRepository.findById(id);
    
    if (!player) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }

    return player;
  }

  /**
   * Processes game events and publishes to RabbitMQ
   * Implements Proxy pattern for event validation
   */
  async processGameEvent(gameEventDto: GameEventDto): Promise<Player> {
    const { playerId, eventType, value } = gameEventDto;

    // Validate positive value
    if (value <= 0) {
      throw new BadRequestException('Event value must be positive');
    }

    // Verify player exists
    const player = await this.playerRepository.findById(playerId);
    if (!player) {
      throw new NotFoundException(`Player with id ${playerId} not found`);
    }

    let updatedPlayer: Player;

    // Process event based on type
    switch (eventType) {
      case GameEventType.MONSTER_KILLED:
        updatedPlayer = await this.playerRepository.updateMonsterKills(playerId, value);
        break;
      case GameEventType.TIME_PLAYED:
        updatedPlayer = await this.playerRepository.updateTimePlayed(playerId, value);
        break;
      default:
        throw new BadRequestException(`Unknown event type: ${eventType}`);
    }

    // Publish event to RabbitMQ
    await this.eventPublisher.publishPlayerEvent(playerId, eventType, value);

    return updatedPlayer;
  }

  /**
   * Retrieves all active players
   */
  async getAllPlayers(): Promise<Player[]> {
    return this.playerRepository.findAll();
  }

  /**
   * Updates an existing player
   */
  async updatePlayer(id: string, updatePlayerDto: UpdatePlayerDto): Promise<Player> {
    const { username, email } = updatePlayerDto;

    // Verify player exists
    const player = await this.playerRepository.findById(id);
    if (!player) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }

    // Check username uniqueness if updating
    if (username && username !== player.username) {
      const existingUsername = await this.playerRepository.findByUsername(username);
      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    // Check email uniqueness if updating
    if (email && email !== player.email) {
      const existingEmail = await this.playerRepository.findByEmail(email);
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    return this.playerRepository.update(id, username, email);
  }

  /**
   * Deletes a player (soft delete)
   */
  async deletePlayer(id: string): Promise<void> {
    const player = await this.playerRepository.findById(id);
    if (!player) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }

    await this.playerRepository.delete(id);
  }
}

