/**
 * Wake up heroku dynos so that it doesn't shut down the server
 */
export function wakeUpDyno() {
  setInterval(
    () => {
      fetch(process.env.HEROKU_URL!).then(() => console.log('WAKE UP DYNO!'));
    },
    1500000,
  );
}
