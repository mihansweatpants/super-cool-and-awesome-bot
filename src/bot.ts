import TelegramBot, { Message, SendMessageOptions } from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as path from 'path';

const isDev = process.env.NODE_ENV = 'development';

const token = process.env.BOT_TOKEN!;
let bot: TelegramBot;

if (!isDev) {
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

export async function reply({ chat: { id } }: Message, text: string, options?: SendMessageOptions) {
  return await bot.sendMessage(id, text, options);
}

export async function forward({ chat, from, message_id }: Message) {
  return await bot.forwardMessage(chat.id, from!.id, message_id);
}
