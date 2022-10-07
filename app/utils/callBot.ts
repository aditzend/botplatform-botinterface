import Logger from '@ioc:Adonis/Core/Logger'
import { postRasaMessage } from 'App/utils/postRasaMessage'
import { sendRabbitMQ } from './rabbit'
import { getContext, EventContext } from './getContext'
import { loadOutgoingTaskParameter } from './loadParameters'
const logger = Logger.child({ module: 'callBot' })

type BotEvent = {
  message: string
  event_name: string
}
export type CallBotPayload = {
  sender: string
  bot_name: string
  message: string
  channel?: string
  parameters?: string[]
  analyze?: boolean
  load_parameters?: boolean
  get_context?: boolean
}

// Se respeta el formato de la consulta de Rasa
export type RasaPayload = {
  sender: string
  message: string
  bot_name: string
}

export type CallBotResponse = {
  recipient_id: string
  bot_name: string
  context?: EventContext
  channel?: string
  parameters?: string[]
  events?: BotEvent[]
  analyze: boolean
  load_parameters: boolean
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
  analyze,
  load_parameters,
  get_context,
}: CallBotPayload): Promise<CallBotResponse> {
  try {
    const events: BotEvent[] = []
    let recursiveMessage: string = message
    let command: string = ''
    let cutCondition: boolean = false
    let context
    while (!cutCondition) {
      logger.trace({ events }, 'Events')
      const rasaPayload: RasaPayload = {
        sender,
        message: recursiveMessage,
        bot_name,
      }
      const rasaResponses = await postRasaMessage(rasaPayload)
      if (recursiveMessage === message) {
        context = await getContext(rasaPayload)
      }

      // Check that there actually are events present
      if (rasaResponses.length < 1) {
        cutCondition = true
        logger.error({ rasaResponses }, 'Rasa responses is empty')
      }

      for (const event of rasaResponses) {
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
        cutCondition = true
      }
    }

    const processedResponse: CallBotResponse = {
      recipient_id: sender,
      bot_name,
      channel,
      parameters,
      events,
      context: get_context ? context : 'NOT REQUESTED',
      analyze: analyze ? true : false,
      load_parameters: load_parameters ? true : false,
    }
    if (analyze)
      sendRabbitMQ({
        queueName: `${bot_name}_etl`,
        data: {
          interaction_id: sender,
          bot_name,
          message,
          events,
          context,
          parameters,
          channel,
          component: 'botinterface',
          sentAt: new Date().toISOString(),
        },
      })
    if (load_parameters) {
      const taskId = context.slots['idTarea'] || '812'
      const prefix = process.env.OUTGOING_TASK_PARAM_PREFIX || 'pts_'
      // Filter the slots that start with 'pts_'
      const outgoingSlotKeys = Object.keys(context.slots).filter((slot) => slot.startsWith(prefix))
      // Log the value of the slots that start with 'pts_'
      outgoingSlotKeys.forEach((slot) => {
        logger.info({ taskId, slot, value: context.slots[slot] }, 'Outgoing slot')
        loadOutgoingTaskParameter({
          taskId,
          parameterName: slot,
          parameterValue: context.slots[slot],
        })
      })
    }

    logger.trace({ processedResponse }, 'Processed response')
    return processedResponse
  } catch (error) {
    logger.error(error)
    return error
  }
}
