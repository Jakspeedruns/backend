import { Env } from "../..";
import { Highscores, getHighscores } from "../../storage/d1";

interface HighscoreCacheEntry {
  highscores: Highscores[];
  timestamp: number;
}

const highscoreCache = new Map<string, HighscoreCacheEntry>();

export const ListHighscores = async (request: any, env: Env, ctx: ExecutionContext) => {
  // TODO - handle no highscore ID
  const highscoreId = request.params.highscoreId;

  let highscores;
  if (highscoreCache.has(highscoreId) && highscoreCache.get(highscoreId).timestamp > Date.now() - 60 * 60 * 1000) {
    highscores = highscoreCache.get(highscoreId).highscores;
  } else {
    highscores = await getHighscores(env.DB, highscoreId);
    highscoreCache.set(highscoreId, {
      highscores,
      timestamp: Date.now(),
    });
  }
  // TODO - finer grained CORS up above (middleware or something)
  const headers = {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  return new Response(JSON.stringify(highscores), { headers });
};
