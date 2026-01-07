// Reward Entity
// Represents the Reward table in PostgreSQL
// Fields:
// - id (UUID primary key)
// - player_id (UUID foreign key)
// - achievement_id (UUID foreign key)
// - reward_type (enum: coins, items, points, badges)
// - reward_amount (integer)
// - awarded_at (timestamp)
// - is_claimed (boolean)
