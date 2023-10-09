import { Env } from "..";
import { Game } from "./models";

function generateUUID() {
  var d = new Date().getTime();
  var d2 = (typeof performance !== "undefined" && performance.now && performance.now() * 1000) || 0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export interface NewSubmissionResponse {
  submissionId: string;
  isNewPlayer: boolean;
}

export async function insertNewHighscoreSubmission(
  db: D1Database,
  highscoreId: number,
  videoLink: string,
  playerName: string,
  score: number,
): Promise<NewSubmissionResponse | undefined> {
  const submissionInsert = db.prepare(
    "INSERT INTO highscores_submissions (highscore_id, player_name, submission_id, submission_status, score, video_link) VALUES (?, ?, ?, ?, ?, ?);",
  );
  const submissionId = generateUUID();
  await submissionInsert.bind(highscoreId, playerName, submissionId, 0, score, videoLink).run();
  // Check if it's a new plyaer
  let playerId = await db
    .prepare("SELECT id FROM highscores_players WHERE player_name = ?;")
    .bind(playerName)
    .first("id");
  return {
    submissionId,
    isNewPlayer: playerId === null,
  };
}

export async function rejectHighscoreSubmission(db: D1Database, submissionId: string, reason: string): Promise<string> {
  const submissionInfo = await db
    .prepare("SELECT * FROM highscores_submissions WHERE submission_id = ?;")
    .bind(submissionId)
    .first();
  if (submissionInfo.submission_status !== 0) {
    return "Already approved/rejected";
  }
  const submissionInsert = db.prepare(
    "UPDATE highscores_submissions SET submission_status = 2, rejection_reason = ? WHERE submission_id = ?;",
  );
  await submissionInsert.bind(reason, submissionId).run();
  return "";
}

export interface Highscores {
  playerName: string;
  score: number;
  videoLink?: string;
}

export async function getHighscores(db: D1Database, highscoreId: number): Promise<Highscores[]> {
  const rows = await db
    .prepare(
      "SELECT highscores_players.player_name, highscores_entries.score, highscores_entries.video_link FROM highscores_entries JOIN highscores_players ON highscores_entries.player_id = highscores_players.id WHERE highscore_id = ? AND archived = 0 ORDER BY highscores_entries.score DESC;",
    )
    .bind(highscoreId)
    .all();

  const highscores: Highscores[] = [];
  rows.results.forEach((row) => {
    highscores.push({
      playerName: row.player_name,
      score: row.score,
      videoLink: row.video_link,
    });
  });
  return highscores;
}

export async function approveHighscoreSubmission(db: D1Database, submissionId: string): Promise<string> {
  const submissionInfo = await db
    .prepare("SELECT * FROM highscores_submissions WHERE submission_id = ?;")
    .bind(submissionId)
    .first();
  if (submissionInfo.submission_status !== 0) {
    return "Already approved/rejected";
  }
  // TODO - Transactions via stored procedures
  // First, mark the submission as approved
  const submissionInsert = db.prepare(
    "UPDATE highscores_submissions SET submission_status = 1 WHERE submission_id = ?;",
  );
  await submissionInsert.bind(submissionId).run();
  // Next, make sure the player exists (get it's id), if not we insert a new player for the first time
  let playerId = await db
    .prepare("SELECT id FROM highscores_players WHERE player_name = ?;")
    .bind(submissionInfo.player_name)
    .first("id");
  if (playerId === null) {
    const playerInsert = db.prepare("INSERT OR IGNORE INTO highscores_players (player_name) VALUES (?) RETURNING id;");
    playerId = await playerInsert.bind(submissionInfo.player_name).first("id");
  }
  console.log(playerId);
  // Archive any runs by that player for that highscore
  const archiveUpdate = db.prepare(
    "UPDATE highscores_entries SET archived = 1 WHERE player_id = ? AND highscore_id = ?;",
  );
  await archiveUpdate.bind(playerId, submissionInfo.highscore_id).run();
  // Finally, insert the new highscore
  const highscoreInsert = db.prepare(
    "INSERT INTO highscores_entries (player_id, highscore_id, score, video_link, archived) VALUES (?, ?, ?, ?, ?);",
  );
  await highscoreInsert
    .bind(playerId, submissionInfo.highscore_id, submissionInfo.score, submissionInfo.video_link, 0)
    .run();
  return "";
}

export async function batchUpdateSpeedruns(env: Env, something: string) {
  // TODO - update the database!
  env.DB.exec("TODO!");
}

export async function insertNewGame(db: D1Database, game: Game) {
  // D1 doesn't have fully fledged transactions, yet
  // batches are the close you can get, which makes it hard to
  // construct a transaction that depends on data from a previous statement (ie. insert one row, then many)
  //
  // For now we have to split them up and bite the bullet on no transactions
  const batches: D1PreparedStatement[] = [];
  const gameInsert = db.prepare("INSERT INTO Games (SRId, GameName, ShortName) VALUES (?, ?, ?) RETURNING id;");
  const categoryInsert = db.prepare("INSERT INTO Category (GameID, SRId, CatName, IL, Misc) VALUES (?, ?, ?, ?, ?);");

  const lastRowId = await gameInsert.bind(game.srcId, game.gameName, game.shortName).first("id");

  // Iterate categories
  for (const category of game.categories) {
    console.log(category);
    batches.push(categoryInsert.bind(lastRowId, category.SRId, category.CatName, category.IL, category.Misc));
  }
  await db.batch(batches);
}
