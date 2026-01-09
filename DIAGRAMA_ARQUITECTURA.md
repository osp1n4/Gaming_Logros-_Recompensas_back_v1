# Diagrama de Arquitectura - Sistema de Logros y Recompensas Gaming

## Arquitectura de Microservicios con Event-Driven

```mermaid
graph TB
    subgraph "Cliente"
        API_CLIENT[Cliente HTTP/REST]
    end

    subgraph "API Gateway / Load Balancer"
        NGINX[Nginx - Puerto 80]
    end

    subgraph "Microservicios Backend"
        subgraph "Player Service - Puerto 3001"
            PS[Player Service<br/>NestJS + TypeScript]
            PS_CTRL[Player Controller]
            PS_SVC[Player Service]
            PS_REPO[Player Repository]
            PS_PUB[Event Publisher]
            
            PS_CTRL --> PS_SVC
            PS_SVC --> PS_REPO
            PS_SVC --> PS_PUB
        end

        subgraph "Achievement Service - Puerto 3002"
            AS[Achievement Service<br/>NestJS + TypeScript]
            AS_CTRL[Achievement Controller]
            AS_SVC[Achievement Service]
            AS_REPO[Achievement Repository]
            AS_RULES[Achievement Rules<br/>- Monster Kill Rule<br/>- Time Played Rule]
            AS_LISTENER[Event Listener]
            AS_PUB[Event Publisher]
            
            AS_CTRL --> AS_SVC
            AS_SVC --> AS_REPO
            AS_SVC --> AS_RULES
            AS_LISTENER --> AS_SVC
            AS_SVC --> AS_PUB
        end

        subgraph "Reward Service - Puerto 3003"
            RS[Reward Service<br/>NestJS + TypeScript]
            RS_CTRL[Reward Controller]
            RS_SVC[Reward Service]
            RS_REPO[Reward Repository]
            RS_STRAT[Reward Strategies<br/>- Fixed Strategy<br/>- Dynamic Strategy<br/>- Bonus Strategy]
            RS_LISTENER[Achievement Unlocked Listener]
            
            RS_CTRL --> RS_SVC
            RS_SVC --> RS_REPO
            RS_SVC --> RS_STRAT
            RS_LISTENER --> RS_SVC
        end
    end

    subgraph "Message Broker"
        RMQ[RabbitMQ - Puerto 5672<br/>Management: 15672]
        
        subgraph "Exchanges"
            EX_PLAYER[player.events<br/>Type: topic]
            EX_ACHIEVEMENT[achievement.events<br/>Type: topic]
        end
        
        subgraph "Queues"
            Q_PLAYER[achievement.player-events<br/>Binding: player.event.*]
            Q_ACHIEVEMENT[reward.achievement-events<br/>Binding: achievement.unlocked]
        end
        
        EX_PLAYER --> Q_PLAYER
        EX_ACHIEVEMENT --> Q_ACHIEVEMENT
    end

    subgraph "Bases de Datos PostgreSQL"
        subgraph "Player DB - Puerto 5433"
            DB_PLAYER[(player_db)]
            TB_PLAYER[players table]
            DB_PLAYER --> TB_PLAYER
        end

        subgraph "Achievement DB - Puerto 5434"
            DB_ACH[(achievement_db)]
            TB_ACH[achievements table]
            TB_PACH[player_achievements table]
            DB_ACH --> TB_ACH
            DB_ACH --> TB_PACH
        end

        subgraph "Reward DB - Puerto 5435"
            DB_REW[(reward_db)]
            TB_BAL[player_balances table]
            TB_REW[rewards table]
            DB_REW --> TB_BAL
            DB_REW --> TB_REW
        end
    end

    %% Flujo de comunicación
    API_CLIENT -->|HTTP REST| NGINX
    NGINX -->|Proxy| PS_CTRL
    NGINX -->|Proxy| AS_CTRL
    NGINX -->|Proxy| RS_CTRL

    %% Flujo de persistencia
    PS_REPO -->|TypeORM| DB_PLAYER
    AS_REPO -->|TypeORM| DB_ACH
    RS_REPO -->|TypeORM| DB_REW

    %% Flujo de eventos
    PS_PUB -->|Publish Events| EX_PLAYER
    Q_PLAYER -->|Consume Events| AS_LISTENER
    AS_PUB -->|Publish Events| EX_ACHIEVEMENT
    Q_ACHIEVEMENT -->|Consume Events| RS_LISTENER

    %% Estilos
    classDef serviceStyle fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    classDef dbStyle fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    classDef mqStyle fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    classDef clientStyle fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px,color:#fff

    class PS,AS,RS serviceStyle
    class DB_PLAYER,DB_ACH,DB_REW dbStyle
    class RMQ,EX_PLAYER,EX_ACHIEVEMENT,Q_PLAYER,Q_ACHIEVEMENT mqStyle
    class API_CLIENT,NGINX clientStyle
```

