import { UniversityClass } from './types';

interface FormatParams {
  day: string;
  classes: UniversityClass[];
  week: string;
}

// tslint:disable prefer-template
export function formatTimetableResponse({ day, classes, week }: FormatParams) {

  let formatted = `${'='.repeat(5)} ${day} ${'='.repeat(5)}\n\n`;

  if (week) {
    formatted = `${'*'.repeat(10)} ${week} ${'*'.repeat(10)}\n` + formatted;
  }

  for (const { time, subject } of classes) {
    formatted += `\n${time}\n` + `${subject}\n${'_'.repeat(20)}\n`;
  }

  return formatted;
}
