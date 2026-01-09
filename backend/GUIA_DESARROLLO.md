# 👨‍💻 Guía de Desarrollo - Contribuir al Proyecto

## 📋 Tabla de Contenidos

1. [Configuración del Ambiente](#configuración-del-ambiente)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Estándares de Código](#estándares-de-código)
4. [Flujo de Git](#flujo-de-git)
5. [Escribir Tests](#escribir-tests)
6. [TDD Workflow](#tdd-workflow)
7. [Code Review](#code-review)
8. [Troubleshooting](#troubleshooting)

---

## ⚙️ Configuración del Ambiente

### Requisitos Previos

```bash
# Versiones recomendadas
Node.js: 20.x LTS
npm: 10.x
Git: 2.40+
Docker: 20.10+
Docker Compose: 2.0+
VS Code: Latest (recomendado)
```

### 1. Clonar Repositorio

```bash
git clone https://github.com/tu-org/gaming-logros-recompensas.git
cd gaming-logros-recompensas
```

### 2. Instalar Dependencias Globales

```bash
# Node.js (si no está instalado)
nvm install 20
nvm use 20

# Verificar versiones
node --version    # v20.x.x
npm --version     # 10.x.x
docker --version  # 20.10+
```

### 3. Instalar Dependencias del Proyecto

```bash
# Instalar en todos los servicios
cd backend/player-service && npm install
cd ../achievement-service && npm install
cd ../reward-service && npm install
cd ../e2e-tests && npm install

# O usar script (si existe)
./setup-local.sh
```

### 4. Levantar Docker Compose

```bash
cd backend
docker-compose up -d

# Verificar que todo está corriendo
docker-compose ps
```

### 5. Verificar Setup

```bash
# Health checks
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health

# Logs
docker-compose logs -f
```

### 6. Configurar VS Code (Opcional)

**Extensiones recomendadas:**

```json
{
  "extensions": [
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "orta.vscode-jest",
    "formulahendry.docker-explorer",
    "ms-azuretools.vscode-docker",
    "eamodio.gitlens",
    "usernamehuman.color-tabs"
  ]
}
```

**Archivo .vscode/settings.json:**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

---

## 📂 Estructura del Proyecto

### Árbol Completo

```
gaming-logros-recompensas/
├── 📄 README.md                          ← README principal
├── 📄 plan_implementacion_logros_gaming.md
├── 📄 HU.md
├── 📄 RESULTADOS_TESTS_FASE2.md
│
├── 📂 backend/                           ← Documentación backend
│   ├── 📄 GUIA_EJECUCION_DOCKER.md       ← Cómo levantar Docker
│   ├── 📄 GUIA_EVENTOS.md                ← Documentación de eventos
│   ├── 📄 ARQUITECTURA.md                ← Decisiones arquitectónicas
│   ├── 📄 DIAGRAMA_ARQUITECTURA.md
│   ├── 📄 DIAGRAMA_FLUJO_E2E.md
│   ├── 📄 REPORTE_COBERTURA_CONSOLIDADO.md
│   ├── 📄 FASE5_COMPLETADA.md
│   ├── 📄 DOCUMENTACION.md               ← Índice de documentación
│   ├── 📄 ESTRUCTURA_DETALLADA.md
│   ├── 🐳 docker-compose.yml
│   │
│   ├── 📂 player-service/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── jest.config.ts
│   │   └── 📂 src/
│   │       ├── main.ts
│   │       ├── config/
│   │       ├── controllers/
│   │       ├── dtos/
│   │       ├── entities/
│   │       ├── events/
│   │       ├── modules/
│   │       ├── repositories/
│   │       └── services/
│   │
│   ├── 📂 achievement-service/
│   │   └── 📂 src/
│   │       ├── config/
│   │       ├── controllers/
│   │       ├── dtos/
│   │       ├── entities/
│   │       ├── listeners/
│   │       ├── modules/
│   │       ├── repositories/
│   │       ├── rules/
│   │       └── services/
│   │
│   ├── 📂 reward-service/
│   │   └── 📂 src/
│   │       ├── config/
│   │       ├── controllers/
│   │       ├── dtos/
│   │       ├── entities/
│   │       ├── listeners/
│   │       ├── modules/
│   │       ├── repositories/
│   │       ├── services/
│   │       └── strategies/
│   │
│   ├── 📂 shared/
│   │   ├── constants/
│   │   ├── events/
│   │   ├── interfaces/
│   │   └── utils/
│   │
│   ├── 📂 infrastructure/
│   │   ├── docker/
│   │   ├── postgres/
│   │   ├── rabbitmq/
│   │   └── scripts/
│   │
│   └── 📂 e2e-tests/
│       ├── package.json
│       └── 📂 tests/
│           ├── complete-flow.spec.ts
│           ├── contract-tests.spec.ts
│           └── resilience.spec.ts
│
└── 📄 .gitignore
```

### Ubicación de Archivos Importantes

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| Controladores | `*/src/controllers/*.ts` | REST endpoints |
| Servicios | `*/src/services/*.ts` | Lógica de negocio |
| Repositorios | `*/src/repositories/*.ts` | Acceso a BD |
| DTOs | `*/src/dtos/*.ts` | Validación de entrada |
| Entidades | `*/src/entities/*.ts` | Modelos de datos |
| Módulos | `*/src/modules/*.ts` | Agrupación de DI |
| Tests | `*/**/*.spec.ts` | Unit tests |
| E2E | `e2e-tests/tests/*.spec.ts` | Integration tests |

---

## 📏 Estándares de Código

### Naming Conventions

```typescript
// ✅ Nombres de clases (PascalCase)
class PlayerService {}
class CreatePlayerDto {}
class PlayerRepository {}

// ✅ Nombres de variables (camelCase)
const playerId = 'uuid-123';
let activeConnections = 0;

// ✅ Nombres de constantes (UPPER_SNAKE_CASE)
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;

// ✅ Nombres de funciones/métodos (camelCase)
async function publishEvent(event: Event) {}
async getPlayerById(id: string) {}

// ✅ Nombres de interfaces (IPrefijo)
interface IPlayerRepository {}
interface IEventPublisher {}

// ❌ Evitar
const PlayerId = 'uuid';        // No mezclar
let player_id = 'uuid';        // Snake case en variables
const playerid = 'uuid';       // Minúscula para clase
```

### Estructura de Archivos por Servicio

```typescript
// player.service.ts
import { Injectable } from '@nestjs/common';
import { PlayerRepository } from '../repositories/player.repository';
import { EventPublisher } from '../../events/event.publisher';
import { CreatePlayerDto } from '../dtos/player.dto';
import { Player } from '../entities/player.entity';

/**
 * Servicio de gestión de jugadores
 * Responsabilidades:
 * - CRUD de jugadores
 * - Publicación de eventos
 */
@Injectable()
export class PlayerService {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly eventPublisher: EventPublisher
  ) {}

  /**
   * Crear nuevo jugador
   * @param createPlayerDto - Datos del jugador
   * @returns Jugador creado
   * @throws BadRequestException si datos inválidos
   */
  async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
    // Validación (ya hecha por DTO pipes)
    
    // Crear entidad
    const player = new Player();
    player.name = createPlayerDto.name;
    player.email = createPlayerDto.email;

    // Guardar
    const savedPlayer = await this.playerRepository.save(player);

    // Publicar evento
    await this.eventPublisher.publish({
      type: 'player.created',
      playerId: savedPlayer.id,
      data: savedPlayer
    });

    return savedPlayer;
  }

  async findById(id: string): Promise<Player> {
    return this.playerRepository.findOne(id);
  }
}
```

### Patrones SOLID Aplicados

```typescript
// ✅ SOLID: Single Responsibility
@Injectable()
export class PlayerService {
  // Solo gestiona lógica de jugadores
  async createPlayer() {}
  async updatePlayer() {}
}

@Injectable()
export class EventPublisher {
  // Solo publica eventos
  async publish() {}
}

// ✅ SOLID: Open/Closed (Strategy Pattern)
abstract class RewardStrategy {
  abstract calculate(playerId: string, achievement: Achievement): Promise<number>;
}

class FixedRewardStrategy extends RewardStrategy {}
class DynamicRewardStrategy extends RewardStrategy {}

// ✅ SOLID: Liskov Substitution
let strategy: RewardStrategy = new FixedRewardStrategy();
strategy = new DynamicRewardStrategy(); // ✅ Compatible

// ✅ SOLID: Interface Segregation
interface IPlayerRepository {
  save(player: Player): Promise<Player>;
  findById(id: string): Promise<Player>;
}

interface IEventPublisher {
  publish(event: Event): Promise<void>;
}

// ✅ SOLID: Dependency Inversion
@Injectable()
export class RewardService {
  constructor(
    private readonly playerRepository: IPlayerRepository,  // Inyecta interfaz
    private readonly eventPublisher: IEventPublisher       // No clase concreta
  ) {}
}
```

### Manejo de Errores

```typescript
// ❌ Incorrecto
async getPlayer(id: string) {
  const player = await this.playerRepository.findById(id);
  // ¿Qué si no existe?
  return player;
}

// ✅ Correcto
async getPlayer(id: string): Promise<Player> {
  const player = await this.playerRepository.findById(id);
  
  if (!player) {
    throw new NotFoundException(`Player with id ${id} not found`);
  }
  
  return player;
}

// ✅ Usar excepciones de NestJS
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException
} from '@nestjs/common';

// En servicio
throw new NotFoundException('Resource not found');
throw new BadRequestException('Invalid input');
throw new ConflictException('Resource already exists');
throw new InternalServerErrorException('Unexpected error');
```

### Logs Estructurados

```typescript
// ✅ Usar emojis para claridad
import { Logger } from '@nestjs/common';

@Injectable()
export class PlayerService {
  private readonly logger = new Logger(PlayerService.name);

  async createPlayer(dto: CreatePlayerDto) {
    this.logger.log(`📤 [CREATE] Iniciando creación de jugador: ${dto.email}`);
    
    try {
      const player = new Player();
      // ... lógica
      
      this.logger.log(`✅ [SUCCESS] Jugador creado: ${player.id}`);
      return player;
    } catch (error) {
      this.logger.error(`❌ [ERROR] Error creando jugador: ${error.message}`);
      throw error;
    }
  }
}

// Emojis disponibles
📤 [PUBLISH]   - Publicación de evento
📥 [CONSUME]   - Consumo de evento
🏆 [ACHIEVEMENT] - Logro desbloqueado
💰 [REWARD]    - Recompensa asignada
⚠️ [WARN]      - Advertencia
✅ [SUCCESS]   - Operación exitosa
❌ [ERROR]     - Error
🔌 [DISCONNECT] - Desconexión
```

---

## 🔄 Flujo de Git

### Branch Naming

```bash
# Formato: <tipo>/<descripción>

# Feature (nueva funcionalidad)
git checkout -b feature/new-achievement-rule

# Bug fix
git checkout -b fix/rabbitmq-connection-timeout

# Hotfix (producción)
git checkout -b hotfix/critical-player-creation

# Documentation
git checkout -b docs/architecture-decision-records

# Refactor
git checkout -b refactor/player-service-optimization

# Test
git checkout -b test/add-e2e-scenarios
```

### Workflow Básico

```bash
# 1. Crear rama desde main
git checkout main
git pull origin main
git checkout -b feature/my-feature

# 2. Hacer cambios
# ... editar archivos, tests, etc ...

# 3. Stage y commit
git add .
git commit -m "feat: descripción clara del cambio

Descripción más detallada si es necesario

Fixes: #123"

# 4. Push a origin
git push origin feature/my-feature

# 5. Crear Pull Request en GitHub
# - Ir a https://github.com/repo/compare/
# - Selector: main ← feature/my-feature
# - Llenar template de PR
# - Esperar review

# 6. Después de aprobación, mergear
git checkout main
git pull origin main
git merge feature/my-feature
git push origin main

# 7. Eliminar rama
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```

### Commits Semánticos

```bash
# Formato: <tipo>(<scope>): <descripción>

# Tipos principales
feat:  Nueva funcionalidad
fix:   Corrección de bug
docs:  Cambios en documentación
style: Formato, semicolons, espacios
refactor: Refactorización sin cambio de funcionalidad
perf:  Mejora de rendimiento
test:  Agregar o actualizar tests
chore: Cambios en build, deps, etc

# Ejemplos válidos
git commit -m "feat(player-service): agregar endpoint de búsqueda de jugadores"
git commit -m "fix(achievement-service): corregir evaluación de reglas"
git commit -m "docs: agregar guía de arquitectura"
git commit -m "refactor(reward-service): extraer lógica de estrategias"
git commit -m "test: agregar casos E2E de flujo completo"

# Con descripción larga
git commit -m "feat(player-service): agregar eventos de jugador

- Agregar endpoint POST /players/{id}/event
- Implementar validación de eventos
- Publicar a RabbitMQ con transaccionalidad

Fixes: #42
Related: #50"
```

### Pull Request Checklist

```markdown
## 📋 Pre-Submission Checklist

### ✅ Código
- [ ] Tests escritos y pasando
- [ ] Cobertura >70% en componentes nuevos
- [ ] No hay console.log() left
- [ ] Nombres descriptivos de variables/funciones
- [ ] Cambios mínimos y focalizados

### ✅ Tests
- [ ] npm test -- --coverage (local)
- [ ] E2E tests pasando
- [ ] No hay skipped tests (excepto por razón)

### ✅ Documentación
- [ ] README.md actualizado si es necesario
- [ ] Código comentado en partes complejas
- [ ] Commit messages semánticos

### ✅ Review
- [ ] Revisar propios cambios primero
- [ ] Solicitar review de al menos 1 persona
- [ ] Responder a comentarios del review

### ✅ Antes de Mergear
- [ ] Resolver conflictos (si los hay)
- [ ] Rebase sobre main
- [ ] Verificar que CI pase
- [ ] Un review approve obligatorio
```

---

## 🧪 Escribir Tests

### Estructura Básica

```typescript
// player.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PlayerService } from './player.service';
import { PlayerRepository } from '../repositories/player.repository';
import { EventPublisher } from '../../events/event.publisher';
import { CreatePlayerDto } from '../dtos/player.dto';
import { Player } from '../entities/player.entity';

describe('PlayerService', () => {
  let service: PlayerService;
  let repository: PlayerRepository;
  let publisher: EventPublisher;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        {
          provide: PlayerRepository,
          useValue: {
            save: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: EventPublisher,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
    repository = module.get<PlayerRepository>(PlayerRepository);
    publisher = module.get<EventPublisher>(EventPublisher);
  });

  describe('createPlayer', () => {
    it('should create a player and publish event', async () => {
      // Arrange
      const createPlayerDto: CreatePlayerDto = {
        name: 'Juan',
        email: 'juan@game.com',
      };

      const mockPlayer: Player = {
        id: 'uuid-123',
        ...createPlayerDto,
        level: 1,
        experience: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'save').mockResolvedValue(mockPlayer);
      jest.spyOn(publisher, 'publish').mockResolvedValue(undefined);

      // Act
      const result = await service.create(createPlayerDto);

      // Assert
      expect(result).toEqual(mockPlayer);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createPlayerDto.name,
          email: createPlayerDto.email,
        })
      );
      expect(publisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'player.created',
          playerId: mockPlayer.id,
        })
      );
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      const createPlayerDto: CreatePlayerDto = {
        name: 'Juan',
        email: 'juan@game.com',
      };

      jest
        .spyOn(repository, 'save')
        .mockRejectedValue(new Error('Email already exists'));

      // Act & Assert
      await expect(service.create(createPlayerDto)).rejects.toThrow(
        'Email already exists'
      );
    });
  });

  describe('getPlayerById', () => {
    it('should return player when found', async () => {
      // Arrange
      const mockPlayer: Player = {
        id: 'uuid-123',
        name: 'Juan',
        email: 'juan@game.com',
        level: 1,
        experience: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockPlayer);

      // Act
      const result = await service.findById('uuid-123');

      // Assert
      expect(result).toEqual(mockPlayer);
      expect(repository.findById).toHaveBeenCalledWith('uuid-123');
    });

    it('should throw NotFoundException when player not found', async () => {
      // Arrange
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById('invalid-id')).rejects.toThrow(
        'Player not found'
      );
    });
  });
});
```

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Watch mode
npm test -- --watch

# Tests específicos
npm test -- --testNamePattern="PlayerService"
npm test -- --testPathPattern="player.service.spec"

# Con cobertura
npm run test:cov

# E2E tests
cd backend/e2e-tests
npm test

# Ver reporte HTML
open coverage/lcov-report/index.html
```

### Cobertura Mínima

```typescript
// jest.config.ts
export default {
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
};
```

---

## 🔴🟢🔵 TDD Workflow

### Ciclo Completo

```bash
# 1️⃣ RED: Escribir test que falla
# - Crear archivo spec
# - Escribir test que describe comportamiento
# - npm test → FAIL ❌

# 2️⃣ GREEN: Escribir código mínimo
# - Implementar lógica mínima para pasar test
# - npm test → PASS ✅

# 3️⃣ REFACTOR: Mejorar código
# - Refactorizar sin cambiar behavior
# - npm test → PASS ✅
# - Commit y continuar
```

### Ejemplo Práctico

```typescript
// FASE RED: Test que falla

// achievement.rule.spec.ts
describe('MonsterKillRule', () => {
  it('should unlock achievement when player kills 5 monsters', async () => {
    // Arrange
    const rule = new MonsterKillRule(achievementRepository);
    const playerId = 'uuid-123';
    const monsterCount = 5;

    // Act
    const result = await rule.evaluate(playerId, monsterCount);

    // Assert
    expect(result).toBe(true);
  });
});

// npm test → FAIL
// Error: Cannot find name 'MonsterKillRule'


// FASE GREEN: Código mínimo

// achievement.rule.ts
export class MonsterKillRule {
  constructor(private achievementRepository: AchievementRepository) {}

  async evaluate(playerId: string, monsterCount: number): Promise<boolean> {
    return monsterCount >= 5;
  }
}

// npm test → PASS ✅


// FASE REFACTOR: Mejorar código

// achievement.rule.ts (mejorado)
@Injectable()
export class MonsterKillRule implements IAchievementRule {
  private readonly TARGET_MONSTERS = 5;

  constructor(
    private readonly achievementRepository: AchievementRepository
  ) {}

  /**
   * Evalúa si el jugador ha desbloqueado el logro de cazador
   * @param playerId - ID del jugador
   * @param monsterCount - Cantidad de monstruos matados
   * @returns true si se desbloquea el logro
   */
  async evaluate(
    playerId: string,
    monsterCount: number
  ): Promise<boolean> {
    if (monsterCount < this.TARGET_MONSTERS) {
      return false;
    }

    // Verificar si ya tiene el logro
    const existing = await this.achievementRepository.findByPlayerAndType(
      playerId,
      'monster_kill'
    );

    return !existing;
  }
}

// npm test → PASS ✅ (aún pasa)

// git commit -m "feat(achievement-service): add MonsterKillRule evaluation"
```

---

## 👀 Code Review

### Checklist para Revisor

```markdown
## Code Review Checklist

### ✅ Funcionalidad
- [ ] El código hace lo que promete
- [ ] Tests describe el comportamiento
- [ ] Edge cases están cubiertos
- [ ] Error handling es apropiado

### ✅ Calidad
- [ ] Sigue estándares del proyecto
- [ ] SOLID principles aplicados
- [ ] No hay code smells obvios
- [ ] Complejidad ciclomática aceptable

### ✅ Tests
- [ ] Tests unitarios tienen sentido
- [ ] Cobertura suficiente (>70%)
- [ ] Nombres de tests descriptivos
- [ ] Mocks configurados correctamente

### ✅ Performance
- [ ] Queries de BD optimizadas
- [ ] No hay N+1 queries
- [ ] Asincronía usada apropiadamente
- [ ] Timeout configurado

### ✅ Documentación
- [ ] Código comentado donde es necesario
- [ ] README actualizado
- [ ] Eventos documentados (si aplica)
- [ ] Commit messages claros
```

### Ejemplo de Feedback

```
// ❌ Feedback poco útil
"This is bad"

// ✅ Feedback constructivo
"Consider using lodash.pick() instead of manually creating 
the object. This would reduce lines and improve readability.
Example: const filtered = pick(user, ['id', 'name']);"
```

### Responder a Review Comments

```
// ❌ Defensivo
"That's how I prefer to write it"

// ✅ Profesional
"Good point! I've updated the implementation to use 
lodash.pick() as suggested. This indeed improves readability."
```

---

## 🔧 Troubleshooting

### Problema: Tests Failing en Local

```bash
# 1. Asegurar dependencies
npm install

# 2. Limpiar caché
npm run clean
npm cache clean --force

# 3. Reinstalar
rm -rf node_modules package-lock.json
npm install

# 4. Ejecutar tests específicos
npm test -- --testNamePattern="nombre"

# 5. Ver logs detallados
npm test -- --verbose
```

### Problema: Docker Containers No Inician

```bash
# Ver logs
docker-compose logs [servicio]

# Reconstruir sin caché
docker-compose down -v
docker-compose up -d --build

# Reintentar
docker-compose restart
```

### Problema: TypeScript Errors

```bash
# Compilar localmente
npx tsc --noEmit

# Ver errores específicos
npm run build
```

### Problema: Port Already in Use

```bash
# Encontrar qué está usando el puerto
lsof -i :3001  # Linux/Mac
netstat -ano | findstr :3001  # Windows

# Cambiar puerto en .env o docker-compose.yml
```

---

## 📚 Recursos

### Documentación Interna

- [README Principal](../README.md)
- [Guía Docker](./GUIA_EJECUCION_DOCKER.md)
- [Guía Eventos](./GUIA_EVENTOS.md)
- [Arquitectura](./ARQUITECTURA.md)

### Recursos Externos

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Jest Testing](https://jestjs.io/docs/getting-started)
- [Docker Docs](https://docs.docker.com)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)

### Tools Recomendadas

- **VS Code** - Editor de código
- **Postman** - Testing de APIs
- **DataGrip** - Cliente SQL
- **Git Graph** - Visualización de commits
- **Thunder Client** - REST client alternativo

---

## 📞 Soporte

### Preguntas Frecuentes

**P: ¿Por dónde empiezo?**  
R: Lee README.md, luego GUIA_EJECUCION_DOCKER.md para levantar el sistema.

**P: ¿Cuál es el stack tecnológico?**  
R: Node.js 20, TypeScript, NestJS, PostgreSQL, RabbitMQ, Jest, Docker.

**P: ¿Cómo escribo tests?**  
R: Sigue TDD: RED (test que falla) → GREEN (código) → REFACTOR (mejora).

**P: ¿Dónde reporto bugs?**  
R: GitHub Issues con pasos para reproducir.

**P: ¿Cómo hago un PR?**  
R: Crea rama, haz cambios, tests, commit y abre PR con template.

---

**Última actualización:** Fase 6 - Observabilidad y Documentación
