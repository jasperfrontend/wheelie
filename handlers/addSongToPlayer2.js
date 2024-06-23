const { supabase } = require('../config');
async function addSongToPlayer2(yt_id, roundId) {
  
  const { data:addSongToRound, error:addSongToRoundError } = await supabase
    .from('rounds')
    .update({ player2_song: yt_id })
    .eq('id', roundId);
  
  if(addSongToRoundError) {
    console.log(`Error saving player 2 song to db: ${JSON.stringify(addSongToRoundError)}`);
  }
  return addSongToRound;
}

module.exports = { addSongToPlayer2 };