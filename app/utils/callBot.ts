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
  sender: string
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
    // Build the conversation Graph starting with the sender's message
    const conversation: Node = {
      sender,
      message,
      bot_name,
    }

    const events: BotEvent[] = []

    // Iterate through the conversation graph
    // with currentNode pointing to the current node
    let currentNode = conversation

    // The actual message to be sent to Rasa
    // will be modified on each node
    let recursiveMessage: string = message
    let command: string = ''

    let cutCondition: boolean = false

    logger.debug({ currentNode }, 'Current node')

    while (!cutCondition) {
      logger.debug({ conversation }, 'Conversation')
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
        // Add the event to the conversation graph
        currentNode.child = {
          sender,
          message: event.text,
          bot_name,
        }

        // Move down the conversation graph
        currentNode = currentNode.child

        if (event.text.includes('>>>')) {
          ;[command, recursiveMessage] = event.text.split('>>>')
          logger.debug({ command, recursiveMessage }, 'Command and recursive message')
          // if (command === 'echo') {
          //   currentNode.child = {
          //     sender,
          //     message: recursiveMessage,
          //     bot_name,
          //   }
          //   currentNode = currentNode.child
          // }
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

    logger.info({ conversation }, 'Conversation graph')
    logger.info({ events }, 'Events')
    const processedResponse: CallBotResponse = {
      sender,
      bot_name,
      channel,
      parameters,
      events: [],
    }
    return processedResponse
  } catch (error) {
    Logger.error(error)
    return error
  }
}
