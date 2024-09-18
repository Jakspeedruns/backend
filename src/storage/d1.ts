import { Env, } from "..";
import { Game, Run, Runner, Platform, Region, Level, VarVal } from "./models";


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
  const gameInsert = db.prepare("INSERT OR IGNORE INTO Games (SRId, GameName, ShortName) VALUES (?, ?, ?) RETURNING id;");
  const categoryInsert = db.prepare("INSERT OR IGNORE INTO Category (GameId, SRId, CatName, IL, Misc) VALUES (?, ?, ?, ?, ?);");

  const platformInsert = db.prepare("INSERT OR IGNORE INTO Platform (GameId, SRId, PlatformName, Shortname) VALUES (?, ?, ?, ?);");
  const regionInsert = db.prepare("INSERT OR IGNORE INTO Region (GameId, SRId, RegionName) VALUES (?, ?, ?);");
  const levelInsert = db.prepare("INSERT OR IGNORE INTO Level (GameId, SRId, LevelName, GameSrcId) VALUES (?, ?, ?, ?);");

  const varvalInsert = db.prepare("INSERT OR IGNORE INTO VarVal (GameId, VariableId, VariableName, CategorySrcId, \
    ValueId, ValueName, IsSubcategory ) VALUES (?, ?, ?, ?, ?, ?, ?);");

  //this can error if it IGNOREs a row
  const lastRowId = await gameInsert.bind(game.srcId, game.gameName, game.shortName).first("id"); 

  // Iterate categories
  for (const category of game.categories) {
    console.log(category);
    batches.push(categoryInsert.bind(lastRowId, category.SRId, category.CatName, category.IL, category.Misc));
  }
  // Iterate platforms
  for (const platform of game.platforms) {
    console.log(platform);
    batches.push(platformInsert.bind(lastRowId, platform.srcId, platform.platformName, platform.shortName));
  }
  // Iterate regions
  for (const region of game.regions) {
    console.log(region);
    batches.push(regionInsert.bind(lastRowId, region.srcId, region.regionName));
  }
  // Iterate levels
  for (const level of game.levels) {
    console.log(level);
    batches.push(levelInsert.bind(lastRowId, level.srcId, level.levelName, level.gameSrcId));
  }
  // Iterate VarVals
  for (const varval of game.varvals) {
    console.log(varval);
    batches.push(varvalInsert.bind(lastRowId, varval.VariableId, varval.VariableName, varval.CategorySrcId,
      varval.ValueId, varval.ValueName, varval.IsSubcategory));
  }

  await db.batch(batches);
}

export async function insertRunner(db: D1Database, runners: Runner[]) {
  const batches: D1PreparedStatement[] = [];
  const runnerInsert = db.prepare("INSERT OR IGNORE INTO Runner (SRId, Name, Guest, Twitch, SRC, RowUpdatedDate) VALUES (?, ?, ?, ?, ?, ?);");

  for (const runner of runners) {
    //console.log(runner);
    let timestamp = new Date(Date.now())
    batches.push(runnerInsert.bind(runner.SRId, runner.name, runner.guest, runner.twitch, runner.SRC, timestamp.toISOString() ));
  }
  await db.batch(batches);
}

export async function insertPlatform(db: D1Database, plats: Platform[]) {
  const batches: D1PreparedStatement[] = [];
  const platformInsert = db.prepare("INSERT OR IGNORE INTO Platform (SRId, PlatformName, Shortname) VALUES (?, ?, ?);");

  for (const plat of plats) {
    console.log(plat);
    batches.push(platformInsert.bind(plat.srcId, plat.platformName, plat.shortName));
  }
  await db.batch(batches);
}

export async function insertRegion(db: D1Database, regs: Region[]) {
  const batches: D1PreparedStatement[] = [];
  const regionInsert = db.prepare("INSERT OR IGNORE INTO Region (SRId, RegionName) VALUES (?, ?);");

  for (const reg of regs) {
    console.log(reg);
    batches.push(regionInsert.bind(reg.srcId, reg.regionName));
  }
  await db.batch(batches);
}

export async function insertLevel(db: D1Database, levs: Level[]) {
  const batches: D1PreparedStatement[] = [];
  const levelInsert = db.prepare("INSERT OR IGNORE INTO Level (SRId, LevelName, GameId) VALUES (?, ?, ?);");

  for (const lev of levs) {
    console.log(lev);
    batches.push(levelInsert.bind(lev.srcId, lev.levelName, lev.gameSrcId));
  }
  await db.batch(batches);
}

export async function selectGameCatSRIds(db: D1Database) {
  //results is one of the things .all() returns
  let { results } = await db.prepare("SELECT g.SRId as GameSRId, c.SRId as CatSRId \
                  FROM Category as c JOIN Games as g on c.GameID = g.id").all();
  return results;
}


