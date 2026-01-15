import { Injectable, Inject } from '@nestjs/common';
import { AchievementEvaluationResult } from '../interfaces/event.interface';

/**
 * Publicador de eventos de logro
 * Aplicación de principios SOLID:
 * - Responsabilidad Única: Solo publica eventos achievement.unlocked a RabbitMQ
 * - Inversión de Dependencias: Depende del token de inyección AMQP_CONNECTION
 * - Abierto/Cerrado: Fácil de extender para nuevos tipos de eventos sin modificar esta clase
 */
@Injectable()
export class AchievementEventPublisher {
  private readonly EXCHANGE_NAME = 'achievement-service';
  private readonly ROUTING_KEY = 'achievement.unlocked';
  private readonly EXCHANGE_TYPE = 'topic';

  constructor(
    @Inject('AMQP_CONNECTION')
    private readonly amqpConnection: any,
  ) {}

  /**
   * Publica evento achievement.unlocked en RabbitMQ
   * Solo publica si el logro fue realmente desbloqueado (achieved: true)
   *
   * @param result Resultado de la evaluación del logro
   * @param metadata Metadatos opcionales para incluir en el evento
   */
  async publishAchievementUnlocked(
    result: AchievementEvaluationResult,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      // Solo publicar si el logro fue desbloqueado
      if (!result.achieved) {
        return;
      }

      // Construir y publicar evento
      const event = this.buildAchievementUnlockedEvent(result, metadata);
      await this.publishToExchange(event);
    } catch (error) {
      // Registrar error pero no lanzar - permitir que el servicio continúe
      console.error('Error publishing achievement.unlocked event:', error);
    }
  }

  /**
   * Publica en lote múltiples eventos achievement.unlocked
   *
   * @param results Array de resultados de evaluación de logros
   * @param metadata Metadatos opcionales para incluir en cada evento
   */
  async publishAchievementUnlockedBatch(
    results: AchievementEvaluationResult[],
    metadata?: Record<string, any>,
  ): Promise<void> {
    for (const result of results) {
      await this.publishAchievementUnlocked(result, metadata);
    }
  }

  /**
   * Construye el mensaje de evento achievement.unlocked
   * @private
   */
  private buildAchievementUnlockedEvent(
    result: AchievementEvaluationResult,
    metadata?: Record<string, any>,
  ): Record<string, any> {
    const event: Record<string, any> = {
      eventType: 'ACHIEVEMENT_UNLOCKED',
      playerId: result.playerId,
      achievementId: result.achievementId,
      achievementCode: result.achievementCode,
      progress: result.progress,
      timestamp: new Date().toISOString(),
    };

    if (metadata) {
      event.metadata = metadata;
    }

    return event;
  }

  /**
   * Publish event to RabbitMQ exchange
   * @private
   */
  private async publishToExchange(event: Record<string, any>): Promise<void> {
    const channel = await this.amqpConnection.createChannel();

    // Asegurar que el exchange existe
    await channel.assertExchange(this.EXCHANGE_NAME, this.EXCHANGE_TYPE, {
      durable: true,
    });

    // Publicar mensaje en el exchange
    channel.publish(
      this.EXCHANGE_NAME,
      this.ROUTING_KEY,
      Buffer.from(JSON.stringify(event)),
      {
        persistent: true,
        contentType: 'application/json',
      },
    );
  }
}
