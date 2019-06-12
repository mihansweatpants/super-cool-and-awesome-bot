import mongoose, { Schema, Document } from 'mongoose';
import { Message } from 'node-telegram-bot-api';

interface ScheduledReminder extends Document {
  message: Message;
  date: string;
  isPending: boolean;
}

const ReminderSchema = new Schema({
  date: { type: String, required: true },
  message: { type: Object, required: true },
  isPending: { type: Boolean, required: true, default: true },
});

export const Reminder = mongoose.model<ScheduledReminder>('Reminer', ReminderSchema);
