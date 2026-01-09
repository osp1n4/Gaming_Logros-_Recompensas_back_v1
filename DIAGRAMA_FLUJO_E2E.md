# Diagrama de Flujo End-to-End - Sistema de Logros y Recompensas

## Flujo Completo: Desde Acción del Jugador hasta Recompensa

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente/Frontend
    participant PS as Player Service
    participant PS_DB as Player DB
    participant RMQ_P as RabbitMQ<br/>player.events
    participant AS as Achievement Service
    participant AS_DB as Achievement DB
    participant RMQ_A as RabbitMQ<br/>achievement.events
    participant RS as Reward Service
    participant RS_DB as Reward DB

    rect rgb(200, 220, 255)
        Note over Client,PS_DB: FASE 1: Registro de Jugador
        Client->>+PS: POST /players<br/>{username, email}
        PS->>PS_DB: INSERT INTO players
        PS_DB-->>PS: player_id
        PS-->>-Client: 201 Created<br/>{id, username, email}
    end

    rect rgb(255, 220, 200)
        Note over Client,RMQ_P: FASE 2: Evento de Acción (Monster Kill)
        Client->>+PS: POST /players/:id/events<br/>{eventType: "monster_killed", data}
        PS->>PS_DB: SELECT player
        PS_DB-->>PS: player data
        PS->>RMQ_P: PUBLISH event<br/>exchange: player.events<br/>routing_key: player.event.monster_killed
        Note over RMQ_P: Mensaje encolado en<br/>achievement.player-events
        PS-->>-Client: 202 Accepted
    end

    rect rgb(200, 255, 220)
        Note over RMQ_P,AS_DB: FASE 3: Procesamiento de Logro
        RMQ_P->>+AS: CONSUME event<br/>queue: achievement.player-events
        AS->>AS_DB: SELECT achievements<br/>WHERE eventType = 'monster_killed'
        AS_DB-->>AS: [achievement_1, achievement_2]
        
        loop Por cada logro
            AS->>AS_DB: SELECT player_achievement<br/>WHERE playerId AND achievementId
            AS_DB-->>AS: player_achievement or null
            
            alt Logro no existe
                AS->>AS_DB: INSERT player_achievement<br/>(progress = 0)
            end
            
            AS->>AS: Evaluar regla de logro<br/>(MonsterKillRule.evaluate)
            
            alt Logro desbloqueado
                AS->>AS_DB: UPDATE player_achievement<br/>SET unlockedAt = NOW()
                AS_DB-->>AS: Updated
                AS->>RMQ_A: PUBLISH achievement.unlocked<br/>exchange: achievement.events<br/>routing_key: achievement.unlocked
                Note over RMQ_A: Mensaje encolado en<br/>reward.achievement-events
            else Logro en progreso
                AS->>AS_DB: UPDATE player_achievement<br/>SET progress = new_progress
            end
        end
        
        AS->>RMQ_P: ACK message
        AS-->>-RMQ_P: Procesado exitosamente
    end

    rect rgb(255, 240, 200)
        Note over RMQ_A,RS_DB: FASE 4: Asignación de Recompensa
        RMQ_A->>+RS: CONSUME event<br/>queue: reward.achievement-events
        RS->>RS: Determinar estrategia<br/>(Fixed/Dynamic/Bonus)
        
        alt Estrategia Fixed
            Note over RS: rewardPoints = 100
        else Estrategia Dynamic
            RS->>RS_DB: SELECT achievement difficulty
            RS_DB-->>RS: difficulty_level
            Note over RS: rewardPoints = baseDifficulty * multiplier
        else Estrategia Bonus
            RS->>RS_DB: SELECT player streak
            RS_DB-->>RS: streak_count
            Note over RS: rewardPoints = base * (1 + streak_bonus)
        end
        
        RS->>RS_DB: SELECT player_balance<br/>WHERE playerId
        RS_DB-->>RS: current_balance or null
        
        alt Balance no existe
            RS->>RS_DB: INSERT player_balance<br/>(points = rewardPoints)
        else Balance existe
            RS->>RS_DB: UPDATE player_balance<br/>SET points = points + rewardPoints
        end
        
        RS->>RS_DB: INSERT reward<br/>(playerId, achievementId, points, type)
        RS_DB-->>RS: reward_id
        
        RS->>RMQ_A: ACK message
        RS-->>-RMQ_A: Procesado exitosamente
    end

    rect rgb(230, 230, 250)
        Note over Client,RS_DB: FASE 5: Consulta de Estado
        Client->>+PS: GET /players/:id
        PS->>PS_DB: SELECT player
        PS_DB-->>PS: player data
        PS-->>-Client: 200 OK<br/>{id, username, stats}
        
        Client->>+AS: GET /player-achievements/:playerId
        AS->>AS_DB: SELECT player_achievements<br/>JOIN achievements
        AS_DB-->>AS: achievements with progress
        AS-->>-Client: 200 OK<br/>[{achievement, progress, unlockedAt}]
        
        Client->>+RS: GET /balance/:playerId
        RS->>RS_DB: SELECT player_balance
        RS_DB-->>RS: balance data
        RS-->>-Client: 200 OK<br/>{points, level, rewards}
    end
