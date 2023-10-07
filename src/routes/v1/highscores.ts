import { Env } from "../..";
import { getHighscores } from "../../storage/d1";

export const ListHighscores = async (request: any, env: Env, ctx: ExecutionContext) => {
  // TODO - handle no highscore ID
  const highscoreId = request.params.highscoreId;
  const highscores = await getHighscores(env.DB, highscoreId);
  // TODO - finer grained CORS up above (middleware or something)
  console.log(request.query);
  const headers = {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  return new Response(JSON.stringify(highscores), { headers });
};
