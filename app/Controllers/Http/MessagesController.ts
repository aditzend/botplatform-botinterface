import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'
import { callBot, CallBotPayload } from 'App/utils/callBot'

export default class MessagesController {
  public async index({ request }: HttpContextContract) {
    const body = request.only(['InteractionId', 'Message', 'Channel', 'Parameters'])
    const payload: CallBotPayload = {
      InteractionId: body.InteractionId,
      SessionId: body.InteractionId,
      Message: body.Message || '',
      BotName: 'bot',
      Channel: body.Channel,
      Parameters: body.Parameters || [],
    }
    try {
      const botResponse = await callBot(payload)
      return botResponse
    } catch (error) {
      Logger.error(error)
      return error
    }
  }
}
