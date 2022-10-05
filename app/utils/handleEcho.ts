import { postRasaMessage } from 'App/utils/postRasaMessage'
import { RasaPayload } from 'App/utils/callBot'
import Logger from '@ioc:Adonis/Core/Logger'

const logger = Logger.child({ module: 'handleEcho' })

export default async function handleEcho(conversationNode) {
  // logger.debug({ payload }, 'Echo payload received')
  const response = await postRasaMessage(payload)
  // logger.debug({ response }, 'Rasa response received')
  const result = response.map(async function (event) {
    if (event.text.includes('>>>')) {
      const [command, message] = event.text.split('>>>')
      if (command === 'echo') {
        const echoPayload = {
          sender: event.recipient_id,
          message,
          bot_name: payload.bot_name,
        }
        return await handleEcho(echoPayload)
      } else {
        return { sender: event.recipient_id, message: event.text, bot_name: payload.bot_name }
      }
    } else {
      return { sender: event.recipient_id, message: event.text, bot_name: event.bot_name }
    }
  })
  const final = result[0]
  // logger.debug({ result }, 'Rasa response returned to transformRasaEvent')
  return final
  // return {
  //   sender: payload.sender,
  //   message: response[0].text,
  //   bot_name: 'echobot',
  // }
  // const [command, text] = message.split('>>>')
  // if (command === 'echo') {
  //   const echoPayload: RasaPayload = {
  //     sender,
  //     message: text,
  //   }
  //   return processEcho(echoPayload)
  // } else {
  //   return {
  //     sender: rasaEvent.sender,
  //     message,
  //   }
  // }
}

export default async function handleEcho(payload: RasaPayload): Promise<RasaPayload> {
  // logger.debug({ payload }, 'Echo payload received')
  const response = await postRasaMessage(payload)
  // logger.debug({ response }, 'Rasa response received')
  const result = response.map(async function (event) {
    if (event.text.includes('>>>')) {
      const [command, message] = event.text.split('>>>')
      if (command === 'echo') {
        const echoPayload = {
          sender: event.recipient_id,
          message,
          bot_name: payload.bot_name,
        }
        return await handleEcho(echoPayload)
      } else {
        return { sender: event.recipient_id, message: event.text, bot_name: payload.bot_name }
      }
    } else {
      return { sender: event.recipient_id, message: event.text, bot_name: event.bot_name }
    }
  })
  const final = result[0]
  // logger.debug({ result }, 'Rasa response returned to transformRasaEvent')
  return final
  // return {
  //   sender: payload.sender,
  //   message: response[0].text,
  //   bot_name: 'echobot',
  // }
  // const [command, text] = message.split('>>>')
  // if (command === 'echo') {
  //   const echoPayload: RasaPayload = {
  //     sender,
  //     message: text,
  //   }
  //   return processEcho(echoPayload)
  // } else {
  //   return {
  //     sender: rasaEvent.sender,
  //     message,
  //   }
  // }
}
