import axios from 'axios';
import { E2E_CONFIG } from './config';
import { ApiClient, RabbitMQHelper, DatabaseHelper, sleep, waitForCondition } from './helpers';

/**
 * E2E Test: Complete Flow - Player Event → Achievement → Reward
 * 
 * FASE TDD: RED
 * Este test debe FALLAR inicialmente hasta que la integración esté completa
 * 
 * Flujo a validar:
 * 1. Player Service emite evento player.event.monster_killed
 * 2. Achievement Service consume evento y evalúa reglas
 * 3. Achievement Service desbloquea logro FIRST_BLOOD (1 kill)
 * 4. Achievement Service emite evento achievement.unlocked
 * 5. Reward Service consume evento y asigna recompensa
 * 6. Reward Service actualiza balance del jugador
 */

describe('E2E: Complete Flow - Event → Achievement → Reward', () => {
  let playerClient: ApiClient;
  let achievementClient: ApiClient;
  let rewardClient: ApiClient;
  let rabbitMQ: RabbitMQHelper;
  let playerDb: DatabaseHelper;
  let achievementDb: DatabaseHelper;
  let rewardDb: DatabaseHelper;

  let testPlayerId: string;

  beforeAll(async () => {
    // Initialize API clients
    playerClient = new ApiClient(E2E_CONFIG.services.player.baseUrl);
    achievementClient = new ApiClient(E2E_CONFIG.services.achievement.baseUrl);
    rewardClient = new ApiClient(E2E_CONFIG.services.reward.baseUrl);

    // Initialize RabbitMQ
    rabbitMQ = new RabbitMQHelper();
    await rabbitMQ.connect();

    // Initialize Database connections
    playerDb = new DatabaseHelper(E2E_CONFIG.databases.player);
    achievementDb = new DatabaseHelper(E2E_CONFIG.databases.achievement);
    rewardDb = new DatabaseHelper(E2E_CONFIG.databases.reward);
  });

  afterAll(async () => {
    await rabbitMQ.disconnect();
    await playerDb.disconnect();
    await achievementDb.disconnect();
    await rewardDb.disconnect();
  });

  beforeEach(async () => {
    // Clean queues before each test
    await rabbitMQ.purgeQueue(E2E_CONFIG.rabbitmq.queues.playerEvents);
    await rabbitMQ.purgeQueue(E2E_CONFIG.rabbitmq.queues.achievementUnlocked);
  });

  describe('Scenario 1: First Blood Achievement Unlocked', () => {
    it('should complete full flow: monster killed event → FIRST_BLOOD achievement → reward assigned', async () => {
      // ARRANGE: Create a new player
      const playerResponse = await axios.put(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
        {
          username: `e2e_player_${Date.now()}`,
          email: `e2e_${Date.now()}@test.com`,
        }
      );

      expect(playerResponse.status).toBe(201);
      testPlayerId = playerResponse.data.id;

      // Initialize achievements for player
      const initResponse = await axios.post(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.initialize}/${testPlayerId}`
      );
      expect(initResponse.status).toBe(201);

      // ACT: Emit monster killed event (1 kill)
      const eventResponse = await axios.post(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.events}`,
        {
          playerId: testPlayerId,
          eventType: 'monster_killed',
          value: 1,
        }
      );

      expect(eventResponse.status).toBe(200);

      // ASSERT 1: Wait for achievement to be unlocked
      await waitForCondition(async () => {
        const achievements = await axios.get(
          `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.playerAchievements}/${testPlayerId}`
        );

        const firstBlood = achievements.data.find(
          (a: any) => a.achievement.code === 'FIRST_BLOOD' && a.unlockedAt
        );

        return !!firstBlood;
      }, E2E_CONFIG.timeouts.eventProcessing);

      // Verify achievement was unlocked
      const playerAchievements = await axios.get(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.playerAchievements}/${testPlayerId}`
      );

      const firstBloodAchievement = playerAchievements.data.find(
        (a: any) => a.achievement.code === 'FIRST_BLOOD'
      );

      expect(firstBloodAchievement).toBeDefined();
      expect(firstBloodAchievement.unlockedAt).toBeTruthy();
      expect(firstBloodAchievement.progress).toBe(1);
      expect(firstBloodAchievement.achievement.requiredValue).toBe(1);

      // ASSERT 2: Wait for reward to be assigned
      await waitForCondition(async () => {
        try {
          const rewards = await axios.get(
            `${E2E_CONFIG.services.reward.baseUrl}${E2E_CONFIG.services.reward.endpoints.rewards}/players/${testPlayerId}`
          );

          return rewards.data.length > 0;
        } catch (error) {
          return false;
        }
      }, E2E_CONFIG.timeouts.eventProcessing);

      // Verify reward was assigned
      const playerRewards = await axios.get(
        `${E2E_CONFIG.services.reward.baseUrl}${E2E_CONFIG.services.reward.endpoints.rewards}/players/${testPlayerId}`
      );

      expect(playerRewards.data.length).toBeGreaterThan(0);

      const firstBloodReward = playerRewards.data.find(
        (r: any) => r.achievementId === firstBloodAchievement.achievement.id
      );

      expect(firstBloodReward).toBeDefined();
      expect(firstBloodReward.rewardAmount).toBeGreaterThan(0);
      expect(firstBloodReward.rewardType).toBe('coins');

      // ASSERT 3: Verify player balance was updated
      const balanceResponse = await axios.get(
        `${E2E_CONFIG.services.reward.baseUrl}${E2E_CONFIG.services.reward.endpoints.balance}/${testPlayerId}`
      );

      expect(balanceResponse.data.totalCoins).toBeGreaterThan(0);
    });
  });

  describe('Scenario 2: Multiple Achievements Progression', () => {
    it('should unlock MONSTER_SLAYER_10 achievement after 10 kills', async () => {
      // ARRANGE: Create player
      const playerResponse = await axios.put(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
        {
          username: `e2e_player_multi_${Date.now()}`,
          email: `e2e_multi_${Date.now()}@test.com`,
        }
      );

      testPlayerId = playerResponse.data.id;

      await axios.post(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.initialize}/${testPlayerId}`
      );

      // ACT: Emit 10 monster killed events
      for (let i = 1; i <= 10; i++) {
        await axios.post(
          `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.events}`,
          {
            playerId: testPlayerId,
            eventType: 'monster_killed',
            value: 1,
          }
        );
        await sleep(200); // Small delay between events
      }

      // ASSERT: Wait for MONSTER_SLAYER_10 to be unlocked
      await waitForCondition(async () => {
        const achievements = await axios.get(
          `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.playerAchievements}/${testPlayerId}`
        );

        const monsterSlayer = achievements.data.find(
          (a: any) => a.achievement.code === 'MONSTER_SLAYER_10' && a.unlockedAt
        );

        return !!monsterSlayer;
      }, E2E_CONFIG.timeouts.eventProcessing * 2);

      // Verify both achievements unlocked
      const playerAchievements = await axios.get(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.playerAchievements}/${testPlayerId}`
      );

      const unlockedAchievements = playerAchievements.data.filter((a: any) => a.unlockedAt);

      expect(unlockedAchievements.length).toBeGreaterThanOrEqual(2); // FIRST_BLOOD + MONSTER_SLAYER_10
      expect(unlockedAchievements.some((a: any) => a.achievement.code === 'FIRST_BLOOD')).toBe(true);
      expect(unlockedAchievements.some((a: any) => a.achievement.code === 'MONSTER_SLAYER_10')).toBe(true);

      // Verify multiple rewards assigned
      const playerRewards = await axios.get(
        `${E2E_CONFIG.services.reward.baseUrl}${E2E_CONFIG.services.reward.endpoints.rewards}/players/${testPlayerId}`
      );

      expect(playerRewards.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Scenario 3: Time Played Achievement', () => {
    it('should unlock TIME_PLAYED_1H achievement after 60 minutes', async () => {
      // ARRANGE: Create player
      const playerResponse = await axios.put(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
        {
          username: `e2e_player_time_${Date.now()}`,
          email: `e2e_time_${Date.now()}@test.com`,
        }
      );

      testPlayerId = playerResponse.data.id;

      await axios.post(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.initialize}/${testPlayerId}`
      );

      // ACT: Emit time played event (60 minutes)
      await axios.post(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.events}`,
        {
          playerId: testPlayerId,
          eventType: 'time_played',
          value: 60,
        }
      );

      // ASSERT: Wait for TIME_PLAYED_1H to be unlocked
      await waitForCondition(async () => {
        const achievements = await axios.get(
          `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.playerAchievements}/${testPlayerId}`
        );

        const timePlayed = achievements.data.find(
          (a: any) => a.achievement.code === 'TIME_PLAYED_1H' && a.unlockedAt
        );

        return !!timePlayed;
      }, E2E_CONFIG.timeouts.eventProcessing);

      // Verify achievement
      const playerAchievements = await axios.get(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.playerAchievements}/${testPlayerId}`
      );

      const timePlayedAchievement = playerAchievements.data.find(
        (a: any) => a.achievement.code === 'TIME_PLAYED_1H'
      );

      expect(timePlayedAchievement).toBeDefined();
      expect(timePlayedAchievement.unlockedAt).toBeTruthy();
      expect(timePlayedAchievement.progress).toBe(60);

      // Verify reward assigned
      await waitForCondition(async () => {
        const rewards = await axios.get(
          `${E2E_CONFIG.services.reward.baseUrl}${E2E_CONFIG.services.reward.endpoints.rewards}/players/${testPlayerId}`
        );

        return rewards.data.length > 0;
      }, E2E_CONFIG.timeouts.eventProcessing);
    });
  });

  describe('Scenario 4: Database Persistence', () => {
    it('should persist all data across services', async () => {
      // ARRANGE: Create player
      const playerResponse = await axios.put(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
        {
          username: `e2e_player_persist_${Date.now()}`,
          email: `e2e_persist_${Date.now()}@test.com`,
        }
      );

      testPlayerId = playerResponse.data.id;

      await axios.post(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.initialize}/${testPlayerId}`
      );

      // ACT: Trigger achievement
      await axios.post(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.events}`,
        {
          playerId: testPlayerId,
          eventType: 'monster_killed',
          value: 1,
        }
      );

      await sleep(5000); // Wait for processing

      // ASSERT: Check database persistence
      // Player DB
      const playersInDb = await playerDb.query(
        'SELECT * FROM players WHERE id = $1',
        [testPlayerId]
      );
      expect(playersInDb.length).toBe(1);

      // Achievement DB
      const playerAchievementsInDb = await achievementDb.query(
        'SELECT * FROM player_achievements WHERE player_id = $1 AND unlocked_at IS NOT NULL',
        [testPlayerId]
      );
      expect(playerAchievementsInDb.length).toBeGreaterThan(0);

      // Reward DB
      const rewardsInDb = await rewardDb.query(
        'SELECT * FROM rewards WHERE player_id = $1',
        [testPlayerId]
      );
      expect(rewardsInDb.length).toBeGreaterThan(0);
    });
  });
});
