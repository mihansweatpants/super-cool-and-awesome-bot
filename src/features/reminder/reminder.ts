import * as mongoose from 'mongoose';
import * as moment from 'moment';
import * as cron from 'node-schedule';
import * as TelegramBot from 'node-telegram-bot-api';
import { responses, emojis, invalidTimeAnswer } from './constants';
import { getRandomIndex } from 'helpers';

export interface ReminderItem extends mongoose.Document {
  messageId: string;
  chatId: string;
  fromId: string;
  pending: boolean;
  date: string;
}

export const ReminderJob = mongoose.model<ReminderItem>(
  'Reminder',
  new mongoose.Schema({
    messageId: String,
    chatId: String,
    fromId: String,
    pending: Boolean,
    date: String,
  })
);

export class Reminder {
  botInstance;

  constructor() {
    this.loadReminders();
  }

  generateInitialResponse = () =>
    `${responses[getRandomIndex(responses)]} ${emojis[getRandomIndex(emojis)]}`;

  getReminderDate = (message: string) => {
    try {
      const date = moment().tz('Europe/Moscow');

      const [hours, minutes] = message
        .match(/([01]?[0-9]|2[0-3]):[0-5][0-9]/gi)[0]
        .split(':');

      date.set({
        hours: Number(hours),
        minutes: Number(minutes),
        seconds: 0,
      });

      if (/сегодня/.test(message)) date.add(0, 'd');
      if (/завтра/.test(message)) date.add(1, 'd');
      if (/послезавтра/.test(message)) date.add(1, 'd');

      return date.toISOString(true);
    } catch (err) {
      return null;
    }
  };

  scheduleReminder = (reminder: ReminderItem, scheduler = cron) => {
    if (moment(reminder.date).isBefore(new Date())) {
      this.sendReminder(reminder, true);
    } else {
      scheduler.scheduleJob(reminder.date, () => this.sendReminder(reminder));

      console.log(
        'Reminder will be sent',
        new Date(reminder.date).toLocaleString()
      );
    }
  };

  sendReminder = async (
    { chatId, fromId, messageId, _id }: ReminderItem,
    delayed?: boolean
  ) => {
    const { botInstance } = this;

    await botInstance.forwardMessage(chatId, fromId, messageId);
    await botInstance.sendMessage(
      chatId,
      delayed
        ? 'Соррян, скорее всего я был сломан :( \n Держи напоминание, надеюсь еще не поздно'
        : 'Напоминаю'
    );

    await ReminderJob.updateOne({ _id }, { $set: { pending: false } });
  };

  loadReminders = async () => {
    const activeReminders = await ReminderJob.find({ pending: true });

    activeReminders.map(reminder => this.scheduleReminder(reminder));

    return activeReminders;
  };

  createReminder = async ({
    chat,
    from,
    message_id,
    text,
  }: TelegramBot.Message) => {
    const { botInstance } = this;

    const reminderDate = this.getReminderDate(text);

    if (!reminderDate || moment(reminderDate).isBefore(new Date())) {
      return botInstance.sendMessage(chat.id, invalidTimeAnswer);
    }

    const reminderJob = await new ReminderJob({
      messageId: message_id,
      chatId: chat.id,
      fromId: from.id,
      date: this.getReminderDate(text),
      pending: true,
    }).save();

    this.scheduleReminder(reminderJob);

    await botInstance.sendMessage(chat.id, this.generateInitialResponse());
  };

  useBot = (bot) => {
    this.botInstance = bot;
    bot.onText(/напомни/i, this.createReminder);
  };
}

export default new Reminder();
