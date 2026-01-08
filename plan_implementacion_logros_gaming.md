# 🕹️ Gaming – Sistema de Logros y Recompensas
## Plan de Implementación por Fases

**Arquitectura:** Modular Microservicios  
**Objetivo:** Implementar un sistema sencillo pero funcional para gestionar logros y recompensas basados en eventos del jugador.

---

## 1️⃣ Fase 0 – Definición y Diseño

### Objetivo
Establecer las bases conceptuales y arquitectónicas del proyecto.

### Actividades
- Definir alcance funcional del sistema.
- Identificar microservicios y responsabilidades.
- Definir eventos principales del sistema.
- Seleccionar patrones de diseño:
  - Observer
  - Proxy (simplificado)
- Diseñar flujo de datos de alto nivel.
- Definir modelo de datos inicial.

### Entregables
- Documento de arquitectura.
- Diagrama de flujo de alto nivel.
- Lista de eventos y entidades.

---

## 2️⃣ Fase 1 – Infraestructura Base y Contenedores

### Objetivo
Preparar el entorno técnico y de despliegue.

### Actividades
- Crear repositorios por microservicio.
- Configurar Node.js y TypeScript.
- Definir estructura modular interna.
- Crear imágenes de contenedores usando **Docker**.
- Crear contenedores para:
  - Player Service
  - Achievement Service
  - Reward Service
  - RabbitMQ
  - PostgreSQL
- Configurar red interna entre contenedores.

### Entregables
- Containerfiles.
- Imágenes de los servicios.
- Entorno local funcional con Docker.

---

## 3️⃣ Fase 2 – Player Service (Generador de Eventos)

### Objetivo
Gestionar jugadores y emitir eventos del juego.

### Funcionalidades
- Registro de jugadores.
- Recepción de eventos:
  - Matar monstruos.
  - Tiempo de juego.
- Validación básica de eventos (Proxy).
- Publicación de eventos en RabbitMQ.

### Eventos Emitidos
- `player.event.monster_killed`
- `player.event.time_played`

### Metodología TDD
- **Red**: Escribir tests para registro de jugadores antes de implementar.
  - Commit: "RED test: add failing test for player registration"
  - Push: `git push` al repositorio remoto
- **Green**: Implementar lógica mínima para pasar tests.
  - Commit: "GREEN: implement player registration to pass tests"
  - Push: `git push` al repositorio remoto
- **Refactor**: Optimizar código manteniendo tests en verde.
  - Commit: "REFACTOR: optimize player registration logic"
  - Push: `git push` al repositorio remoto
- **Ciclo estricto**: Seguir Red → Green → Refactor sin saltarse pasos.
  - **Después de cada paso**: Ejecutar `git push` para sincronizar con GitHub.
- **Cobertura**: Controllers, Services, Repositories, Event Publishers.
- **Tests Unitarios**: Cobertura mayor a 70% en lógica de negocio (Services).

### Código Limpio y Principios SOLID
- **0 violaciones a principios SOLID**:
  - **S**: Single Responsibility - Cada clase una sola responsabilidad.
  - **O**: Open/Closed - Abierto a extensión, cerrado a modificación.
  - **L**: Liskov Substitution - Subclases sustituibles por clases base.
  - **I**: Interface Segregation - Interfaces específicas, no genéricas.
  - **D**: Dependency Inversion - Depender de abstracciones, no de concreciones.
- **Clean Code**: Nombres descriptivos, funciones pequeñas, sin duplicación.

### Entregables
- Player Service funcional.
- Eventos publicados correctamente.
- Persistencia básica en PostgreSQL.
- **Suite de tests unitarios y de integración.**
- **Reporte de cobertura de código >70%.**

---

## 4️⃣ Fase 3 – Achievement Service (Observer)

### Objetivo
Evaluar reglas y desbloquear logros.

### Funcionalidades
- Escuchar eventos desde RabbitMQ.
- Evaluar condiciones de logros.
- Evitar duplicados.
- Guardar logros desbloqueados.

### Logros Iniciales
- Matar 10 monstruos.
- Jugar 5 horas.

### Eventos
- Consumidos: `player.event.*`
- Emitidos: `achievement.unlocked`

### Metodología TDD
- **Red**: Escribir tests para evaluación de reglas antes de implementar.
  - Commit: "RED: add failing test for achievement rule evaluation"
  - Push: `git push` al repositorio remoto
- **Green**: Implementar lógica de evaluación para pasar tests.
  - Commit: "GREEN: implement achievement rule evaluation"
  - Push: `git push` al repositorio remoto
- **Refactor**: Optimizar motor de reglas manteniendo tests verdes.
  - Commit: "REFACTOR: optimize achievement rules engine"
  - Push: `git push` al repositorio remoto
- **Ciclo estricto**: Seguir Red → Green → Refactor sin saltarse pasos.
  - **Después de cada paso**: Ejecutar `git push` para sincronizar con GitHub.
- **Cobertura**: Achievement Rules, Listeners, Services, Repositories.
- **Tests específicos**: Prevención de duplicados, ventanas temporales.
- **Tests Unitarios**: Cobertura mayor a 70% en lógica de negocio (Rules, Services).

### Código Limpio y Principios SOLID
- **0 violaciones a principios SOLID**:
  - **S**: Cada regla de logro en su propia clase.
  - **O**: Motor de reglas extensible sin modificar código existente.
  - **L**: Todas las reglas intercambiables por la interfaz base.
  - **I**: Interfaces específicas para evaluación, listeners, storage.
  - **D**: Servicios dependen de interfaces, no de implementaciones.
- **Clean Code**: Reglas legibles, evaluación clara, sin lógica duplicada.

### Entregables
- Achievement Service funcional.
- Logros evaluados y almacenados.
- **Tests de reglas de logros y listeners.**
- **Reporte de cobertura de código >70%.**

