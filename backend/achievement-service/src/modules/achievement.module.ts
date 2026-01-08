import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Achievement } from '../entities/achievement.entity';
import { PlayerAchievement } from '../entities/player.achievement';
import { AchievementController } from '../controllers/achievement.controller';
import { AchievementService } from '../services/achievement.service';
import { AchievementRepository } from '../repositories/achievement.repository';
import { AchievementEventListener } from '../listeners/achievement.event.listener';
import { AchievementEventPublisher } from '../publishers/achievement.event.publisher';
import { AchievementRule } from '../rules/achievement.rule';
import { MonsterKillRule } from '../rules/monster.kill.rule';
import { TimePlayedRule } from '../rules/time.played.rule';

/**
 * Achievement Module
 * 
 * SOLID Principles Application:
 * - Single Responsibility: Only configures and wires achievement-related components
 * - Dependency Inversion: All dependencies injected through constructor
 * - Open/Closed: Easy to add new rules without modifying this module
 * 
 * Wires together:
 * - Entities (Achievement, PlayerAchievement)
 * - Repository (AchievementRepository)
 * - Rules (MonsterKillRule, TimePlayedRule)
 * - Service (AchievementService)
 * - Listeners (AchievementEventListener)
 * - Publishers (AchievementEventPublisher)
 * - Controller (AchievementController)
 */
@Module({
  imports: [
    // TypeORM entities
    TypeOrmModule.forFeature([Achievement, PlayerAchievement]),
    
    // RabbitMQ client configuration
    ClientsModule.register([
      {
        name: 'AMQP_CONNECTION',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'achievement_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [AchievementController],
  providers: [
    // Service
    AchievementService,
    
    // Repository with interface token
    {
      provide: 'IAchievementRepository',
      useClass: AchievementRepository,
    },
    AchievementRepository,
    
    // Event handling
    AchievementEventListener,
    AchievementEventPublisher,
    
    // Achievement rules - all rules available for injection
    MonsterKillRule,
    TimePlayedRule,
    
    // Provide array of all rules for AchievementService
    {
      provide: 'ACHIEVEMENT_RULES',
      useFactory: (
        monsterKillRule: MonsterKillRule,
        timePlayedRule: TimePlayedRule,
      ): AchievementRule[] => {
        return [monsterKillRule, timePlayedRule];
      },
      inject: [MonsterKillRule, TimePlayedRule],
    },
  ],
  exports: [
    AchievementService,
    AchievementRepository,
    'IAchievementRepository',
  ],
})
export class AchievementModule {}
