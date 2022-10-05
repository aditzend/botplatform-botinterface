import { RasaResponse } from 'App/utils/postRasaMessage'
import handleEcho from './handleEcho'
import Logger from '@ioc:Adonis/Core/Logger'
const logger = Logger.child({ module: 'transformRasaEvent' })
import Node from './node'

export default async function transformRasaEvent(node) {
  try {
    const { sender, message, bot_name } = node
    // logger.debug({ event }, 'Rasa event received')
    // while there are echo commands in the message
    // traverse the conversation graph
    node.addChild({
      sender,
      message: 'test from transformRasaEvent',
      bot_name,
    })
    // while (node.message.includes('>>>')) {
    //   const [command, message] = conversationNode.message.split('>>>')
    //   if (command === 'echo') {
    //     conversationNode.message = message
    //     conversationNode.child = await handleEcho(conversationNode)
    //     conversationNode = conversationNode.child
    //   } else {
    //     break
    //   }
    // }
    // if (text.includes('>>>')) {
    //   const [command, message] = text.split('>>>')
    //   if (command === 'echo') {
    //     const echoPayload = {
    //       sender: event.recipient_id,
    //       message,
    //       bot_name: event.bot_name,
    //     }
    //     // Make a while loop traversing a conversation graph with
    //     // the echoGraph function
    //     // Each time the echoGraph function is called, it will
    //     // return a new payload to be sent to the bot
    //     // then we move down one node and call it again
    //     const handledEchoPayload = await handleEcho(echoPayload)
    //     // logger.debug({ handledEchoPayload }, 'Rasa response received after echo')
    //     return [
    //       {
    //         recipient_id: handledEchoPayload.sender,
    //         text: handledEchoPayload.message,
    //         bot_name: handledEchoPayload.bot_name,
    //       },
    //     ]
    //   } else {
    //     return []
    //   }
    // } else {
    //   return []
    // }
  } catch (error) {
    logger.error({ error }, 'Error processing Rasa event')
  }
}
