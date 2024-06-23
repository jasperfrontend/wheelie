// bbot, because it's better than bot.js was
const { opts, supabase } = require('./config');
const tmi = require('tmi.js');
const client = new tmi.Client(opts);

const { handle69 } = require('./handlers/handle69');
const { handleBeep } = require('./handlers/handleBeep');
const { handleCat } = require('./handlers/handleCat');
const { handleGetsong } = require('./handlers/handleGetsong');
const { handleJoin } = require('./handlers/handleJoin');
const { handleLeave } = require('./handlers/handleLeave');
const { handleNew } = require('./handlers/handleNew');
const { handlePos } = require('./handlers/handlePos');
const { handleR } = require('./handlers/handleR');
const { handleSongs } = require('./handlers/handleSongs');
const { handleStats } = require('./handlers/handleStats');
const { handleVote } = require('./handlers/handleVote');
const { handleVotewhen } = require('./handlers/handleVotewhen');
const { handleVs } = require('./handlers/handleVs');

const {
  onConnectedHandler,
  onDisconnectedHandler,
  onReconnectHandler,
  onNoticeHandler,
  onErrorHandler
} = require('./handlers/events');

// Authorized users
// @todo: this needs to be changed to a restrictive system
// based on public.players.is_banned
const authorizedUsers = ['JasperDiscovers'];

async function initializeBot() {
  let session = JSON.parse(process.env.BOTRUNBOT_SESSION || null);

  if (!session) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: { accessToken: process.env.TWITCH_OAUTH_TOKEN }
    });

    if (error) {
      console.error('Error logging in:', error.message);
      return;
    }

    session = data.session;
    process.env.BOTRUNBOT_SESSION = JSON.stringify(session);
  } else {
    supabase.auth.setSession(session.access_token);
  }

  client.opts.channels = [process.env.TWITCH_CHANNEL];
  client.connect().catch(console.error);
}

client.on('message', (channel, context, msg, self) => {
  if (self) return;
  const commandName = msg.trim().toLowerCase();
  const username = context['display-name'];

  if (!authorizedUsers.includes(username)) return;

  if (commandName === '!join') {
    handleJoin(client, channel, commandName, context);
  } else if (commandName.startsWith('!r ')) {
    handleR(client, channel, commandName, context, msg);
  } else if (commandName === '1' || commandName === '2') {
    handleVote(client, channel, commandName, context, 'vote');
  } else if (commandName === '69') {
    handle69(client, channel, commandName, context);
  } else if (commandName.startsWith('!new')) {
    handleNew(client, channel, commandName, context);
  } else if (commandName === '!leave') {
    handleLeave(client, channel, commandName, context);
  } else if (commandName === '!pos') {
    handlePos(client, channel, commandName, context);
  } else if (commandName === '!votewhen') {
    handleVotewhen(client, channel, commandName, context);
  } else if (commandName === '!getsong') {
    handleGetsong(client, channel, commandName, context);
  } else if (commandName === '!songs') {
    handleSongs(client, channel, commandName, context);
  } else if (commandName.startsWith('!stats')) { // !stats @username
    handleStats(client, channel, commandName, context);
  } else if (commandName.startsWith('!vs')) { // !vs @username @username
    handleVs(client, channel, commandName, context);
  } else if (commandName.startsWith('!cat')) { // !cat <category name or partial>
    handleCat(client, channel, commandName, context);
  } else if (commandName === '!beep') {
    handleBeep(client, channel, commandName, context);
  };
});

client.on('connected', onConnectedHandler);
client.on('disconnected', onDisconnectedHandler);
client.on('reconnect', onReconnectHandler);
client.on('notice', onNoticeHandler);
client.on('error', onErrorHandler);

initializeBot().catch(console.error);
