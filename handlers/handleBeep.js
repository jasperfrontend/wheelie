async function handleBeep(client, channel, command, context) {
  console.log(`${command} received!`);
  client.say(channel, 'boop!');
}

module.exports = { handleBeep };