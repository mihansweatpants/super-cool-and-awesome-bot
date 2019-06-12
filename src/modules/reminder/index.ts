import bot from '~/bot';
import { Message } from 'node-telegram-bot-api';

import { getReminderDate } from './date';

// TODO: move somewhere else
function reply({ chat: { id } }: Message, text: string) {
  bot.sendMessage(id, text);
}

bot.onText(/напомни/i, (msg) => {
  getReminderDate(msg.text!);
  reply(msg, 'poshel nahui');
});
