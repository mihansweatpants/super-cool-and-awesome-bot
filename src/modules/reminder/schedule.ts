import { DateTime } from 'luxon';
import { Message } from 'node-telegram-bot-api';
import mongoose, { Schema, Document } from 'mongoose';

import { forward } from '~/bot';

interface Reminder {
  date: DateTime;
  message: Message;
}

interface ScheduledReminder extends Reminder, Document {
  isPending: boolean;
}

const ReminderSchema = new Schema({
  date: { type: String, required: true },
  message: { type: Object, required: true },
  isPending: { type: Boolean, required: true, default: true },
});

const ReminderModel = mongoose.model<ScheduledReminder>('Reminer', ReminderSchema);

const UPDATE_INTERVAL = 30000; // 30 secs

export async function schedule(params: Reminder) {
  await ReminderModel.create(params);
}

function checkForPendingReminders() {
  sendPendingReminders();
  setTimeout(
    async () => {
      await sendPendingReminders();
      checkForPendingReminders();
    },
    UPDATE_INTERVAL,
  );
}

checkForPendingReminders();

async function sendPendingReminders() {
  const pendingReminders = await ReminderModel.find({ isPending: true });

  pendingReminders.forEach(async (reminder) => {
    const { date, message, _id } = reminder;

    if (DateTime.fromISO(date as any) < DateTime.local()) {
      await forward(message);
      await ReminderModel.updateOne({ _id }, { $set: { isPending: false } });
    }
  });
}