export async function insertLeaderboard(db: D1Database, leaderboard: Run[]) {
  const batches: D1PreparedStatement[] = [];
  const runsInsert = db.prepare("INSERT INTO Runs \
  (SRId, GameId, LevelId, CategoryId, runnerSrcId, time, timeSecs, platformId, emulated, regionId, \
    videoLink, comment, submitDate, status, examiner, verifyDate, variables, RowUpdatedDate) \
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);");

  // Iterate Runs
  for (const run of leaderboard) {
    //console.log(run);
    let timestamp = new Date(Date.now())
    batches.push(runsInsert.bind(run.SRId, run.gameId, run.levelId, run.categoryId, run.runnerSrcId, run.time, 
      run.timeSecs, run.platformId, run.emulated, run.regionId, run.videoLink, run.comment, 
      run.submitDate, run.status, run.examiner, run.verifyDate, run.variables, timestamp.toISOString()));
  }
  console.log('batched inserts for leaderboard runs');
  //console.log(batches);
  await db.batch(batches);
}

//identical to insertLeaderboard for now
export async function insertRuns(db: D1Database, leaderboard: Run[]) {
  const batches: D1PreparedStatement[] = [];
  const runsInsert = db.prepare("INSERT INTO Runs \
  (SRId, GameId, LevelId, CategoryId, runnerSrcId, time, timeSecs, platformId, emulated, regionId, \
    videoLink, comment, submitDate, status, examiner, verifyDate, variables, RowUpdatedDate) \
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);");

  // Iterate Runs
  for (const run of leaderboard) {
    //console.log(run);
    let timestamp = new Date(Date.now())
    batches.push(runsInsert.bind(run.SRId, run.gameId, run.levelId, run.categoryId, run.runnerSrcId, run.time, 
      run.timeSecs, run.platformId, run.emulated, run.regionId, run.videoLink, run.comment, 
      run.submitDate, run.status, run.examiner, run.verifyDate, run.variables, timestamp.toISOString()));
  }
  console.log('inserting leaderboard runs');
  //console.log(batches);
  await db.batch(batches);
}



export async function insertVarVal(db: D1Database, varvals: VarVal[]) {
  const batches: D1PreparedStatement[] = [];
  const varvalInsert = db.prepare("INSERT OR IGNORE INTO VarVal (VariableId, VariableName, CategorySrcId, \
    ValueId, ValueName, IsSubcategory ) VALUES (?, ?, ?, ?, ?, ?);");

  for (const varval of varvals) {
    console.log(varval);
    batches.push(varvalInsert.bind(varval.VariableId, varval.VariableName, varval.CategorySrcId,
      varval.ValueId, varval.ValueName, varval.IsSubcategory));
  }
  await db.batch(batches);
}


//this checks the entire runs table for any NULL RunnerId and grabs our Runner.Id based on SrcId
export async function updateRunnerIdsFromSrcId(db: D1Database) {
  const updateRunnerId = db.prepare("UPDATE Runs SET RunnerId = ( SELECT Runner.Id \
    FROM Runner WHERE Runner.SRId = Runs.RunnerSrcId ) WHERE RunnerId IS NULL AND EXISTS \
    ( SELECT * FROM Runner WHERE Runner.SRId = Runs.RunnerSrcId )").run();

  console.log(updateRunnerId);
}

export async function checkRunsSrcId(db: D1Database, ids: String[]) {
  const results = await db.prepare(
    "SELECT * FROM Runs WHERE SRId in ("+ "?, ".repeat(ids.length-1)+"?)").bind(...ids).all();
  
  return results.results
}

export async function checkRunnersSrcId(db: D1Database, ids: String[]) {
  const results = await db.prepare(
    "SELECT * FROM Runner WHERE SRId in ("+ "?, ".repeat(ids.length-1)+"?)").bind(...ids).all();
  
  return results.results
}


export async function updateRunsSrcId(db: D1Database, runlist: Run[]) {
  const batches: D1PreparedStatement[] = [];
  const updateRuns = db.prepare("UPDATE Runs SET GameId = ?, LevelId = ?, CategoryId = ?, RunnerSrcId = ?, \
    Time = ?, TimeSecs = ?, PlatformId = ?, Emulated = ?, RegionId = ?, VideoLink = ?, Comment = ?, SubmitDate = ?,\
    Status = ?, Examiner = ?, VerifyDate = ?, RowUpdatedDate = ?, Variables = ? WHERE SRId = ?");
  
  for (const run of runlist) {
    //console.log(run);
    let timestamp = new Date(Date.now())
    batches.push(updateRuns.bind( run.gameId, run.levelId, run.categoryId, run.runnerSrcId, 
      run.time, run.timeSecs, run.platformId, run.emulated, run.regionId, run.videoLink, run.comment, run.submitDate,
      run.status, run.examiner, run.verifyDate, timestamp.toISOString(), run.variables,  run.SRId ));
  }

  await db.batch(batches);
}

export async function updateRunnerSrcId(db: D1Database, runnerlist: Runner[]) {
  const batches: D1PreparedStatement[] = [];
  const updateRunners = db.prepare("UPDATE Runner SET Name = ?, Guest = ?, Twitch = ?, SRC = ?, RowUpdatedDate = ? WHERE SRId = ?");
  
  for (const runner of runnerlist) {
    let timestamp = new Date(Date.now())
    batches.push(updateRunners.bind( runner.name, runner.guest, runner.twitch, runner.SRC, timestamp.toISOString(),  runner.SRId ));
  }

  await db.batch(batches);
}
