import Logger from '@ioc:Adonis/Core/Logger'
import { RasaResponse } from './postRasaMessage'
import transformRasaEvent from './transformRasaEvent'
const logger = Logger.child({ module: 'botMessageProcessor' })

export type BotEvent = {
  Message: string
  EventName: string
}

export async function botMessageProcessor({
  rasaResponseEvents,
}: {
  rasaResponseEvents: RasaResponse[]
}): Promise<BotEvent[]> {
  logger.debug({ rasaResponseEvents }, 'Rasa response events received')
  return Promise.all(
    rasaResponseEvents.map((botResponse) => {
      return transformRasaEvent({ botResponse })
    })
  )
}
