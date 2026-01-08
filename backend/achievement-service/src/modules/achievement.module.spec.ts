import { Test, TestingModule } from '@nestjs/testing';
import { AchievementModule } from './achievement.module';
import { AchievementController } from '../controllers/achievement.controller';
import { AchievementService } from '../services/achievement.service';
import { AchievementRepository } from '../repositories/achievement.repository';
import { AchievementEventListener } from '../listeners/achievement.event.listener';
import { AchievementEventPublisher } from '../publishers/achievement.event.publisher';
import { MonsterKillRule } from '../rules/monster.kill.rule';
import { TimePlayedRule } from '../rules/time.played.rule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from '../entities/achievement.entity';
import { PlayerAchievement } from '../entities/player.achievement';

describe('AchievementModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        // Mock TypeORM module
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'test',
          password: 'test',
          database: 'test',
          entities: [Achievement, PlayerAchievement],
          synchronize: false,
        }),
        AchievementModule,
      ],
    }).compile();
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
      expect(repository).toBeInstanceOf(AchievementRepository);
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
      expect(repository).toBeInstanceOf(AchievementRepository);
    });

    it('should inject all rules into AchievementService', () => {
      const service = module.get<AchievementService>(AchievementService);
      expect(service).toBeDefined();
      
      // Verify that service has access to rules through constructor
      const serviceAny = service as any;
      expect(serviceAny.rules).toBeDefined();
      expect(Array.isArray(serviceAny.rules)).toBe(true);
      expect(serviceAny.rules.length).toBeGreaterThan(0);
    });

    it('should inject AchievementRepository into AchievementService', () => {
      const service = module.get<AchievementService>(AchievementService);
      expect(service).toBeDefined();
      
      // Verify that service has access to repository
      const serviceAny = service as any;
      expect(serviceAny.repository).toBeDefined();
    });

    it('should inject AchievementService into AchievementController', () => {
      const controller = module.get<AchievementController>(
        AchievementController,
      );
      expect(controller).toBeDefined();
      
      // Verify that controller has access to service
      const controllerAny = controller as any;
      expect(controllerAny.achievementService).toBeDefined();
    });

    it('should inject AchievementService into AchievementEventListener', () => {
      const listener = module.get<AchievementEventListener>(
        AchievementEventListener,
      );
      expect(listener).toBeDefined();
      
      // Verify that listener has access to service
      const listenerAny = listener as any;
      expect(listenerAny.achievementService).toBeDefined();
    });
  });

  describe('module exports', () => {
    it('should export AchievementService for use in other modules', async () => {
      const exportedModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'test',
            password: 'test',
            database: 'test',
            entities: [Achievement, PlayerAchievement],
            synchronize: false,
          }),
          AchievementModule,
        ],
      }).compile();

      const service = exportedModule.get<AchievementService>(
        AchievementService,
      );
      expect(service).toBeDefined();

      await exportedModule.close();
    });
  });
});
