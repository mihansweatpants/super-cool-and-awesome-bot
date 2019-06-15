import { DateTime, DurationObject } from 'luxon';

type WeekDay = 'понедельник' | 'вторник' | 'среда' | 'четверг' | 'пятница' | 'суббота';

interface UniversityClass {
  time: string;
  subject: string;
}

interface Timetable {
  weekNumber: number;
  schedule: {
    [key in WeekDay]?: UniversityClass[];
  };
}

let cache: {
  expires: DateTime;
  data: Timetable;
};

const cacheLifetime: DurationObject = { hours: 3 };

async function fetchTimetable(): Promise<Timetable> {
  const timetable = {
    weekNumber: 43,
    schedule: {
      понедельник: [{ time: '10:00', subject: 'Какая-то хуйня' }, { time: '11:50', subject: 'Еще какая-то хуйня' }],
      вторник: [{ time: '10:00', subject: 'Какая-то хуйня' }],
    },
  };

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
