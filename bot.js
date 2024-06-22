require('dotenv').config();
const tmi = require('tmi.js');
const { createClient } = require('@supabase/supabase-js');
const express = require('express');

const PORT = process.env.PORT || 10000;

// Define configuration options
const opts = {
  identity: {
    username: process.env.TWITCH_BOT_USERNAME,
    password: process.env.TWITCH_OAUTH_TOKEN
  },
  channels: [process.env.TWITCH_CHANNEL],
  connection: {
    reconnect: true,
    secure: true
  }
};

// List of authorized users
const authorizedUsers = ['jasperdiscovers'];

// Create a client with our options
const client = new tmi.Client(opts);

// Create a single Supabase client for interacting with your database
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

  // Fetch the channels from the database where is_player is true
  // async function fetchPlayerChannels() {
  //   const { data, error } = await supabase
  //     .from('players')
  //     .select('name')
  //     .eq('is_player', true);

  //   if (error) {
  //     console.error('Error fetching players.');
  //     return [];
  //   }

  //   return data.map(user => user.name);
  // }

  // Register our event handlers 
  client.on('message', onMessageHandler);
  client.on('connected', onConnectedHandler);
  client.on('disconnected', onDisconnectedHandler);
  client.on('reconnect', onReconnectHandler);
  client.on('notice', onNoticeHandler);
  client.on('error', onErrorHandler);

  // Connect to Twitch and fetch channels
  // const channels = await fetchPlayerChannels();
  // client.opts.channels = channels;
  client.connect().catch(console.error);
}

// Start the bot initialization
initializeBot().catch(console.error);

// Called every time a message comes in
function onMessageHandler(channel, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot
  console.log(context); // this is a fuckton of data lol
  // Get the username of the message sender
  const username = context.username;

  // Check if the user is authorized
  if (!authorizedUsers.includes(username.toLowerCase())) {
    return;
  }

  // Remove whitespace from chat message and convert to lowercase
  const commandName = msg.trim().toLowerCase();

  // Log the received command for debugging
  // console.log(`Received command: ${commandName} from ${username}`);

  // If the command is known, let's execute it
  if (commandName.startsWith('!join')) {
    handleJoin(channel, commandName, context);
  } else if (commandName.startsWith('!sr')) {
    handleSR(channel, commandName, context);
  } else if (commandName === '1' || commandName === '2') {
    handleVote(channel, commandName, context, 'vote');
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
    console.log('!beep received');
    client.say(channel, 'boop!');
  } 
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to [${addr}:${port}]`);
  // client.say('jasperdiscovers', 'Spinge Bot is alive. Hi!');
}

// Called every time the bot disconnects from Twitch chat
function onDisconnectedHandler(reason) {
  console.log(`Disconnected: ${reason}`);
  client.connect().catch(console.error); // Attempt to reconnect
}

// Called every time the bot attempts to reconnect
function onReconnectHandler() {
  console.log('Reconnecting...');
  client.say('jasperdiscovers', 'Reconnecting... Twitch smol startup sometimes cannot keep their chatbox online.');
}

// Called for any notice events from Twitch
function onNoticeHandler(channel, msgid, message) {
  console.log(`Notice from ${channel}: [${msgid}] ${message}`);
}

// Called for any errors
function onErrorHandler(err) {
  console.error('Error:', err);
  client.say('jasperdiscovers', 'Something went wrong: ' + err);
}


async function handleJoin(channel, command, context) {
  client.say(channel, `${command} is called by ${context.username}`); 
}
async function handleSR(channel, command, context) {
  client.say(channel, `${command} is called by ${context.username}`); 
}
async function handleVote(channel, command, context) {
  client.say(channel, `${command} is called by ${context.username}`); 
}
async function handleNew(channel, command, context) {
  client.say(channel, `${command} is called by ${context.username}`); 
}
async function handleLeave(channel, command, context) {
  client.say(channel, `${command} is called by ${context.username}`); 
}
async function handlePos(channel, command, context) {
  client.say(channel, `${command} is called by ${context.username}`); 
}
async function handleVotewhen(channel, command, context) {
  client.say(channel, `${command} is called by ${context.username}`); 
}
async function handleGetsong(channel, command, context) {
  client.say(channel, `${command} is called by ${context.username}`); 
}
async function handleSongs(channel, command, context) {
  client.say(channel, `${command} is called by ${context.username}`); 
}
async function handleStats(channel, command, context) {
  client.say(channel, `${command} is called by ${context.username}`); 
}
async function handleVs(channel, command, context) {
  client.say(channel, `${command} is called by ${context.username}`); 
}
async function handleCat(channel, command, context) {
  client.say(channel, `${command} is called by ${context.username}`); 
}

// Express server for Render port binding
const app = express();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
