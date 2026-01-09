import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from '../entities/reward.entity';
import { PlayerBalance } from '../entities/player.balance';
import { getDatabaseConfig } from '../config/database.config';
import { RewardService } from '../services/reward.service';
import { EventListenerService } from '../services/event.listener';
import { AchievementUnlockedListener } from '../listeners/achievement.unlocked.listener';
import { RewardController } from '../controllers/reward.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    TypeOrmModule.forFeature([Reward, PlayerBalance]),
  ],
  controllers: [RewardController],
  providers: [
    RewardService,
    AchievementUnlockedListener,
    {
      provide: 'EVENT_LISTENER',
      useFactory: (achievementUnlockedListener: AchievementUnlockedListener) => {
        const rabbitMqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
        return new EventListenerService(rabbitMqUrl, achievementUnlockedListener);
      },
      inject: [AchievementUnlockedListener],
    },
  ],
  exports: ['EVENT_LISTENER'],
})
export class RewardModule {}
