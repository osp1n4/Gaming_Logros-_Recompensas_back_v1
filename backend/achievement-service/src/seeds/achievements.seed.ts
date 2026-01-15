import { DataSource } from 'typeorm';
import { Achievement } from '../entities/achievement.entity';

/**
 * Achievement Seed Data
 * Inserts 10 predefined achievements for testing
 */
export async function seedAchievements(dataSource: DataSource): Promise<void> {
  const achievementRepository = dataSource.getRepository(Achievement);

  const achievements = [
    {
      code: 'FIRST_BLOOD',
      titleKey: 'achievement.first_blood.title',
      descriptionKey: 'achievement.first_blood.description',
      requiredValue: 1,
      eventType: 'MONSTER_KILLED',
      isTemporal: false,
      temporalWindowStart: null,
      temporalWindowEnd: null,
      isActive: true,
    },
    {
      code: 'MONSTER_SLAYER_10',
      titleKey: 'achievement.monster_slayer_10.title',
      descriptionKey: 'achievement.monster_slayer_10.description',
      requiredValue: 10,
      eventType: 'MONSTER_KILLED',
      isTemporal: false,
      temporalWindowStart: null,
      temporalWindowEnd: null,
      isActive: true,
    },
    {
      code: 'MONSTER_SLAYER_50',
      titleKey: 'achievement.monster_slayer_50.title',
      descriptionKey: 'achievement.monster_slayer_50.description',
      requiredValue: 50,
      eventType: 'MONSTER_KILLED',
      isTemporal: false,
      temporalWindowStart: null,
      temporalWindowEnd: null,
      isActive: true,
    },
    {
      code: 'MONSTER_SLAYER_100',
      titleKey: 'achievement.monster_slayer_100.title',
      descriptionKey: 'achievement.monster_slayer_100.description',
      requiredValue: 100,
      eventType: 'MONSTER_KILLED',
      isTemporal: false,
      temporalWindowStart: null,
      temporalWindowEnd: null,
      isActive: true,
    },
    {
      code: 'TIME_PLAYED_1H',
      titleKey: 'achievement.time_played_1h.title',
      descriptionKey: 'achievement.time_played_1h.description',
      requiredValue: 60,
      eventType: 'TIME_PLAYED',
      isTemporal: false,
      temporalWindowStart: null,
      temporalWindowEnd: null,
      isActive: true,
    },
    {
      code: 'TIME_PLAYED_5H',
      titleKey: 'achievement.time_played_5h.title',
      descriptionKey: 'achievement.time_played_5h.description',
      requiredValue: 300,
      eventType: 'TIME_PLAYED',
      isTemporal: false,
      temporalWindowStart: null,
      temporalWindowEnd: null,
      isActive: true,
    },
    {
      code: 'TIME_PLAYED_10H',
      titleKey: 'achievement.time_played_10h.title',
      descriptionKey: 'achievement.time_played_10h.description',
      requiredValue: 600,
      eventType: 'TIME_PLAYED',
      isTemporal: false,
      temporalWindowStart: null,
      temporalWindowEnd: null,
      isActive: true,
    },
    {
      code: 'WEEKEND_WARRIOR',
      titleKey: 'achievement.weekend_warrior.title',
      descriptionKey: 'achievement.weekend_warrior.description',
      requiredValue: 20,
      eventType: 'MONSTER_KILLED',
      isTemporal: true,
      temporalWindowStart: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      temporalWindowEnd: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      isActive: true,
    },
    {
      code: 'SPEED_RACER',
      titleKey: 'achievement.speed_racer.title',
      descriptionKey: 'achievement.speed_racer.description',
      requiredValue: 30,
      eventType: 'MONSTER_KILLED',
      isTemporal: true,
      temporalWindowStart: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      temporalWindowEnd: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      isActive: true,
    },
    {
      code: 'LEGENDARY_HUNTER',
      titleKey: 'achievement.legendary_hunter.title',
      descriptionKey: 'achievement.legendary_hunter.description',
      requiredValue: 500,
      eventType: 'MONSTER_KILLED',
      isTemporal: false,
      temporalWindowStart: null,
      temporalWindowEnd: null,
      isActive: true,
    },
  ];

  for (const achievementData of achievements) {
    const existing = await achievementRepository.findOne({
      where: { code: achievementData.code },
    });

    if (!existing) {
      const achievement = achievementRepository.create(achievementData);
      await achievementRepository.save(achievement);
      console.log(`✅ Achievement created: ${achievementData.code}`);
    } else {
      console.log(`⏭️  Achievement already exists: ${achievementData.code}`);
    }
  }

  console.log('\n✅ Seed data completed for achievements!');
}
