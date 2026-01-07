# Gaming – Sistema de Logros y Recompensas - Backend

## 📋 Descripción General

Backend modular de microservicios para un sistema de logros y recompensas en juegos. Implementa una arquitectura event-driven con comunicación asíncrona mediante RabbitMQ y persistencia en PostgreSQL.

## 🏗️ Arquitectura

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                   GAMING BACKEND SYSTEM                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │ Player Service   │  │Achievement Srvce │  │Reward Srvce│ │
│  │                  │  │                  │  │            │ │
│  │ PORT: 3001       │  │ PORT: 3002       │  │ PORT: 3003 │ │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬───┘ │
│           │                     │                     │      │
│  ┌────────▼──────────────────────▼─────────────────────▼────┐│
│  │           RabbitMQ Message Broker (PORT: 5672)           ││
│  │  Exchanges: player_events, achievement_events, rewards   ││
│  └─────────────────────────────────────────────────────────┘│
│           │                     │                     │      │
│  ┌────────▼─────────┐  ┌────────▼─────────┐  ┌─────▼──────┐ │
│  │  PostgreSQL-1    │  │  PostgreSQL-2    │  │PostgreSQL-3│ │
│  │  Player DB       │  │  Achievement DB  │  │  Reward DB │ │
│  │  PORT: 5433      │  │  PORT: 5434      │  │ PORT: 5435 │ │
│  └──────────────────┘  └──────────────────┘  └────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

```
1. Jugador realiza acción en el juego
   ↓
2. Player Service recibe evento y lo publica en RabbitMQ
   ↓
3. Achievement Service escucha el evento y evalúa reglas (Observer)
   ↓
4. Si se cumple una regla: publica evento achievement.unlocked
   ↓
5. Reward Service escucha evento y asigna recompensas
   ↓
6. Rewards se persisten y están disponibles para el jugador
```

## 📦 Estructura de Directorios

```
backend/
├── player-service/                  # Servicio de Jugadores
│   ├── src/
│   │   ├── controllers/            # Controladores HTTP
│   │   ├── services/               # Lógica de negocio
│   │   ├── repositories/           # Acceso a datos
│   │   ├── entities/               # Entidades TypeORM
│   │   ├── dtos/                   # Data Transfer Objects
│   │   ├── events/                 # Publicadores de eventos
│   │   ├── modules/                # Módulos NestJS
│   │   ├── config/                 # Configuración
│   │   └── main.ts                 # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── Containerfile
│   ├── .env.example
│   └── README.md
│
├── achievement-service/             # Servicio de Logros
│   ├── src/
│   │   ├── controllers/            # Controladores HTTP
│   │   ├── services/               # Lógica de negocio
│   │   ├── repositories/           # Acceso a datos
│   │   ├── entities/               # Entidades TypeORM
│   │   ├── dtos/                   # Data Transfer Objects
│   │   ├── listeners/              # Listeners (Observer pattern)
│   │   ├── rules/                  # Reglas de evaluación
│   │   ├── modules/                # Módulos NestJS
│   │   ├── config/                 # Configuración
│   │   └── main.ts                 # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── Containerfile
│   ├── .env.example
│   └── README.md
│
├── reward-service/                  # Servicio de Recompensas
│   ├── src/
│   │   ├── controllers/            # Controladores HTTP
│   │   ├── services/               # Lógica de negocio
│   │   ├── repositories/           # Acceso a datos
│   │   ├── entities/               # Entidades TypeORM
│   │   ├── dtos/                   # Data Transfer Objects
│   │   ├── listeners/              # Listeners (Observer pattern)
│   │   ├── strategies/             # Estrategias de recompensa
│   │   ├── modules/                # Módulos NestJS
│   │   ├── config/                 # Configuración
│   │   └── main.ts                 # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── Containerfile
│   ├── .env.example
│   └── README.md
│
├── infrastructure/                  # Infraestructura
│   ├── docker/                     # Configuración Docker
│   ├── rabbitmq/                   # Config RabbitMQ
│   ├── postgres/                   # Config PostgreSQL
│   └── scripts/                    # Scripts de despliegue
│       ├── deploy.sh
│       ├── postgres-init.sh
│       └── rabbitmq-init.sh
│
├── shared/                          # Código compartido
│   ├── events/                     # Interfaces de eventos
│   ├── interfaces/                 # Interfaces compartidas
│   ├── constants/                  # Constantes globales
│   └── utils/                      # Utilidades compartidas
│
├── docker-compose.yml               # Orquestación de contenedores
├── README.md                        # Este archivo
└── .gitignore
```

