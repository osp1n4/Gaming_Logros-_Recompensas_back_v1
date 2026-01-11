título sugerido: Gestión Automatizada de Logros Basada en Catálogo de Acciones

historia de usuario:

como jugador del sistema de logros,
quiero que el sistema detecte automáticamente las acciones relevantes que realizo en el juego mediante un catálogo predefinido,
para desbloquear logros y recibir recompensas que mejoren mi experiencia, incluyendo logros temporales y visualización internacionalizada.

descripción y contexto:
El sistema de logros y recompensas busca incrementar la retención y el compromiso de los jugadores a través de un mecanismo automatizado, desacoplado del núcleo del juego, y basado en microservicios y eventos. Una “acción relevante” es cualquier evento del jugador incluido en un catálogo predefinido (por ejemplo, ENEMY_KILLED, MISSION_COMPLETED, TIME_PLAYED). El sistema debe ser capaz de gestionar tanto logros permanentes como logros temporales o basados en eventos específicos, definidos por ventanas de tiempo. La integración depende del motor del juego, que emite los eventos mediante API o colas de mensajes. Además, toda la información de logros y recompensas debe estar internacionalizada para soportar múltiples idiomas, almacenando los textos mediante claves de idioma.

criterios de aceptación (ac):

ac 1: detección y desbloqueo de logros exitoso

dado que el jugador realiza una acción incluida en el catálogo predefinido de acciones relevantes,
cuando el sistema recibe el evento correspondiente,
entonces el sistema evalúa si la acción cumple los requisitos de un logro (permanente o temporal), desbloquea el logro y asigna la recompensa correspondiente al jugador.

ac 2: manejo de acciones no relevantes

dado que el jugador realiza una acción que no está en el catálogo de acciones relevantes,
cuando el sistema recibe el evento,
entonces el sistema no desbloquea ningún logro ni asigna recompensa, pero registra el evento para trazabilidad.

ac 3: persistencia e internacionalización de logros y recompensas

dado que un logro ha sido desbloqueado y una recompensa asignada,
cuando el proceso es exitoso,
entonces el sistema almacena la información del logro y la recompensa, incluyendo las claves de idioma para nombres y descripciones, asegurando su disponibilidad para consultas futuras y visualización multilenguaje.


ac 4: visualización de logros y recompensas

dado que el jugador ha desbloqueado logros y recibido recompensas,
cuando accede a su perfil en el sistema,
entonces puede visualizar el historial de logros y recompensas obtenidas en su idioma configurado, incluyendo detalles como fecha de desbloqueo y progreso acumulado.

---

## historia de usuario 2: player service - gestión de jugadores y eventos del juego

título sugerido: Gestión de Jugadores y Publicación de Eventos de Gameplay

historia de usuario:

como administrador del sistema de logros,
quiero que el Player Service gestione el registro de jugadores y capture los eventos relevantes del juego de manera confiable,
para que estos eventos sean procesados por los servicios de logros y recompensas, manteniendo un registro preciso del progreso de cada jugador.

descripción y contexto:
El Player Service es el microservicio responsable de gestionar el ciclo de vida de los jugadores y actuar como punto de entrada para los eventos del juego. Este servicio implementa el patrón Proxy para validar eventos antes de publicarlos en RabbitMQ, garantizando que solo eventos válidos sean procesados por los servicios downstream. El servicio mantiene un registro actualizado de las estadísticas de cada jugador (monstruos eliminados, tiempo de juego) y proporciona una API REST para operaciones CRUD. La arquitectura está diseñada siguiendo principios SOLID, con inyección de dependencias, interfaces abstractas y separación de responsabilidades entre controladores, servicios y repositorios. El servicio se despliega como contenedor Docker y se conecta a PostgreSQL para persistencia y RabbitMQ para mensajería asíncrona.

criterios de aceptación (ac):

ac 1: registro exitoso de nuevos jugadores

