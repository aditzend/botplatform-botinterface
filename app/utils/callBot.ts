import { botMessageProcessor, BotEvent } from 'App/utils/botMessageProcessor'
import Logger from '@ioc:Adonis/Core/Logger'
import Env from '@ioc:Adonis/Core/Env'
import { RasaResponse, RasaNode, postRasaMessage } from 'App/utils/postRasaMessage'
import transformRasaEvent from './transformRasaEvent'
import { Node, ConversationNode } from './node'

const logger = Logger.child({ module: 'callBot' })

export type CallBotPayload = {
  InteractionId: string
  SessionId: string
  BotName: string
  Message: string
  Channel: string
  Parameters: string[]
}

// Se respeta el formato de la consulta de Rasa
export type RasaPayload = {
  sender: string
  message: string
  bot_name?: string
}

export type CallBotResponse = {
  InteractionId: string
  SessionId: string
  BotName: string
  Conversation?: object
  Events?: BotEvent[]
}

export async function callBot(callBotPayload: CallBotPayload) {
  try {
    const processedResponse: CallBotResponse = {
      InteractionId: callBotPayload.InteractionId,
      SessionId: callBotPayload.SessionId,
      BotName: callBotPayload.BotName,
      Events: [],
    }
    const firstRasaPayload: RasaPayload = {
      sender: callBotPayload.SessionId,
      message: callBotPayload.Message,
      bot_name: callBotPayload.BotName,
    }
    const firstBotResponse = await postRasaMessage(firstRasaPayload)
    // logger.debug({ firstBotResponse }, 'Rasa response received')

    const conversation: Node = {
      sender: firstRasaPayload.sender,
      message: firstRasaPayload.message,
      bot_name: firstRasaPayload.bot_name,
    }
    let currentNode = conversation

    for (const event of firstBotResponse) {
      currentNode.child = {
        sender: event.recipient_id,
        message: event.text,
        bot_name: firstRasaPayload.bot_name,
      }
      currentNode = currentNode.child

      if (event.text.includes('>>>')) {
        const [command, message] = event.text.split('>>>')
        if (command === 'echo') {
          const echoPayload = {
            sender: event.recipient_id,
            message,
            bot_name: firstRasaPayload.bot_name,
          }
          const echoResponse = await postRasaMessage(echoPayload)
          for (const echoEvent of echoResponse) {
            currentNode.child = {
              sender: echoEvent.recipient_id,
              message: echoEvent.text,
              bot_name: firstRasaPayload.bot_name,
            }
            currentNode = currentNode.child
          }
          currentNode = currentNode.child
        }

        // logger.debug({ echoResponse }, 'Rasa response received after echo')
      } else {
      }
    }
    logger.debug({ conversation }, 'Conversation created')
    logger.debug({ currentNode }, 'node')

    // if (rasaResponseData.length > 1) {
    //   // Hay mas de un evento en la respuesta
    //   let conversationGraph: RasaNode = { ...rasaResponseData[0], type: 'root' }
    //   let currentNode: RasaNode
    //   logger.debug({ conversationGraph }, 'Conversation graph')
    // } else {
    //   // Respuesta simple
    //   const conversationGraph: RasaNode = rasaResponse.data[0]
    //   logger.debug({ conversationGraph }, 'Respuesta simple')
    //   processedResponse.Events[0] = {
    //     EventName: '*text',
    //     Message: conversationGraph.text,
    //   }
    // }

    return processedResponse
  } catch (error) {
    Logger.error(error)
    return error
  }
}
