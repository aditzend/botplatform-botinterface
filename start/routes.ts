import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { versions: 'v1' }
})

Route.post('/v1/messages', 'MessagesController.index')
