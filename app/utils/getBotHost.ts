import Logger from '@ioc:Adonis/Core/Logger'

export default async function getBotHost(botName: string): Promise<string> {
  const botEnv = process.env.BOT_ENV || 'production'
  const protocol = process.env.BOT_PROTOCOL || 'http'
  const stackName = botName?.toLowerCase()
  const serviceName = process.env.PRODUCTION_RASA_SERVICE_NAME || 'rasa'
  const servicePort = process.env.PRODUCTION_RASA_PORT || '5005'
  const devUrl: string = process.env.BOT_DEV_URL || 'http://localhost:5005'
  const productionUrl: string = `${protocol}://${stackName}_${serviceName}:${servicePort}`

  try {
    if (botEnv === 'development') {
      return devUrl
    }
    return productionUrl
  } catch (error) {
    Logger.error(error)
    return error
  }
}
