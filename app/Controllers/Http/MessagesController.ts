import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'
import { callBot, CallBotPayload } from 'App/utils/callBot'

export default class MessagesController {
  public async index({ request }: HttpContextContract) {
    const body = request.only([
      'sender',
      'bot_name',
      'message',
      'channel',
      'parameters',
      'analyze',
      'load_parameters',
      'get_context',
    ])
    const payload: CallBotPayload = body
    try {
      const botResponse = await callBot(payload)
      return botResponse
    } catch (error) {
      Logger.error(error)
      return error
    }
  }
}
