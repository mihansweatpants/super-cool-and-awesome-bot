import bot from '~/bot';

bot.on('message', (message) => {
  console.log(message);

  const { chat: { id } } = message;

  bot.sendMessage(id, 'poshel nahui');
});
