import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Player } from '../entities/player.entity';
import { PlayerController } from '../controllers/player.controller';
import { PlayerService } from '../services/player.service';
import { PlayerRepository } from '../repositories/player.repository';
import { EventPublisher } from '../events/event.publisher';

/**
 * Player Module
 * SOLID Principles:
 * - S (Single Responsibility): Module handles only player-related components
 * - D (Dependency Inversion): Uses provider tokens for abstractions
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Player]),
    ConfigModule,
  ],
  controllers: [PlayerController],
  providers: [
    PlayerService,
    {
      provide: 'IPlayerRepository',
      useClass: PlayerRepository,
    },
    {
      provide: 'IEventPublisher',
      useFactory: (configService: ConfigService) => {
        const rabbitMqUrl = configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672');
        return new EventPublisher(rabbitMqUrl);
      },
      inject: [ConfigService],
    },
  ],
  exports: [PlayerService],
})
export class PlayerModule {}

