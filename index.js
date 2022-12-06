require('dotenv').config();
const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const { Configuration, OpenAIApi } = require("openai");

const BOT_TOKEN = process.env.BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

 const configuration = new Configuration({
     apiKey: OPENAI_API_KEY,
 });
 const openai = new OpenAIApi(configuration);

 const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
    const startMessage = `
    Привет, я бот который умеет генерировать картинки исходя из твоего запроса.
        Для того что бы начать:
        1. Просто напиши сообщение с текстом который будет отражать то, что ты хочешь увидеть на картинке.
        2. Немного подожди пока я обрабатываю запрос
        3. Наслаждайся полученным результатом
        Если вдруг забыл как мной пользоваться, то ты всегда можешь воспользоваться командой /help
    `
    ctx.reply(startMessage);
});
bot.help((ctx) => ctx.reply('Просто напиши сообщение с текстом который будет отражать то, что ты хочешь увидеть на картинке.'));
bot.on('message', async (ctx) => {
    if (typeof(ctx.message.text) === 'string') {
        ctx.reply('Одну минутку, я обрабатываю запрос');
        const responsePromise = await new Promise((resolve, reject) => {
            const response = openai.createImage({
                prompt: ctx.message.text,
                n: 1,
                size: "1024x1024",
            });
            resolve(response);
        }).then((response) => {
            const urlImage = response.data.data[0].url;
            // ctx.telegram.sendMessage(ctx.message.chat.id, urlImage);
            ctx.replyWithPhoto(urlImage);
        }).catch(error => {
            ctx.reply('К сожалению, я не понимаю, что ты хочешь мне сказать.');
            // console.log(error);
        });
    } else {
        await ctx.reply('Пожалуйста, введи текстовое сообщение');
    }
});
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));