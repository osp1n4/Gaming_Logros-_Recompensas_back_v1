import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { RewardModule } from './modules/reward.module';

const logger = new Logger('RewardService');
const APP_PORT = process.env.APP_PORT || 3003;

async function bootstrap() {
  const app = await NestFactory.create(RewardModule);

  app.setGlobalPrefix('api');

  await app.listen(APP_PORT);
  logger.log(`Reward Service started on port ${APP_PORT}`);
}

bootstrap();
