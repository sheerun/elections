"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var botbuilder_1 = require("botbuilder");
var botbuilder_azure_1 = require("@sheerun/botbuilder-azure");
var isDevelopment = process.env.NODE_ENV == 'development';
var settings = {
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    gzipData: false
};
var connector = isDevelopment
    ? new botbuilder_1.ChatConnector()
    : new botbuilder_azure_1.BotServiceConnector(settings);
var bot = new botbuilder_1.UniversalBot(connector);
bot.localePath(path_1.join(__dirname, './locale'));
if (isDevelopment) {
    bot.set('storage', new botbuilder_1.MemoryBotStorage());
}
else {
    var azureTableClient = new botbuilder_azure_1.AzureTableClient('botdata', process.env['AzureWebJobsStorage']);
    var azureBotStorage = new botbuilder_azure_1.AzureBotStorage({ gzipData: false }, azureTableClient);
    bot.set('storage', azureBotStorage);
}
bot.dialog('/', [
    function (session) {
        var text = session.message.text;
        if (text) {
            if (text === 'Forget me') {
                session.userData = undefined;
                session.send('OK!');
                return;
            }
            if (session.userData.message) {
                session.send('Hello! You previous message was: ' + session.userData.message);
            }
            else {
                session.send('Hello, firstcomer!');
            }
            session.userData.message = text;
        }
    }
]);
if (isDevelopment) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
}
else {
    module.exports = connector.listen();
}
