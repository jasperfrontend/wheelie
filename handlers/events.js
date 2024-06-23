function onConnectedHandler(addr, port) {
  const cyan = '\x1b[36m';  // ANSI escape code for cyan
  const reset = '\x1b[0m';  // ANSI escape code to reset color
  
  const message = `* * * Connected to [${addr}:${port}] * * *`;
  const coloredMessage = message.replace(/\*/g, `${cyan}*${reset}`);

  console.log(coloredMessage);
}

function onDisconnectedHandler(reason) {
  console.log(`Disconnected: ${reason}`);
  client.connect().catch(console.error); // Attempt to reconnect
}

function onReconnectHandler() {
  console.log('Reconnecting...');
}

function onNoticeHandler(channel, msgid, message) {
  console.log(`Notice from ${channel}: [${msgid}] ${message}`);
}

function onErrorHandler(err) {
  console.error('Error:', err);
  client.say(process.env.TWITCH_CHANNEL, 'Something went wrong LUL fuck knows what went wrong. This message is literally a last-ditch effort to try and save the bot from disconnecting.');
}

module.exports = {
  onConnectedHandler,
  onDisconnectedHandler,
  onReconnectHandler,
  onNoticeHandler,
  onErrorHandler
};
