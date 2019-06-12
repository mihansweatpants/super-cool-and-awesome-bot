import { DateTime } from 'luxon';

import bot, { reply } from '~/bot';

import { getReminderDate } from './date';
import { schedule } from './schedule';

const invalidTimeAnswer = 'Попробуй выбрать другую дату (например, чуть позже)';
const genericErrorAnswer = 'Что-то пошло не так, попобуй заново';

bot.onText(/напомни/i, async (message) => {
  try {
    const date = getReminderDate(message.text!);

    if (date < DateTime.local()) {
      reply(message, invalidTimeAnswer);
      return;
    }

    // console.log(date);
    await schedule({ date, message });
  } catch {
    reply(message, genericErrorAnswer);
  }
});
