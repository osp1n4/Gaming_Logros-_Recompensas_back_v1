# 📋 Test Data for Achievement Service

## 10 Predefined Achievements for Testing

Este documento contiene 10 logros predefinidos para pruebas en Postman del Achievement Service.

---

## 📊 Logros Incluidos

### 1. **FIRST_BLOOD** - Primer Logro
- **Código:** `FIRST_BLOOD`
- **Tipo de Evento:** `MONSTER_KILLED`
- **Valor Requerido:** 1 monstruo
- **Temporal:** No
- **Descripción:** Obtén tu primer logro matando 1 monstruo

### 2. **MONSTER_SLAYER_10** - Cazador de 10 Monstruos
- **Código:** `MONSTER_SLAYER_10`
- **Tipo de Evento:** `MONSTER_KILLED`
- **Valor Requerido:** 10 monstruos
- **Temporal:** No
- **Descripción:** Mata 10 monstruos

### 3. **MONSTER_SLAYER_50** - Cazador de 50 Monstruos
- **Código:** `MONSTER_SLAYER_50`
- **Tipo de Evento:** `MONSTER_KILLED`
- **Valor Requerido:** 50 monstruos
- **Temporal:** No
- **Descripción:** Mata 50 monstruos

### 4. **MONSTER_SLAYER_100** - Cazador Experto
- **Código:** `MONSTER_SLAYER_100`
- **Tipo de Evento:** `MONSTER_KILLED`
- **Valor Requerido:** 100 monstruos
- **Temporal:** No
- **Descripción:** Mata 100 monstruos

### 5. **TIME_PLAYED_1H** - Primera Hora
- **Código:** `TIME_PLAYED_1H`
- **Tipo de Evento:** `TIME_PLAYED`
- **Valor Requerido:** 60 minutos
- **Temporal:** No
- **Descripción:** Juega 1 hora

### 6. **TIME_PLAYED_5H** - Jugador Dedicado
- **Código:** `TIME_PLAYED_5H`
- **Tipo de Evento:** `TIME_PLAYED`
- **Valor Requerido:** 300 minutos (5 horas)
- **Temporal:** No
- **Descripción:** Juega 5 horas

### 7. **TIME_PLAYED_10H** - Jugador Obsesionado
- **Código:** `TIME_PLAYED_10H`
- **Tipo de Evento:** `TIME_PLAYED`
- **Valor Requerido:** 600 minutos (10 horas)
- **Temporal:** No
- **Descripción:** Juega 10 horas

### 8. **WEEKEND_WARRIOR** - Guerrero de Fin de Semana ⏰
- **Código:** `WEEKEND_WARRIOR`
- **Tipo de Evento:** `MONSTER_KILLED`
- **Valor Requerido:** 20 monstruos
- **Temporal:** Sí (1 Dec 2025 - 15 Dec 2025)
- **Descripción:** Mata 20 monstruos durante la ventana temporal

### 9. **SPEED_RACER** - Corredor de Velocidad ⏰
- **Código:** `SPEED_RACER`
- **Tipo de Evento:** `MONSTER_KILLED`
- **Valor Requerido:** 30 monstruos
- **Temporal:** Sí (5 Jan 2026 - 10 Jan 2026)
- **Descripción:** Mata 30 monstruos durante la ventana temporal

### 10. **LEGENDARY_HUNTER** - Cazador Legendario 👑
- **Código:** `LEGENDARY_HUNTER`
- **Tipo de Evento:** `MONSTER_KILLED`
- **Valor Requerido:** 500 monstruos
- **Temporal:** No
- **Descripción:** Mata 500 monstruos (máximo desafío)

---

## 🚀 Cómo Usar en Postman

### Opción 1: Importar Collection JSON
1. Abre Postman
2. Click en **Import** (esquina superior izquierda)
3. Selecciona la pestaña **Upload Files**
4. Carga el archivo `postman_test_data.json`
5. Click en **Import**
6. Ejecuta los requests en orden (1-10)

### Opción 2: Crear Manualmente

Si prefieres crear los logros manualmente, usa los datos JSON proporcionados abajo:

**URL Base:** `http://localhost:3002/api/achievements`

#### Request 1: FIRST_BLOOD
```json
{
  "code": "FIRST_BLOOD",
  "titleKey": "achievement.first_blood.title",
  "descriptionKey": "achievement.first_blood.description",
  "requiredValue": 1,
  "eventType": "MONSTER_KILLED",
  "isTemporal": false,
  "isActive": true
}
```

#### Request 2: MONSTER_SLAYER_10
```json
{
  "code": "MONSTER_SLAYER_10",
  "titleKey": "achievement.monster_slayer_10.title",
  "descriptionKey": "achievement.monster_slayer_10.description",
  "requiredValue": 10,
  "eventType": "MONSTER_KILLED",
  "isTemporal": false,
  "isActive": true
}
```

#### Request 3: MONSTER_SLAYER_50
```json
{
  "code": "MONSTER_SLAYER_50",
  "titleKey": "achievement.monster_slayer_50.title",
  "descriptionKey": "achievement.monster_slayer_50.description",
  "requiredValue": 50,
  "eventType": "MONSTER_KILLED",
  "isTemporal": false,
  "isActive": true
}
```