dado que un nuevo jugador se registra en el sistema,
cuando se envía una solicitud PUT /players con username y email únicos,
entonces el sistema crea el jugador con estadísticas inicializadas en cero (monstersKilled=0, timePlayed=0), persiste los datos en PostgreSQL, y devuelve el objeto del jugador con código HTTP 201 Created.

ac 2: validación de unicidad en registro

dado que se intenta registrar un jugador con username o email ya existente,
cuando se envía la solicitud de registro,
entonces el sistema rechaza la operación con código HTTP 409 Conflict y un mensaje descriptivo indicando el campo duplicado, sin crear ningún registro.

ac 3: procesamiento y validación de eventos del juego

dado que el jugador realiza una acción en el juego (MONSTER_KILLED o TIME_PLAYED),
cuando el motor del juego envía el evento a POST /players/events con playerId, eventType y value positivo,
entonces el sistema valida que el jugador exista, valida que el value sea positivo, actualiza las estadísticas del jugador incrementando el contador correspondiente, publica el evento en RabbitMQ para procesamiento downstream, y devuelve el jugador actualizado con código HTTP 200.

ac 4: actualización de información de jugadores

dado que un jugador existente necesita actualizar su información,
cuando se envía una solicitud POST /players/:id con username y/o email nuevos,
entonces el sistema valida la unicidad de los campos modificados, actualiza solo los campos proporcionados, persiste los cambios, y devuelve el jugador actualizado con código HTTP 200.

ac 5: eliminación lógica (soft delete) de jugadores

dado que se requiere eliminar un jugador del sistema,
cuando se envía una solicitud DELETE /players/:id,
entonces el sistema marca el jugador como inactivo (isActive=false) sin eliminar físicamente el registro, mantiene la integridad histórica de los datos, y devuelve código HTTP 200 o 204.

ac 6: consulta de jugadores activos

dado que se requiere listar los jugadores activos del sistema,
cuando se envía una solicitud GET /players,
entonces el sistema devuelve únicamente los jugadores con isActive=true, incluyendo sus estadísticas actuales (monstersKilled, timePlayed), y devuelve código HTTP 200 con un arreglo JSON.

ac 7: consulta de jugador específico

dado que se requiere consultar la información de un jugador específico,
cuando se envía una solicitud GET /players/:id con un ID válido,
entonces el sistema devuelve los datos completos del jugador incluyendo todas sus estadísticas y fechas de creación/actualización con código HTTP 200, o devuelve HTTP 404 Not Found si el jugador no existe.

ac 8: manejo de errores y validaciones

dado que se reciben datos inválidos o se producen errores en el servicio,
cuando ocurre una validación fallida o error técnico,
entonces el sistema devuelve códigos HTTP apropiados (400 Bad Request para datos inválidos, 404 Not Found para recursos inexistentes, 409 Conflict para duplicados, 500 Internal Server Error para errores del servidor), incluye mensajes descriptivos en el cuerpo de la respuesta, y registra los errores para trazabilidad.


ac 10: cobertura de pruebas automatizadas

dado que el servicio debe mantener alta calidad de código,
cuando se ejecuta la suite de pruebas con npm run test:cov,
entonces la cobertura de código debe ser mayor al 70% en statements, branches y lines, todas las pruebas unitarias deben pasar exitosamente, y los tests deben cubrir controllers, services, repositories y event publishers siguiendo metodología TDD.

---

## historia de usuario 3: achievement service - evaluación de eventos y gestión de logros

título sugerido: Asignación y Progreso de Logros Basada en Eventos

historia de usuario:

como administrador del sistema de logros,
quiero que el Achievement Service evalúe eventos del jugador (MONSTER_KILLED, TIME_PLAYED) publicados en RabbitMQ y gestione el catálogo de logros,
para asignar logros de forma idempotente, calcular su progreso y permitir consultas del catálogo y los logros de cada jugador.

