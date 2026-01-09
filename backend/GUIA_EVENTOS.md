# 📡 Guía Completa de Eventos

## 📋 Tabla de Contenidos

1. [Introducción a Eventos](#introducción-a-eventos)
2. [Arquitectura Event-Driven](#arquitectura-event-driven)
3. [Tipos de Eventos](#tipos-de-eventos)
4. [Esquemas y Ejemplos](#esquemas-y-ejemplos)
5. [Publicación de Eventos](#publicación-de-eventos)
6. [Consumición de Eventos](#consumición-de-eventos)
7. [Manejo de Errores](#manejo-de-errores)
8. [Monitoreo de Eventos](#monitoreo-de-eventos)

---

## 🎯 Introducción a Eventos

### ¿Qué es un Evento?

Un **evento** es una notificación asincrónica de que algo importante ocurrió en el sistema:

```
┌──────────────────────────────────────────────────────┐
│              PLAYER SERVICE                          │
│  - Jugador mata monstruo                             │
│  - Emite: "player.event.monster_killed"             │
│  └─→ EVENT 1: PlayerEventDTO ──→ RabbitMQ          │
└──────────────────────────────────────────────────────┘
                       ↓ (Topic Exchange)
        ┌──────────────┴───────────────┐
        ↓                              ↓
   ┌────────────────┐         ┌──────────────────┐
   │ ACHIEVEMENT    │         │ OTHER SERVICES   │
   │ SERVICE        │         │ (Futuros)        │
   │ - Evalúa logros│         └──────────────────┘
   │ - Emite evento │
   │   "achievement │
   │    .unlocked"  │
   └────────────────┘
        ↓
   ┌──────────────────┐
   │ REWARD SERVICE   │
   │ - Calcula premio │
   │ - Asigna puntos  │
   └──────────────────┘
```

### Ventajas del Diseño Event-Driven

✅ **Desacoplamiento:** Servicios no se conocen directamente  
✅ **Escalabilidad:** Fácil agregar nuevos consumidores  
✅ **Asincronía:** Operaciones no bloqueantes  
✅ **Trazabilidad:** Auditoría completa de eventos  
✅ **Resiliencia:** Reintentos automáticos  

---

## 🏗️ Arquitectura Event-Driven

### Flujo Completo de Eventos

```
┌─────────────────────────────────────────────────────────────┐
│                    PLAYER SERVICE                           │
│  POST /players/{id}/event                                   │
│  {                                                          │
│    "type": "monster_killed",                               │
│    "data": { "monsterId": "dragon_1", "points": 500 }     │
│  }                                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
    ┌──────────────────┴──────────────────┐
    │  EventPublisher.publish()            │
    │  1. Conectar a RabbitMQ             │
    │  2. Enviar a exchange "player.events"│
    │  3. Esperar ACK de broker           │
    └──────────────────┬──────────────────┘
                       │
        ┌──────────────┴───────────────┐
        │ RabbitMQ Topic Exchange       │
        │ "player.events"               │
        │ (Routing: player.event.*)    │
        └──────────────┬───────────────┘
                       │
        ┌──────────────┴───────────────┐
        │                              │
        ↓ Queue: achievement.          ↓ Queue: (otros)
          player-events              
        │                              
        ↓ EventListenerService         
    ┌──────────────────────┐          
    │ ACHIEVEMENT SERVICE  │          
    │ 1. Consume evento    │          
    │ 2. Evalúa reglas:    │          
    │    - MonsterKillRule │          
    │    - TimePlayedRule  │          
    │ 3. Si logro cumplido:│          
    │    - Crear logro     │          
    │    - Publicar        │          
    │      achievement.    │          
    │      unlocked        │          
    │ 4. ACK al broker     │          
    └──────────┬───────────┘          
               │
    ┌──────────┴──────────┐
    │ RabbitMQ Topic      │
    │ "achievement.events"│
    │ (Routing:           │
    │  achievement.*)    │
    └──────────┬──────────┘
               │
        ┌──────┴────────┐
        │               │
        ↓ Queue: reward.│ Queue: (otros)
          achievement-  │
          events        │
        │               │
        ↓ EventListener
    ┌──────────────────────┐
    │ REWARD SERVICE       │
    │ 1. Consume evento    │
    │ 2. Calcula recompensa│
    │    con estrategia    │
    │ 3. Asigna puntos     │
    │ 4. ACK al broker     │
    └──────────────────────┘
```

### Componentes de Infraestructura

```javascript
// Exchanges (Productores publican aquí)
- "player.events"      (Topic)      ← Player Service
- "achievement.events" (Topic)      ← Achievement Service

// Colas (Consumidores leen aquí)
- "achievement.player-events"       ← Binding: "player.event.*"
- "reward.achievement-events"       ← Binding: "achievement.*"

// Características
- Durable: true        (Persiste en reinicio)
- Auto-delete: false   (No se elimina solo)
- Exclusive: false     (Múltiples consumidores)
- Ack Mode: Manual     (Confirmar manual)
```

---

## 📨 Tipos de Eventos

### 1. Eventos de Player Service

#### 1.1 Player Created
```json
{
  "type": "player.created",
  "playerId": "uuid-1234",
  "name": "Juan",
  "email": "juan@game.com",
  "level": 1,
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "player-service"
}
```

**Cuándo:** Cuando se crea un nuevo jugador  
**Consumidores:** Achievement Service, Reward Service  
**Garantía:** At-least-once  

---

#### 1.2 Player Event (Monster Killed)
```json
{
  "type": "player.event.monster_killed",
  "playerId": "uuid-1234",
  "eventData": {
    "monsterId": "dragon_1",
    "monsterType": "dragon",
    "pointsEarned": 500,
    "difficulty": "hard",
    "timeToKill": 120
  },
  "timestamp": "2024-01-15T10:35:45Z",
  "source": "player-service"
}
```

**Cuándo:** Cuando un jugador mata un monstruo  
**Consumidores:** Achievement Service  
**Garantía:** At-least-once  
**Reglas Activadas:**
- `MonsterKillRule`: Si monstruos_matados >= 5 → Logro "Cazador"

---

#### 1.3 Player Event (Time Played)
```json
{
  "type": "player.event.time_played",
  "playerId": "uuid-1234",
  "eventData": {
    "sessionDuration": 3600,
    "totalPlayTime": 7200,
    "level": 5
  },
  "timestamp": "2024-01-15T11:35:45Z",
  "source": "player-service"
}
```

**Cuándo:** Cuando se reporta tiempo de juego  
**Consumidores:** Achievement Service  
**Garantía:** At-least-once  
**Reglas Activadas:**
- `TimePlayedRule`: Si tiempo_total >= 3600s → Logro "Maratón"

---

### 2. Eventos de Achievement Service

#### 2.1 Achievement Unlocked
```json
{
  "type": "achievement.unlocked",
  "playerId": "uuid-1234",
  "achievement": {
    "id": "achievement-1",
    "name": "Cazador",
    "description": "Mata 5 monstruos",
    "points": 100,
    "ruleType": "MonsterKillRule",
    "unlockedAt": "2024-01-15T10:40:00Z"
  },
  "timestamp": "2024-01-15T10:40:00Z",
  "source": "achievement-service"
}
```

**Cuándo:** Cuando se desbloquea un logro  
**Consumidores:** Reward Service, Analytics Service (futuro)  
**Garantía:** At-least-once  

---

#### 2.2 Achievement Progress
```json
{
  "type": "achievement.progress",
  "playerId": "uuid-1234",
  "achievement": {
    "id": "achievement-1",
    "name": "Cazador",
    "progress": 3,
    "target": 5,
    "percentage": 60
  },
  "timestamp": "2024-01-15T10:35:00Z",
  "source": "achievement-service"
}
```

**Nota:** Actualmente no publicado (Fase 7+)

---

### 3. Eventos de Reward Service

#### 3.1 Reward Assigned
```json
{
  "type": "reward.assigned",
  "playerId": "uuid-1234",
  "achievement": {
    "id": "achievement-1",
    "name": "Cazador"
  },
  "reward": {
    "id": "reward-1",
    "points": 100,
    "multiplier": 1.0,
    "basePoints": 100,
    "strategy": "fixed"
  },
  "timestamp": "2024-01-15T10:40:05Z",
  "source": "reward-service"
}
```

**Cuándo:** Cuando se asignan puntos de recompensa  
**Consumidores:** Analytics Service (futuro)  
**Garantía:** At-least-once  

---

## 💾 Esquemas y Ejemplos

### Estructura Base de Evento

```typescript
interface GameEvent {
  type: string;                    // Tipo identificador
  playerId: string;                // ID del jugador
  eventData?: Record<string, any>; // Datos específicos
  timestamp: string;               // ISO 8601 format
  source: string;                  // Servicio origen
  traceId?: string;                // ID de rastreo
  correlationId?: string;           // ID de correlación
}
```

### Validaciones Requeridas

```typescript
// ✅ Válido
{
  "type": "player.event.monster_killed",
  "playerId": "550e8400-e29b-41d4-a716-446655440000",
  "eventData": {
    "monsterId": "dragon_1",
    "pointsEarned": 500
  },
  "timestamp": "2024-01-15T10:35:45Z",
  "source": "player-service"
}

// ❌ Inválido (playerId faltante)
{
  "type": "player.event.monster_killed",
  "eventData": { "monsterId": "dragon_1" },
  "timestamp": "2024-01-15T10:35:45Z"
}

// ❌ Inválido (timestamp mal formado)
{
  "type": "player.event.monster_killed",
  "playerId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2024-01-15 10:35:45"  // Debe ser ISO 8601
}
```

---

## 📤 Publicación de Eventos

### Desde Player Service

#### Método 1: Controlador REST

```typescript
// POST /players/{id}/event
@Post(':id/event')
async publishEvent(
  @Param('id') id: string,
  @Body() eventDto: GameEventDTO
) {
  const player = await this.playerService.findById(id);
  await this.eventPublisher.publish({
    type: eventDto.type,
    playerId: id,
    eventData: eventDto.data,
    timestamp: new Date().toISOString(),
    source: 'player-service'
  });
  return { success: true, message: 'Evento publicado' };
}
```

#### Método 2: Servicio Directo

```typescript
// En player.service.ts
async killMonster(playerId: string, monsterId: string) {
  // Lógica de negocio
  const monster = await this.monsterRepository.findById(monsterId);
  
  // Publicar evento
  await this.eventPublisher.publish({
    type: 'player.event.monster_killed',
    playerId,
    eventData: {
      monsterId,
      pointsEarned: monster.points,
      difficulty: monster.difficulty
    },
    timestamp: new Date().toISOString(),
    source: 'player-service'
  });
}
```

#### Implementación EventPublisher

```typescript
// event.publisher.ts
@Injectable()
export class EventPublisher {
  private channel: any;
  private exchange = 'player.events';
  private exchangeType = 'topic';

  async publish(event: GameEvent) {
    try {
      // 1. Conectar a RabbitMQ
      const connection = await amqp.connect('amqp://rabbitmq:5672');
      this.channel = await connection.createChannel();

      // 2. Declarar exchange
      await this.channel.assertExchange(
        this.exchange,
        this.exchangeType,
        { durable: true }
      );

      // 3. Enviar mensaje
      const routingKey = event.type; // "player.event.monster_killed"
      const message = JSON.stringify(event);
      
      this.channel.publish(
        this.exchange,
        routingKey,
        Buffer.from(message),
        { persistent: true, contentType: 'application/json' }
      );

      console.log(`📤 [PUBLISH] ${event.type} → ${routingKey}`);

      // 4. Desconectar
      await this.channel.close();
      await connection.close();
    } catch (error) {
      console.error(`❌ [ERROR] Publishing event: ${error.message}`);
      throw error;
    }
  }
}
```

### Desde Achievement Service

```typescript
// achievement.event.publisher.ts
@Injectable()
export class AchievementEventPublisher {
  async publishUnlocked(playerId: string, achievement: Achievement) {
    const event = {
      type: 'achievement.unlocked',
      playerId,
      achievement: {
        id: achievement.id,
        name: achievement.name,
        points: achievement.points
      },
      timestamp: new Date().toISOString(),
      source: 'achievement-service'
    };

    await this.publishToRabbitMQ(
      event,
      'achievement.events',
      'achievement.unlocked'
    );
  }

  private async publishToRabbitMQ(
    event: any,
    exchange: string,
    routingKey: string
  ) {
    const connection = await amqp.connect('amqp://rabbitmq:5672');
    const channel = await connection.createChannel();

    await channel.assertExchange(exchange, 'topic', { durable: true });
    
    channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      { persistent: true }
    );

    console.log(`📤 [PUBLISH] ${event.type}`);
    
    await channel.close();
    await connection.close();
  }
}
```

---

## 📥 Consumición de Eventos

### En Achievement Service

```typescript
// event.listener.ts
@Injectable()
export class EventListenerService implements OnModuleInit {
  private channel: any;
  private connection: any;
  private exchange = 'player.events';
  private queue = 'achievement.player-events';
  private routingKey = 'player.event.*';

  constructor(
    private achievementRuleEngine: AchievementRuleEngine
  ) {}

  async onModuleInit() {
    await this.connect();
    await this.startListening();
  }

  private async connect() {
    try {
      this.connection = await amqp.connect('amqp://rabbitmq:5672');
      this.channel = await this.connection.createChannel();
      console.log('✅ [SUCCESS] Conectado a RabbitMQ');
    } catch (error) {
      console.error(`❌ [ERROR] Conexión RabbitMQ: ${error.message}`);
      setTimeout(() => this.connect(), 5000); // Reintentar
    }
  }

  private async startListening() {
    try {
      // 1. Declarar exchange
      await this.channel.assertExchange(
        this.exchange,
        'topic',
        { durable: true }
      );

      // 2. Declarar cola
      await this.channel.assertQueue(this.queue, { durable: true });

      // 3. Vincular cola a exchange
      await this.channel.bindQueue(
        this.queue,
        this.exchange,
        this.routingKey
      );

      console.log(`📥 [CONSUME] Escuchando: ${this.routingKey}`);

      // 4. Consumir mensajes
      await this.channel.consume(this.queue, async (message) => {
        if (message) {
          try {
            const event = JSON.parse(message.content.toString());
            console.log(`📥 [CONSUME] Evento recibido: ${event.type}`);

            // Procesar evento
            await this.handlePlayerEvent(event);

            // Confirmar al broker
            this.channel.ack(message);
            console.log(`✅ [SUCCESS] Evento procesado`);
          } catch (error) {
            console.error(`❌ [ERROR] ${error.message}`);
            // Rechazar y devolver a cola
            this.channel.nack(message, false, true);
          }
        }
      });
    } catch (error) {
      console.error(`❌ [ERROR] Iniciando listener: ${error.message}`);
    }
  }

  private async handlePlayerEvent(event: any) {
    const { type, playerId, eventData } = event;

    // Evaluar reglas según tipo de evento
    if (type === 'player.event.monster_killed') {
      await this.achievementRuleEngine.evaluateMonsterKill(
        playerId,
        eventData
      );
    } else if (type === 'player.event.time_played') {
      await this.achievementRuleEngine.evaluateTimePlayed(
        playerId,
        eventData
      );
    }
  }

  // Graceful shutdown
  async onModuleDestroy() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    console.log('🔌 [DISCONNECT] Desconectado de RabbitMQ');
  }
}
```

### En Reward Service

```typescript
// event.listener.ts
@Injectable()
export class EventListenerService {
  async handleMessage(message: any) {
    try {
      const event = JSON.parse(message.content.toString());
      const { type, playerId, achievement } = event;

      if (type === 'achievement.unlocked') {
        console.log(`🏆 [ACHIEVEMENT] ${achievement.name}`);

        // Calcular recompensa según estrategia
        const strategy = this.getRewardStrategy();
        const points = await strategy.calculate(
          playerId,
          achievement
        );

        // Asignar recompensa
        await this.rewardService.assignReward(
          playerId,
          achievement.id,
          points
        );

        console.log(`💰 [REWARD] ${points} puntos asignados`);
      }

      // Confirmar consumo
      this.channel.ack(message);
    } catch (error) {
      console.error(`❌ [ERROR] ${error.message}`);
      this.channel.nack(message, false, true);
    }
  }
}
```

---

## 🚨 Manejo de Errores

### Estrategias de Reintentos

```typescript
// Reintentos exponenciales
async publishWithRetry(event: GameEvent, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await this.publish(event);
      return; // Éxito
    } catch (error) {
      lastError = error;
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.warn(
        `⚠️ [RETRY] Intento ${attempt}/${maxRetries}, esperando ${delay}ms`
      );
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  throw new Error(`Falló después de ${maxRetries} intentos: ${lastError.message}`);
}
```

### Dead Letter Queues (DLQ)

```typescript
// Para eventos no procesables
const dlx = 'dlx.gaming-events';
const dlq = 'dlq.failed-events';

// Configurar queue con DLX
await channel.assertQueue(queue, {
  durable: true,
  arguments: {
    'x-dead-letter-exchange': dlx,
    'x-message-ttl': 86400000 // 24 horas
  }
});

// Configurar DLQ
await channel.assertExchange(dlx, 'direct', { durable: true });
await channel.assertQueue(dlq, { durable: true });
await channel.bindQueue(dlq, dlx, 'failed');
```

### Logging de Errores

```typescript
try {
  await this.channel.publish(...);
} catch (error) {
  console.error({
    timestamp: new Date().toISOString(),
    error: error.message,
    event: {
      type: event.type,
      playerId: event.playerId
    },
    context: 'EventPublisher.publish',
    severity: 'ERROR'
  });
  
  // Enviar a servicio de logging/monitoring
  await this.logService.error({
    message: error.message,
    event,
    stack: error.stack
  });
}
```

---

## 📊 Monitoreo de Eventos

### RabbitMQ Management UI

Acceder a: **http://localhost:15672**

```
Usuario: guest
Contraseña: guest
```

**Métricas Disponibles:**

1. **Exchanges**
   - `player.events` → Ver publicaciones
   - `achievement.events` → Ver publicaciones

2. **Queues**
   - `achievement.player-events` → Ready, Unacked, Total
   - `reward.achievement-events` → Ready, Unacked, Total

3. **Connections**
   - Estado de conexiones de cada servicio
   - Bytes enviados/recibidos

### Comandos CLI RabbitMQ

```bash
# Listar colas
docker-compose exec rabbitmq rabbitmqctl list_queues name messages consumers

# Ver exchanges
docker-compose exec rabbitmq rabbitmqctl list_exchanges

# Ver bindings
docker-compose exec rabbitmq rabbitmqctl list_bindings

# Monitoreo en tiempo real
watch -n 1 'docker-compose exec rabbitmq rabbitmqctl list_queues'

# Purgar cola (limpiar todos los mensajes)
docker-compose exec rabbitmq rabbitmqctl purge_queue achievement.player-events
```

### Logging Centralizado

```bash
# Ver logs en tiempo real
docker-compose logs -f --timestamps player-service achievement-service reward-service

# Buscar eventos específicos
docker-compose logs | grep "📤 \[PUBLISH\]"
docker-compose logs | grep "📥 \[CONSUME\]"
docker-compose logs | grep "🏆 \[ACHIEVEMENT\]"
docker-compose logs | grep "❌ \[ERROR\]"

# Exportar a archivo
docker-compose logs --timestamps > eventos.log
```

### Métricas de Eventos

```typescript
// Contador de eventos publicados
interface EventMetrics {
  totalPublished: number;
  totalConsumed: number;
  averageLatency: number; // ms
  errorRate: number; // %
  retryCount: number;
}

// Exportar métricas
console.log({
  'player.events.published': 150,
  'achievement.unlocked.published': 23,
  'achievement.consumed': 23,
  'reward.assigned': 23,
  'average_latency_ms': 245,
  'error_rate_percent': 0.5
});
```

---

## 📚 Referencia Rápida

| Evento | Publicador | Consumidor | Routing Key | Garantía |
|--------|-----------|-----------|-------------|----------|
| Player Created | Player | Varios | `player.created` | At-least-once |
| Monster Killed | Player | Achievement | `player.event.monster_killed` | At-least-once |
| Time Played | Player | Achievement | `player.event.time_played` | At-least-once |
| Achievement Unlocked | Achievement | Reward | `achievement.unlocked` | At-least-once |

---

**Última actualización:** Fase 6 - Observabilidad y Documentación
