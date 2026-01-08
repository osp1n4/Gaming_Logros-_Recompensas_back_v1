import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { RewardModule } from './modules/reward.module';

const logger = new Logger('RewardService');
const DEFAULT_APP_PORT = 3003;
const API_PREFIX = 'api';
const APP_PORT = parseInt(process.env.APP_PORT || String(DEFAULT_APP_PORT), 10);

async function bootstrap() {
  const app = await NestFactory.create(RewardModule);

  app.setGlobalPrefix(API_PREFIX);

  await app.listen(APP_PORT);
  logger.log(`Reward Service started on port ${APP_PORT}`);
}

bootstrap();
