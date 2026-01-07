# 🏗️ Estructura Backend - Vista Detallada

## 📊 Árbol de Directorios Completo

```
backend/
│
├── 📁 player-service/                    # Servicio de Jugadores (Puerto 3001)
│   ├── src/
│   │   ├── 📁 controllers/
│   │   │   └── player.controller.ts      # Endpoints HTTP para jugadores
│   │   ├── 📁 services/
│   │   │   ├── player.service.ts         # Lógica de negocio de jugadores
│   │   │   └── event.publisher.ts        # Publica eventos a RabbitMQ
│   │   ├── 📁 repositories/
│   │   │   └── player.repository.ts      # Acceso a datos (CRUD)
│   │   ├── 📁 entities/
│   │   │   └── player.entity.ts          # Entidad TypeORM para jugadores
│   │   ├── 📁 dtos/
│   │   │   └── player.dto.ts             # Data Transfer Objects
│   │   ├── 📁 events/                    # Publicadores de eventos
│   │   ├── 📁 modules/
│   │   │   └── player.module.ts          # Módulo NestJS
│   │   ├── 📁 config/
│   │   │   └── database.config.ts        # Configuración de BD
│   │   └── main.ts                       # Entry point
│   ├── package.json                      # Dependencias Node.js
│   ├── tsconfig.json                     # Configuración TypeScript
│   ├── Containerfile                     # Imagen Docker/Podman
│   ├── .env.example                      # Variables de entorno ejemplo
│   └── README.md                         # Documentación del servicio
│
├── 📁 achievement-service/               # Servicio de Logros (Puerto 3002)
│   ├── src/
│   │   ├── 📁 controllers/
│   │   │   └── achievement.controller.ts # Endpoints HTTP para logros
│   │   ├── 📁 services/
│   │   │   ├── achievement.service.ts    # Evaluación de logros
│   │   │   ├── event.listener.ts         # Escucha eventos (Observer)
│   │   │   └── event.publisher.ts        # Publica eventos de logros
│   │   ├── 📁 repositories/
│   │   │   └── achievement.repository.ts # Acceso a datos
│   │   ├── 📁 entities/
│   │   │   ├── achievement.entity.ts     # Entidad Achievement
│   │   │   └── player.achievement.ts     # Relación player-achievement
│   │   ├── 📁 dtos/
│   │   │   └── achievement.dto.ts        # Data Transfer Objects
│   │   ├── 📁 listeners/                 # Event listeners (Observer pattern)
│   │   ├── 📁 rules/                     # Motor de reglas
│   │   │   ├── achievement.rule.ts       # Interfaz base de reglas
│   │   │   ├── monster.kill.rule.ts      # Regla: matar monstruos
│   │   │   └── time.played.rule.ts       # Regla: tiempo jugado
│   │   ├── 📁 modules/
│   │   │   └── achievement.module.ts     # Módulo NestJS
│   │   ├── 📁 config/
│   │   │   └── database.config.ts        # Configuración de BD
│   │   └── main.ts                       # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── Containerfile
│   ├── .env.example
│   └── README.md
│
├── 📁 reward-service/                    # Servicio de Recompensas (Puerto 3003)
│   ├── src/
│   │   ├── 📁 controllers/
│   │   │   └── reward.controller.ts      # Endpoints HTTP para recompensas
│   │   ├── 📁 services/
│   │   │   ├── reward.service.ts         # Asignación de recompensas
│   │   │   └── event.listener.ts         # Escucha eventos de logros
│   │   ├── 📁 repositories/
│   │   │   └── reward.repository.ts      # Acceso a datos
│   │   ├── 📁 entities/
│   │   │   ├── reward.entity.ts          # Entidad Reward
│   │   │   └── player.balance.ts         # Balance de jugador
│   │   ├── 📁 dtos/
│   │   │   └── reward.dto.ts             # Data Transfer Objects
│   │   ├── 📁 listeners/                 # Event listeners
│   │   ├── 📁 strategies/                # Estrategias de recompensa
│   │   │   ├── reward.strategy.ts        # Interfaz base
│   │   │   ├── fixed.reward.strategy.ts  # Recompensas fijas
│   │   │   ├── dynamic.reward.strategy.ts# Recompensas dinámicas
│   │   │   └── bonus.reward.strategy.ts  # Bonificaciones
│   │   ├── 📁 modules/
│   │   │   └── reward.module.ts          # Módulo NestJS
│   │   ├── 📁 config/
│   │   │   └── database.config.ts        # Configuración de BD
│   │   └── main.ts                       # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── Containerfile
│   ├── .env.example
│   └── README.md
│
├── 📁 infrastructure/                    # Infraestructura compartida
│   ├── 📁 docker/                        # Configuraciones Docker
│   ├── 📁 rabbitmq/
│   │   └── README.md                     # Documentación RabbitMQ
│   ├── 📁 postgres/
│   │   └── README.md                     # Documentación PostgreSQL
│   └── 📁 scripts/                       # Scripts de despliegue
│       ├── deploy.sh                     # Script de despliegue general
│       ├── postgres-init.sh              # Inicialización PostgreSQL
│       └── rabbitmq-init.sh              # Inicialización RabbitMQ
│
├── 📁 shared/                            # Código compartido entre servicios
│   ├── 📁 events/
│   │   └── event.interface.ts            # Interfaces de eventos
│   ├── 📁 interfaces/
│   │   ├── database.interface.ts         # Interfaz de BD
│   │   └── rabbitmq.interface.ts         # Interfaz de RabbitMQ
│   ├── 📁 constants/
│   │   ├── app.constants.ts              # Constantes de aplicación
│   │   └── rabbitmq.constants.ts         # Constantes RabbitMQ
│   └── 📁 utils/
│       └── common.utils.ts               # Utilidades compartidas
│
├── docker-compose.yml                    # Orquestación de contenedores
├── .gitignore                            # Archivos ignorados por Git
└── README.md                             # Documentación principal
```

