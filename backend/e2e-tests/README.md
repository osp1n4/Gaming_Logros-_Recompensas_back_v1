# E2E Integration Tests - Gaming Achievement & Reward System

## 📋 Descripción

Suite completa de tests End-to-End para validar la integración entre los microservicios del sistema de logros y recompensas gaming.

## 🎯 Cobertura de Tests

### 1. **Complete Flow Tests** (`complete-flow.e2e.spec.ts`)
Valida el flujo completo del sistema:
- ✅ Evento de Player → Desbloqueo de Achievement → Asignación de Reward
- ✅ Múltiples achievements progresivos
- ✅ Diferentes tipos de eventos (MONSTER_KILLED, TIME_PLAYED)
- ✅ Persistencia de datos en todas las bases de datos

**Escenarios:**
- Desbloqueo de FIRST_BLOOD (1 kill)
- Progresión hasta MONSTER_SLAYER_10 (10 kills)
- TIME_PLAYED_1H (60 minutos)
- Validación de persistencia en PostgreSQL

### 2. **Contract Tests** (`service-contracts.contract.spec.ts`)
Valida los contratos entre servicios:
- ✅ Estructura de eventos de Player Service
- ✅ Estructura de eventos de Achievement Service
- ✅ Contratos de API REST
- ✅ Mensajes en RabbitMQ
- ✅ Respuestas de error

**Validaciones:**
- Estructura de eventos MONSTER_KILLED
- Estructura de eventos TIME_PLAYED
- Estructura de achievement.unlocked
- Formato de respuestas API
- Códigos de error HTTP

### 3. **Resilience Tests** (`resilience.resilience.spec.ts`)
Valida la resiliencia y manejo de errores:
- ✅ Manejo de errores HTTP (404, 400)
- ✅ Retry patterns con reintentos automáticos
- ✅ Timeout handling
- ✅ Idempotencia de operaciones
- ✅ Manejo de requests concurrentes
- ✅ Resiliencia de message queues
- ✅ Consistencia de datos

**Pruebas:**
- Validación de datos inválidos
- Reintentos en caso de fallos
- Prevención de duplicados
- Procesamiento concurrente
- Recuperación ante fallos de queue

## 🏗️ Arquitectura de Tests

```
e2e-tests/
├── config.ts                          # Configuración centralizada
├── helpers.ts                         # Utilidades compartidas
├── complete-flow.e2e.spec.ts          # Tests de flujo completo
├── service-contracts.contract.spec.ts # Tests de contratos
└── resilience.resilience.spec.ts      # Tests de resiliencia
```

## 🚀 Prerequisitos

Antes de ejecutar los tests, asegúrate de que todos los servicios estén corriendo:

```powershell
# Navegar al directorio backend
cd backend

# Levantar contenedores
docker compose up -d

# Verificar que todos los servicios están healthy
docker compose ps
```

**Servicios requeridos:**
- ✅ Player Service (puerto 3001)
- ✅ Achievement Service (puerto 3002)
- ✅ Reward Service (puerto 3003)
- ✅ PostgreSQL Player DB (puerto 5433)
- ✅ PostgreSQL Achievement DB (puerto 5434)
- ✅ PostgreSQL Reward DB (puerto 5435)
- ✅ RabbitMQ (puerto 5672, UI 15672)

## 📦 Instalación

```powershell
# Navegar al directorio de tests E2E
cd backend/e2e-tests

# Instalar dependencias
npm install
```

## ▶️ Ejecución de Tests

### Ejecutar todos los tests
```powershell
npm test
```

### Ejecutar con cobertura
```powershell
npm run test:coverage
```

### Ejecutar en modo verbose
```powershell
npm run test:verbose
```

### Ejecutar en modo watch
```powershell
npm run test:watch
```

### Ejecutar tests específicos

**Solo tests E2E de flujo completo:**
```powershell
npm test -- complete-flow.e2e.spec.ts
```

**Solo tests de contrato:**
```powershell
npm test -- service-contracts.contract.spec.ts
```

**Solo tests de resiliencia:**
```powershell
npm test -- resilience.resilience.spec.ts
```

## 🎯 Metodología TDD

Los tests siguen el ciclo TDD estricto:

### 🔴 RED - Tests que fallan
1. Escribir tests antes de la implementación
2. Ejecutar tests y verificar que fallan
3. Commit: `"RED: add failing test for [feature]"`

### 🟢 GREEN - Implementación mínima
1. Implementar código mínimo para pasar tests
2. Ejecutar tests y verificar que pasan
3. Commit: `"GREEN: implement [feature] to pass tests"`

