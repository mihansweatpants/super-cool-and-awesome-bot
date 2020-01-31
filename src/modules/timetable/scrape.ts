import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

import { Timetable, UniversityClass } from './types';

import { withCache } from './cache';

async function fetchTimetableHtml(): Promise<string> {
  const response = await fetch(process.env.TIMETABLE_URL!, {
    headers: {
      'x-requested-with': 'XMLHttpRequest',
    },
  });

  return response.text();
}

async function constructTimetable(): Promise<Timetable> {
  const html = await fetchTimetableHtml();

  const { window: { document } } = new JSDOM(html);

  const weekNum = Number((document.getElementById('weekNum')! as HTMLInputElement).value);

  const schedule = {};

  Array.from(document.getElementsByTagName('table')).forEach((day) => {
    const dayOfWeek = day.getElementsByClassName('dayh')[0].textContent!;

    const classes: UniversityClass[] = [];

    Array.from(day.getElementsByTagName('td'))
      .map(el => el.textContent!)
      .filter(Boolean)
      .forEach((entry, index, arr) => {
        if (entry.includes(':')) {
          classes.push({ time: entry, subject: arr[index + 1] });
        }
      });

    schedule[dayOfWeek] = classes;
  });

  return { weekNum, schedule };
}

export const getTimetable = withCache(constructTimetable);