## 📝 Descripción de Capas por Microservicio

### Capa Controllers
- Maneja solicitudes HTTP
- Valida entrada de datos
- Retorna respuestas JSON
- Documentación Swagger (futura)

### Capa Services
- Lógica de negocio principal
- Coordinación entre repositorios
- Manejo de eventos
- Validaciones complejas

### Capa Repositories
- Acceso exclusivo a BD
- Métodos CRUD optimizados
- Consultas complejas
- Transacciones

### Capa Entities
- Modelos de datos TypeORM
- Esquema de BD
- Relaciones entre tablas
- Validaciones en entidad

### Capa DTOs
- Transferencia de datos
- Validación con decoradores
- Serialización/Deserialización
- Aislamiento de datos internos

### Capa Config
- Variables de entorno
- Conexión a BD
- Conexión a RabbitMQ
- Configuración de módulos

### Capas Especiales

#### Achievement Service
- **Listeners**: Implementan Observer pattern
- **Rules**: Motor de evaluación de logros
  - Cada regla hereda de AchievementRule
  - Soporta condiciones complejas
  - Validación de ventanas temporales

#### Reward Service
- **Strategies**: Implementan Strategy pattern
  - FixedRewardStrategy: Recompensas predefinidas
  - DynamicRewardStrategy: Escalable con nivel
  - BonusRewardStrategy: Multiplicadores temporales

## 🗄️ Bases de Datos

```
PostgreSQL Instances:
│
├── Player DB (puerto 5433)
│   ├── players          # Información de jugadores
│   └── player_events    # Historial de eventos
│
├── Achievement DB (puerto 5434)
│   ├── achievements     # Catálogo de logros
│   ├── player_achievements  # Logros desbloqueados
│   └── achievement_rules    # Definición de reglas
│
└── Reward DB (puerto 5435)
    ├── rewards          # Recompensas otorgadas
    ├── reward_types     # Tipos de recompensas
    └── player_balances  # Balance actual por jugador
```

## 🔄 Flujo de Datos y Eventos

```
Jugador realiza acción
    ↓
Player Service
├─ Recibe evento (POST)
├─ Valida datos
├─ Persiste en BD
└─ Publica en RabbitMQ (player_events)
    ↓
Achievement Service (Listener)
├─ Escucha player_events
├─ Evalúa reglas
├─ Detecta duplicados
├─ Si cumple → Persiste achievement
└─ Publica en RabbitMQ (achievement_events)
    ↓
Reward Service (Listener)
├─ Escucha achievement_events
├─ Selecciona estrategia
├─ Calcula recompensa
├─ Actualiza balance
└─ Persiste en BD
    ↓
Recompensa disponible para el jugador
```

## 🛠️ Configuración de Contenedores

```
docker-compose.yml:
│
├── postgres-player (imagen: postgres:15-alpine)
│   └── player_db
│
├── postgres-achievement (imagen: postgres:15-alpine)
│   └── achievement_db
│
├── postgres-reward (imagen: postgres:15-alpine)
│   └── reward_db
│
├── rabbitmq (imagen: rabbitmq:3.12-management-alpine)
│   ├── Puerto AMQP: 5672
│   └── Puerto Management UI: 15672
│
├── player-service (build: player-service/Containerfile)
│   └── Puerto: 3001
│
├── achievement-service (build: achievement-service/Containerfile)
│   └── Puerto: 3002
│
└── reward-service (build: reward-service/Containerfile)
    └── Puerto: 3003
```

## 📦 Patrones de Diseño Implementados

| Patrón | Servicio | Ubicación | Propósito |
|--------|----------|-----------|----------|
| Observer | Achievement, Reward | listeners/ | Escucha eventos |
| Strategy | Reward | strategies/ | Múltiples estrategias de recompensa |
| Repository | Todos | repositories/ | Abstracción de datos |
| Module | Todos | modules/ | Organización modular |
| Dependency Injection | Todos | NestJS | Inyección de dependencias |

## 📚 Archivos de Configuración

- **docker-compose.yml**: Orquestación completa del stack
- **Containerfile**: Imagen Docker/Podman para cada servicio
- **.env.example**: Template de variables de entorno
- **package.json**: Dependencias y scripts npm
- **tsconfig.json**: Configuración TypeScript
- **README.md**: Documentación de cada servicio

## 🚀 Próximos Pasos para Implementación

1. **Fase 1**: Configurar TypeORM en cada servicio
2. **Fase 2**: Implementar Controllers y DTOs
3. **Fase 3**: Implementar Services y Repositories
4. **Fase 4**: Configurar RabbitMQ
5. **Fase 5**: Tests unitarios
6. **Fase 6**: Documentación Swagger
7. **Fase 7**: Manejo de errores robusto
8. **Fase 8**: Logging y monitoreo

## 📞 Acceso a Servicios Locales

| Servicio | URL | Propósito |
|----------|-----|----------|
| Player Service | http://localhost:3001 | Gestión de jugadores |
| Achievement Service | http://localhost:3002 | Consulta de logros |
| Reward Service | http://localhost:3003 | Consulta de recompensas |
| RabbitMQ UI | http://localhost:15672 | Monitoreo de mensajes |
| Player DB | localhost:5433 | Base de datos jugadores |
| Achievement DB | localhost:5434 | Base de datos logros |
| Reward DB | localhost:5435 | Base de datos recompensas |
