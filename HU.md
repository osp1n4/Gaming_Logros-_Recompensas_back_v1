título sugerido: Gestión Automatizada de Logros Basada en Catálogo de Acciones


## HU 1: Gestión de Jugadores y Publicación de Eventos de Gameplay

como usuario del sistema de logros,
quiero que el Player Service gestione el registro de jugadores y capture los eventos relevantes del juego de manera confiable,
para que estos eventos sean procesados por los servicios de logros y recompensas, manteniendo un registro preciso del progreso de cada jugador.

descripción y contexto:
El Player Service es el microservicio responsable de gestionar el ciclo de vida de los jugadores y actuar como punto de entrada para los eventos del juego. Este servicio implementa el patrón Proxy para validar eventos antes de publicarlos en RabbitMQ, garantizando que solo eventos válidos sean procesados por los servicios downstream. El servicio mantiene un registro actualizado de las estadísticas de cada jugador (monstruos eliminados, tiempo de juego).

criterios de aceptación (ac):

ac 1: registro exitoso de nuevos jugadores

dado que un nuevo jugador se registra en el sistema,
cuando se envía una solicitud PUT /players con username y email únicos,
entonces el sistema crea el jugador con estadísticas inicializadas en cero (monstersKilled=0, timePlayed=0), y devuelve el objeto del jugador con código HTTP 201 Created.

ac 2: validación de duplicidad en registro de jugador

dado que se intenta registrar un jugador con username o email ya existente,
cuando se envía la solicitud de registro,
entonces el sistema muestra un mensaje indicando "El nombre de usuario ya existe".


ac 3: actualización de información de jugadores

dado que un jugador existente necesita actualizar su información,
cuando se envía una solicitud POST /players/:id con username y/o email nuevos,
entonces el sistema valida la unicidad de los campos modificados, actualiza solo los campos proporcionados, persiste los cambios, y devuelve el jugador actualizado con código HTTP 200.

ac 4: eliminación de un jugador

dado que se requiere eliminar un jugador del sistema,
cuando se envía una solicitud DELETE /players/:id,
entonces el sistema devuelve código HTTP 204.

ac 5: consulta de jugadores activos

dado que se requiere listar los jugadores activos del sistema,
cuando se envía una solicitud GET /players,
entonces el sistema devuelve la lista de los jugadores activos

ac 6: consulta de jugador específico

dado que se requiere consultar la información de un jugador específico,
cuando se envía una solicitud GET /players/:id con un ID válido,
entonces el sistema devuelve los datos completos del jugador con código HTTP 200.


## HU 2: reward service - asignación de recompensas basada en estrategias


como usuario del sistema de logros,
quiero que el Reward Service asigne recompensas de forma flexible mediante estrategias configurables cuando un jugador desbloquee un logro,
para otorgar monedas y puntos según reglas de negocio personalizables, mantener un registro de balance por jugador y permitir consultas del historial de recompensas.

descripción y contexto:
El servicio de recompensas es el encargado de premiar automáticamente a los jugadores cuando desbloquean logros. Funciona escuchando notificaciones del servicio de logros y calculando cuántas monedas y puntos debe recibir cada jugador. El sistema debera ofrecer flexibilidad para otorgar recompensas de diferentes formas: puede dar cantidades fijas siempre iguales, puede escalar las recompensas según el progreso acumulado del jugador (premiando más a quienes ya han avanzado más). Todas las recompensas quedan registradas en el historial del jugador, permitiendo consultar su balance total de monedas y puntos acumulados, así como revisar cuándo y por qué recibió cada recompensa.


criterios de aceptación (ac):

ac 1: asignación manual de recompensas mediante api rest

dado que se requiere otorgar una recompensa a un jugador,
cuando se envía una solicitud POST /api/rewards/assign con playerId, achievementId y strategy (fixed, dynamic o bonus),
entonces el sistema devuelve el objeto Reward creado con código HTTP 201 Created.

ac 2: consumo automático de eventos achievement.unlocked

dado que el Achievement Service publica un evento `achievement.unlocked` en RabbitMQ con {playerId, achievementId, timestamp},
cuando el Reward Service consume el evento,
entonces el sistema asigna automáticamente una recompensa


ac 3: consulta de historial de recompensas de un jugador

dado que se requiere visualizar el historial completo de recompensas de un jugador,
cuando se envía una solicitud GET /api/rewards/players/:playerId,
entonces el sistema devuelve todas las recompensas del jugador con playerId, achievementId, rewardType, rewardAmount, con código HTTP 200.

ac 4: consulta de balance actual de un jugador

dado que se requiere conocer el balance acumulado de un jugador,
cuando se envía una solicitud GET /api/rewards/balance/:playerId,
entonces el sistema devuelve el objeto PlayerBalance con totalCoins, totalPoints, playerId y updatedAt, con código HTTP 200.


## HU 3: Achievement Service - Evaluación de Logros y Gestión de Progreso

como usuario del sistema de logros,
quiero que el Achievement Service evalúe automáticamente los eventos del juego y gestione el progreso de los logros de cada jugador,
para desbloquear logros cuando se cumplan los requisitos, mantener un registro actualizado del avance y permitir consultar el catálogo de logros disponibles.

descripción y contexto:
El servicio de logros es el encargado de escuchar las acciones que realizan los jugadores y determinar si han alcanzado algún logro. Funciona recibiendo notificaciones cada vez que un jugador mata monstruos o acumula tiempo de juego, comparando estos valores contra un catálogo de logros predefinido. Cada logro tiene requisitos específicos (por ejemplo, matar 10 monstruos o jugar 60 minutos) y el sistema lleva un registro del progreso de cada jugador hacia cada logro. Cuando un jugador alcanza el objetivo de un logro, el sistema lo marca como desbloqueado y notifica al servicio de recompensas para que otorgue el premio correspondiente.

criterios de aceptación (ac):

ac 1: consumo de eventos del jugador

dado que el Player Service publica un evento de jugador (monster_killed o time_played),
cuando el Achievement Service consume el evento desde RabbitMQ,
entonces el sistema identifica los logros aplicables a ese tipo de evento y evalúa el progreso del jugador.

ac 2: evaluación y desbloqueo de logros

dado que un jugador alcanza el valor requerido para un logro (por ejemplo, 10 monstruos eliminados),
cuando el sistema evalúa el evento,
entonces marca el logro como desbloqueado, actualiza el progreso a 100%, establece la fecha de desbloqueo, y publica un evento achievement.unlocked hacia RabbitMQ.

ac 3: actualización incremental de progreso

dado que un jugador realiza acciones que contribuyen a un logro pero aún no cumple el requisito completo,
cuando el sistema evalúa el evento,
entonces actualiza el valor de progreso acumulado del jugador para ese logro sin marcarlo como desbloqueado.


ac 4: consulta de logros de un jugador

dado que se requiere visualizar los logros de un jugador específico,
cuando se envía una solicitud GET /achievements/players/:playerId,
entonces el sistema devuelve todos los logros del jugador incluyendo su estado (desbloqueado o en progreso), valor actual de progreso, y con código HTTP 200.


ac 5: publicación de eventos de logro desbloqueado

dado que un logro ha sido desbloqueado para un jugador,
cuando el sistema confirma el desbloqueo,
entonces publica un evento achievement.unlocked en RabbitMQ con formato {playerId, achievementId, timestamp} en el exchange 'achievement-service' con routing key 'achievement.unlocked'.




