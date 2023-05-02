import { Env } from "..";
import { createSpeedrunAPIClient } from "../external/src-api";
import { insertNewGame } from "../storage/d1";

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
