import { Test, TestingModule } from '@nestjs/testing';
import { PlayerService } from './player.service';
import { IPlayerRepository } from '../interfaces/player-repository.interface';
import { IEventPublisher } from '../interfaces/event-publisher.interface';
import { CreatePlayerDto, GameEventDto, GameEventType, UpdatePlayerDto } from '../dtos/player.dto';
import { Player } from '../entities/player.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

/**
 * PlayerService Tests
 * TDD Cycle: RED - Tests written first
 * SOLID Principle S: Testing single responsibility (business logic)
 */
describe('PlayerService', () => {
  let service: PlayerService;
  let mockRepository: jest.Mocked<IPlayerRepository>;
  let mockEventPublisher: jest.Mocked<IEventPublisher>;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      updateMonsterKills: jest.fn(),
      updateTimePlayed: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };

    mockEventPublisher = {
      publishPlayerEvent: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        {
          provide: 'IPlayerRepository',
          useValue: mockRepository,
        },
        {
          provide: 'IEventPublisher',
          useValue: mockEventPublisher,
        },
      ],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
  });

  describe('registerPlayer', () => {
    it('should register a new player successfully', async () => {
      const createPlayerDto: CreatePlayerDto = {
        username: 'newuser',
        email: 'newuser@example.com',
      };

      const mockPlayer: Player = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'newuser',
        email: 'newuser@example.com',
        monstersKilled: 0,
        timePlayed: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByUsername.mockResolvedValue(null);
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockPlayer);

      const result = await service.registerPlayer(createPlayerDto);

      expect(result).toEqual(mockPlayer);
      expect(mockRepository.findByUsername).toHaveBeenCalledWith('newuser');
      expect(mockRepository.findByEmail).toHaveBeenCalledWith('newuser@example.com');
      expect(mockRepository.create).toHaveBeenCalledWith('newuser', 'newuser@example.com');
    });

    it('should throw ConflictException if username already exists', async () => {
      const createPlayerDto: CreatePlayerDto = {
        username: 'existinguser',
        email: 'new@example.com',
      };

      const existingPlayer: Player = {
        id: '123',
        username: 'existinguser',
        email: 'old@example.com',
        monstersKilled: 0,
        timePlayed: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByUsername.mockResolvedValue(existingPlayer);

      await expect(service.registerPlayer(createPlayerDto)).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const createPlayerDto: CreatePlayerDto = {
        username: 'newuser',
        email: 'existing@example.com',
      };

      const existingPlayer: Player = {
        id: '123',
        username: 'olduser',
        email: 'existing@example.com',
        monstersKilled: 0,
        timePlayed: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByUsername.mockResolvedValue(null);
      mockRepository.findByEmail.mockResolvedValue(existingPlayer);

      await expect(service.registerPlayer(createPlayerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getPlayerById', () => {
    it('should return a player when found', async () => {
      const mockPlayer: Player = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        monstersKilled: 10,
        timePlayed: 120,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockPlayer);

      const result = await service.getPlayerById('123');

      expect(result).toEqual(mockPlayer);
    });

    it('should throw NotFoundException when player not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getPlayerById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('processGameEvent', () => {
    const mockPlayer: Player = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
      monstersKilled: 5,
      timePlayed: 60,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should process MONSTER_KILLED event correctly', async () => {
      const gameEventDto: GameEventDto = {
        playerId: '123',
        eventType: GameEventType.MONSTER_KILLED,
        value: 3,
      };

      const updatedPlayer = { ...mockPlayer, monstersKilled: 8 };

      mockRepository.findById.mockResolvedValue(mockPlayer);
      mockRepository.updateMonsterKills.mockResolvedValue(updatedPlayer);

      const result = await service.processGameEvent(gameEventDto);

      expect(result).toEqual(updatedPlayer);
      expect(mockRepository.updateMonsterKills).toHaveBeenCalledWith('123', 3);
      expect(mockEventPublisher.publishPlayerEvent).toHaveBeenCalledWith(
        '123',
        GameEventType.MONSTER_KILLED,
        3
      );
    });

    it('should process TIME_PLAYED event correctly', async () => {
      const gameEventDto: GameEventDto = {
        playerId: '123',
        eventType: GameEventType.TIME_PLAYED,
        value: 30,
      };

      const updatedPlayer = { ...mockPlayer, timePlayed: 90 };

      mockRepository.findById.mockResolvedValue(mockPlayer);
      mockRepository.updateTimePlayed.mockResolvedValue(updatedPlayer);

      const result = await service.processGameEvent(gameEventDto);

      expect(result).toEqual(updatedPlayer);
      expect(mockRepository.updateTimePlayed).toHaveBeenCalledWith('123', 30);
      expect(mockEventPublisher.publishPlayerEvent).toHaveBeenCalledWith(
        '123',
        GameEventType.TIME_PLAYED,
        30
      );
    });

    it('should throw NotFoundException if player does not exist', async () => {
      const gameEventDto: GameEventDto = {
        playerId: 'non-existent',
        eventType: GameEventType.MONSTER_KILLED,
        value: 1,
      };

      mockRepository.findById.mockResolvedValue(null);

      await expect(service.processGameEvent(gameEventDto)).rejects.toThrow(NotFoundException);
      expect(mockEventPublisher.publishPlayerEvent).not.toHaveBeenCalled();
    });

    it('should validate positive event values', async () => {
      const gameEventDto: GameEventDto = {
        playerId: '123',
        eventType: GameEventType.MONSTER_KILLED,
        value: 0,
      };

      mockRepository.findById.mockResolvedValue(mockPlayer);

      await expect(service.processGameEvent(gameEventDto)).rejects.toThrow('El valor del evento debe ser positivo');
    });
  });

  describe('getAllPlayers', () => {
    it('should return all players', async () => {
      const mockPlayers: Player[] = [
        {
          id: '1',
          username: 'user1',
          email: 'user1@example.com',
          monstersKilled: 10,
          timePlayed: 100,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          username: 'user2',
          email: 'user2@example.com',
          monstersKilled: 20,
          timePlayed: 200,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.findAll.mockResolvedValue(mockPlayers);

      const result = await service.getAllPlayers();

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockPlayers);
    });
  });

  describe('updatePlayer', () => {
    const existing: Player = {
      id: 'id-1',
      username: 'olduser',
      email: 'old@example.com',
      monstersKilled: 0,
      timePlayed: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update username and email successfully', async () => {
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.findByUsername.mockResolvedValue(null);
      mockRepository.findByEmail.mockResolvedValue(null);

      const updated: Player = { ...existing, username: 'newuser', email: 'new@example.com' };
      mockRepository.update.mockResolvedValue(updated);

      const dto: UpdatePlayerDto = { username: 'newuser', email: 'new@example.com' };
      const result = await service.updatePlayer('id-1', dto);

      expect(result).toEqual(updated);
      expect(mockRepository.update).toHaveBeenCalledWith('id-1', 'newuser', 'new@example.com');
    });

    it('should throw NotFound when player does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.updatePlayer('missing', { username: 'x' })).rejects.toThrow(NotFoundException);
    });

    it('should throw Conflict when username already exists', async () => {
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.findByUsername.mockResolvedValue({ ...existing, id: 'other' });

      await expect(service.updatePlayer('id-1', { username: 'taken' })).rejects.toThrow(ConflictException);
    });

    it('should throw Conflict when email already exists', async () => {
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.findByUsername.mockResolvedValue(null);
      mockRepository.findByEmail.mockResolvedValue({ ...existing, id: 'other' });

      await expect(service.updatePlayer('id-1', { email: 'taken@example.com' })).rejects.toThrow(ConflictException);
    });
  });

  describe('deletePlayer', () => {
    it('should delete player successfully', async () => {
      const existing: Player = {
        id: 'id-1',
        username: 'u',
        email: 'e@e.com',
        monstersKilled: 0,
        timePlayed: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.delete.mockResolvedValue();

      await service.deletePlayer('id-1');
      expect(mockRepository.delete).toHaveBeenCalledWith('id-1');
    });

    it('should throw NotFound when deleting non-existent player', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.deletePlayer('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
