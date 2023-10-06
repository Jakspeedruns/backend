// Workers are serverless functions, so ensuring the database is in a valid state
// at runtime is wasteful and a bit of a synchronization headache
//
// So migrations have to be done as required before hand atleast to keep things simple
// for now

import utils from "util";
import { exec } from "child_process";
import fs from "fs";

export const execute = utils.promisify(exec);

const run = async () => {
	let files = fs.readdirSync("./db/migrations").sort();
	for (const file of files) {
		if (file.includes("temp")) {
			console.log("Skipping temp migration");
			continue;
		}
		await execute(`wrangler d1 execute jsr-backend-db --yes --local --file=./db/migrations/${file}`);
	}
};

run();
