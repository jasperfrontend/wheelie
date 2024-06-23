const { supabase } = require('../config');
async function handleLeave(client, channel, command, context) {
  // check if user is already in db
  // if so, continue
  // if not, return with message they weren't playing in the first place
  const { data:findPlayer, error:findPlayerError } = await supabase
    .from('players')
    .select('name')
    .eq('name', context['display-name'])
    .maybeSingle();
  if(findPlayerError) {
    console.log(`Error getting users: ${error}`);
  } else if(findPlayer === null) {
    console.log('No users returned.');
    client.say(channel, `@${context['display-name']}, you were not joined to begin with.`)
  } 

  // now that they're signed in, change their is_player status to true
  const { data:setUserAsPlayer, error:setUserAsPlayerError } = await supabase
    .from('players')
    .update({ is_player: false })
    .eq('name', context['display-name'])
    .select()
    .single();

  if(setUserAsPlayerError) {
    console.log(`Error setting ${context['display-name']} as player.`);
  } else if(setUserAsPlayer.is_player === false) {
    client.say(channel, `@${context['display-name']}, you have left the queue of Spin The Wheel. Type !join to join the queue again in the future. Thanks for playing!`);
  } else {
    client.say(channel, `@${context['display-name']}, god knows what went wrong. Try !leave again :)`);
  }
}

module.exports = { handleLeave };
