INSERT INTO achievements (code, title_key, description_key, required_value, event_type, is_active) 
VALUES 
  ('FIRST_BLOOD', 'achievement.first_blood.title', 'achievement.first_blood.desc', 1, 'MONSTER_KILLED', true),
  ('MONSTER_SLAYER', 'achievement.monster_slayer.title', 'achievement.monster_slayer.desc', 5, 'MONSTER_KILLED', true),
  ('HUNDRED_KILLS', 'achievement.hundred_kills.title', 'achievement.hundred_kills.desc', 10, 'MONSTER_KILLED', true),
  ('THOUSAND_KILLS', 'achievement.thousand_kills.title', 'achievement.thousand_kills.desc', 15, 'MONSTER_KILLED', true),
  ('NOVICE_WARRIOR', 'achievement.novice_warrior.title', 'achievement.novice_warrior.desc', 300, 'TIME_PLAYED', true),
  ('VETERAN_WARRIOR', 'achievement.veteran_warrior.title', 'achievement.veteran_warrior.desc', 3600, 'TIME_PLAYED', true),
  ('LEGENDARY_WARRIOR', 'achievement.legendary_warrior.title', 'achievement.legendary_warrior.desc', 36000, 'TIME_PLAYED', true),
  ('SPEEDRUNNER', 'achievement.speedrunner.title', 'achievement.speedrunner.desc', 50, 'MONSTER_KILLED', true),
  ('PERSISTENT_PLAYER', 'achievement.persistent_player.title', 'achievement.persistent_player.desc', 7200, 'TIME_PLAYED', true),
  ('ULTIMATE_CHAMPION', 'achievement.ultimate_champion.title', 'achievement.ultimate_champion.desc', 20, 'MONSTER_KILLED', true);
