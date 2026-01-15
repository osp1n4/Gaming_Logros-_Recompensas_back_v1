/**
 * E2E Test Configuration
 * Configuración centralizada para tests de integración
 */

export const E2E_CONFIG = {
  services: {
    player: {
      baseUrl: process.env.PLAYER_SERVICE_URL || 'http://localhost:3001',
      endpoints: {
        players: '/players',
        events: '/players/events',
      },
    },
    achievement: {
      baseUrl: process.env.ACHIEVEMENT_SERVICE_URL || 'http://localhost:3002',
      endpoints: {
        achievements: '/api/achievements',
        initialize: '/api/achievements/initialize',
        playerAchievements: '/api/achievements/players',
        progress: '/api/achievements/players',
      },
    },
    reward: {
      baseUrl: process.env.REWARD_SERVICE_URL || 'http://localhost:3003',
      endpoints: {
        rewards: '/api/rewards',
        assign: '/api/rewards/assign',
        balance: '/api/rewards/balance',
      },
    },
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    exchanges: {
      playerEvents: 'player_events',
      achievementEvents: 'achievement_events',
    },
    queues: {
      playerEvents: 'player.events',
      achievementUnlocked: 'achievement.unlocked',
    },
    routingKeys: {
      monsterKilled: 'player.event.monster_killed',
      timePlayed: 'player.event.time_played',
      achievementUnlocked: 'achievement.unlocked',
    },
  },
  databases: {
    player: {
      host: process.env.PLAYER_DB_HOST || 'localhost',
      port: parseInt(process.env.PLAYER_DB_PORT || '5433'),
      database: process.env.PLAYER_DB_NAME || 'player_db',
      user: process.env.PLAYER_DB_USER || 'player_user',
      password: process.env.PLAYER_DB_PASSWORD || 'player_password',
    },
    achievement: {
      host: process.env.ACHIEVEMENT_DB_HOST || 'localhost',
      port: parseInt(process.env.ACHIEVEMENT_DB_PORT || '5434'),
      database: process.env.ACHIEVEMENT_DB_NAME || 'achievement_db',
      user: process.env.ACHIEVEMENT_DB_USER || 'achievement_user',
      password: process.env.ACHIEVEMENT_DB_PASSWORD || 'achievement_password',
    },
    reward: {
      host: process.env.REWARD_DB_HOST || 'localhost',
      port: parseInt(process.env.REWARD_DB_PORT || '5435'),
      database: process.env.REWARD_DB_NAME || 'reward_db',
      user: process.env.REWARD_DB_USER || 'reward_user',
      password: process.env.REWARD_DB_PASSWORD || 'reward_password',
    },
  },
  timeouts: {
    apiCall: 5000,
    eventProcessing: 15000,
    databaseQuery: 3000,
  },
  retries: {
    maxAttempts: 3,
    delayMs: 1000,
  },
};
