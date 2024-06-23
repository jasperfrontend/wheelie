async function handleBeep(client, channel, command, context) {
  console.log(`${command} received!`);
  const responses = ['BOOB Kappa', 'boop!', 'boof?!'];
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  client.say(channel, randomResponse);
}

module.exports = { handleBeep };
