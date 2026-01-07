import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PlayerModule } from './player.module';
import { Player } from '../entities/player.entity';

/**
 * App Module - Root Module
 * SOLID Principle S: Coordinates all application modules
 */
@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Database configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5433),
        username: configService.get<string>('DB_USER', 'player_user'),
        password: configService.get<string>('DB_PASSWORD', 'player_pass'),
        database: configService.get<string>('DB_NAME', 'player_db'),
        entities: [Player],
        synchronize: configService.get<boolean>('DB_SYNC', true), // Only for development
        logging: configService.get<boolean>('DB_LOGGING', false),
      }),
      inject: [ConfigService],
    }),
    
    // Feature modules
    PlayerModule,
  ],
})
export class AppModule {}
