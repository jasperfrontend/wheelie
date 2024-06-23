const moment = require('moment');
require('moment-duration-format');
const { cleanTitle } = require('./cleantitle');

const videoCutTimes = {}; // Temporary storage for cut times

async function getYouTubeVideo(client, channel, context, videoId) {
  const response = await fetch(`${process.env.YOUTUBE_API_URL}?part=snippet%2CcontentDetails&id=${videoId}&maxResults=1&key=${process.env.YOUTUBE_API_KEY}`);
  const yt = await response.json();
  const deep = yt.items[0];
  const duration = moment.duration(deep.contentDetails.duration).asSeconds();
  if(duration > 600) {
    client.say(channel, `@${context['display-name']}, That's a long-ass video. Only the first 10 minutes will be played. You can cut off a part of your submission by typing !cutstart 60 or !cutend 60 to respectively skip 60 seconds from the start or 60 seconds to the end. You can keep changing these values for as long as your song isn't playing yet!`);
  }

  // Initialize cut times
  videoCutTimes[videoId] = { cutStart: 0, cutEnd: duration > 600 ? 600 : duration };

  return {
    id: deep.id,
    title: cleanTitle(deep.snippet.title),
    thumb: deep.snippet.thumbnails.standard.url,
    duration: duration
  };
}

function updateCutTime(videoId, type, value) {
  if (videoCutTimes[videoId]) {
    if (type === 'start') {
      videoCutTimes[videoId].cutStart = value;
    } else if (type === 'end') {
      videoCutTimes[videoId].cutEnd = value;
    }
  }
}

module.exports = {
  getYouTubeVideo,
  updateCutTime,
  videoCutTimes,
};
