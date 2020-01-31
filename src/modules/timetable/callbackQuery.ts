import { CallbackQuery } from 'node-telegram-bot-api';

const CALLBACK_PREFIX = 'timetable_';

export function isTimetableCallback({ data }: CallbackQuery) {
  return data!.includes(CALLBACK_PREFIX);
}

export function makeTimetableCallback(data: string) {
  return `${CALLBACK_PREFIX}${data}`;
}

export function parseTimetableCallback(prefixedData: string) {
  const [, data] = prefixedData.split(CALLBACK_PREFIX);

  return data;
}
