const supabaseUrl = "https://sjpfzfvmgjhqjnspgmua.supabase.co";
const supabaseKey = "sb_publishable_vMpgHf8DI0nRSeDVRImzUw_QXM2XzGR"

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  try {
    const { error } = await supabaseClient
      .from("players")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }

    console.log("Supabase connected successfully");
    return true;
  } catch (err) {
    console.error("Unexpected Supabase connection error:", err);
    return false;
  }
}

async function submitScore(gameNumber, score) {
  const playerId = localStorage.getItem("mq_player_id");

  if (!playerId) {
    console.warn("No player ID found");
    return;
  }

  try {
    const { error } = await supabaseClient
      .from("score_attempts")
      .insert([
        {
          player_id: playerId,
          game_number: gameNumber,
          score: score
        }
      ]);

    if (error) {
      console.error("Score submission failed:", error);
    } else {
      console.log(`Score submitted: Game ${gameNumber} → ${score}`);
    }
  } catch (err) {
    console.error("Unexpected score submission error:", err);
  }
}

window.supabaseClient = supabaseClient;
window.submitScore = submitScore;
window.testSupabaseConnection = testSupabaseConnection;