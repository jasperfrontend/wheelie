async function handleVotewhen(client, channel, command, context) {
  client.say(channel, `${command} is called by ${context['display-name']}`); 
}

module.exports = { handleVotewhen };