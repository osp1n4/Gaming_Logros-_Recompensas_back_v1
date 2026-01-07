// Achievement Entity
// Represents the Achievement table in PostgreSQL
// Fields:
// - id (UUID primary key)
// - player_id (UUID foreign key)
// - achievement_code (string unique key)
// - title_key (string for i18n)
// - description_key (string for i18n)
// - unlocked_at (timestamp)
// - is_temporal (boolean)
// - temporal_window_start (timestamp nullable)
// - temporal_window_end (timestamp nullable)
