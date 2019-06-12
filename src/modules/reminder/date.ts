import { DateTime } from 'luxon';

export const UTC_OFFSET = 'UTC+3';

// tslint:disable object-literal-key-quotes
const MONTHS = {
  'января': 1,
  'февраля': 2,
  'марта': 3,
  'апреля': 4,
  'мая': 5,
  'июня': 6,
  'июля': 7,
  'августа': 8,
  'сентября': 9,
  'октября': 10,
  'ноября': 11,
  'декабря': 12,
};

// tslint:disable max-line-length
export function getReminderDate(text: string): DateTime {
  const timeReg = /в ([01]?[0-9]|2[0-3]):[0-5][0-9]/gi; // hour:minute
  const timeShortReg = /в ([01]?[0-9]|2[0-3])/gi; // hour
  const dayMonthReg = /([1-9]|[12]\d|3[0-1]) (января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/gi;

  let addDays: number = 0;
  let hour: number = 12;
  let minute: number = 0;
  let month: number;
  let day: number;

  ({ month, day } = DateTime.local().setZone(UTC_OFFSET));

  if (timeReg.test(text)) {
    [hour, minute] = text.match(timeReg)![0].split(' ')[1].split(':').map(el => +el);
  } else {
    try {
      hour = +text.match(timeShortReg)![0].split(' ')[1];
    } catch {}
  }

  if (/завтра/gi.test(text)) addDays = 1;
  if (/послезавтра/gi.test(text)) addDays = 2;

  if (dayMonthReg.test(text)) {
    const dayAndMonth = text.match(dayMonthReg)![0].split(' ');
    if (dayAndMonth.length === 2) {
      const [dayOfMonth, monthName] = dayAndMonth;
      const monthNameReg = new RegExp(monthName, 'ig');

      Object.entries(MONTHS).forEach(([key, val]) => {
        if (monthNameReg.test(key)) {
          month = val;
          day = +dayOfMonth;
        }
      });
    }
  }

  const date = DateTime.local()
    .setZone(UTC_OFFSET)
    .set({ month, day, hour: +hour, minute: +minute, second: 0 })
    .plus({ days: addDays });

  return date;
}
