async function handleNew(client, channel, command, context) {
  client.say(channel, `${command} is called by ${context['display-name']}`); 
}

module.exports = { handleNew };