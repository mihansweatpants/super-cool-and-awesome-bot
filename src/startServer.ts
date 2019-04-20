import * as http from 'http';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import { name, version, description } from '../package.json';
import { wakeUpDyno } from 'helpers';
import bot from './bot';

export interface BotServer {
  server: http.Server;
  app: express.Application;
}

async function connectToMongo() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI,
      {
        useNewUrlParser: true,
        reconnectTries: 30, // Retry up to 30 times
        reconnectInterval: 500, // Reconnect every 500ms
        poolSize: 10,
        bufferMaxEntries: 0,
      }
    );

    console.log('Connected to MongoDB instance');
  } catch (err) {
    console.log(
      err,
      'MongoDB connection unsuccessful, will retry after 5 seconds.'
    );
    setTimeout(connectToMongo, 5000);
  }
}

export async function startServer() {
  const app = express();

  app.use(bodyParser.json());

  await connectToMongo();

  app.get('/', (_, res) => res.json({ name, version, description }));

  app.post(`/${process.env.BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  if (process.env.HEROKU_URL) {
    wakeUpDyno();
  }

  return new Promise<BotServer>(resolve => {
    const port = process.env.PORT || 9000;

    const server = app.listen(port, () => {
      console.log(`🤖 bot listening on ${port}`);
      server.on('close', () => {
        mongoose.connection.close();
      });
    });

    resolve({ server, app });
  });
}
