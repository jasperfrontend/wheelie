const moment = require('moment');
require('moment-duration-format');
const { cleanTitle } = require('./cleantitle');

async function getYouTubeVideo(videoId) {
  const response = await fetch(`${process.env.YOUTUBE_API_URL}?part=snippet%2CcontentDetails&id=${videoId}&maxResults=1&key=${process.env.YOUTUBE_API_KEY}`);
  const yt = await response.json();
  const deep = yt.items[0];

  return {
    id: deep.id,
    title: cleanTitle(deep.snippet.title),
    thumb: deep.snippet.thumbnails.standard.url,
    duration: moment.duration(deep.contentDetails.duration).asSeconds()
  };
}


module.exports = {
  getYouTubeVideo,
};
