import { Injectable } from '@nestjs/common';
import { AchievementService } from '../services/achievement.service';
import { PlayerEvent } from '../interfaces/event.interface';


/**
 * Listener de eventos - Observer pattern
 * Escucha eventos de RabbitMQ y delega evaluación de logros
 */
@Injectable()
export class AchievementEventListener {
  constructor(private readonly achievementService: AchievementService) {}

  /**
   * Evalúa logros para un evento de jugador
   */
  async handlePlayerEvent(event: PlayerEvent): Promise<any[]> {
    try {
      const results = await this.achievementService.evaluateEvent(event);
      return results;
    } catch (error) {
      // Log sin lanzar excepción
      console.error(
        `Error processing player event for player ${event.playerId}:`,
        error,
      );
      return [];
    }
  }

  /**
   * Procesa mensaje de RabbitMQ (punto de entrada del listener)
   */
  async handlePlayerEventMessage(message: any): Promise<any[]> {
    try {
      const event = this.parsePlayerEvent(message);
      if (!this.isValidEvent(event)) {
        console.warn('Formato de mensaje inválido - faltan campos requeridos');
        return [];
      }
      return await this.handlePlayerEvent(event);
    } catch (error) {
      console.error('Error parsing message:', error);
      return [];
    }
  }

  /**
   * Extrae evento del mensaje RabbitMQ
   * @private
   */
  private parsePlayerEvent(message: any): PlayerEvent {
    if (message.content && typeof message.content.toString === 'function') {
      return JSON.parse(message.content.toString());
    }
    return message as PlayerEvent;
  }

  /**
   * Valida campos requeridos del evento
   * @private
   */
  private isValidEvent(event: PlayerEvent): boolean {
    return !!(event && event.playerId && event.eventType);
  }
}
