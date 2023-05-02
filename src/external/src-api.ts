import { Game } from "../storage/models";

class SRCApi {
  async getGameInfo(gameId: string): Promise<Game | undefined> {
    // https://www.speedrun.com/api/v1/games/xkdk4g1m?embed=categories
    const resp = await fetch(`https://www.speedrun.com/api/v1/games/${gameId}?embed=categories`);
    if (resp.status !== 200) {
      return undefined;
    }
    const respData: any = await resp.json();
    let newGame: Game = {
      srcId: respData.data.id,
      gameName: respData.data.names.international,
      shortName: respData.data.abbreviation,
      categories: [],
    };
    for (const category of respData.data.categories.data) {
      newGame.categories.push({
        SRId: category.id,
        CatName: category.name,
        IL: 0, // TODO - this requires a different lookup, tbh levels should probably be their own table for that reason
        Misc: category.miscellaneous === true ? 1 : 0,
      });
    }
    return newGame;
  }

  async getLeaderboard(gameId: string, categoryId: string) {}
}

export function createSpeedrunAPIClient(): SRCApi {
  return new SRCApi();
}
