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

/* =========================
   TEACHER DASHBOARD HELPERS
========================= */

// Get all students
async function getAllStudents() {
  const { data, error } = await supabaseClient
    .from("players")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch students:", error);
    return [];
  }

  return data || [];
}

// Get students filtered by class code
async function getStudentsByClass(classCode) {
  let query = supabaseClient
    .from("players")
    .select("*")
    .order("last_name", { ascending: true });

  if (classCode && classCode !== "all") {
    query = query.eq("class_code", classCode);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch class students:", error);
    return [];
  }

  return data || [];
}

// Get all score attempts
async function getAllScoreAttempts() {
  const { data, error } = await supabaseClient
    .from("score_attempts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch score attempts:", error);
    return [];
  }

  return data || [];
}

// Get score attempts by class code
async function getScoreAttemptsByClass(classCode) {
  const { data, error } = await supabaseClient
    .from("score_attempts")
    .select(`
      *,
      players (
        id,
        username,
        first_name,
        last_name,
        class_code
      )
    `)
    .eq("players.class_code", classCode)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch class score attempts:", error);
    return [];
  }

  return data || [];
}

// Get a single student's score history
async function getStudentScoreHistory(playerId) {
  const { data, error } = await supabaseClient
    .from("score_attempts")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch student history:", error);
    return [];
  }

  return data || [];
}

// Update student info
async function updateStudent(playerId, updates) {
  const { data, error } = await supabaseClient
    .from("players")
    .update(updates)
    .eq("id", playerId)
    .select();

  if (error) {
    console.error("Failed to update student:", error);
    return null;
  }

  return data?.[0] || null;
}

// Reset one student's scores
async function resetStudentScores(playerId) {
  const { error } = await supabaseClient
    .from("score_attempts")
    .delete()
    .eq("player_id", playerId);

  if (error) {
    console.error("Failed to reset student scores:", error);
    return false;
  }

  return true;
}

// Reset all scores for a class
async function resetClassScores(classCode) {
  const students = await getStudentsByClass(classCode);
  const ids = students.map(student => student.id);

  if (!ids.length) return true;

  const { error } = await supabaseClient
    .from("score_attempts")
    .delete()
    .in("player_id", ids);

  if (error) {
    console.error("Failed to reset class scores:", error);
    return false;
  }

  return true;
}

// Get recent signups
async function getRecentSignups(limit = 10) {
  const { data, error } = await supabaseClient
    .from("players")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch recent signups:", error);
    return [];
  }

  return data || [];
}

// Get class codes for filter dropdown
async function getClassCodes() {
  const { data, error } = await supabaseClient
    .from("players")
    .select("class_code");

  if (error) {
    console.error("Failed to fetch class codes:", error);
    return [];
  }

  const uniqueCodes = [...new Set((data || [])
    .map(item => item.class_code)
    .filter(Boolean))];

  return uniqueCodes.sort();
}

window.supabaseClient = supabaseClient;
window.submitScore = submitScore;
window.testSupabaseConnection = testSupabaseConnection;
window.getAllStudents = getAllStudents;
window.getStudentsByClass = getStudentsByClass;
window.getAllScoreAttempts = getAllScoreAttempts;
window.getScoreAttemptsByClass = getScoreAttemptsByClass;
window.getStudentScoreHistory = getStudentScoreHistory;
window.updateStudent = updateStudent;
window.resetStudentScores = resetStudentScores;
window.resetClassScores = resetClassScores;
window.getRecentSignups = getRecentSignups;
window.getClassCodes = getClassCodes;