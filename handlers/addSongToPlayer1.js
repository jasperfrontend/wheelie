const { supabase } = require('../config');
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

module.exports = { addSongToPlayer1 };