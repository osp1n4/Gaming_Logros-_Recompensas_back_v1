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

### Entregables
- Player Service funcional.
- Eventos publicados correctamente.
- Persistencia básica en PostgreSQL.

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

### Entregables
- Achievement Service funcional.
- Logros evaluados y almacenados.

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

### Entregables
- Reward Service funcional.
- Recompensas persistidas.

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

### Entregables
- Sistema integrado.
- Evidencias de pruebas.
- Diagramas actualizados.

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
