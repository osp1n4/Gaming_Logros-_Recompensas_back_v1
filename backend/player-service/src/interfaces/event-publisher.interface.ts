import { GameEventType } from '../dtos/player.dto';

/**
 * Event Publisher Interface
 * SOLID Principle D (Dependency Inversion): Depend on abstractions
 */
export interface IEventPublisher {
  publishPlayerEvent(playerId: string, eventType: GameEventType, value: number): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}