```

## Descripción del Flujo

### 🎮 FASE 1: Registro de Jugador
1. Cliente envía datos del jugador (username, email)
2. Player Service valida y persiste en Player DB
3. Retorna ID del jugador creado

**Endpoints:**
- `POST /players`

**Estado:** Jugador registrado en el sistema

---

### 🎯 FASE 2: Evento de Acción del Jugador
4. Cliente registra una acción (ej: monster_killed)
5. Player Service valida el jugador existe
6. **Publica evento a RabbitMQ** en exchange `player.events`
7. Evento encolado en `achievement.player-events`
8. Retorna 202 Accepted (procesamiento asíncrono)

**Eventos Soportados:**
- `player.event.monster_killed`
- `player.event.time_played`
- `player.event.level_up`
- etc.

**Estado:** Evento publicado, esperando procesamiento

---

### 🏆 FASE 3: Procesamiento de Logro
9. Achievement Service **consume evento** de la cola
10. Busca logros relacionados con el tipo de evento
11. Para cada logro:
    - Verifica si existe player_achievement (crea si no existe)
    - Evalúa la regla del logro (MonsterKillRule, TimePlayedRule, etc.)
    - Si se cumple la condición:
      - Actualiza `unlockedAt` en player_achievement
      - **Publica evento `achievement.unlocked`** a RabbitMQ
    - Si no se cumple:
      - Actualiza progreso del logro
12. Confirma procesamiento (ACK)

**Reglas de Negocio:**
- Cada regla tiene su propia lógica de evaluación
- No se re-procesa un logro ya desbloqueado
- Progreso se acumula si el logro no está completo

**Estado:** Logro evaluado, evento de desbloqueo publicado si aplica

---

### 💰 FASE 4: Asignación de Recompensa
13. Reward Service **consume evento achievement.unlocked**
14. Determina estrategia de recompensa:
    - **Fixed**: Puntos fijos por logro
    - **Dynamic**: Basado en dificultad del logro
    - **Bonus**: Multiplica por racha del jugador
15. Calcula puntos según estrategia
16. Actualiza/crea balance del jugador
17. Registra la recompensa en tabla rewards
18. Confirma procesamiento (ACK)

**Estrategias:**
```typescript
Fixed: 100 puntos
Dynamic: baseDifficulty * multiplier
Bonus: base * (1 + streak_bonus)
```

**Estado:** Recompensa asignada, balance actualizado

---

### 📊 FASE 5: Consulta de Estado
19-24. Cliente puede consultar:
    - Datos del jugador (Player Service)
    - Logros y progreso (Achievement Service)
    - Balance y recompensas (Reward Service)

**Endpoints de Consulta:**
- `GET /players/:id` - Info del jugador
- `GET /player-achievements/:playerId` - Logros desbloqueados y en progreso
- `GET /balance/:playerId` - Puntos y recompensas

**Estado:** Cliente tiene vista completa del progreso

---

## Características del Flujo

### ⚡ Procesamiento Asíncrono
- Las fases 3 y 4 son completamente asíncronas
- No bloquea al cliente esperando procesamiento
- Permite alta concurrencia

### 🔄 Garantías de Entrega
- **At-Least-Once Delivery**: Mensajes se reencolan si falla el procesamiento
- **ACK/NACK**: Confirmación explícita de procesamiento
- **Idempotencia**: Servicios verifican estado antes de procesar

### 🛡️ Manejo de Errores
```typescript
// Si falla procesamiento en Achievement Service:
try {
  await processEvent(event);
  channel.ack(msg); // ✅ Éxito
} catch (error) {
  channel.nack(msg, false, true); // ❌ Reencolar
}
```

### 📈 Latencias Esperadas
| Fase | Tipo | Latencia Estimada |
|------|------|-------------------|
| 1 | Síncrono | ~50-100ms |
| 2 | Síncrono + Async | ~100-200ms (response), +processing async |
| 3 | Asíncrono | ~200-500ms |
| 4 | Asíncrono | ~100-300ms |
| 5 | Síncrono | ~50-150ms |

**Total E2E (con procesamiento completo):** ~1-2 segundos

---

## Casos de Uso Ejemplo

### Caso 1: Primer Monster Kill
```
1. POST /players/123/events {eventType: "monster_killed", data: {monsterId: "orc-1"}}
2. Event published: player.event.monster_killed
3. Achievement Service evalúa: "FIRST_BLOOD" ✅ UNLOCKED
4. Event published: achievement.unlocked
5. Reward Service: +100 points (Fixed Strategy)
6. GET /balance/123 → {points: 100}
```

### Caso 2: Monster Kill #5 (Progreso)
```
1. POST /players/123/events {eventType: "monster_killed", data: {monsterId: "goblin-5"}}
2. Event published: player.event.monster_killed
3. Achievement Service evalúa: "MONSTER_SLAYER" (requires 10 kills)
   - Current progress: 4 → 5
   - Status: IN_PROGRESS ⏳
