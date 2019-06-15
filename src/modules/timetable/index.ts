import { Message } from 'node-telegram-bot-api';

import bot, { reply } from '~/bot';
import { getTimetable } from './fetch';
import { isTimetableCallback, makeTimetableCallback } from './callbackQuery';

const timetableCommand = /^пары/i;

bot.onText(timetableCommand, async (message) => {
  try {
    replyWithOptions(message);
  } catch {}
});

bot.on('callback_query', async (query) => {
  if (!isTimetableCallback(query)) {
    return;
  }

  const { weekNumber, schedule } = await getTimetable();

  console.log(weekNumber, schedule);
});

function replyWithOptions(message: Message) {
  reply(message, 'Выбери день', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'test', callback_data: makeTimetableCallback('test_1') }],
        [{ text: 'test', callback_data: makeTimetableCallback('test_2') }],
        [{ text: 'test', callback_data: makeTimetableCallback('test_3') }],
      ],
    },
  });
}
