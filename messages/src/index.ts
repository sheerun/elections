import { join } from 'path';

import {
  ChatConnector,
  UniversalBot,
  MemoryBotStorage
} from 'botbuilder';

import {
  BotServiceConnector,
  IBotServiceConnectorSettings,
  AzureTableClient,
  AzureBotStorage
} from '@sheerun/botbuilder-azure';

const isDevelopment = process.env.NODE_ENV == 'development'

const settings: IBotServiceConnectorSettings = {
  appId: process.env['MicrosoftAppId'],
  appPassword: process.env['MicrosoftAppPassword'],
  gzipData: false
}

const connector = isDevelopment
  ? new ChatConnector()
  : new BotServiceConnector(settings)

var bot = new UniversalBot(connector)
bot.localePath(join(__dirname, './locale'))

if (isDevelopment) {
  bot.set('storage', new MemoryBotStorage())
} else {
  const azureTableClient = new AzureTableClient('botdata', process.env['AzureWebJobsStorage'])
  const azureBotStorage = new AzureBotStorage({ gzipData: false }, azureTableClient)
  bot.set('storage', azureBotStorage)
}

bot.dialog('/', [
  function (session) {
    const text = session.message.text
    if (text) {
      if (text === 'Forget me') {
        session.userData = undefined
        session.send('OK!')
        return
      }

      if (session.userData.message) {
        session.send('Wat! Your previous message was: ' + session.userData.message)
      } else {
        session.send('Hello, firstcomer!')
      }

      session.userData.message = text
    }
  }
])

if (isDevelopment) {
  const restify = require('restify')
  const server = restify.createServer()
  server.listen(3978, function () {
    console.log('test bot endpoint at http://localhost:3978/api/messages')
  })
  server.post('/api/messages', connector.listen())
} else {
  module.exports = connector.listen()
}
