import { RasaPayload } from 'App/utils/callBot'
import getBotHost from './getBotHost'
import axios from 'axios'
import _ from 'lodash'

export type EventContext = {
  slots: object
  intent: {
    name: string
    confidence: number
  }
  entities: object[]
  rasa_message_id: string
  rasa_message_timestamp: string
  action_name: string
}

export async function getContext(payload: RasaPayload): Promise<EventContext> {
  const url = await getBotHost(payload.bot_name)
  const tracker = await axios.get(`${url}/conversations/${payload.sender}/tracker`)
  const { data } = tracker
  const slots = _.pickBy(data.slots, _.isNotNull)

  const intent = {
    name: data.latest_message.intent.name,
    confidence: data.latest_message.intent.confidence,
  }
  const entities = data.latest_message.entities
  const rasa_message_id = data.latest_message.message_id
  const rasa_message_timestamp = data.latest_message.latest_event_time
  const action_name = data.latest_action_name
  return {
    slots,
    intent,
    entities,
    rasa_message_id,
    rasa_message_timestamp,
    action_name,
  }
}