#### Request 4: MONSTER_SLAYER_100
```json
{
  "code": "MONSTER_SLAYER_100",
  "titleKey": "achievement.monster_slayer_100.title",
  "descriptionKey": "achievement.monster_slayer_100.description",
  "requiredValue": 100,
  "eventType": "MONSTER_KILLED",
  "isTemporal": false,
  "isActive": true
}
```

#### Request 5: TIME_PLAYED_1H
```json
{
  "code": "TIME_PLAYED_1H",
  "titleKey": "achievement.time_played_1h.title",
  "descriptionKey": "achievement.time_played_1h.description",
  "requiredValue": 60,
  "eventType": "TIME_PLAYED",
  "isTemporal": false,
  "isActive": true
}
```

#### Request 6: TIME_PLAYED_5H
```json
{
  "code": "TIME_PLAYED_5H",
  "titleKey": "achievement.time_played_5h.title",
  "descriptionKey": "achievement.time_played_5h.description",
  "requiredValue": 300,
  "eventType": "TIME_PLAYED",
  "isTemporal": false,
  "isActive": true
}
```

#### Request 7: TIME_PLAYED_10H
```json
{
  "code": "TIME_PLAYED_10H",
  "titleKey": "achievement.time_played_10h.title",
  "descriptionKey": "achievement.time_played_10h.description",
  "requiredValue": 600,
  "eventType": "TIME_PLAYED",
  "isTemporal": false,
  "isActive": true
}
```

#### Request 8: WEEKEND_WARRIOR
```json
{
  "code": "WEEKEND_WARRIOR",
  "titleKey": "achievement.weekend_warrior.title",
  "descriptionKey": "achievement.weekend_warrior.description",
  "requiredValue": 20,
  "eventType": "MONSTER_KILLED",
  "isTemporal": true,
  "temporalWindowStart": "2025-12-01T00:00:00Z",
  "temporalWindowEnd": "2025-12-15T23:59:59Z",
  "isActive": true
}
```

#### Request 9: SPEED_RACER
```json
{
  "code": "SPEED_RACER",
  "titleKey": "achievement.speed_racer.title",
  "descriptionKey": "achievement.speed_racer.description",
  "requiredValue": 30,
  "eventType": "MONSTER_KILLED",
  "isTemporal": true,
  "temporalWindowStart": "2026-01-05T00:00:00Z",
  "temporalWindowEnd": "2026-01-10T23:59:59Z",
  "isActive": true
}
```

#### Request 10: LEGENDARY_HUNTER
```json
{
  "code": "LEGENDARY_HUNTER",
  "titleKey": "achievement.legendary_hunter.title",
  "descriptionKey": "achievement.legendary_hunter.description",
  "requiredValue": 500,
  "eventType": "MONSTER_KILLED",
  "isTemporal": false,
  "isActive": true
}
```

---

## 📌 Pasos para Probar

### 1️⃣ Crear los 10 Logros
- Importa o copia los requests de arriba en Postman
- Ejecuta cada uno con método **POST** a `http://localhost:3002/api/achievements`
- Deberías recibir respuesta `201 Created` con el ID del logro creado

### 2️⃣ Consultar Todos los Logros
```
GET http://localhost:3002/api/achievements
```

### 3️⃣ Inicializar Logros para un Jugador
```
POST http://localhost:3002/api/achievements/initialize/{playerId}
```
Usa un UUID válido de un jugador que existe en Player Service.

### 4️⃣ Obtener Logros de un Jugador
```
GET http://localhost:3002/api/achievements/players/{playerId}
```

### 5️⃣ Obtener Progreso de un Logro Específico
```
GET http://localhost:3002/api/achievements/players/{playerId}/{achievementId}/progress
```

---

## 📂 Estructura de Datos

### Entidad: Achievement
```typescript
{
  id: string (UUID);
  code: string (unique);
  titleKey: string;
  descriptionKey: string;
  requiredValue: number;
  eventType: string (MONSTER_KILLED | TIME_PLAYED);
  isTemporal: boolean;
  temporalWindowStart: Date | null;
  temporalWindowEnd: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## ⚡ Notas Importantes

1. **Campos Requeridos:** `code`, `titleKey`, `descriptionKey`, `requiredValue`, `eventType`
2. **Temporales:** Si `isTemporal = true`, debes proporcionar `temporalWindowStart` y `temporalWindowEnd`
3. **Códigos Únicos:** El campo `code` debe ser único en la base de datos
4. **Idioma:** Los campos `titleKey` y `descriptionKey` son claves para internacionalización (i18n)
5. **Validación:** El sistema valida que `requiredValue > 0` y `eventType` sea válido

---

## 🔍 Verificación

Después de crear los 10 logros, ejecuta:

```bash
GET http://localhost:3002/api/achievements
```

Deberías recibir una respuesta con un array de 10 logros.

---

**Última Actualización:** 8 de Enero, 2026
