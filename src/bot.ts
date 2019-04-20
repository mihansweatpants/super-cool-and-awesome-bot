import * as TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as path from 'path';

export function setupBot() {
  const token = process.env.BOT_TOKEN;
  let bot;

  if (process.env.NODE_ENV === 'production') {
    bot = new TelegramBot(token);
    bot.setWebHook(process.env.HEROKU_URL + token);
  } else {
    bot = new TelegramBot(token, { polling: true });
  }

  const features = fs
    .readdirSync(path.resolve('src/features'))
    .map(folder => [require(`./features/${folder}`).default, folder]);

  for (let [feature, name] of features) {
    console.log(`=== Using ${name} ===`);
    feature.useBot(bot);
  }

  return bot;
}

export default setupBot();
