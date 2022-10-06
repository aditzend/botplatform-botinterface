import { botMessageProcessor, BotEvent } from 'App/utils/botMessageProcessor'
import Logger from '@ioc:Adonis/Core/Logger'
import Env from '@ioc:Adonis/Core/Env'
import { RasaResponse, RasaNode, postRasaMessage } from 'App/utils/postRasaMessage'
import transformRasaEvent from './transformRasaEvent'
import { Node, ConversationNode } from './node'

const logger = Logger.child({ module: 'callBot' })

export type CallBotPayload = {
  sender: string
  bot_name: string
  message: string
  channel?: string
  parameters?: string[]
}

// Se respeta el formato de la consulta de Rasa
export type RasaPayload = {
  sender: string
  message: string
  bot_name?: string
}

export type CallBotResponse = {
  recipient_id: string
  bot_name: string
  channel?: string
  parameters?: string[]
  events?: BotEvent[]
}

/**
 * callBot controls the flow of the recursive calls to Rasa
 * @param CallBotPayload
 * @returns CallBotResponse
 */
export async function callBot({
  sender,
  bot_name,
  message,
  channel,
  parameters,
}: CallBotPayload): Promise<CallBotResponse> {
  try {
    const events: BotEvent[] = []
    let recursiveMessage: string = message
    let command: string = ''
    let cutCondition: boolean = false
    while (!cutCondition) {
      logger.debug({ events }, 'Events')
      const rasaPayload: RasaPayload = {
        sender,
        message: recursiveMessage,
        bot_name,
      }
      const rasaResponses = await postRasaMessage(rasaPayload)

      // Check that there actually are events present
      if (rasaResponses.length < 1) {
        cutCondition = true
        logger.error({ rasaResponses }, 'Rasa responses is empty')
      }

      for (const event of rasaResponses) {
        logger.debug({ event }, 'Rasa event added as child')
        if (event.text.includes('>>>')) {
          ;[command, recursiveMessage] = event.text.split('>>>')
          if (command === 'show_message_then_transfer') {
            events.push({
              message: recursiveMessage,
              event_name: '*text',
            })
            events.push({
              message: '',
              event_name: '*transfer',
            })
          }
          if (command === 'show_message_then_close') {
            events.push({
              message: recursiveMessage,
              event_name: '*text',
            })
            events.push({
              message: '',
              event_name: '*offline',
            })
          }

          logger.debug({ command, recursiveMessage }, 'Command and recursive message')
        } else {
          events.push({
            message: event.text,
            event_name: '*text',
          })
        }
      }

      const lastMessage = rasaResponses[rasaResponses.length - 1].text
      const lastMessageHasEcho = lastMessage.includes('echo')
      if (!lastMessageHasEcho) {
        logger.debug({ lastMessage }, 'Last message does not have echo')
        cutCondition = true
      }
    }

    // logger.info({ conversation }, 'Conversation graph')
    const processedResponse: CallBotResponse = {
      recipient_id: sender,
      bot_name,
      channel,
      parameters,
      events,
    }
    logger.info({ processedResponse }, 'Processed response')
    return processedResponse
  } catch (error) {
    Logger.error(error)
    return error
  }
}
