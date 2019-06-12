import TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as path from 'path';

const isDev = process.env.NODE_ENV = 'development';

const token = process.env.BOT_TOKEN!;
let bot: TelegramBot;

if (!isDev) {
  // TODO: add webhook for prod
  bot = new TelegramBot(token);
  bot.setWebHook(process.env.BOT_WEBHOOK_URL + token);
} else {
  bot = new TelegramBot(token, { polling: true });
}

export default bot;

export function bootstrapModules() {
  const modulesDir = path.join(__dirname, 'modules');

  fs.readdirSync(modulesDir).map(entry => require(`${modulesDir}/${entry}`));
}
