const { supabase } = require('../config');
async function handleJoin(client, channel, command, context) {
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
    client.say(channel, `@${context['display-name']}, you have joined the queue of Spin The Wheel. Type !leave if you want to leave the queue. I will let you know when it's your time to play.`)
  } else {
    client.say(channel, `@${context['display-name']}, god knows what went wrong. Try !join again :)`);
  }
}

module.exports = { handleJoin };