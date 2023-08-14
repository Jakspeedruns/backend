import { Env, } from "..";
import { Game, Run, Runner, Platform, Region, Level } from "./models";


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

  const platformInsert = db.prepare("INSERT OR IGNORE INTO Platform (SRId, PlatformName, Shortname) VALUES (?, ?, ?);");
  const regionInsert = db.prepare("INSERT OR IGNORE INTO Region (SRId, RegionName) VALUES (?, ?);");
  const levelInsert = db.prepare("INSERT INTO Level (SRId, LevelName, GameId) VALUES (?, ?, ?);");

  const lastRowId = await gameInsert.bind(game.srcId, game.gameName, game.shortName).first("id"); 

  // Iterate categories
  for (const category of game.categories) {
    console.log(category);
    batches.push(categoryInsert.bind(lastRowId, category.SRId, category.CatName, category.IL, category.Misc));
  }
  // Iterate platforms
  for (const platform of game.platforms) {
    console.log(platform);
    batches.push(platformInsert.bind(platform.srcId, platform.platformName, platform.shortName));
  }
  // Iterate regions
  for (const region of game.regions) {
    console.log(region);
    batches.push(regionInsert.bind(region.srcId, region.regionName));
  }
  // Iterate levels
  for (const level of game.levels) {
    console.log(level);
    batches.push(levelInsert.bind(level.srcId, level.levelName, level.gameId));
  }

  await db.batch(batches);
}

export async function insertRunner(db: D1Database, runners: Runner[]) {
  const batches: D1PreparedStatement[] = [];
  const runnerInsert = db.prepare("INSERT OR REPLACE INTO Runner (SRId, Name, Guest, Twitch, SRC, RowCreatedDate) VALUES (?, ?, ?, ?, ?, ?);");

  for (const runner of runners) {
    console.log(runner);
    let timestamp = new Date(Date.now())
    batches.push(runnerInsert.bind(runner.SRId, runner.name, runner.guest, runner.twitch, runner.SRC, timestamp.toISOString() ));
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
  (SRId, GameId, LevelId, CategoryId, time, timeSecs, platformId, emulated, regionId, \
    videoLink, comment, submitDate, status, examiner, verifyDate, variables, RowCreatedDate) \
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);");

  // Iterate categories
  for (const run of leaderboard) {
    //console.log(run);
    let timestamp = new Date(Date.now())
    batches.push(runsInsert.bind(run.SRId, run.gameId, run.levelId, run.categoryId, run.time, 
      run.timeSecs, run.platformId, run.emulated, run.regionId, run.videoLink, run.comment, 
      run.submitDate, run.status, run.examiner, run.verifyDate, run.variables, timestamp.toISOString()));
  }
  console.log('batched inserts for leaderboard runs');
  //console.log(batches);
  await db.batch(batches);
}