## 🚀 Quick Start

### Prerrequisitos
- Node.js 20+
- Docker o Podman
- Git

### Instalación y Ejecución

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd backend
```

2. **Configurar variables de entorno**
```bash
cp player-service/.env.example player-service/.env
cp achievement-service/.env.example achievement-service/.env
cp reward-service/.env.example reward-service/.env
```

3. **Ejecutar con Docker Compose**
```bash
docker-compose up -d
# O con Podman
podman-compose up -d
```

4. **Verificar que los servicios estén activos**
```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

### Acceso a Interfaces
- **Player Service**: http://localhost:3001
- **Achievement Service**: http://localhost:3002
- **Reward Service**: http://localhost:3003
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## 📡 Eventos del Sistema

### Player Service Emite
- `player.event.monster_killed` - Monstruo matado
- `player.event.time_played` - Tiempo de juego acumulado
- `player.event.level_up` - Jugador sube de nivel

### Achievement Service Emite
- `achievement.unlocked` - Logro desbloqueado

### Queues RabbitMQ
- `player_events` - Eventos del jugador
- `achievement_events` - Eventos de logros
- `reward_events` - Eventos de recompensas

## 🏛️ Patrones de Diseño

- **Observer Pattern**: Achievement y Reward Services escuchan eventos
- **Strategy Pattern**: Múltiples estrategias de recompensa
- **Repository Pattern**: Abstracción de datos
- **Module Pattern**: Organización modular de NestJS

## 🗄️ Base de Datos

### Player Service DB
- `players` - Información de jugadores
- `player_events` - Historial de eventos

### Achievement Service DB
- `achievements` - Catálogo de logros
- `player_achievements` - Logros desbloqueados por jugador
- `achievement_rules` - Reglas de evaluación

### Reward Service DB
- `rewards` - Recompensas otorgadas
- `player_balances` - Balance de recompensas por jugador
- `reward_types` - Tipos de recompensas disponibles

## 🛠️ Desarrollo

### Estructura de Capas por Servicio

```
src/
├── controllers/      → Maneja solicitudes HTTP
├── services/         → Lógica de negocio
├── repositories/     → Acceso a datos
├── entities/         → Modelos de datos
├── dtos/            → Transferencia de datos
├── listeners/       → Consumo de eventos (si aplica)
├── modules/         → Módulos NestJS
├── config/          → Configuración
└── main.ts          → Entry point
```

## 📊 Configuración de Persistencia

Cada servicio tiene su propia BD PostgreSQL:
- **player_service**: puerto 5433
- **achievement_service**: puerto 5434
- **reward_service**: puerto 5435

Acceso a BD desde contenedor:
```bash
podman exec postgres-player psql -U player_user -d player_db
```

## 🔍 Monitoreo

### RabbitMQ
- UI de Management: http://localhost:15672
- Credentials: guest / guest

### Logs de Servicios
```bash
docker-compose logs -f player-service
docker-compose logs -f achievement-service
docker-compose logs -f reward-service
```

## 🚫 Detener Servicios

```bash
docker-compose down
# Con limpieza de volúmenes
docker-compose down -v
```

## 📝 Próximos Pasos

1. Implementar controladores y servicios
2. Configurar TypeORM y migraciones
3. Establecer conexiones RabbitMQ
4. Implementar lógica de reglas de logros
5. Agregar estrategias de recompensas
6. Escribir tests unitarios
7. Documentar APIs con Swagger

## 📚 Referencias

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Contribución

Seguir estructura modular y patrones establecidos. Crear PRs con descripción clara de cambios.

## 📄 Licencia

Este proyecto es parte del Taller Individual "The AI-Native Artisan".
