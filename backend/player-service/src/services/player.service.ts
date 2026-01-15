import { Injectable, Inject, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { IPlayerRepository } from '../interfaces/player-repository.interface';
import { IEventPublisher } from '../interfaces/event-publisher.interface';
import { CreatePlayerDto, UpdatePlayerDto, GameEventDto, GameEventType, PlayerResponseDto } from '../dtos/player.dto';
import { Player } from '../entities/player.entity';

/**
 * Servicio de Jugador - Capa de Lógica de Negocio
 * Principios SOLID:
 * - S (Responsabilidad Única): Maneja solo la lógica de negocio relacionada con jugadores
 * - D (Inversión de Dependencias): Depende de abstracciones (interfaces), no de concreciones
 * - O (Abierto/Cerrado): Abierto para extensión, cerrado para modificación
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
   * Registra un nuevo jugador
   * Valida la unicidad del nombre de usuario y correo electrónico
   */
  async registerPlayer(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const { username, email } = createPlayerDto;

    // Verificar si el nombre de usuario ya existe
    const existingUsername = await this.playerRepository.findByUsername(username);
    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya existe');
    }

    // Verificar si el correo electrónico ya existe
    const existingEmail = await this.playerRepository.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    return this.playerRepository.create(username, email);
  }

  /**
   * Obtiene un jugador por ID
   */
  async getPlayerById(id: string): Promise<Player> {
    const player = await this.playerRepository.findById(id);
    
    if (!player) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }

    return player;
  }

  /**
   * Procesa eventos de juego y los publica a RabbitMQ
   * Implementa el patrón Proxy para validación de eventos
   */
  async processGameEvent(gameEventDto: GameEventDto): Promise<Player> {
    const { playerId, eventType, value } = gameEventDto;

    // Validar que el valor sea positivo
    if (value <= 0) {
      throw new BadRequestException('El valor del evento debe ser positivo');
    }

    // Verificar que el jugador existe
    const player = await this.playerRepository.findById(playerId);
    if (!player) {
      throw new NotFoundException(`Jugador con id ${playerId} no encontrado`);
    }

    let updatedPlayer: Player;

    // Procesar evento según su tipo
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

    // Publicar evento a RabbitMQ
    await this.eventPublisher.publishPlayerEvent(playerId, eventType, value);

    return updatedPlayer;
  }

  /**
   * Obtiene todos los jugadores activos
   */
  async getAllPlayers(): Promise<Player[]> {
    return this.playerRepository.findAll();
  }

  /**
   * Actualiza un jugador existente
   */
  async updatePlayer(id: string, updatePlayerDto: UpdatePlayerDto): Promise<Player> {
    const { username, email } = updatePlayerDto;

    // Verificar que el jugador existe
    const player = await this.playerRepository.findById(id);
    if (!player) {
      throw new NotFoundException(`Jugador con id ${id} no encontrado`);
    }

    // Verificar unicidad del nombre de usuario si se está actualizando
    if (username && username !== player.username) {
      const existingUsername = await this.playerRepository.findByUsername(username);
      if (existingUsername) {
        throw new ConflictException('El nombre de usuario ya existe');
      }
    }

    // Verificar unicidad del correo electrónico si se está actualizando
    if (email && email !== player.email) {
      const existingEmail = await this.playerRepository.findByEmail(email);
      if (existingEmail) {
        throw new ConflictException('El correo electrónico ya existe');
      }
    }

    return this.playerRepository.update(id, username, email);
  }

  /**
   * Elimina un jugador (eliminación lógica)
   */
  async deletePlayer(id: string): Promise<void> {
    const player = await this.playerRepository.findById(id);
    if (!player) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }

    await this.playerRepository.delete(id);
  }
}