## Características de la Arquitectura

### 🏗️ Patrón Arquitectónico
- **Microservicios**: Cada servicio es independiente y desplegable por separado
- **Event-Driven Architecture**: Comunicación asíncrona mediante eventos
- **CQRS Parcial**: Separación de comandos (escritura) y consultas (lectura)

### 🔄 Comunicación
- **Síncrona**: REST API para operaciones CRUD directas
- **Asíncrona**: RabbitMQ para eventos entre servicios
- **Protocolo**: HTTP/REST + AMQP

### 📦 Tecnologías
- **Framework**: NestJS (Node.js + TypeScript)
- **ORM**: TypeORM
- **Message Broker**: RabbitMQ
- **Base de Datos**: PostgreSQL (3 instancias independientes)
- **Contenedores**: Docker + Docker Compose

### 🎯 Principios SOLID Aplicados
- **Single Responsibility**: Cada servicio tiene una responsabilidad única
- **Open/Closed**: Extensible mediante nuevas reglas y estrategias
- **Liskov Substitution**: Interfaces y abstracciones consistentes
- **Interface Segregation**: Contratos específicos por dominio
- **Dependency Inversion**: Inyección de dependencias en todos los niveles

### 🔐 Resiliencia
- **Retry Logic**: Reintentos automáticos en caso de fallo
- **Message Acknowledgment**: ACK/NACK para garantizar procesamiento
- **Dead Letter Queues**: Mensajes fallidos se pueden reencolar
- **Health Checks**: Endpoints de salud en cada servicio

### 📊 Métricas y Observabilidad
- **Logging**: Console logs estructurados en cada servicio
- **RabbitMQ Management**: Dashboard web para monitoreo de colas
- **Database Monitoring**: PostgreSQL logs y métricas

## Puertos y Endpoints

| Servicio | Puerto | Endpoints Principales |
|----------|--------|----------------------|
| Player Service | 3001 | `/players`, `/players/:id` |
| Achievement Service | 3002 | `/achievements`, `/player-achievements/:playerId` |
| Reward Service | 3003 | `/rewards`, `/balance/:playerId` |
| RabbitMQ | 5672 | AMQP Protocol |
| RabbitMQ Management | 15672 | Web UI |
| Player DB | 5433 | PostgreSQL |
| Achievement DB | 5434 | PostgreSQL |
| Reward DB | 5435 | PostgreSQL |

## Escalabilidad

### Horizontal Scaling
- ✅ Cada servicio puede escalarse independientemente
- ✅ RabbitMQ soporta múltiples consumidores por cola
- ✅ PostgreSQL puede configurarse con replicas de lectura

### Vertical Scaling
- ✅ Ajuste de recursos por servicio en Docker Compose
- ✅ Configuración de memoria y CPU por contenedor
- ✅ Optimización de queries y conexiones a BD

## Seguridad

### Nivel de Red
- 🔒 Servicios en red interna de Docker
- 🔒 Solo puertos necesarios expuestos al host
- 🔒 RabbitMQ con autenticación por defecto

### Nivel de Aplicación
- 🔒 Validación de DTOs con class-validator
- 🔒 Sanitización de inputs
- 🔒 Error handling consistente

### Nivel de Datos
- 🔒 Conexiones a BD con credenciales
- 🔒 Transacciones ACID en PostgreSQL
- 🔒 TypeORM para prevenir SQL injection
