import { Message } from 'node-telegram-bot-api';

import bot, { reply } from '~/bot';

import { getTimetable } from './scraper';
import { formatTimetableResponse } from './format';
import { isTimetableCallback, makeTimetableCallback, parseTimetableCallback } from './callbackQuery';

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

  const { message } = query;

  const { weekNum, schedule } = await getTimetable();
  const day = parseTimetableCallback(query.data!);

  reply(message!, formatTimetableResponse({ weekNum, day, classes: schedule[day] }));
});

async function replyWithOptions(message: Message) {
  bot.sendChatAction(message.chat.id, 'typing');

  const { schedule } = await getTimetable();

  const keyboard = Object.keys(schedule).map(day => [
    { text: day, callback_data: makeTimetableCallback(day) },
  ]);

  reply(message, 'Выбери день', {
    reply_markup: {
      inline_keyboard: keyboard,
    },
  });
}
