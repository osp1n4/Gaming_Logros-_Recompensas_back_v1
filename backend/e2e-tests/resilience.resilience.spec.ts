import axios from 'axios';
import { E2E_CONFIG } from './config';
import { ApiClient, RabbitMQHelper, DatabaseHelper, retryAsync, sleep, waitForCondition } from './helpers';

/**
 * Resilience Tests: Error Handling and Retry Patterns
 * 
 * FASE TDD: RED
 * Estos tests validan el manejo de errores y la resiliencia del sistema
 * 
 * Validaciones:
 * 1. Manejo de errores en servicios
 * 2. Reintentos automáticos
 * 3. Timeout handling
 * 4. Circuit breaker patterns
 * 5. Duplicación de mensajes
 */

describe('Resilience Tests: Error Handling and Recovery', () => {
  let playerClient: ApiClient;
  let achievementClient: ApiClient;
  let rewardClient: ApiClient;
  let rabbitMQ: RabbitMQHelper;

  beforeAll(async () => {
    playerClient = new ApiClient(E2E_CONFIG.services.player.baseUrl);
    achievementClient = new ApiClient(E2E_CONFIG.services.achievement.baseUrl);
    rewardClient = new ApiClient(E2E_CONFIG.services.reward.baseUrl);

    rabbitMQ = new RabbitMQHelper();
    await rabbitMQ.connect();
  });

  afterAll(async () => {
    await rabbitMQ.disconnect();
  });

  describe('API Error Handling', () => {
    it('should return 404 for non-existent player', async () => {
      try {
        await axios.get(
          `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}/00000000-0000-0000-0000-000000000000`
        );
        fail('Should have thrown 404 error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toBeDefined();
      }
    });

    it('should return 400 for invalid player creation', async () => {
      try {
        await axios.put(
          `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
          {
            username: '', // Invalid: empty username
            email: 'invalid-email', // Invalid email format
          }
        );
        fail('Should have thrown 400 error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBeDefined();
      }
    });

    it('should return 400 for invalid event type', async () => {
      // Create valid player
      const playerResponse = await axios.put(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
        {
          username: `error_test_${Date.now()}`,
          email: `error_test_${Date.now()}@test.com`,
        }
      );

      const playerId = playerResponse.data.id;

      try {
        await axios.post(
          `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.events}`,
          {
            playerId,
            eventType: 'INVALID_EVENT_TYPE',
            value: 1,
          }
        );
        fail('Should have thrown 400 error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 for negative event value', async () => {
      const playerResponse = await axios.put(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
        {
          username: `negative_test_${Date.now()}`,
          email: `negative_test_${Date.now()}@test.com`,
        }
      );

      const playerId = playerResponse.data.id;

      try {
        await axios.post(
          `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.events}`,
          {
            playerId,
            eventType: 'monster_killed',
            value: -5, // Invalid: negative value
          }
        );
        fail('Should have thrown 400 error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Retry Patterns', () => {
    it('should retry API call on failure', async () => {
      let attempts = 0;

      const result = await retryAsync(async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error('Simulated failure');
        }
        return { success: true };
      }, 3, 100);

      expect(result.success).toBe(true);
      expect(attempts).toBe(2);
    });

    it('should fail after max retry attempts', async () => {
      let attempts = 0;

      try {
        await retryAsync(async () => {
          attempts++;
          throw new Error('Persistent failure');
        }, 3, 100);
        fail('Should have thrown error after retries');
      } catch (error: any) {
        expect(attempts).toBe(3);
        expect(error.message).toContain('Failed after 3 attempts');
      }
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout if achievement processing takes too long', async () => {
      const shortTimeout = 1000; // 1 second

      try {
        await waitForCondition(
          async () => {
            // This condition will never be true
            return false;
          },
          shortTimeout,
          200
        );
        fail('Should have thrown timeout error');
      } catch (error: any) {
        expect(error.message).toContain('Condition not met within timeout');
      }
    });
  });

  describe('Idempotency', () => {
    it('should not create duplicate achievements for same event', async () => {
      // Create player
      const playerResponse = await axios.put(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
        {
          username: `idempotent_test_${Date.now()}`,
          email: `idempotent_test_${Date.now()}@test.com`,
        }
      );

      const playerId = playerResponse.data.id;

      await axios.post(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.initialize}/${playerId}`
      );

      // Emit same event multiple times
      for (let i = 0; i < 3; i++) {
        await axios.post(
          `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.events}`,
          {
            playerId,
            eventType: 'monster_killed',
            value: 1,
          }
        );
      }

      await sleep(5000);

      // Check achievements - FIRST_BLOOD should only be unlocked once
      const achievements = await axios.get(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.playerAchievements}/${playerId}`
      );

      const firstBloodAchievements = achievements.data.filter(
        (a: any) => a.achievement.code === 'FIRST_BLOOD'
      );

      // Should only have one FIRST_BLOOD achievement entry
      expect(firstBloodAchievements.length).toBe(1);
      expect(firstBloodAchievements[0].unlockedAt).toBeTruthy();

      // Progress should be cumulative (3 kills)
      expect(firstBloodAchievements[0].progress).toBe(3);
    });

    it('should not assign duplicate rewards for same achievement', async () => {
      // Create player
      const playerResponse = await axios.put(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
        {
          username: `reward_idempotent_${Date.now()}`,
          email: `reward_idempotent_${Date.now()}@test.com`,
        }
      );

      const playerId = playerResponse.data.id;

      await axios.post(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.initialize}/${playerId}`
      );

      // Trigger achievement
      await axios.post(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.events}`,
        {
          playerId,
          eventType: 'monster_killed',
          value: 1,
        }
      );

      // Wait for reward assignment
      await waitForCondition(async () => {
        try {
          const rewards = await axios.get(
            `${E2E_CONFIG.services.reward.baseUrl}${E2E_CONFIG.services.reward.endpoints.rewards}/players/${playerId}`
          );
          return rewards.data.length > 0;
        } catch {
          return false;
        }
      }, 10000);

      // Get rewards
      const rewards = await axios.get(
        `${E2E_CONFIG.services.reward.baseUrl}${E2E_CONFIG.services.reward.endpoints.rewards}/players/${playerId}`
      );

      // Get achievement ID
      const achievements = await axios.get(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.playerAchievements}/${playerId}`
      );

      const firstBlood = achievements.data.find(
        (a: any) => a.achievement.code === 'FIRST_BLOOD'
      );

      // Should only have one reward for FIRST_BLOOD
      const firstBloodRewards = rewards.data.filter(
        (r: any) => r.achievementId === firstBlood.achievement.id
      );

      expect(firstBloodRewards.length).toBe(1);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent player creations', async () => {
      const concurrentRequests = 5;

      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        axios.put(
          `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
          {
            username: `concurrent_${Date.now()}_${i}`,
            email: `concurrent_${Date.now()}_${i}@test.com`,
          }
        )
      );

      const results = await Promise.all(promises);

      expect(results.length).toBe(concurrentRequests);
      results.forEach((result) => {
        expect(result.status).toBe(201);
        expect(result.data.id).toBeDefined();
      });

      // All players should have unique IDs
      const ids = results.map((r) => r.data.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(concurrentRequests);
    });

    it('should handle multiple concurrent events for same player', async () => {
      // Create player
      const playerResponse = await axios.put(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
        {
          username: `concurrent_events_${Date.now()}`,
          email: `concurrent_events_${Date.now()}@test.com`,
        }
      );

      const playerId = playerResponse.data.id;

      await axios.post(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.initialize}/${playerId}`
      );

      // Emit multiple events concurrently
      const concurrentEvents = 5;
      const promises = Array.from({ length: concurrentEvents }, () =>
        axios.post(
          `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.events}`,
          {
            playerId,
            eventType: 'monster_killed',
            value: 1,
          }
        )
      );

      const results = await Promise.all(promises);

      expect(results.length).toBe(concurrentEvents);
      results.forEach((result) => {
        expect(result.status).toBe(200);
      });

      // Wait for processing
      await sleep(5000);

      // Check final progress
      const achievements = await axios.get(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.playerAchievements}/${playerId}`
      );

      const firstBlood = achievements.data.find(
        (a: any) => a.achievement.code === 'FIRST_BLOOD'
      );

      // Progress should reflect all events
      expect(firstBlood.progress).toBe(concurrentEvents);
      expect(firstBlood.unlockedAt).toBeTruthy();
    });
  });

  describe('Message Queue Resilience', () => {
    it('should handle messages even after queue purge', async () => {
      // Purge queues
      await rabbitMQ.purgeQueue(E2E_CONFIG.rabbitmq.queues.playerEvents);
      await rabbitMQ.purgeQueue(E2E_CONFIG.rabbitmq.queues.achievementUnlocked);

      // Create player
      const playerResponse = await axios.put(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
        {
          username: `queue_test_${Date.now()}`,
          email: `queue_test_${Date.now()}@test.com`,
        }
      );

      const playerId = playerResponse.data.id;

      await axios.post(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.initialize}/${playerId}`
      );

      // Emit event after purge
      await axios.post(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.events}`,
        {
          playerId,
          eventType: 'monster_killed',
          value: 1,
        }
      );

      // System should still process the event
      await waitForCondition(async () => {
        const achievements = await axios.get(
          `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.playerAchievements}/${playerId}`
        );

        const firstBlood = achievements.data.find(
          (a: any) => a.achievement.code === 'FIRST_BLOOD' && a.unlockedAt
        );

        return !!firstBlood;
      }, 10000);

      const achievements = await axios.get(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.playerAchievements}/${playerId}`
      );

      const firstBlood = achievements.data.find(
        (a: any) => a.achievement.code === 'FIRST_BLOOD'
      );

      expect(firstBlood).toBeDefined();
      expect(firstBlood.unlockedAt).toBeTruthy();
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consistency across all databases', async () => {
      // Create player
      const playerResponse = await axios.put(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
        {
          username: `consistency_${Date.now()}`,
          email: `consistency_${Date.now()}@test.com`,
        }
      );

      const playerId = playerResponse.data.id;

      await axios.post(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.initialize}/${playerId}`
      );

      // Trigger achievement and reward
      await axios.post(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.events}`,
        {
          playerId,
          eventType: 'monster_killed',
          value: 1,
        }
      );

      await sleep(5000);

      // Verify consistency
      // 1. Player exists
      const player = await axios.get(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}/${playerId}`
      );
      expect(player.data.id).toBe(playerId);

      // 2. Achievement unlocked
      const achievements = await axios.get(
        `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.playerAchievements}/${playerId}`
      );
      const unlocked = achievements.data.filter((a: any) => a.unlockedAt);
      expect(unlocked.length).toBeGreaterThan(0);

      // 3. Reward assigned
      const rewards = await axios.get(
        `${E2E_CONFIG.services.reward.baseUrl}${E2E_CONFIG.services.reward.endpoints.rewards}/players/${playerId}`
      );
      expect(rewards.data.length).toBeGreaterThan(0);

      // 4. Balance updated
      const balance = await axios.get(
        `${E2E_CONFIG.services.reward.baseUrl}${E2E_CONFIG.services.reward.endpoints.balance}/${playerId}`
      );
      expect(balance.data.totalCoins).toBeGreaterThan(0);
    });
  });
});
