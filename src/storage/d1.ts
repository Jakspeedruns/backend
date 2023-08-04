import { Env } from "..";
import { Game } from "./models";
import { Platform } from "./models";
import { Region } from "./models";
import { Level } from "./models";
import { Run } from "./models";


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

export async function insertPlatform(db: D1Database, plats: Platform[]) {
  const batches: D1PreparedStatement[] = [];
  const platformInsert = db.prepare("INSERT INTO Platform (SRId, PlatformName, Shortname) VALUES (?, ?, ?);");

  for (const plat of plats) {
    console.log(plat);
    batches.push(platformInsert.bind(plat.srcId, plat.platformName, plat.shortName));
  }
  await db.batch(batches);
}

export async function insertRegion(db: D1Database, regs: Region[]) {
  const batches: D1PreparedStatement[] = [];
  const regionInsert = db.prepare("INSERT INTO Region (SRId, RegionName) VALUES (?, ?);");

  for (const reg of regs) {
    console.log(reg);
    batches.push(regionInsert.bind(reg.srcId, reg.regionName));
  }
  await db.batch(batches);
}

export async function insertLevel(db: D1Database, levs: Level[]) {
  const batches: D1PreparedStatement[] = [];
  const levelInsert = db.prepare("INSERT INTO Level (SRId, LevelName, GameId) VALUES (?, ?, ?);");

  for (const lev of levs) {
    console.log(lev);
    batches.push(levelInsert.bind(lev.srcId, lev.levelName, lev.gameId));
  }
  await db.batch(batches);
}


export async function insertLeaderboard(db: D1Database, leaderboard: Run[]) {
  const batches: D1PreparedStatement[] = [];
  const runsInsert = db.prepare("INSERT INTO Runs \
  (SRId, GameId, CategoryId, time, timeSecs, platformId, emulated, regionId, \
    videoLink, comment, submitDate, status, examiner, verifyDate, variables) \
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);");

  // Iterate categories
  for (const run of leaderboard) {
    //console.log(run);
    batches.push(runsInsert.bind(run.SRId, run.gameId, run.categoryId, run.time, 
      run.timeSecs, run.platformId, run.emulated, run.regionId, run.videoLink, run.comment, 
      run.submitDate, run.status, run.examiner, run.verifyDate, run.variables));
  }
  console.log('batched inserts');
  console.log(batches);
  await db.batch(batches);
}