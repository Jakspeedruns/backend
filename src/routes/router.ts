import { Router } from "itty-router";
import { Env } from "..";
import { updateSpeedrunRecords } from "../crons/cron-handler";
import { ListOfRunners } from "./v1/runners";
import { SubmissionHandler } from "./discord/highscores";
import { ListHighscores } from "./v1/highscores";

const routerV2 = Router();

// TODO - these /cron/ paths are just to make it easier to test the crons locally
// they should be disabled if the worker is running in API mode

routerV2
  .post("/discord/submissions", SubmissionHandler)
  .get("/v1/highscores/:highscoreId", ListHighscores)
  .get("/cron/speedrunUpdate", updateSpeedrunRecords)
  .get("/v1/runners", ListOfRunners)
  .get("*", () => new Response("Not found", { status: 404 }));

export const handleRequest = (request: Request, env: Env, ctx: ExecutionContext) => routerV2.handle(request, env, ctx);
