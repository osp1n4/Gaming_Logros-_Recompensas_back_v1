import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from '../entities/reward.entity';
import { PlayerBalance } from '../entities/player.balance';
import { getDatabaseConfig } from '../config/database.config';
import { RewardService } from '../services/reward.service';
import { EventListener } from '../services/event.listener';
import { RewardController } from '../controllers/reward.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    TypeOrmModule.forFeature([Reward, PlayerBalance]),
  ],
  controllers: [RewardController],
  providers: [RewardService, EventListener],
})
export class RewardModule {}
