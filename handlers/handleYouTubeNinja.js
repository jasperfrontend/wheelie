const { updateCutTime, videoCutTimes } = require('../utils/youtube');
// replace the args[0] copout with the actual request of the player
async function handleCutStart(client, channel, context, args) {
  const videoId = args[0];
  const cutStart = parseInt(args[1], 10);
  if (!videoCutTimes[videoId]) {
    client.say(channel, `@${context['display-name']}, Invalid video ID.`);
    return;
  }
  updateCutTime(videoId, 'start', cutStart);
  client.say(channel, `@${context['display-name']}, Updated start cut time to ${cutStart} seconds.`);
}

async function handleCutEnd(client, channel, context, args) {
  const videoId = args[0];
  const cutEnd = parseInt(args[1], 10);
  if (!videoCutTimes[videoId]) {
    client.say(channel, `@${context['display-name']}, Invalid video ID.`);
    return;
  }
  updateCutTime(videoId, 'end', cutEnd);
  client.say(channel, `@${context['display-name']}, Updated end cut time to ${cutEnd} seconds.`);
}

module.exports = {
  handleCutStart,
  handleCutEnd,
};