descripción y contexto:
El Achievement Service es el microservicio responsable de:
- consumir eventos del jugador desde RabbitMQ (colas definidas en el sistema),
- evaluar reglas de logros contra un catálogo persistido en PostgreSQL,
- asignar logros de forma idempotente y calcular su progreso,
- exponer una API REST para consultar el catálogo de logros y el estado de los logros por jugador.
Sigue principios SOLID, con separación entre controladores, servicios, repositorios, entidades y reglas (strategy/rule pattern). La persistencia se realiza con TypeORM y las reglas incluyen al menos MONSTER_KILLED y TIME_PLAYED. El servicio se despliega en Docker y utiliza configuración por variables de entorno, incluyendo el prefijo global de API `/api` y binding a `0.0.0.0`.

criterios de aceptación (ac):

ac 1: consumo de eventos y evaluación de reglas

dado que el Player Service publica un evento válido en RabbitMQ (playerId, eventType, value),
cuando el Achievement Service consume el evento,
entonces aplica la regla correspondiente (por ejemplo, MONSTER_KILLED o TIME_PLAYED), actualiza el progreso del logro o lo desbloquea si cumple los requisitos, y persiste los cambios en PostgreSQL.

ac 2: idempotencia en asignación de logros

dado que un jugador cumple repetidamente los criterios de un mismo logro,
cuando el sistema intenta asignar el logro que ya fue desbloqueado anteriormente,
entonces el servicio no crea duplicados, mantiene una única relación jugador-logro, y solo actualiza el progreso si aplica.

ac 3: consulta de catálogo de logros

dado que se requiere listar los logros disponibles,
cuando se envía una solicitud GET /api/achievements,
entonces el servicio devuelve el catálogo con código, nombre, descripción y tipo de cálculo (por ejemplo, por conteo de monstruos o por tiempo de juego), con código HTTP 200.

ac 4: consulta de logros de un jugador

dado que se requiere visualizar los logros de un jugador específico,
cuando se envía una solicitud GET /api/achievements/players/:playerId,
entonces el servicio devuelve los logros del jugador con su estado actual (desbloqueado/progreso), incluyendo `progress` y fechas relevantes, con código HTTP 200.

ac 5: consulta de progreso de un logro específico

dado que se requiere obtener el progreso de un logro para un jugador,
cuando se envía una solicitud GET /api/achievements/players/:playerId/:achievementId/progress,
entonces el servicio devuelve el objeto de progreso con sus campos actuales (por ejemplo, `progress`, `isUnlocked`, `updatedAt`) con código HTTP 200, o HTTP 404 si no existe.

ac 6: persistencia y consistencia transaccional

dado que el servicio procesa eventos y actualiza múltiples entidades (logros y progreso de jugador),
cuando se realiza la operación de evaluación y asignación,
entonces el sistema persiste los cambios de manera transaccional, garantizando consistencia incluso bajo concurrencia.

ac 7: manejo de errores y validaciones

dado que se reciben eventos inválidos o se producen errores de persistencia/conexión,
cuando el servicio procesa el evento o atiende una solicitud HTTP,
entonces devuelve códigos HTTP apropiados (400/404/409/500 según el caso), registra el error para trazabilidad y reintenta la conexión a RabbitMQ cuando sea necesario.

ac 8: publicación de eventos de logro desbloqueado (opcional)

dado que un logro ha sido desbloqueado para un jugador,
cuando el servicio confirma la asignación,
entonces puede publicar un evento `achievement.unlocked` con `{playerId, achievementId, timestamp}` para consumo por el Reward Service u otros componentes, asegurando desac acoplamiento.

ac 9: internacionalización y metadatos

dado que el sistema debe soportar múltiples idiomas,
cuando se consultan los logros,
entonces el servicio devuelve claves de idioma para `nameKey` y `descriptionKey` y metadatos del logro para que el cliente resuelva los textos internacionalizados.

ac 10: cobertura de pruebas automatizadas

