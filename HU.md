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

ac 4: manejo de logros temporales y basados en eventos

dado que existe un logro con ventana de tiempo o evento específico (por ejemplo, evento de aniversario),
cuando el jugador realiza la acción relevante dentro del periodo definido,
entonces el logro puede ser desbloqueado y la recompensa asignada solo si se cumplen las condiciones temporales.

ac 5: manejo de errores en la recepción de eventos

dado que el sistema no puede recibir un evento debido a problemas de comunicación con el motor del juego,
cuando el juego intenta enviar el evento,
entonces el sistema registra el error, notifica al equipo técnico y asegura que no se pierda la integridad de los datos.

ac 6: visualización de logros y recompensas

dado que el jugador ha desbloqueado logros y recibido recompensas,
cuando accede a su perfil en el sistema,
entonces puede visualizar el historial de logros y recompensas obtenidas en su idioma configurado, incluyendo detalles como fecha de desbloqueo y progreso acumulado.