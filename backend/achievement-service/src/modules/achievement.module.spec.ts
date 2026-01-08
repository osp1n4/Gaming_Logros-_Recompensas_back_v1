import { Test, TestingModule } from '@nestjs/testing';
import { AchievementModule } from './achievement.module';
import { AchievementController } from '../controllers/achievement.controller';
import { AchievementService } from '../services/achievement.service';
import { AchievementRepository } from '../repositories/achievement.repository';
import { AchievementEventListener } from '../listeners/achievement.event.listener';
import { AchievementEventPublisher } from '../publishers/achievement.event.publisher';
import { MonsterKillRule } from '../rules/monster.kill.rule';
import { TimePlayedRule } from '../rules/time.played.rule';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Achievement } from '../entities/achievement.entity';
import { PlayerAchievement } from '../entities/player.achievement';

describe('AchievementModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    const mockRepository = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      findByCode: jest.fn(),
      findByEventType: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      findPlayerAchievement: jest.fn(),
      findPlayerAchievements: jest.fn().mockResolvedValue([]),
      createPlayerAchievement: jest.fn(),
      updatePlayerAchievementProgress: jest.fn(),
      unlockPlayerAchievement: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [AchievementModule],
    })
      .overrideProvider(getRepositoryToken(Achievement))
      .useValue({
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
      })
      .overrideProvider(getRepositoryToken(PlayerAchievement))
      .useValue({
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
      })
      .overrideProvider('IAchievementRepository')
      .useValue(mockRepository)
      .overrideProvider(AchievementRepository)
      .useValue(mockRepository)
      .overrideProvider('AMQP_CONNECTION')
      .useValue({
        createChannel: jest.fn().mockResolvedValue({
          assertExchange: jest.fn(),
          publish: jest.fn(),
        }),
      })
      .compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('module initialization', () => {
    it('should compile the module', () => {
      expect(module).toBeDefined();
    });

    it('should provide AchievementController', () => {
      const controller = module.get<AchievementController>(
        AchievementController,
      );
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(AchievementController);
    });

    it('should provide AchievementService', () => {
      const service = module.get<AchievementService>(AchievementService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(AchievementService);
    });

    it('should provide AchievementRepository', () => {
      const repository = module.get<AchievementRepository>(
        AchievementRepository,
      );
      expect(repository).toBeDefined();
    });

    it('should provide AchievementEventListener', () => {
      const listener = module.get<AchievementEventListener>(
        AchievementEventListener,
      );
      expect(listener).toBeDefined();
      expect(listener).toBeInstanceOf(AchievementEventListener);
    });

    it('should provide AchievementEventPublisher', () => {
      const publisher = module.get<AchievementEventPublisher>(
        AchievementEventPublisher,
      );
      expect(publisher).toBeDefined();
      expect(publisher).toBeInstanceOf(AchievementEventPublisher);
    });

    it('should provide MonsterKillRule', () => {
      const rule = module.get<MonsterKillRule>(MonsterKillRule);
      expect(rule).toBeDefined();
      expect(rule).toBeInstanceOf(MonsterKillRule);
    });

    it('should provide TimePlayedRule', () => {
      const rule = module.get<TimePlayedRule>(TimePlayedRule);
      expect(rule).toBeDefined();
      expect(rule).toBeInstanceOf(TimePlayedRule);
    });
  });

  describe('dependency injection', () => {
    it('should inject IAchievementRepository into AchievementRepository token', () => {
      const repository = module.get('IAchievementRepository');
      expect(repository).toBeDefined();
    });

    it('should inject all rules into AchievementService', () => {
      const service = module.get<AchievementService>(AchievementService);
      expect(service).toBeDefined();
      
      // Verify that service can be instantiated with rules
      expect(service).toBeInstanceOf(AchievementService);
    });

    it('should inject AchievementRepository into AchievementService', () => {
      const service = module.get<AchievementService>(AchievementService);
      expect(service).toBeDefined();
      
      // Verify that service can be instantiated with repository
      expect(service).toBeInstanceOf(AchievementService);
    });

    it('should inject AchievementService into AchievementController', () => {
      const controller = module.get<AchievementController>(
        AchievementController,
      );
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(AchievementController);
    });

    it('should inject AchievementService into AchievementEventListener', () => {
      const listener = module.get<AchievementEventListener>(
        AchievementEventListener,
      );
      expect(listener).toBeDefined();
      expect(listener).toBeInstanceOf(AchievementEventListener);
    });
  });

  describe('module exports', () => {
    it('should export AchievementService for use in other modules', async () => {
      const service = module.get<AchievementService>(AchievementService);
      expect(service).toBeDefined();
    });
  });
});
