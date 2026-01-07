# Configuración de RabbitMQ

## Exchanges
- **player_events** (topic) - Eventos del servicio de jugadores
- **achievement_events** (topic) - Eventos del servicio de logros
- **reward_events** (topic) - Eventos del servicio de recompensas

## Queues
- **player_events** - Cola para eventos de jugadores
- **achievement_events** - Cola para eventos de logros
- **reward_events** - Cola para eventos de recompensas

## Bindings
- player_events queue → player_events exchange (key: #)
- achievement_events queue → achievement_events exchange (key: #)

## Message Format (JSON)
```json
{
  "eventId": "uuid",
  "eventType": "string",
  "timestamp": "ISO-8601",
  "payload": {
    "playerId": "uuid",
    "data": {}
  }
}
```
