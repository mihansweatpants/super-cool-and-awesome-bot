import { CallbackQuery } from 'node-telegram-bot-api';

const CALLBACK_PREFIX = 'timetable';

export function isTimetableCallback({ data }: CallbackQuery) {
  if (data!.includes(CALLBACK_PREFIX)) {
    return true;
  }

  return false;
}

export function makeTimetableCallback(data: string) {
  return `${CALLBACK_PREFIX}_${data}`;
}
