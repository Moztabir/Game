const supabaseUrl = "https://ktlarcejrqsovffqhfcu.supabase.co";
const supabaseKey = "sb_publishable_ndfyElH6tRakFhd07AEPfg_PVjOiHYu";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function submitScore(gameNumber, score){
  const playerId = localStorage.getItem("mq_player_id");

  if(!playerId){
    console.warn("No player ID found");
    return;
  }

  const { error } = await supabaseClient
    .from("score_attempts")
    .insert([
      {
        player_id: playerId,
        game_number: gameNumber,
        score: score
      }
    ]);

  if(error){
    console.error("Score submission failed:", error);
  } else {
    console.log(`Score submitted: Game ${gameNumber} → ${score}`);
  }
}

window.submitScore = submitScore;
window.supabaseClient = supabaseClient;