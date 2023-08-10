import { Env } from "..";
import { createSpeedrunAPIClient } from "../external/src-api";
import { insertNewGame
        ,insertPlatform
        ,insertRegion
        ,insertLevel
        ,insertLeaderboard } from "../storage/d1";

// a difference
export async function updateSpeedrunRecords(req: any, env: Env, ctx: ExecutionContext): Promise<any> {
  // Create a Speedrun.com API client
  const client = createSpeedrunAPIClient();

  // Do something with it
  // TODO Simple test with Jak 1
  const game = await client.getGameInfo("xkdk4g1m");
  if (game !== undefined) {
    await insertNewGame(env.DB, game);
  }

  console.log("TODO updated speedrun records");

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

  console.log("TODO updated platforms");

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

  console.log("TODO updated regions");

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

  console.log("TODO updated level");

  return;
}

export async function updateLeaderboard(req: any, env: Env, ctx: ExecutionContext): Promise<any> {
  // Create a Speedrun.com API client
  const client = createSpeedrunAPIClient();

  // also a Simple test with Jak 1
  const leaderboard = await client.getLeaderboard("xkdk4g1m", "5dw8r40d");
  if (leaderboard !== undefined) {
    await insertLeaderboard(env.DB, leaderboard);
  }

  console.log("TODO updated leaderboard");

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
  console.log("Updated games/cats :o");

  return;
}