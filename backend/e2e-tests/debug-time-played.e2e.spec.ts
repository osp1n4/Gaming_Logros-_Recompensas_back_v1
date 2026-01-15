import axios from 'axios';
import { E2E_CONFIG } from './config';
import { waitForCondition, DatabaseHelper } from './helpers';

/**
 * Debug test for TIME_PLAYED event processing
 */
describe('DEBUG: Time Played Event', () => {
  let testPlayerId: string;
  let achievementDb: DatabaseHelper;

  beforeAll(async () => {
    achievementDb = new DatabaseHelper(E2E_CONFIG.databases.achievement);
    await achievementDb.connect();
  });

  afterAll(async () => {
    await achievementDb.disconnect();
  });

  it('should show TIME_PLAYED achievements in database', async () => {
    // Check what TIME_PLAYED achievements exist
    const achievements = await achievementDb.query(
      `SELECT id, code, event_type, required_value FROM achievements WHERE event_type = 'TIME_PLAYED' ORDER BY required_value`
    );

    console.log('TIME_PLAYED achievements in database:');
    console.log(JSON.stringify(achievements.rows, null, 2));

    expect(achievements.rows.length).toBeGreaterThan(0);
  });

  it('should process time_played event and update progress', async () => {
    // Create player
    const playerResponse = await axios.put(
      `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.players}`,
      {
        username: `debug_time_${Date.now()}`,
        email: `debug_time_${Date.now()}@test.com`,
      }
    );

    testPlayerId = playerResponse.data.id;
    console.log('Created player:', testPlayerId);

    // Initialize achievements
    await axios.post(
      `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.initialize}/${testPlayerId}`
    );

    // Get initial state
    const beforeAchievements = await axios.get(
      `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.playerAchievements}/${testPlayerId}`
    );

    const timePlayedBefore = beforeAchievements.data.filter(
      (a: any) => a.achievement.event_type === 'TIME_PLAYED'
    );

    console.log('\nTIME_PLAYED achievements BEFORE event:');
    console.log(JSON.stringify(timePlayedBefore.map((a: any) => ({
      code: a.achievement.code,
      requiredValue: a.achievement.requiredValue,
      progress: a.progress,
      unlocked: !!a.unlockedAt
    })), null, 2));

    // Emit event
    console.log('\nEmitting time_played event with value 60...');
    const eventResponse = await axios.post(
      `${E2E_CONFIG.services.player.baseUrl}${E2E_CONFIG.services.player.endpoints.events}`,
      {
        playerId: testPlayerId,
        eventType: 'time_played',
        value: 60,
      }
    );

    console.log('Event response status:', eventResponse.status);

    // Wait a bit for processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get final state
    const afterAchievements = await axios.get(
      `${E2E_CONFIG.services.achievement.baseUrl}${E2E_CONFIG.services.achievement.endpoints.playerAchievements}/${testPlayerId}`
    );

    const timePlayedAfter = afterAchievements.data.filter(
      (a: any) => a.achievement.event_type === 'TIME_PLAYED'
    );

    console.log('\nTIME_PLAYED achievements AFTER event:');
    console.log(JSON.stringify(timePlayedAfter.map((a: any) => ({
      code: a.achievement.code,
      requiredValue: a.achievement.requiredValue,
      progress: a.progress,
      unlocked: !!a.unlockedAt
    })), null, 2));

    // Check if any progress was made
    const progressMade = timePlayedAfter.some((a: any) => a.progress > 0);
    console.log('\nProgress made:', progressMade);

    expect(progressMade).toBe(true);
  });
});
