async function handleNew(client, channel, command, context) {
  client.say(channel, `@${context['display-name']}, replacing your song is as easy as requesting it again with !r <youtubelink>. That's all. See this as the perk of being the 2nd player to submit their song Kappa `); 
}

module.exports = { handleNew };
