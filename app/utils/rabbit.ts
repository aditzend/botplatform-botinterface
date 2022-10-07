//RabbitMQ
import amqp from 'amqplib/callback_api'
import Logger from '@ioc:Adonis/Core/Logger'
const logger = Logger.child({ module: 'rabbit' })

const rabbitUrl = process.env.RABBITMQ_HOST || 'amqp://localhost:5672'

export type QueueParams = {
  queueName: string
  data: object
}

export function sendRabbitMQ({ queueName, data }: QueueParams) {
  const payload = JSON.stringify(data)
  amqp.connect(rabbitUrl, function (error0, connection) {
    if (error0) {
      throw error0
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1
      }
      channel.assertQueue(queueName, {
        durable: true,
      })
      channel.sendToQueue(queueName, Buffer.from(payload), { persistent: true })
      logger.info(`[x] Sent ${payload} to ${queueName}`)
    })
    setTimeout(function () {
      connection.close()
    }, 500)
  })
}

// const msg = {
//   interaction_id: "211203122948891_CHT_56000",
//   bot_name: "alojamiento",
// };
// ;

// sendRabbitMQ("alojamiento_etl", JSON.stringify(msg));
