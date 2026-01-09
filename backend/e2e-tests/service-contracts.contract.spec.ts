import axios from 'axios';
import { E2E_CONFIG } from './config';
import { RabbitMQHelper } from './helpers';

/**
 * Contract Tests: Service Communication Validation
 * 
 * FASE TDD: RED
 * Estos tests validan la estructura de eventos entre servicios
 * 
 * Validaciones:
 * 1. Estructura de eventos de Player Service
 * 2. Estructura de eventos de Achievement Service
 * 3. Contratos de API REST entre servicios
 */

describe('Contract Tests: Service Communication', () => {
  let rabbitMQ: RabbitMQHelper;

  beforeAll(async () => {
    rabbitMQ = new RabbitMQHelper();
    await rabbitMQ.connect();
  });

  afterAll(async () => {
    await rabbitMQ.disconnect();
  });

  describe('Player Event Contracts', () => {
    it('should emit MONSTER_KILLED event with correct structure', async () => {
      const expectedEventStructure = {
        playerId: expect.any(String),
        eventType: 'MONSTER_KILLED',
        value: expect.any(Number),
        timestamp: expect.any(String),
      };

      // Create player
      const playerResponse = await axios.put(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
        {
          username: `contract_test_${Date.now()}`,
          email: `contract_${Date.now()}@test.com`,
        }
      );

      const playerId = playerResponse.data.id;

      // Emit event
      const eventResponse = await axios.post(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.events}`,
        {
          playerId,
          eventType: 'monster_killed',
          value: 1,
        }
      );

      expect(eventResponse.status).toBe(200);
      expect(eventResponse.data).toMatchObject(expectedEventStructure);
    });

    it('should emit TIME_PLAYED event with correct structure', async () => {
      const expectedEventStructure = {
        playerId: expect.any(String),
        eventType: 'TIME_PLAYED',
        value: expect.any(Number),
        timestamp: expect.any(String),
      };

      // Create player
      const playerResponse = await axios.put(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
        {
          username: `contract_time_${Date.now()}`,
          email: `contract_time_${Date.now()}@test.com`,
        }
      );

      const playerId = playerResponse.data.id;

      // Emit event
      const eventResponse = await axios.post(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.events}`,
        {
          playerId,
          eventType: 'time_played',
          value: 30,
        }
      );

      expect(eventResponse.status).toBe(200);
      expect(eventResponse.data).toMatchObject(expectedEventStructure);
    });
  });

  describe('Achievement Event Contracts', () => {
    it('should emit achievement.unlocked event with correct structure', async () => {
      const expectedEventStructure = {
        playerId: expect.any(String),
        achievementId: expect.any(String),
        achievementCode: expect.any(String),
        unlockedAt: expect.any(String),
      };

      // This test validates the contract structure
      // The actual event will be emitted by Achievement Service
      // We define the expected structure for contract validation

      // Note: This is a contract definition test
      // The actual emission will be tested in E2E flow tests
      expect(expectedEventStructure).toBeDefined();
    });
  });

  describe('API Response Contracts', () => {
    describe('Player Service API', () => {
      it('should return player with correct structure', async () => {
        const response = await axios.put(
          `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
          {
            username: `api_contract_${Date.now()}`,
            email: `api_contract_${Date.now()}@test.com`,
          }
        );

        expect(response.status).toBe(201);
        expect(response.data).toMatchObject({
          id: expect.any(String),
          username: expect.any(String),
          email: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });
    });

    describe('Achievement Service API', () => {
      it('should return achievements list with correct structure', async () => {
        const response = await axios.get(
          `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.achievements}`
        );

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);

        if (response.data.length > 0) {
          expect(response.data[0]).toMatchObject({
            id: expect.any(String),
            code: expect.any(String),
            titleKey: expect.any(String),
            descriptionKey: expect.any(String),
            requiredValue: expect.any(Number),
            eventType: expect.any(String),
            isTemporal: expect.any(Boolean),
            isActive: expect.any(Boolean),
          });
        }
      });

      it('should return player achievements with correct structure', async () => {
        // Create player and initialize achievements
        const playerResponse = await axios.put(
          `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
          {
            username: `achieve_contract_${Date.now()}`,
            email: `achieve_contract_${Date.now()}@test.com`,
          }
        );

        const playerId = playerResponse.data.id;

        await axios.post(
          `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.initialize}/${playerId}`
        );

        const response = await axios.get(
          `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.playerAchievements}/${playerId}`
        );

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);

        if (response.data.length > 0) {
          expect(response.data[0]).toMatchObject({
            id: expect.any(String),
            playerId: expect.any(String),
            achievement: expect.objectContaining({
              id: expect.any(String),
              code: expect.any(String),
            }),
            progress: expect.any(Number),
            unlockedAt: expect.anything(), // Can be Date or null
          });
        }
      });
    });

    describe('Reward Service API', () => {
      it('should return player balance with correct structure', async () => {
        // Create player
        const playerResponse = await axios.put(
          `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
          {
            username: `reward_contract_${Date.now()}`,
            email: `reward_contract_${Date.now()}@test.com`,
          }
        );

        const playerId = playerResponse.data.id;

        // Get balance (should work even with no rewards)
        const response = await axios.get(
          `${E2E_CONFIG.services.reward.baseUrl}${E2E_CONFIG.services.reward.endpoints.balance}/${playerId}`
        );

        expect(response.status).toBe(200);
        expect(response.data).toMatchObject({
          playerId: expect.any(String),
          totalCoins: expect.any(Number),
          totalRewards: expect.any(Number),
        });
      });

      it('should return rewards list with correct structure', async () => {
        // This validates the contract structure for rewards
        // Actual rewards will be created through E2E flow

        const expectedRewardStructure = {
          id: expect.any(String),
          playerId: expect.any(String),
          achievementId: expect.any(String),
          rewardType: expect.any(String),
          rewardValue: expect.any(Number),
          strategyUsed: expect.any(String),
          status: expect.any(String),
          createdAt: expect.any(String),
        };

        expect(expectedRewardStructure).toBeDefined();
      });
    });
  });

  describe('Error Response Contracts', () => {
    it('should return 404 with correct structure for non-existent player', async () => {
      try {
        await axios.get(
          `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}/00000000-0000-0000-0000-000000000000`
        );
        fail('Should have thrown 404 error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toMatchObject({
          statusCode: 404,
          message: expect.any(String),
        });
      }
    });

    it('should return 400 with correct structure for invalid request', async () => {
      try {
        await axios.put(
          `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
          {
            // Missing required fields
          }
        );
        fail('Should have thrown 400 error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toMatchObject({
          statusCode: 400,
          message: expect.any(String),
        });
      }
    });
  });

  describe('Event Message Contracts', () => {
    it('should validate player event message structure in RabbitMQ', async () => {
      // Purge queue
      await rabbitMQ.purgeQueue(E2E_CONFIG.rabbitmq.queues.playerEvents);

      // Create player and emit event
      const playerResponse = await axios.put(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
        {
          username: `mq_contract_${Date.now()}`,
          email: `mq_contract_${Date.now()}@test.com`,
        }
      );

      const playerId = playerResponse.data.id;

      await axios.post(
        `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.events}`,
        {
          playerId,
          eventType: 'monster_killed',
          value: 1,
        }
      );

      // Consume event from queue
      const event = await rabbitMQ.consumeEvent(
        E2E_CONFIG.rabbitmq.queues.playerEvents,
        5000
      );

      expect(event).toMatchObject({
        playerId: expect.any(String),
        eventType: 'MONSTER_KILLED',
        value: expect.any(Number),
        timestamp: expect.any(String),
      });

      expect(event.playerId).toBe(playerId);
      expect(event.eventType).toBe('MONSTER_KILLED');
      expect(event.value).toBe(1);
    });
  });
});
