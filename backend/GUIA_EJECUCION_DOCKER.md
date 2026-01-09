# 🐳 Guía de Ejecución con Docker Compose

## 📋 Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Estructura de Docker Compose](#estructura-de-docker-compose)
3. [Iniciación Rápida](#iniciación-rápida)
4. [Servicios Disponibles](#servicios-disponibles)
5. [Comandos Útiles](#comandos-útiles)
6. [Verificación de Servicios](#verificación-de-servicios)
7. [Logs y Monitoreo](#logs-y-monitoreo)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisitos

### Requisitos Mínimos

- **Docker:** v20.10+
- **Docker Compose:** v2.0+
- **Sistema Operativo:** Linux, macOS o Windows (con WSL2)
- **Espacio en Disco:** 2GB mínimo
- **Puertos Disponibles:**
  - `5432-5435` (PostgreSQL)
  - `5672, 15672` (RabbitMQ)
  - `3001-3003` (Aplicaciones)

### Instalación de Docker

```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y docker.io docker-compose

# macOS (con Homebrew)
brew install docker docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

---

## 🏗️ Estructura de Docker Compose

### Servicios Contenidos

```yaml
Servicios de Base de Datos:
├── postgres-player    (Puerto 5433)
├── postgres-achievement (Puerto 5434)
└── postgres-reward    (Puerto 5435)

Servicios de Mensajería:
└── rabbitmq          (Puerto 5672, Management: 15672)

Servicios de Aplicación:
├── player-service    (Puerto 3001)
├── achievement-service (Puerto 3002)
└── reward-service    (Puerto 3003)
```

### Topología de Red

```
┌─────────────────────────────────────────────────────┐
│           Docker Network: gaming-network            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Player Service]  ──┐                             │
│        :3001         │                             │
│                      └─→ [RabbitMQ] ──→ [PostgreSQL]
│  [Achievement]  ──┐  :5672    × 3                 │
│      :3002        │   :15672   (5433,5434,5435)   │
│                   │                                │
│  [Reward Service] ┘                                │
│       :3003                                        │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Iniciación Rápida

### 1. Clonar o Navegar al Proyecto

```bash
cd backend
```

### 2. Levantar los Servicios

```bash
# Comando principal
docker-compose up -d

# Con logs visibles
docker-compose up --follow

# Forzar reconstrucción
docker-compose up -d --build --remove-orphans
```

### 3. Verificar que Todo está Corriendo

```bash
docker-compose ps
```

**Salida esperada:**
```
NAME                    STATUS              PORTS
postgres-player         Up 2 minutes        0.0.0.0:5433->5432/tcp
postgres-achievement    Up 2 minutes        0.0.0.0:5434->5432/tcp
postgres-reward         Up 2 minutes        0.0.0.0:5435->5432/tcp
rabbitmq                Up 2 minutes        0.0.0.0:5672->5672/tcp, 0.0.0.0:15672->15672/tcp
player-service          Up 2 minutes        0.0.0.0:3001->3000/tcp
achievement-service     Up 2 minutes        0.0.0.0:3002->3000/tcp
reward-service          Up 2 minutes        0.0.0.0:3003->3000/tcp
```

### 4. Detener los Servicios

```bash
# Pausar (sin eliminar contenedores)
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar todo (incluyendo volúmenes)
docker-compose down -v
```

---

## 🎯 Servicios Disponibles

### 1️⃣ Player Service (Puerto 3001)

**Propósito:** Gestión de jugadores y publicación de eventos

**Endpoints Principales:**

```bash
# Crear jugador
POST http://localhost:3001/players
Content-Type: application/json

{
  "name": "Juan",
  "email": "juan@game.com",
  "level": 1
}

# Obtener jugadores
GET http://localhost:3001/players

# Publicar evento de juego
POST http://localhost:3001/players/{id}/event
Content-Type: application/json

{
  "type": "monster_killed",
  "data": {
    "monsterId": "dragon_1",
    "points": 500
  }
}
```

**Variables de Entorno:**
```
DATABASE_HOST=postgres-player
DATABASE_PORT=5432
DATABASE_NAME=player_db
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
```

---

### 2️⃣ Achievement Service (Puerto 3002)

**Propósito:** Evaluación de logros basada en eventos de jugadores

**Endpoints Principales:**

```bash
# Obtener logros de un jugador
GET http://localhost:3002/achievements?playerId=1

# Obtener detalle de un logro
GET http://localhost:3002/achievements/{id}

# Obtener estadísticas
GET http://localhost:3002/achievements/stats/summary
```

**Reglas de Negocio:**

- ✅ `MonsterKillRule`: 5+ monstruos asesinados → Logro "Cazador"
- ✅ `TimePlayedRule`: 1+ hora jugando → Logro "Maratón"
- ✅ Evaluación automática al recibir eventos
- ✅ Publicación de `achievement.unlocked` a RabbitMQ

---

### 3️⃣ Reward Service (Puerto 3003)

**Propósito:** Cálculo y asignación de recompensas

**Endpoints Principales:**

```bash
# Obtener recompensas de un jugador
GET http://localhost:3003/rewards?playerId=1

# Obtener resumen de recompensas
GET http://localhost:3003/rewards/summary

# Consultar estrategia activa
GET http://localhost:3003/strategies
```

**Estrategias de Recompensa:**

- **Fixed Strategy:** Puntos fijos por logro (100 pts)
- **Dynamic Strategy:** Puntos por dificultad (50-500 pts)
- **Bonus Strategy:** Multiplicador por racha (1x, 2x, 3x)

---

## 📝 Comandos Útiles

### Gestión de Contenedores

```bash
# Listar contenedores en ejecución
docker-compose ps

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f player-service

# Ver últimas N líneas
docker-compose logs --tail=50

# Ejecutar comando en un contenedor
docker-compose exec player-service npm test

# Reconstruir una imagen específica
docker-compose build --no-cache player-service

# Reiniciar un servicio
docker-compose restart player-service
```

### Inspección de Redes

```bash
# Listar redes Docker
docker network ls

# Inspeccionar la red del proyecto
docker network inspect gaming_network

# Probar conectividad entre servicios
docker-compose exec player-service ping -c 2 rabbitmq
```

### Gestión de Volúmenes

```bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen específico
docker volume inspect gaming_postgres_player_data

# Limpiar volúmenes no usados
docker volume prune
```

---

## ✅ Verificación de Servicios

### 1. Verificar PostgreSQL

```bash
# Conectar a la base de datos del Player
docker-compose exec postgres-player psql -U postgres -d player_db

# Listar tablas
\dt

# Ver estructura de tabla
\d players

# Salir
\q
```

**Credenciales:**
```
Usuario: postgres
Contraseña: postgres
Host: localhost:5433, 5434, 5435
```

### 2. Verificar RabbitMQ

**Management UI:** http://localhost:15672

```
Usuario: guest
Contraseña: guest
```

**Ver colas desde CLI:**
```bash
docker-compose exec rabbitmq rabbitmqctl list_queues

# Purgar cola
docker-compose exec rabbitmq rabbitmqctl purge_queue achievement.player-events
```

### 3. Verificar Servicios REST

```bash
# Health Check - Player Service
curl http://localhost:3001/health

# Health Check - Achievement Service
curl http://localhost:3002/health

# Health Check - Reward Service
curl http://localhost:3003/health

# Espera completa
curl -v http://localhost:3001/health
```

### 4. Flujo Completo (E2E)

```bash
#!/bin/bash

echo "🔄 Iniciando flujo E2E completo..."

# 1. Crear jugador
echo "1️⃣ Creando jugador..."
PLAYER=$(curl -s -X POST http://localhost:3001/players \
  -H "Content-Type: application/json" \
  -d '{"name":"Hero","email":"hero@game.com","level":1}' | jq -r '.id')

echo "   Jugador creado: $PLAYER"

# 2. Publicar evento
echo "2️⃣ Publicando evento de monstruo..."
curl -s -X POST http://localhost:3001/players/$PLAYER/event \
  -H "Content-Type: application/json" \
  -d '{"type":"monster_killed","data":{"monsterId":"dragon1","points":500}}'

echo "   ✅ Evento publicado"

# 3. Esperar procesamiento
echo "3️⃣ Esperando procesamiento (2 segundos)..."
sleep 2

# 4. Verificar logros
echo "4️⃣ Verificando logros..."
curl -s http://localhost:3002/achievements?playerId=$PLAYER | jq .

# 5. Verificar recompensas
echo "5️⃣ Verificando recompensas..."
curl -s http://localhost:3003/rewards?playerId=$PLAYER | jq .

echo "✅ Flujo E2E completado"
```

---

## 📊 Logs y Monitoreo

### Estructura de Logs

Todos los servicios usan **emoji indicators** para claridad:

```
📤 [PUBLISH]  - Publicación de eventos
📥 [CONSUME]  - Consumo de eventos  
🏆 [ACHIEVEMENT] - Logros desbloqueados
💰 [REWARD]  - Recompensas asignadas
⚠️ [ERROR]   - Errores y excepciones
✅ [SUCCESS] - Operaciones exitosas
```

### Monitoreo en Tiempo Real

```bash
# Terminal 1: Logs del Player Service
docker-compose logs -f player-service

# Terminal 2: Logs del Achievement Service
docker-compose logs -f achievement-service

# Terminal 3: Logs del Reward Service
docker-compose logs -f reward-service

# Terminal 4: RabbitMQ Management
# Abre: http://localhost:15672
```

### Exportar Logs

```bash
# Exportar todos los logs a archivo
docker-compose logs > sistema.log

# Exportar logs de un servicio
docker-compose logs player-service > player-service.log

# Exportar con timestamp
docker-compose logs --timestamps > sistema_con_timestamps.log
```

---

## 🔧 Troubleshooting

### Problema: Puertos ya en Uso

```bash
# Identificar qué proceso usa el puerto
lsof -i :5433  # Linux/macOS
netstat -ano | findstr :5433  # Windows

# Liberar puerto (cambiar puerto en docker-compose.yml)
# Cambiar: "5433:5432" a "5436:5432"
```

### Problema: Contenedores no se Inician

```bash
# Ver logs de error
docker-compose logs --tail=100

# Reconstruir sin caché
docker-compose down -v
docker-compose up -d --build

# Verificar recursos disponibles
docker stats
```

### Problema: Conexión a Base de Datos Rechazada

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps postgres-player

# Verificar credenciales
docker-compose exec postgres-player psql -U postgres -c "SELECT version();"

# Reiniciar el servicio
docker-compose restart postgres-player
```

### Problema: RabbitMQ Connection Timeout

```bash
# Verificar conectividad
docker-compose exec player-service ping rabbitmq

# Ver logs de RabbitMQ
docker-compose logs rabbitmq

# Reiniciar RabbitMQ
docker-compose restart rabbitmq

# Esperar inicialización (60 segundos)
sleep 60
```

### Problema: Tests Fallando en Docker

```bash
# Ejecutar tests dentro del contenedor
docker-compose exec player-service npm test

# Ver cobertura
docker-compose exec player-service npm run test:cov

# Tests con output detallado
docker-compose exec player-service npm test -- --verbose
```

### Limpieza Completa

```bash
# Detener todo
docker-compose down

# Eliminar volúmenes
docker-compose down -v

# Eliminar imágenes
docker rmi gaming-player-service gaming-achievement-service gaming-reward-service

# Limpiar caché de construcción
docker builder prune

# Reconstruir desde cero
docker-compose up -d --build
```

---

## 📚 Recursos Adicionales

- [Documentación Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [RabbitMQ Management Plugin](https://www.rabbitmq.com/management.html)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## 📞 Soporte

Para problemas o dudas:

1. Revisar [Troubleshooting](#troubleshooting)
2. Consultar logs: `docker-compose logs -f`
3. Ejecutar health checks
4. Verificar puerto y conectividad
5. Reconstruir desde cero si es necesario

**Última actualización:** Fase 6 - Observabilidad y Documentación
