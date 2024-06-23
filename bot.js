require('dotenv').config();
const tmi = require('tmi.js');
const supabase = require('./lib/supabaseClient');
const express = require('express');
const youtubeCleaner = require('./utils/theUnpunishedYTCleaner');
const moment = require('moment');
require('moment-duration-format');

const PORT = process.env.PORT || 10000;

// Define configuration options
const opts = {
  identity: {
    username: process.env.TWITCH_BOT_USERNAME,
    password: process.env.TWITCH_OAUTH_TOKEN
  },
  channels: [],
  connection: {
    reconnect: true,
    secure: true
  }
};

// List of authorized users
const authorizedUsers = ['JasperDiscovers'];

// Create a client with our options
const client = new tmi.Client(opts);

// Initialize and start the bot
async function initializeBot() {
  // Use the stored session or login if necessary
  let session = JSON.parse(process.env.BOTRUNBOT_SESSION || null);

  if (!session) {
    // Authenticate the bot user with Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: {
        accessToken: process.env.TWITCH_OAUTH_TOKEN,
      },
    });

    if (error) {
      console.error('Error logging in:', error.message);
      return;
    }
    
    session = data.session;
    process.env.BOTRUNBOT_SESSION = JSON.stringify(session); // Store the session
  } else {
    supabase.auth.setSession(session.access_token);
  }

  // Fetch the players
  async function fetchPlayerChannels() {
    const { data, error } = await supabase
      .from('players')
      .select('name')
      .eq('uid', 'ea04bc6c-39dd-44a5-a9b3-11c42ae2ddf1');

    if (error) {
      console.error('Error fetching players.');
      return [];
    }
    // console.log(data.map(user => user.name));
    return data.map(user => user.name);
  }

  // Register our event handlers 
  client.on('message', onMessageHandler);
  client.on('connected', onConnectedHandler);
  client.on('disconnected', onDisconnectedHandler);
  client.on('reconnect', onReconnectHandler);
  client.on('notice', onNoticeHandler);
  client.on('error', onErrorHandler);

  // Connect to Twitch and fetch channels
  const channels = await fetchPlayerChannels();
  client.opts.channels = channels;
  client.connect().catch(console.error);
}

// Start the bot initialization
initializeBot().catch(console.error);

// Called every time a message comes in
function onMessageHandler(channel, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // console.log(`* * * context: ${JSON.stringify(context)}. msg: ${msg} * * *`);

  // Get the username of the message sender
  const username = context['display-name'];

  // Check if the user is authorized
  if (!authorizedUsers.includes(username)) {
    return;
  }

  const commandName = msg.trim().toLowerCase();

  if (commandName === '!join') {
    handleJoin(channel, commandName, context);
  } else if (commandName.startsWith('!r ')) {
    handleR(channel, commandName, context, msg);
  } else if (commandName === '1' || commandName === '2') {
    handleVote(channel, commandName, context, 'vote');
  } else if (commandName === '69') {
    handle69(channel, commandName, context);
  } else if (commandName.startsWith('!new')) {
    handleNew(channel, commandName, context);
  } else if (commandName === '!leave') {
    handleLeave(channel, commandName, context);
  } else if (commandName === '!pos') {
    handlePos(channel, commandName, context);
  } else if (commandName === '!votewhen') {
    handleVotewhen(channel, commandName, context);
  } else if (commandName === '!getsong') {
    handleGetsong(channel, commandName, context);
  } else if (commandName === '!songs') {
    handleSongs(channel, commandName, context);
  } else if (commandName.startsWith('!stats')) { // !stats @username
    handleStats(channel, commandName, context);
  } else if (commandName.startsWith('!vs')) { // !vs @username @username
    handleVs(channel, commandName, context);
  } else if (commandName.startsWith('!cat')) { // !cat <category name or partial>
    handleCat(channel, commandName, context);
  } else if (commandName === '!beep') {
    handleBeep(channel, commandName, context);
  } 
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  const cyan = '\x1b[36m';  // ANSI escape code for cyan
  const reset = '\x1b[0m';  // ANSI escape code to reset color
  
  const message = `* * * Connected to [${addr}:${port}] * * *`;
  const coloredMessage = message.replace(/\*/g, `${cyan}*${reset}`);

  console.log(coloredMessage);
}

