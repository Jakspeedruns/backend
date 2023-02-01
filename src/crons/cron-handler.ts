import { Env } from "..";
import { createSpeedrunAPIClient } from "../external/src-api";
import { batchUpdateSpeedruns } from "../storage/d1";

// a difference
export async function updateSpeedrunRecords(
	req: any,
	env: Env,
	ctx: ExecutionContext
): Promise<any> {
	// Create a Speedrun.com API client
	const client = createSpeedrunAPIClient();

	// Do something with it
	let test = client.getLeaderboard("hello world");

	// Update the database
	await batchUpdateSpeedruns(env, "something");

	console.log("hello world");

	return;
}
