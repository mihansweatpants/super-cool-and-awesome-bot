import { DateTime, DurationObject } from 'luxon';

import { Timetable } from './types';

let cache: {
  expires: DateTime;
  data: Timetable;
};

const cacheLifetime: DurationObject = { hours: 3 };

export function withCache<F extends (...args: any[]) => Promise<any>>(func: F): F {
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
