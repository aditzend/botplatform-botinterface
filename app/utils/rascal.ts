import rascal from 'rascal'
import Logger from '@ioc:Adonis/Core/Logger'
const logger = Logger.child({ module: 'rascal' })

export async function connectQueue() {
  try {
    const definitions = {
      vhosts: {
        '/': {
          connection: {
            slashes: false,
            protocol: 'amqp',
            hostname: '192.168.43.169',
            user: 'guest',
            password: 'guest',
            port: 5672,
            vhost: '/',
          },
        },
      },
    }
    const config = rascal.withTestConfig(definitions)
    logger.debug({ config }, 'Rascal config')
    const broker = await rascal.BrokerAsPromised.create(config)
    const queue = await broker.assertQueue('denver_etl')
    return queue
  } catch (error) {
    logger.error({ error }, 'Error connecting to queue')
  }
}
