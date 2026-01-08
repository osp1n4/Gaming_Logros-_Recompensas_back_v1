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
 * Central configuration module for Achievement Service
 * 
 * SOLID Principles Application:
 * - Single Responsibility: Only configures and wires achievement-related components
 * - Dependency Inversion: All dependencies injected through constructor
 * - Open/Closed: Easy to add new rules without modifying module structure
 * 
 * Architecture:
 * 1. Entities: Achievement, PlayerAchievement (TypeORM)
 * 2. Repository: AchievementRepository (Data persistence layer)
 * 3. Rules: MonsterKillRule, TimePlayedRule (Business logic)
 * 4. Service: AchievementService (Orchestration layer)
 * 5. Listeners: AchievementEventListener (Event consumption from RabbitMQ)
 * 6. Publishers: AchievementEventPublisher (Event publication to RabbitMQ)
 * 7. Controller: AchievementController (REST API endpoints)
 * 
 * Dependencies:
 * - TypeORM for database operations
 * - RabbitMQ for event-driven communication
 * - NestJS for dependency injection and module wiring
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