// Called every time the bot disconnects from Twitch chat
function onDisconnectedHandler(reason) {
  console.log(`Disconnected: ${reason}`);
  client.connect().catch(console.error); // Attempt to reconnect
}

// Called every time the bot attempts to reconnect
function onReconnectHandler() {
  console.log('Reconnecting...');
}

// Called for any notice events from Twitch
function onNoticeHandler(channel, msgid, message) {
  console.log(`Notice from ${channel}: [${msgid}] ${message}`);
}

// Called for any errors
function onErrorHandler(err) {
  console.error('Error:', err);
  client.say(process.env.TWITCH_CHANNEL, 'Something went wrong LUL fuck knows what went wrong. This message is literally a last-ditch effort to try and save the bot from disconnecting.');
}

// Cleans input to remove anything in between [brackets] (brackets) or {brackets}
function cleanTitle(title) {
  // Regular expression to match anything in parentheses, square brackets, or curly braces
  const regex = / *\([^)]*\)| *\[[^\]]*\]| *\{[^}]*\}/g;
  // Replace matched content with an empty string
  return title.replace(regex, '').trim();
}

// converts ISO8608 time to seconds
function iso8601DurationToSeconds(duration) {
  const parsedDuration = moment.duration(duration);
  return parsedDuration.asSeconds();
}

// YouTube Data API
async function getYouTubeVideo(videoId) {
  const vidId = videoId || null;
  const response = vidId ? await fetch(`${process.env.YOUTUBE_API_URL}?part=snippet%2CcontentDetails&id=${vidId}&maxResults=1&key=${process.env.YOUTUBE_API_KEY}`) : null;
  const yt = await response.json();
  const deep = yt.items[0]; // KEKW

  const ytObject = ({
    id: deep.id,
    title: cleanTitle(deep.snippet.title),
    thumb: deep.snippet.thumbnails.standard.url,
    duration: iso8601DurationToSeconds(deep.contentDetails.duration),
  });

  return ytObject;
}

// Adding songs to the right player. pardon my French here.
async function addSongToPlayer1(yt_id, roundId) {

  const { data:addSongToRound, error:addSongToRoundError } = await supabase
    .from('rounds')
    .update({ player1_song: yt_id })
    .eq('id', roundId);
  
  if(addSongToRoundError) {
    console.log(`Error saving player 1 song to db: ${JSON.stringify(addSongToRoundError)}`);
  }
  return addSongToRound;
}

async function addSongToPlayer2(yt_id, roundId) {
  const { data:addSongToRound, error:addSongToRoundError } = await supabase
    .from('rounds')
    .update({ player2_song: yt_id })
    .eq('id', roundId)
    .select()
    .single();
  
  if(addSongToRoundError) {
    console.log(`Error saving player 2 song to db: ${JSON.stringify(addSongToRoundError)}`);
  }
  return addSongToRound;
}

async function handleJoin(channel, command, context) {
  // check if user is already in db
  // if so, continue
  // if not, return with link
  const { data:findPlayer, error:findPlayerError } = await supabase
    .from('players')
    .select('name')
    .eq('name', context['display-name'])
    .maybeSingle();
  if(findPlayerError) {
    console.log(`Error getting users: ${error}`);
  } else if(findPlayer === null) {
    console.log('No users returned.');
    client.say(channel, `@${context['display-name']}, you have not linked your Twitch account with Spin The Wheel yet. Please visit https://go.jasper.stream/stw to link your account.`)
  } 

  // now that they're signed in, change their is_player status to true
  const { data:setUserAsPlayer, error:setUserAsPlayerError } = await supabase
    .from('players')
    .update({ is_player: true })
    .eq('name', context['display-name'])
    .select()
    .single();

  if(setUserAsPlayerError) {
    console.log(`Error setting ${context['display-name']} as player.`);
  } else if(setUserAsPlayer.is_player === true) {
    client.say(channel, `@${context['display-name']}, you have already joined the queue of Spin The Wheel. Type !leave if you want to leave the queue. I will let you know when it's your time to play.`)
  } else {
    client.say(channel, `@${context['display-name']}, you have joined the queue of Spin The Wheel. Type !leave to leave the queue.`);
  }
}

