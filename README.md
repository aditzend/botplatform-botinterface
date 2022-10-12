# botinterface
Interfaz de conexión a apis de RASA

## Hacer un llamado

`http://[ip]:[puerto]/v1/messages`

POST

Body:
```
{
  sender: string
  message: string
  channel: string
  bot_name: string
  load_parameters: boolean
  get_context: boolean
  analyze: boolean
}
```

`sender` Identifica al interlocutor, generalmente es igual al id de interacción.

`message` Uteración, acepta intenciones (las que empiezan con /)
`channel` Para ajustar la respuesta al canal. Opciones válidas: WEB, SMS, WHATSAPP, FACEBOOK, INSTAGRAM, TWITTER, PHONE, VOICE
`bot_name` Nombre del stack al que desea llamar
`load_parameters` Si es verdadero se cargan los slots del bot que empiezan con 'pts_' como parámetros de salida de la tarea. Solo funciona para campañas salientes porque sino no hay idTarea donde cargarlos.
`get_context` Si es verdadero devuelve toda la información de contexto de RASA.
`analyze` Si es verdadero el mensaje se sube a la cola de trabajo de analytics. No importa si get_context es falso, el contexto se sube por detrás a la cola de RabbitMQ.

# Versiones
1.1.0 : Devuelve contexto en cada interacción
1.2.0: Opciones get_context, analyze y load_parameters

# ENV
```
ENV_NAME : Nombre del ambiente || 'STAGING CLIENTE A'
PORT: Puerto de salida || 3333
HOST: Ip interna || 0.0.0.0
NODE_ENV: Entorno de Node para seleccionar salida de logs || production
APP_KEY: Clave de app || 1juZdKzqEi2XiJJu1LR-HI7cH4dChzl5
DRIVE_DISK: Disco || local
BOTPLATFORM_IP: Ip de la VM donde viven los bots || 192.168.43.169
LOG_LEVEL: Nivel de logging || info
BOT_ENV: Para desarrollar usar 'development' || production
BOT_DEV_URL: Si BOT_ENV es 'development' se conecta a esta url ||http://10.30.0.20:43005
BOT_WAKE_UP_WORD: Intención para arrancar un bot || /start
PRODUCTION_RASA_SERVICE_NAME: Nombre de los servicios de bot || rasa

#1.2.0 Values
RABBITMQ_HOST: Cola de tareas para analytics || amqp://192.168.43.169:5672/
DBINTERFACE_URL: API de la base || http://192.168.43.169:30040
OUTGOING_TASK_PARAM_PREFIX: Prefijo de los slots que se suben como parámetros de tarea de salida || pts_
```