---

## 5️⃣ Fase 4 – Reward Service

### Objetivo
Otorgar recompensas asociadas a logros.

### Funcionalidades
- Escuchar eventos de logros desbloqueados.
- Asignar recompensas.
- Registrar recompensas otorgadas.

### Recompensas Iniciales
- Monedas virtuales.
- Ítems básicos.

### Eventos Consumidos
- `achievement.unlocked`

### Metodología TDD
- **Red**: Escribir tests para estrategias de recompensa antes de implementar.
  - Commit: "RED: add failing test for reward strategy"
  - Push: `git push` al repositorio remoto
- **Green**: Implementar estrategias (Fixed, Dynamic, Bonus) para pasar tests.
  - Commit: "GREEN: implement reward strategy [strategy-name]"
  - Push: `git push` al repositorio remoto
- **Refactor**: Optimizar estrategias manteniendo tests verdes.
  - Commit: "REFACTOR: optimize reward strategy logic"
  - Push: `git push` al repositorio remoto
- **Ciclo estricto**: Seguir Red → Green → Refactor sin saltarse pasos.
  - **Después de cada paso**: Ejecutar `git push` para sincronizar con GitHub.
- **Cobertura**: Reward Strategies, Listeners, Services, Repositories.
- **Tests específicos**: Cálculo de recompensas, actualización de balances.
- **Tests Unitarios**: Cobertura mayor a 70% en lógica de negocio (Strategies, Services).

### Código Limpio y Principios SOLID
- **0 violaciones a principios SOLID**:
  - **S**: Cada estrategia en su propia clase con responsabilidad única.
  - **O**: Sistema de estrategias extensible mediante Strategy Pattern.
  - **L**: Todas las estrategias sustituibles por interfaz común.
  - **I**: Interfaces segregadas para cálculo, asignación, persistencia.
  - **D**: RewardService depende de IRewardStrategy, no de clases concretas.
- **Clean Code**: Cálculos explícitos, nombres descriptivos, sin condicionales anidados.

### Entregables
- Reward Service funcional.
- Recompensas persistidas.
- **Tests de estrategias y asignación de recompensas.**
- **Reporte de cobertura de código >70%.**

---

## 6️⃣ Fase 5 – Integración y Flujo Completo

### Objetivo
Validar el funcionamiento end-to-end.

### Actividades
- Pruebas de comunicación entre servicios.
- Validar flujo:
  - Evento → Logro → Recompensa.
- Manejo básico de errores.
- Verificación de persistencia.

### Metodología TDD - Tests de Integración
- **Red**: Escribir tests E2E que fallen inicialmente.
  - Commit: "RED: add failing E2E test for complete flow"
  - Push: `git push` al repositorio remoto
- **Green**: Implementar integración para pasar tests E2E.
  - Commit: "GREEN: integrate services for E2E flow"
  - Push: `git push` al repositorio remoto
- **Refactor**: Optimizar comunicación entre servicios.
  - Commit: "REFACTOR: optimize inter-service communication"
  - Push: `git push` al repositorio remoto
- **Ciclo estricto**: Seguir Red → Green → Refactor sin saltarse pasos.
  - **Después de cada paso**: Ejecutar `git push` para sincronizar con GitHub.
- **Tests E2E**: Flujo completo desde evento hasta recompensa.
- **Tests de Contrato**: Validar comunicación entre servicios.
- **Tests de Resiliencia**: Manejo de errores y reintentos.
- **Cobertura**: Flujos completos, casos edge, escenarios de fallo.
- **Tests Unitarios**: Cobertura global mayor a 70% en todos los servicios.

### Código Limpio y Principios SOLID
- **Validación de 0 violaciones SOLID en integración**:
  - **S**: Cada orquestador con responsabilidad específica.
  - **O**: Comunicación extensible sin modificar servicios base.
  - **L**: Contratos respetados entre todos los servicios.
  - **I**: APIs de integración claras y específicas.
  - **D**: Servicios acoplados por interfaces, no por implementaciones.
- **Clean Code**: Manejo de errores claro, logging consistente, retry patterns.

### Entregables
- Sistema integrado.
- Evidencias de pruebas.
- Diagramas actualizados.
- **Suite completa de tests E2E y de integración.**
- **Reporte de cobertura consolidado >70%.**

---

## 7️⃣ Fase 6 – Observabilidad y Documentación

### Objetivo
Mejorar mantenibilidad y presentación del proyecto.

### Actividades
- Agregar logs por servicio.
- Documentar eventos.
- Documentar decisiones arquitectónicas.
- Crear README.
- Incluir guía de ejecución con Podman.

### Entregables
- Documentación técnica.
- Guía de despliegue.

---

## 8️⃣ Fase 7 – Mejoras Futuras (Opcional)

- Escalado horizontal.
- Nuevos logros dinámicos.
- Validaciones anti-cheat.
- API Gateway dedicado.
- Dashboard de logros.

---

# 🧰 Stack Tecnológico

## Backend
- Node.js
- TypeScript
- NestJS

## Base de Datos
- PostgreSQL

## Mensajería
- RabbitMQ

## Contenedores
- PDocker
- Containerfile

## Arquitectura
- Modular Microservicios
- Event-Driven Architecture
- Observer Pattern
- Proxy Pattern (simplificado)

## Herramientas
- Git
- REST API
- JSON

## Testing
- Jest (Framework de testing)
- Supertest (Tests E2E)
- TDD (Test-Driven Development)

## Principios y Buenas Prácticas
- **SOLID Principles** (0 violaciones permitidas)
- **Clean Code** (Código limpio y legible)
- **DRY** (Don't Repeat Yourself)
- **KISS** (Keep It Simple, Stupid)
