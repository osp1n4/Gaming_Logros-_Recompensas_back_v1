import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AchievementModule } from './modules/achievement.module';
import { Achievement } from './entities/achievement.entity';
import { PlayerAchievement } from './entities/player.achievement';

/**
 * Application Root Module
 * 
 * Configures:
 * - Environment variables (ConfigModule)
 * - Database connection (TypeOrmModule)
 * - Achievement business logic (AchievementModule)
 * - Health check endpoint
 */
@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configure TypeORM with PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'achievement_user',
      password: process.env.DB_PASSWORD || 'achievement_password',
      database: process.env.DB_NAME || 'achievement_db',
      entities: [Achievement, PlayerAchievement],
      synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in development
      logging: process.env.NODE_ENV === 'development',
    }),

    // Achievement business logic
    AchievementModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
