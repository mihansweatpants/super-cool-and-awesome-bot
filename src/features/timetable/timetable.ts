import * as cron from 'node-schedule';
import * as TelegramBot from 'node-telegram-bot-api';
import { weekDays } from './constants';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

interface TimetableResponse {
  weekNumber: string;
  timetable: {
    [key: string]: Pair[]
  };
}

interface Pair {
  time: string;
  subject: string;
}

class Timetable {
  botInstance;
  cachedTimetable: TimetableResponse;

  constructor() {
    this.scheduleTimetableRefresh();
  }

  getTimetable = async (options: { useCached: boolean } = { useCached: true }) => {
    const response = await fetch('https://rasp.rea.ru/Default?GroupName=291%D0%94-10%D0%91%D0%98/16#day1');
    const html = await response.text();
    const { window: { document } } = new JSDOM(html);

    if (options.useCached && this.cachedTimetable) {
      return this.cachedTimetable;
    };

    const rows = Array.from(document.querySelectorAll('tr'));
    const scrapped = [];

    for (let {
      cells: [time, pair],
    } of <any>rows) {
      if (pair.innerHTML) {
        scrapped.push({
          time: time.textContent,
          subject: pair.textContent,
        });
      }
    }

    const timeTable: TimetableResponse = {
      weekNumber: scrapped[0].time,
      timetable: {},
    };

    let day: string;
    scrapped.forEach(item => {
      if (weekDays.includes(item.subject.split(',')[0])) {
        day = item.subject;
        timeTable.timetable[day] = [];
      } else {
        timeTable.timetable[day].push(item);
      }
    });

    this.cachedTimetable = timeTable;

    return timeTable;
  };

  getPrettyMessage = (day: string, pairList: Pair[], weekNumber?: string) => {
    let message = `${'='.repeat(5)} ${day} ${'='.repeat(5)}\n\n`;

    if (weekNumber)
      message = `${'*'.repeat(10)} ${weekNumber} ${'*'.repeat(10)}\n` + message;

    if (pairList.length) {
      for (let pair of pairList) {
        message += `\n${pair.time}\n` + `${pair.subject}\n${'_'.repeat(20)}\n`;
      }
    } else {
        message += `${' '.repeat(15)}Занятий нет 😎`
    }

    return message;
  };

  scheduleTimetableRefresh = () => {
    cron.scheduleJob('0 19 * * *', async () => {
      console.log(`Updating timetable cache`);
      this.getTimetable({ useCached: false });
    });
  };


  replyWithOptions = async (
    { chat }: TelegramBot.Message,
    bot,
  ) => {
    try {
      const { timetable } = await this.getTimetable();
  
      const keyboardOptions = Object.keys(timetable).map(day => [
        { text: day, callback_data: day },
      ]);
  
      bot.sendMessage(chat.id, `Какой день?`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [...keyboardOptions],
        },
      });
    } catch (err) {
      bot.sendMessage('Сорян, кажись я сломался');
    }
  };

  useBot = (bot) => {
    this.botInstance = bot;
    bot.onText(/(расписание|рп|пары|rp)/i, msg => this.replyWithOptions(msg, bot));

    bot.on(
      'callback_query',
      async ({ data, message: { chat } }) => {
        const { weekNumber, timetable } = await this.getTimetable();

        try {
          const reply = this.getPrettyMessage(data, timetable[data], weekNumber);
  
          bot.sendMessage(chat.id, reply, { parse_mode: 'HTML' });
        } catch(err) {
          bot.sendMessage('Сорян, не могу найти расписание');
        }
      }
    );
  };
}

export default new Timetable();