4. No event published (logro no completado)
5. No recompensa asignada
6. GET /player-achievements/123 → [{code: "MONSTER_SLAYER", progress: 50%}]
```

### Caso 3: Tiempo Jugado (Acumulativo)
```
1. POST /players/123/events {eventType: "time_played", data: {minutes: 30}}
2. Event published: player.event.time_played
3. Achievement Service evalúa: "DEDICATED_GAMER" (requires 60 min)
   - Accumulated time: 45 → 75 minutes
   - Status: UNLOCKED ✅
4. Event published: achievement.unlocked
5. Reward Service: +200 points (Dynamic Strategy, difficulty: 2)
6. GET /balance/123 → {points: 300}
```

---

## Testing E2E

### Escenarios Cubiertos (25/28 passing)
✅ **Complete Flow (4/4)**
- Flujo completo de jugador → evento → logro → recompensa
- Múltiples logros en un evento
- Progreso acumulativo

✅ **Contract Tests (10/10)**
- Validación de schemas de eventos
- Estructura de mensajes RabbitMQ
- DTOs entre servicios

🟡 **Resilience Tests (11/13)**
- Reintentos automáticos
- Manejo de servicios caídos
- Edge cases de race conditions

---

## Monitoreo y Logs

### Logs Estructurados
```
Player Service: 📤 Publishing event: player.event.monster_killed
RabbitMQ: 📨 Message enqueued: achievement.player-events
Achievement Service: 📥 Received player event
Achievement Service: 🏆 Achievement unlocked: FIRST_BLOOD
RabbitMQ: 📨 Message enqueued: reward.achievement-events
Reward Service: 📥 Received achievement.unlocked event
Reward Service: 💰 Reward assigned: 100 points
```

### Métricas Clave
- Eventos publicados por segundo
- Tiempo promedio de procesamiento por fase
- Tasa de errores y reintentos
- Cola depth (profundidad de mensajes pendientes)