### 🔵 REFACTOR - Optimización
1. Refactorizar código manteniendo tests verdes
2. Ejecutar tests y verificar que siguen pasando
3. Commit: `"REFACTOR: optimize [feature]"`

## 📊 Cobertura de Código

Objetivo: **>70% de cobertura** en todos los servicios

```powershell
# Generar reporte de cobertura
npm run test:coverage

# Ver reporte HTML
start ./coverage/index.html
```

**Métricas de cobertura:**
- Branches: >70%
- Functions: >70%
- Lines: >70%
- Statements: >70%

## 🔧 Configuración

### Variables de Entorno

Puedes personalizar la configuración mediante variables de entorno:

```powershell
# Player Service
$env:PLAYER_SERVICE_URL="http://localhost:3001"

# Achievement Service
$env:ACHIEVEMENT_SERVICE_URL="http://localhost:3002"

# Reward Service
$env:REWARD_SERVICE_URL="http://localhost:3003"

# RabbitMQ
$env:RABBITMQ_URL="amqp://guest:guest@localhost:5672"

# Databases
$env:PLAYER_DB_HOST="localhost"
$env:PLAYER_DB_PORT="5433"
$env:ACHIEVEMENT_DB_HOST="localhost"
$env:ACHIEVEMENT_DB_PORT="5434"
$env:REWARD_DB_HOST="localhost"
$env:REWARD_DB_PORT="5435"
```

### Timeouts

Configurados en `config.ts`:
- API Call: 5 segundos
- Event Processing: 10 segundos
- Database Query: 3 segundos

### Retries

- Max Attempts: 3
- Delay: 1000ms

## 🐛 Troubleshooting

### Tests fallan por timeout
```powershell
# Aumentar timeout en config.ts
timeouts: {
  eventProcessing: 20000, # Aumentar a 20 segundos
}
```

### Servicios no responden
```powershell
# Verificar estado de contenedores
docker compose ps

# Ver logs de un servicio específico
docker compose logs player-service
docker compose logs achievement-service
docker compose logs reward-service

# Reiniciar servicios
docker compose restart
```

### Errores de conexión a RabbitMQ
```powershell
# Verificar RabbitMQ
docker compose logs rabbitmq

# Acceder a la UI de RabbitMQ
start http://localhost:15672
# Usuario: guest / Password: guest
```

### Base de datos con datos sucios
```powershell
# Limpiar y reiniciar
docker compose down -v
docker compose up -d
```

## 📝 Estructura de un Test E2E

```typescript
describe('E2E: Feature Name', () => {
  let client: ApiClient;
  let rabbitMQ: RabbitMQHelper;
  let db: DatabaseHelper;

  beforeAll(async () => {
    // Setup
  });

  afterAll(async () => {
    // Cleanup
  });

  beforeEach(async () => {
    // Reset state
  });

  it('should complete expected behavior', async () => {
    // ARRANGE: Preparar datos
    
    // ACT: Ejecutar acción
    
    // ASSERT: Validar resultado
  });
});
```

## 🎓 Principios SOLID en Tests

- **S** - Single Responsibility: Cada test valida un solo comportamiento
- **O** - Open/Closed: Helpers extensibles sin modificar código existente
- **L** - Liskov Substitution: Mocks intercambiables con servicios reales
- **I** - Interface Segregation: Helpers especializados (API, DB, RabbitMQ)
- **D** - Dependency Inversion: Tests dependen de abstracciones

## 📈 Resultados Esperados

### ✅ Tests Exitosos
```
PASS  complete-flow.e2e.spec.ts (45.231s)
PASS  service-contracts.contract.spec.ts (22.145s)
PASS  resilience.resilience.spec.ts (38.892s)

Test Suites: 3 passed, 3 total
Tests:       28 passed, 28 total
Snapshots:   0 total
Time:        106.268s

Coverage:
  Branches:   75.23%
  Functions:  78.45%
  Lines:      76.89%
  Statements: 76.34%
```

## 🔗 Referencias

- [Jest Documentation](https://jestjs.io/)
- [Supertest](https://github.com/visionmedia/supertest)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Microservices Testing](https://martinfowler.com/articles/microservice-testing/)

## 📞 Soporte

Para problemas o preguntas sobre los tests E2E, consulta:
- Documentación de arquitectura en `/backend/ESTRUCTURA_DETALLADA.md`
- Historias de Usuario en `/HU.md`
- Plan de implementación en `/plan_implementacion_logros_gaming.md`
