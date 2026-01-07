/**
 * Player Event Interface
 * Represents events received from Player Service via RabbitMQ
 */
export interface PlayerEvent {
  playerId: string;
  eventType: string;
  value: number;
  timestamp?: Date;
}

/**
 * Achievement Evaluation Result
 */
export interface AchievementEvaluationResult {
  achieved: boolean;
  progress: number;
  achievementId: string;
  achievementCode: string;
  playerId: string;
  unlockedAt?: Date | null;
}