dado que el servicio debe mantener alta calidad de código,
cuando se ejecuta la suite de pruebas con npm run test:cov,
entonces la cobertura de código debe ser mayor al 70% en statements, branches y lines; las pruebas deben cubrir controllers, services, repositories, event listeners/publishers y reglas de logro (strategy) siguiendo TDD.

---

## historia de usuario 4: reward service - asignación de recompensas basada en estrategias

título sugerido: Asignación Flexible de Recompensas mediante Estrategias Configurables

historia de usuario:

como administrador del sistema de logros,
quiero que el Reward Service asigne recompensas de forma flexible mediante estrategias configurables cuando un jugador desbloquee un logro,
para otorgar monedas y puntos según reglas de negocio personalizables (fijas, dinámicas o con bonificación), mantener un registro de balance por jugador y permitir consultas del historial de recompensas.

descripción y contexto:
El Reward Service es el microservicio responsable de:
- consumir eventos `achievement.unlocked` desde RabbitMQ publicados por el Achievement Service,
- calcular recompensas mediante el patrón Strategy, soportando al menos tres estrategias: Fixed (montos constantes), Dynamic (escalado basado en balance actual del jugador), y Bonus (multiplicador configurable por variable de entorno),
- persistir las recompensas otorgadas y actualizar el balance acumulado de cada jugador (totalCoins, totalPoints),
- exponer una API REST para asignar recompensas manualmente, consultar historial de recompensas por jugador y obtener el balance actual.
Sigue principios SOLID con inyección de dependencias, Strategy Pattern para el cálculo de recompensas, separación de responsabilidades entre controladores, servicios, repositorios, estrategias y listeners. La persistencia se realiza con TypeORM en PostgreSQL (entidades Reward y PlayerBalance). El servicio se despliega como contenedor Docker con configuración por variables de entorno, incluyendo el prefijo global de API `/api` y binding a `0.0.0.0`.

criterios de aceptación (ac):

ac 1: asignación manual de recompensas mediante api rest

dado que se requiere otorgar una recompensa a un jugador,
cuando se envía una solicitud POST /api/rewards/assign con playerId, achievementId y strategy (fixed, dynamic o bonus),
entonces el sistema selecciona la estrategia indicada, calcula la recompensa correspondiente (coins y points), crea un registro de recompensa con tipo, monto y fecha de asignación, actualiza el balance del jugador sumando los valores calculados, persiste ambos cambios en PostgreSQL, y devuelve el objeto Reward creado con código HTTP 201 Created.

ac 2: consumo automático de eventos achievement.unlocked

dado que el Achievement Service publica un evento `achievement.unlocked` en RabbitMQ con {playerId, achievementId, timestamp},
cuando el Reward Service consume el evento,
entonces el sistema asigna automáticamente una recompensa utilizando la estrategia por defecto (fixed), actualiza el balance del jugador, persiste los cambios, y realiza acknowledge (ACK) del mensaje para confirmar el procesamiento exitoso.

ac 3: estrategia fixed - recompensa fija

dado que se asigna una recompensa con estrategia "fixed",
cuando el sistema calcula la recompensa,
entonces devuelve montos constantes definidos (100 coins y 50 points), sin considerar el balance previo del jugador, garantizando valores predecibles y consistentes.

ac 4: estrategia dynamic - escalado por balance

dado que se asigna una recompensa con estrategia "dynamic",
cuando el sistema calcula la recompensa,
entonces devuelve un monto base (50 coins y 25 points) más un 1% del balance actual del jugador (Math.floor(totalCoins * 0.01) y Math.floor(totalPoints * 0.01)), incentivando el progreso acumulado del jugador.

ac 5: estrategia bonus - multiplicador configurable

dado que se asigna una recompensa con estrategia "bonus",
cuando el sistema calcula la recompensa,
entonces lee la variable de entorno BONUS_MULTIPLIER (por defecto 2), multiplica los valores base (100 coins y 50 points) por el multiplicador, y devuelve el resultado (por defecto 200 coins y 100 points), permitiendo ajustes dinámicos sin redespliegue.

