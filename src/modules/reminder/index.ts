import { DateTime } from 'luxon';

import bot, { reply } from '~/bot';

import { getReminderDate } from './date';
import { schedule, checkForPendingReminders } from './schedule';

const invalidTimeAnswer = 'Попробуй выбрать другую дату (например, чуть позже)';
const genericErrorAnswer = 'Что-то пошло не так, попобуй заново';
const successAnswer = 'ок';

const reminderCommand = /^напомни/i;

checkForPendingReminders();

bot.onText(reminderCommand, async (message) => {
  try {
    const date = getReminderDate(message.text!);

    if (date < DateTime.local()) {
      reply(message, invalidTimeAnswer);
      return;
    }

    await schedule({ date, message });

    reply(message, successAnswer);
  } catch {
    reply(message, genericErrorAnswer);
  }
});
