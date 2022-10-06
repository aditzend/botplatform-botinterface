// hacer un llamado simple sin el resto de los parametros al bot
/*
{
  "sender": "default",
  "message": "Hola"
}
*/
import { RasaPayload } from 'App/utils/callBot'
import axios from 'axios'
import getBotHost from './getBotHost'

export type RasaResponse = {
  recipient_id: string
  text: string
  metadata?: {
    template_name: string
  }
  bot_name?: string
}

export type RasaNode = {
  recipient_id?: string
  text?: string
  metadata?: {
    template_name: string
  }
  child?: RasaNode
  type: string
}

export async function postRasaMessage(payload: RasaPayload): Promise<RasaResponse[]> {
  const url = await getBotHost(payload.bot_name)
  const res = await axios.post(`${url}/webhooks/rest/webhook`, payload)
  return res.data
}
