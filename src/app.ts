require('dotenv').config();
import 'module-alias/register';

import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';

import bot, { bootstrapModules } from '~/bot';

async function connectToMongo() {
  try {
    await mongoose.connect(process.env.DB_CONN_STRING!);
  } catch (err) {
    console.log(`Unable to connect to db\n: ${err}`);
  }
}

(async () => {
  await connectToMongo();

  const app = express();
  app.use(bodyParser.json());

  app.post(`/${process.env.BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  bootstrapModules();

  const port = process.env.APP_PORT;
  const server = app.listen(port, () => console.log(`🤖 Started bot on http://localhost:${port}`));
  server.on('close', () => mongoose.connection.close());
})();
