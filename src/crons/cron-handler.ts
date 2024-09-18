import { Env } from "..";
import { createSpeedrunAPIClient } from "../external/src-api";
import { insertNewGame
        ,insertRunner
        ,insertPlatform
        ,insertRegion
        ,insertLevel
        ,insertLeaderboard
        ,insertRuns
        ,selectGameCatSRIds
        ,insertVarVal 
        ,updateRunnerIdsFromSrcId
        ,checkRunsSrcId
        ,checkRunnersSrcId
        ,updateRunsSrcId
        ,updateRunnerSrcId
        } from "../storage/d1";
import { Game, Run, Runner, Platform, Region, Level, VarVal } from "../storage/models";


//makes a table for game, level, category, platform, and region
export async function fetchGameInfo(req: any, env: Env, ctx: ExecutionContext): Promise<any> {
  const client = createSpeedrunAPIClient();
  // Simple test with Jak 1
  const game = await client.getGameInfo("ok6qlo1g");
  if (game !== undefined) {
    await insertNewGame(env.DB, game);
  }

  console.log("finished fetchGameInfo");

  return;
}

export async function updateGamePlatforms(req: any, env: Env, ctx: ExecutionContext): Promise<any> {
  // Create a Speedrun.com API client
  const client = createSpeedrunAPIClient();

  // also a Simple test with Jak 1
  const plats = await client.getPlatform("xkdk4g1m");
  if (plats !== undefined) {
    await insertPlatform(env.DB, plats);
  }

  console.log("updated platforms");

  return;
}

export async function updateGameRegions(req: any, env: Env, ctx: ExecutionContext): Promise<any> {
  // Create a Speedrun.com API client
  const client = createSpeedrunAPIClient();

  // also a Simple test with Jak 1
  const regs = await client.getRegion("xkdk4g1m");
  if (regs !== undefined) {
    await insertRegion(env.DB, regs);
  }

  console.log("updated regions");

  return;
}

export async function updateGameLevel(req: any, env: Env, ctx: ExecutionContext): Promise<any> {
  // Create a Speedrun.com API client
  const client = createSpeedrunAPIClient();

  // also a Simple test with Jak 1
  const levs = await client.getLevel("xkdk4g1m");
  if (levs !== undefined) {
    await insertLevel(env.DB, levs);
  }

  console.log("updated level");

  return;
}

export async function test(req: any, env: Env, ctx: ExecutionContext): Promise<any> {
//this doesn't work its an array
  let { GameSRId, CatSRId } = await selectGameCatSRIds(env.DB);

//
//
//
//
//
  console.log(GameSRId)
  console.log("TODO");

  return;
}

export async function updateLeaderboard(req: any, env: Env, ctx: ExecutionContext): Promise<any> {
  // Create a Speedrun.com API client
  const client = createSpeedrunAPIClient();

  // this has red lines but runs well
  const { leaderboard, players , varvals } = await client.getLeaderboard("76r3eg46", "q255rn82");
  
  if (players !== undefined) {
    console.log('insert leaderboard players')
    await insertRunner(env.DB, players);
  }

  if (leaderboard !== undefined) {
    await insertLeaderboard(env.DB, leaderboard);
  }
  console.log("------" + varvals)
  if (varvals !== undefined) {
    console.log("varvals??------")
    await insertVarVal(env.DB, varvals);
  }

  console.log("updated leaderboard");

  return;
}

export async function updateSeriesGames(req: any, env: Env, ctx: ExecutionContext): Promise<any> {
  // Create a Speedrun.com API client
  const client = createSpeedrunAPIClient();
  
  const gameIdList = await client.getSeriesGames();
  if (gameIdList !== undefined) {
    for (const gameId of gameIdList ) {
      const game = await client.getGameInfo(gameId);
      if (game !== undefined) {
        await insertNewGame(env.DB, game);
      }
    }
  }
  console.log("Updated games/cats/plats/regions/levels :o");

  return;
}



export async function updateRuns(req: any, env: Env, ctx: ExecutionContext): Promise<any> {
  // Create a Speedrun.com API client
  const client = createSpeedrunAPIClient();

  // also a Simple test with Jak 1
  const [ runs, players ] = await client.getRuns("xkdk4g1m");
  if (runs !== undefined) {
    await insertRuns(env.DB, runs);
  }
  if (players !== undefined) {
    await insertRunner(env.DB, players);
  }

  console.log("inserted Jak1 runs");

  return;
}



export async function updateRecentRuns(req: any, env: Env, ctx: ExecutionContext): Promise<any> {
  // Create a Speedrun.com API client
  const client = createSpeedrunAPIClient();
  const [ apiRuns, apiPlayers ] = await client.getRecentRuns("xkdk4g1m");

  //get the SR ids and check our DB
  let ids = apiRuns.map(obj => obj.SRId)
  let rows = await checkRunsSrcId(env.DB, ids)

  let runUpdateList: Run[] = []
  let runInsertList: Run[] = []
  
  //if we find a match, update the row, otherwise insert the new run
  if (rows !== undefined) {
    for (const apiRun of apiRuns) {
      const match = rows.find(row => row.SRId == apiRun.SRId)
      if (match !== undefined) {
        runUpdateList.push(apiRun)
      }
      else {
        runInsertList.push(apiRun)
      }
    }
    console.log("run update list:" + runUpdateList.length)
    if (runUpdateList.length > 0) {
      await updateRunsSrcId(env.DB, runUpdateList);
    }
    console.log("run insert list:" + runInsertList.length)
    if (runInsertList.length > 0) {
      await insertRuns(env.DB, runInsertList);
    }
  }
  //repeat for players
  ids = apiPlayers.map(obj => obj.SRId)
  rows = await checkRunnersSrcId(env.DB, ids)
  
  let runnerUpdateList: Runner[] = []
  let runnerInsertList: Runner[] = []

  if (rows !== undefined) {
    for (const apiPlayer of apiPlayers) {
      const match = rows.find(row => row.SRId == apiPlayer.SRId)
      if (match !== undefined) {
        runnerUpdateList.push(apiPlayer)
      }
      else {
        runnerInsertList.push(apiPlayer)
      }
    }
    console.log("runner update list:" + runnerUpdateList.length)
    if (runnerUpdateList.length > 0) {
      await updateRunnerSrcId(env.DB, runnerUpdateList);
    }
    console.log("runner insert list:" + runnerInsertList.length)
    if (runnerInsertList.length > 0) {
      await insertRunner(env.DB, runnerInsertList);
    }
  }
  console.log("inserted recent runs and players");
  return;
}



//this checks the entire runs table for any NULL RunnerId and grabs our Runner.Id based on SrcId
export async function bulkRunnerIdUpdater(req: any, env: Env, ctx: ExecutionContext): Promise<any> {
  // Create a Speedrun.com API client
  const client = createSpeedrunAPIClient();
 
  await updateRunnerIdsFromSrcId(env.DB);

  return;
}