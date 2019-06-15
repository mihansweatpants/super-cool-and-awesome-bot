import { DateTime, DurationObject } from 'luxon';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

import { Timetable } from './types';

export const weekDays = [
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
  'воскресенье',
];

let cache: {
  expires: DateTime;
  data: Timetable;
};

const cacheLifetime: DurationObject = { hours: 3 };

async function fetchTimetable(): Promise<Timetable> {
  const response = await fetch(encodeURI(process.env.TIMETABLE_URL!));
  const html = await response.text();

  const { window: { document } } = new JSDOM(html);

  const tableRows = Array.from(document.querySelectorAll('tr'));
  const scrapped = tableRows.map(({ cells }) => {
    const [time, subject] = Array.from(cells);

    return { time: time.textContent!, subject: subject.textContent! };
  });

  const timetable: Timetable = {
    week: scrapped[0].time!,
    schedule: {},
  };

  // TODO: something better than this
  let day: string;
  scrapped.forEach((item) => {
    const isWeekDayTimetableRow = weekDays.includes(item.subject!.split(',')[0]);

    // Some rows contain name of day instead of subject name
    if (isWeekDayTimetableRow) {
      day = item.subject!;
      timetable.schedule[day] = [];
    } else if (item.subject.length > 0) {
      timetable.schedule[day].push(item);
    }
  });

  return timetable;
}

function withCache<F extends (...args: any[]) => Promise<any>>(func: F): F {
  return async function (...args: any[]) {
    if (cache != null) {
      if (DateTime.local() > cache.expires) {
        return refreshCache(await func(...args));
      }

      return cache.data;
    }

    return refreshCache(await func(...args));
  } as F;
}

function refreshCache(data: Timetable): Timetable {
  cache = { data, expires: DateTime.local().plus(cacheLifetime) };

  return data;
}

export const getTimetable = withCache(fetchTimetable);
