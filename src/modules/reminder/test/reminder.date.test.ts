import { DateTime } from 'luxon';
import { getReminderDate, UTC_OFFSET } from '~/modules/reminder/date';

// Mocking Date.now to have some consistency when testing time operations
const now = 1560362014391;
const getNow = () => DateTime.fromMillis(now).setZone(UTC_OFFSET);

beforeEach(async () => {
  jest.spyOn(Date, 'now').mockImplementation(() => now);
});

describe('getReminderDate', () => {
  test('Extracts correct date from message', () => {
    expect(getReminderDate('завтра')).toEqual(
      getNow().plus({ days: 1 }).set({ hour: 12, minute: 0, second: 0 }),
    );

    expect(getReminderDate('завтра в 10:00')).toEqual(
      getNow().plus({ days: 1 }).set({ hour: 10, minute: 0, second: 0 }),
    );

    expect(getReminderDate('в 18:00')).toEqual(
      getNow().set({ hour: 18, minute: 0, second: 0 }),
    );

    expect(getReminderDate('послезавтра в 2:34')).toEqual(
      getNow().plus({ days: 2 }).set({ hour: 2, minute: 34, second: 0 }),
    );

    expect(getReminderDate('в 16')).toEqual(
      getNow().set({ hour: 16, minute: 0, second: 0 }),
    );

    expect(getReminderDate('завтра в 7')).toEqual(
      getNow().plus({ days: 1 }).set({ hour: 7, minute: 0, second: 0 }),
    );

    expect(getReminderDate('5 июля в 18')).toEqual(
      getNow().set({ month: 7, day: 5, hour: 18, minute: 0, second: 0 }),
    );

    expect(getReminderDate('16 СЕНТЯБРЯ в 8:31')).toEqual(
      getNow().set({ month: 9, day: 16, hour: 8, minute: 31, second: 0 }),
    );

    expect(getReminderDate('31 декабря')).toEqual(
      getNow().set({ month: 12, day: 31, hour: 12, minute: 0, second: 0 }),
    );
  });
});