// !r <youtubelink>
async function handleR(channel, command, context, msg) {
  
  const beforeFilter = msg.toString().split(" ")[1];
  const result = youtubeCleaner.execute(beforeFilter);
  if(result.requestHasFuckedUpLink || result === null) {

    client.say(channel, `@${context['display-name']}, you can only ${command} songs with a YouTube link, nothing else.`);

  } else if(result.filteredYouTubeLink) {

    const youTubeVideo = await getYouTubeVideo(result.filteredYouTubeLink);
    // console.log(youTubeVideo);

    // youTubeVideo now contains a bunch of data
    // insert into public.songs: 
    const { data:songData, error:songDataError } = await supabase
      .from('songs')
      .upsert({ yt_id: youTubeVideo.id, title: youTubeVideo.title, thumbnail_url: youTubeVideo.thumb })
      .select()
      .single();
    
    if(songDataError) {
      console.log(`Error inserting song into db: ${JSON.stringify(songDataError)}`);
    }
    if(songData === null) {
      console.log(`No return data received after inserting a song: ${songData}`);
    }
    let song = songData;

    // then get correct player uid from public.players eq.name
    const { data:getUserData, error:getUserDataError } = await supabase
      .from('players')
      .select(`name, uid`)
      .ilike('name', context['display-name'])
      .single();
    
    if(getUserDataError) {
      console.log(`Error getting user from db: ${JSON.stringify(getUserDataError)}`);
    }
    if(getUserData === null) {
      console.log(`No return data received after searching for user: ${getUserData}`);
    }
    let correctUser = getUserData;
    
    // then get last round from view:last_round
    const { data:lastRound, error:lastRoundError } = await supabase
      .from('last_round')
      .select('*')
      .single();

    if(lastRoundError) {
      console.log(`Error getting last round from db: ${lastRoundError}`);
    }
    if(lastRound === null) {
      console.log(`No return data received after trying to get last round: ${lastRound}`);
    }
    let theLastRound = lastRound;

    // then get both player1_uid and player2_uid 
    const player1 = theLastRound.player1_uid;
    
    // assign song to the correct player 
    player1 === correctUser.uid ? addSongToPlayer1(song.yt_id, theLastRound.id) : addSongToPlayer2(song.yt_id, theLastRound.id);

    client.say(channel, `@${context['display-name']}, you requested ${youTubeVideo.title}. Good luck!`);

    // then $patch store with latest updates in Vue app
    // then startRound()

  } else {
    client.say(channel, `@${context['display-name']}, you can only ${command} songs with a YouTube link, nothing else.`);
  }
}

async function handleVote(channel, command, context) {
  client.say(channel, `${command} is called by ${context['display-name']}`); 
}

async function handleNew(channel, command, context) {
  client.say(channel, `${command} is called by ${context['display-name']}`); 
}

async function handle69(channel) {
  client.say(channel, 'Kappa');
}

async function handleLeave(channel, command, context) {
  client.say(channel, `${command} is called by ${context['display-name']}`); 
}
async function handlePos(channel, command, context) {
  client.say(channel, `${command} is called by ${context['display-name']}`); 
}
async function handleVotewhen(channel, command, context) {
  client.say(channel, `${command} is called by ${context['display-name']}`); 
}
async function handleGetsong(channel, command, context) {
  client.say(channel, `${command} is called by ${context['display-name']}`); 
}
async function handleSongs(channel, command, context) {
  client.say(channel, `${command} is called by ${context['display-name']}`); 
}
async function handleStats(channel, command, context) {
  client.say(channel, `${command} is called by ${context['display-name']}`); 
}
async function handleVs(channel, command, context) {
  client.say(channel, `${command} is called by ${context['display-name']}`); 
}
async function handleCat(channel, command, context) {
  client.say(channel, `${command} is called by ${context['display-name']}`); 
}
async function handleBeep(channel, command, context) {
  console.log(`${command} received!`);
  client.say(channel, 'boop!');
}

// Express server for Render port binding
const app = express();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
