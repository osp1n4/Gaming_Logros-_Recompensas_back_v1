import { Test, TestingModule } from '@nestjs/testing';
import { PlayerController } from './player.controller';
import { PlayerService } from '../services/player.service';
import { CreatePlayerDto, GameEventDto, GameEventType } from '../dtos/player.dto';
import { Player } from '../entities/player.entity';

/**
 * PlayerController Tests
 * TDD Cycle: RED - Tests written first
 * SOLID Principle S: Testing single responsibility (HTTP handling)
 */
describe('PlayerController', () => {
  let controller: PlayerController;
  let mockPlayerService: jest.Mocked<PlayerService>;

  beforeEach(async () => {
    mockPlayerService = {
      registerPlayer: jest.fn(),
      getPlayerById: jest.fn(),
      processGameEvent: jest.fn(),
      getAllPlayers: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [
        {
          provide: PlayerService,
          useValue: mockPlayerService,
        },
      ],
    }).compile();

    controller = module.get<PlayerController>(PlayerController);
  });

  describe('register', () => {
    it('should register a new player successfully', async () => {
      const createPlayerDto: CreatePlayerDto = {
        username: 'testuser',
        email: 'test@example.com',
      };

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

      mockPlayerService.registerPlayer.mockResolvedValue(mockPlayer);

      const result = await controller.register(createPlayerDto);

      expect(result).toEqual(mockPlayer);
      expect(mockPlayerService.registerPlayer).toHaveBeenCalledWith(createPlayerDto);
    });
  });

  describe('getPlayer', () => {
    it('should return a player by id', async () => {
      const playerId = '123e4567-e89b-12d3-a456-426614174000';
      
      const mockPlayer: Player = {
        id: playerId,
        username: 'testuser',
        email: 'test@example.com',
        monstersKilled: 10,
        timePlayed: 120,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPlayerService.getPlayerById.mockResolvedValue(mockPlayer);

      const result = await controller.getPlayer(playerId);

      expect(result).toEqual(mockPlayer);
      expect(mockPlayerService.getPlayerById).toHaveBeenCalledWith(playerId);
    });
  });

  describe('submitGameEvent', () => {
    it('should process monster_killed event successfully', async () => {
      const gameEventDto: GameEventDto = {
        playerId: '123',
        eventType: GameEventType.MONSTER_KILLED,
        value: 5,
      };

      const updatedPlayer: Player = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        monstersKilled: 15,
        timePlayed: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPlayerService.processGameEvent.mockResolvedValue(updatedPlayer);

      const result = await controller.submitGameEvent(gameEventDto);

      expect(result).toEqual(updatedPlayer);
      expect(mockPlayerService.processGameEvent).toHaveBeenCalledWith(gameEventDto);
    });

    it('should process time_played event successfully', async () => {
      const gameEventDto: GameEventDto = {
        playerId: '123',
        eventType: GameEventType.TIME_PLAYED,
        value: 30,
      };

      const updatedPlayer: Player = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        monstersKilled: 0,
        timePlayed: 150,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPlayerService.processGameEvent.mockResolvedValue(updatedPlayer);

      const result = await controller.submitGameEvent(gameEventDto);

      expect(result).toEqual(updatedPlayer);
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

      mockPlayerService.getAllPlayers.mockResolvedValue(mockPlayers);

      const result = await controller.getAllPlayers();

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockPlayers);
      expect(mockPlayerService.getAllPlayers).toHaveBeenCalled();
    });
  });
});
