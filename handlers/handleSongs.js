async function handleSongs(client, channel, command, context) {
  client.say(channel, `@${context['display-name']}, ${command} is still being worked on. You can always submit a pull request on Github to make this functionality yourself Kappa https://github.com/jasperfrontend/wheelie`); 
}

module.exports = { handleSongs };