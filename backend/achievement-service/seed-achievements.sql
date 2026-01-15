-- Achievement Service - Seed Data SQL
-- Inserts 10 predefined achievements for testing
-- Run this directly in PostgreSQL

-- Connect to achievement_db
\c achievement_db

-- Insert 10 achievements
INSERT INTO achievements (id, code, title_key, description_key, required_value, event_type, is_temporal, temporal_window_start, temporal_window_end, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'FIRST_BLOOD', 'achievement.first_blood.title', 'achievement.first_blood.description', 1, 'MONSTER_KILLED', FALSE, NULL, NULL, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'MONSTER_SLAYER_10', 'achievement.monster_slayer_10.title', 'achievement.monster_slayer_10.description', 5, 'MONSTER_KILLED', FALSE, NULL, NULL, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'MONSTER_SLAYER_50', 'achievement.monster_slayer_50.title', 'achievement.monster_slayer_50.description', 10, 'MONSTER_KILLED', FALSE, NULL, NULL, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'MONSTER_SLAYER_100', 'achievement.monster_slayer_100.title', 'achievement.monster_slayer_100.description', 15, 'MONSTER_KILLED', FALSE, NULL, NULL, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'TIME_PLAYED_1H', 'achievement.time_played_1h.title', 'achievement.time_played_1h.description', 60, 'TIME_PLAYED', FALSE, NULL, NULL, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'TIME_PLAYED_5H', 'achievement.time_played_5h.title', 'achievement.time_played_5h.description', 300, 'TIME_PLAYED', FALSE, NULL, NULL, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'TIME_PLAYED_10H', 'achievement.time_played_10h.title', 'achievement.time_played_10h.description', 600, 'TIME_PLAYED', FALSE, NULL, NULL, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'WEEKEND_WARRIOR', 'achievement.weekend_warrior.title', 'achievement.weekend_warrior.description', 20, 'MONSTER_KILLED', TRUE, '2025-12-01 00:00:00', '2025-12-15 23:59:59', TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'SPEED_RACER', 'achievement.speed_racer.title', 'achievement.speed_racer.description', 30, 'MONSTER_KILLED', TRUE, '2026-01-05 00:00:00', '2026-01-10 23:59:59', TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'LEGENDARY_HUNTER', 'achievement.legendary_hunter.title', 'achievement.legendary_hunter.description', 20, 'MONSTER_KILLED', FALSE, NULL, NULL, TRUE, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Verify insertions
SELECT code, required_value, event_type, is_temporal FROM achievements ORDER BY required_value;
