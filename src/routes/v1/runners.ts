import { Env } from "../..";

export const ListOfRunners = (request: any, env: Env, ctx: ExecutionContext) => {
  const body = JSON.stringify({ hello: "world" });
  // TODO - CORS
  const headers = { "Content-type": "application/json" };
  return new Response(body, { headers });
};