ac 6: consulta de historial de recompensas de un jugador

dado que se requiere visualizar el historial completo de recompensas de un jugador,
cuando se envía una solicitud GET /api/rewards/players/:playerId,
entonces el sistema devuelve todas las recompensas del jugador con playerId, achievementId, rewardType, rewardAmount, awardedAt e isClaimed, ordenadas por fecha de asignación, con código HTTP 200.

ac 7: consulta de balance actual de un jugador

dado que se requiere conocer el balance acumulado de un jugador,
cuando se envía una solicitud GET /api/rewards/balance/:playerId,
entonces el sistema devuelve el objeto PlayerBalance con totalCoins, totalPoints, playerId y updatedAt, creando un registro con valores en cero si el jugador no tiene balance previo, con código HTTP 200.

ac 8: consulta de todas las recompensas del sistema

dado que se requiere auditar o visualizar todas las recompensas otorgadas,
cuando se envía una solicitud GET /api/rewards,
entonces el sistema devuelve la lista completa de recompensas registradas en el sistema con todos sus campos, con código HTTP 200.

ac 9: actualización transaccional de balance

dado que el sistema asigna una recompensa y actualiza el balance del jugador,
cuando se ejecuta la operación de asignación,
entonces el sistema garantiza atomicidad transaccional: si falla la persistencia de la recompensa o la actualización del balance, toda la operación se revierte (rollback), evitando inconsistencias entre las entidades Reward y PlayerBalance.

ac 10: manejo de estrategias inexistentes

dado que se intenta asignar una recompensa con una estrategia no registrada,
cuando el sistema busca la estrategia en el mapa de estrategias y no la encuentra,
entonces lanza una excepción con mensaje descriptivo "Unknown reward strategy: [nombre]", devuelve código HTTP 400 Bad Request, y no persiste ningún cambio.

ac 11: manejo de errores y validaciones

dado que se reciben datos inválidos o se producen errores de persistencia/conexión,
cuando el servicio procesa un evento o atiende una solicitud HTTP,
entonces devuelve códigos HTTP apropiados (400 Bad Request para datos inválidos, 404 Not Found para recursos inexistentes, 500 Internal Server Error para errores del servidor), incluye mensajes descriptivos en el cuerpo de la respuesta, registra los errores para trazabilidad, y realiza negative acknowledge (NACK) en RabbitMQ para reintentar eventos fallidos.

ac 12: idempotencia y prevención de duplicados

dado que el sistema recibe múltiples veces el mismo evento achievement.unlocked debido a reintentos o errores de red,
cuando se procesa el evento repetido,
entonces el sistema implementa mecanismos para detectar duplicados (por ejemplo, validando combinaciones únicas de playerId + achievementId + timestamp o usando identificadores de mensaje), evita crear recompensas duplicadas, y mantiene la integridad del balance del jugador.

ac 13: extensibilidad del sistema de estrategias

dado que se requiere agregar nuevas estrategias de recompensa en el futuro,
cuando se desarrolla una nueva estrategia,
entonces el sistema permite extender la funcionalidad implementando la interfaz RewardStrategy, registrando la nueva estrategia en el mapa del servicio, sin modificar el código existente de otras estrategias ni del RewardService (cumpliendo Open/Closed Principle).

ac 14: cobertura de pruebas automatizadas

dado que el servicio debe mantener alta calidad de código,
cuando se ejecuta la suite de pruebas con npm run test:cov,
entonces la cobertura de código debe ser mayor al 70% en statements, branches y lines, todas las pruebas unitarias deben pasar exitosamente, y los tests deben cubrir controllers, services, repositories, event listeners, y todas las estrategias de recompensa (fixed, dynamic, bonus) siguiendo metodología TDD con ciclos Red-Green-Refactor.

