import { Env } from "..";
import { Game } from "./models";

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
  const gameInsert = db.prepare("INSERT INTO Games (SRId, GameName, ShortName) VALUES (?, ?, ?) RETURNING id;");
  const categoryInsert = db.prepare("INSERT INTO Category (GameID, SRId, CatName, IL, Misc) VALUES (?, ?, ?, ?, ?);");

  const lastRowId = await gameInsert.bind(game.srcId, game.gameName, game.shortName).first("id");

  // Iterate categories
  for (const category of game.categories) {
    console.log(category);
    batches.push(categoryInsert.bind(lastRowId, category.SRId, category.CatName, category.IL, category.Misc));
  }
  await db.batch(batches);
}
