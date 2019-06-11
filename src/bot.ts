import TelegramBot from 'node-telegram-bot-api';

const isDev = process.env.NODE_ENV = 'development';
const isProd = !isDev;

const token = process.env.BOT_TOKEN!;

let bot: TelegramBot;

if (isProd) {
  // TODO: add webhook for prod
  bot = new TelegramBot(token);
  bot.setWebHook(process.env.BOT_WEBHOOK_URL + token);
} else {
  bot = new TelegramBot(token, { polling: true });
}

export default bot;
