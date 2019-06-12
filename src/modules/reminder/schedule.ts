import { DateTime } from 'luxon';
import { Message } from 'node-telegram-bot-api';

import { forward } from '~/bot';
import { Reminder } from './models';

const UPDATE_INTERVAL = 30000;

export async function schedule(params: { message: Message, date: DateTime }) {
  await Reminder.create(params);
}

async function sendPendingReminders() {
  const pendingReminders = await Reminder.find({ isPending: true });

  pendingReminders.forEach(async (reminder) => {
    const { date, message, _id } = reminder;

    if (DateTime.fromISO(date) < DateTime.local()) {
      await Reminder.updateOne({ _id }, { $set: { isPending: false } });
      await forward(message);
    }
  });
}

export function checkForPendingReminders() {
  setTimeout(
    async () => {
      try {
        await sendPendingReminders();
      } catch {}
      checkForPendingReminders();
    },
    UPDATE_INTERVAL,
  );
}
