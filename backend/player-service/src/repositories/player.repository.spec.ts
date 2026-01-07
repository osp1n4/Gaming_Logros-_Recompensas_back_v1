import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerRepository } from './player.repository';
import { Player } from '../entities/player.entity';

/**
 * PlayerRepository Tests
 * TDD Cycle: RED - Tests written first
 * SOLID Principle S: Testing single responsibility (data access)
 */
describe('PlayerRepository', () => {
  let playerRepository: PlayerRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<Player>>;

  beforeEach(async () => {
    // Mock TypeORM Repository
    mockTypeOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerRepository,
        {
          provide: getRepositoryToken(Player),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    playerRepository = module.get<PlayerRepository>(PlayerRepository);
  });

  describe('create', () => {
    it('should create a new player successfully', async () => {
      const mockPlayer: Player = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        email: 'test@example.com',
        monstersKilled: 0,
        timePlayed: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTypeOrmRepository.create.mockReturnValue(mockPlayer);
      mockTypeOrmRepository.save.mockResolvedValue(mockPlayer);

      const result = await playerRepository.create('testuser', 'test@example.com');

      expect(result).toEqual(mockPlayer);
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
      });
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(mockPlayer);
    });
  });

  describe('findById', () => {
    it('should return a player when found by id', async () => {
      const mockPlayer: Player = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        email: 'test@example.com',
        monstersKilled: 5,
        timePlayed: 120,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTypeOrmRepository.findOne.mockResolvedValue(mockPlayer);

      const result = await playerRepository.findById('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockPlayer);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
      });
    });

    it('should return null when player not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await playerRepository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return a player when found by username', async () => {
      const mockPlayer: Player = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        email: 'test@example.com',
        monstersKilled: 0,
        timePlayed: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTypeOrmRepository.findOne.mockResolvedValue(mockPlayer);

      const result = await playerRepository.findByUsername('testuser');

      expect(result).toEqual(mockPlayer);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return a player when found by email', async () => {
      const mockPlayer: Player = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        email: 'test@example.com',
        monstersKilled: 0,
        timePlayed: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTypeOrmRepository.findOne.mockResolvedValue(mockPlayer);

      const result = await playerRepository.findByEmail('test@example.com');

      expect(result).toEqual(mockPlayer);
    });
  });

  describe('updateMonsterKills', () => {
    it('should increment monster kills for a player', async () => {
      const mockPlayer: Player = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        email: 'test@example.com',
        monstersKilled: 5,
        timePlayed: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPlayer = { ...mockPlayer, monstersKilled: 10 };

      mockTypeOrmRepository.findOne.mockResolvedValue(mockPlayer);
      mockTypeOrmRepository.save.mockResolvedValue(updatedPlayer);

      const result = await playerRepository.updateMonsterKills('123e4567-e89b-12d3-a456-426614174000', 5);

      expect(result.monstersKilled).toBe(10);
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
    });

    it('should throw error when player not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      await expect(
        playerRepository.updateMonsterKills('non-existent-id', 5)
      ).rejects.toThrow('Player not found');
    });
  });

  describe('updateTimePlayed', () => {
    it('should increment time played for a player', async () => {
      const mockPlayer: Player = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        email: 'test@example.com',
        monstersKilled: 0,
        timePlayed: 60,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPlayer = { ...mockPlayer, timePlayed: 120 };

      mockTypeOrmRepository.findOne.mockResolvedValue(mockPlayer);
      mockTypeOrmRepository.save.mockResolvedValue(updatedPlayer);

      const result = await playerRepository.updateTimePlayed('123e4567-e89b-12d3-a456-426614174000', 60);

      expect(result.timePlayed).toBe(120);
    });
  });

  describe('findAll', () => {
    it('should return all active players', async () => {
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

      mockTypeOrmRepository.find.mockResolvedValue(mockPlayers);

      const result = await playerRepository.findAll();

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockPlayers);
    });
  });
});
