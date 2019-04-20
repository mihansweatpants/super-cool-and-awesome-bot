import fetch from 'node-fetch';

/**
 * Wake up heroku dynos so that it doesn't shut down the server
 */
export const wakeUpDyno = () =>
  setInterval(() => {
    fetch(process.env.HEROKU_URL).then(() => console.log('WAKE UP DYNO!'));
  }, 1500000);

export const getRandomIndex = (arr: any[]) =>
  Math.floor(Math.random() * arr.length);
