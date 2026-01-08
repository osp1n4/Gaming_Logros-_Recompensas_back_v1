import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Reward } from '../entities/reward.entity';
import { PlayerBalance } from '../entities/player.balance';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres-reward',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'reward_db',
  entities: [Reward, PlayerBalance],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.DB_LOGGING === 'true',
  dropSchema: false,
});
