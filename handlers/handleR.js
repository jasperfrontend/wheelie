const youtubeCleaner = require('../utils/theUnpunishedYTCleaner');
const { getYouTubeVideo } = require('../utils/youtube');
const { supabase } = require('../config');
const { addSongToPlayer1 } = require('./addSongToPlayer1');
const { addSongToPlayer2 } = require('./addSongToPlayer2');

async function handleR(client, channel, command, context, msg) {
  
  const beforeFilter = msg.toString().split(" ")[1];
  const result = youtubeCleaner.execute(beforeFilter);
  if(result.requestHasFuckedUpLink || result === null) {

    client.say(channel, `@${context['display-name']}, you can only request songs with a YouTube link, nothing else.`);

  } else if(result.filteredYouTubeLink) {

    const youTubeVideo = await getYouTubeVideo(result.filteredYouTubeLink);

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
    client.say(channel, `@${context['display-name']}, you can only request songs with a YouTube link, nothing else.`);
  }
}

module.exports = { handleR };