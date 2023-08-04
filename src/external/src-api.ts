import { Game } from "../storage/models";
import { Run } from "../storage/models";
import { Platform } from "../storage/models";
import { Region } from "../storage/models";
import { Level } from "../storage/models";

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

  async getLeaderboard(gameId: string, categoryId: string) {
    // https://www.speedrun.com/api/v1/leaderboards/xkdk4g1m/category/5dw8r40d
    const resp = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${gameId}/category/${categoryId}`);
    if (resp.status !== 200) {
      return undefined;
    }
    const respData: any = await resp.json();
    let leaderboard: Run[] = [];
      for (const run of respData.data.runs) {
        //console.log(run.run.id)
        let arun = {
          SRId: run.run.id,
          gameId: run.run.game,
          categoryId: run.run.category,
          time: run.run.times.primary,
          timeSecs: run.run.times.primary_t,
          platformId: run.run.system.platform,
          emulated: run.run.system.emulated * 1, //converts t/f to 1/0
          regionId: run.run.system.region,
          videoLink: '',          //should maybe use null for all these
          comment: run.run.comment,
          submitDate: run.run.submitted,
          status: '',
          examiner: '',
          verifyDate: '',
          variables: JSON.stringify(run.run.values),
        };
        if (run.run.videos !== null) {
          arun.videoLink = run.run.videos.links[0].uri; //currently only first video
        }
        if (run.run.status !== null) {
          arun.status = run.run.status.status;
          arun.examiner = run.run.status.examiner;
          arun.verifyDate = run.run.status["verify-date"];
        }
        leaderboard.push(arun);
      }
      return leaderboard;
  }

  async getPlatform(gameId: string) {
    // https://www.speedrun.com/api/v1/games/xkdk4g1m?embed=platforms
    const resp = await fetch(`https://www.speedrun.com/api/v1/games/${gameId}?embed=platforms`);
    if (resp.status !== 200) {
      return undefined;
    }
    const respData: any = await resp.json();
    let plats: Platform[] = [];
    for (const plat of respData.data.platforms.data) {
      plats.push({
        srcId: plat.id,
        platformName: plat.name,
        shortName: '', //not included in json, eg: ps2, bcps3
      });
    }
    return plats;
  }

  async getRegion(gameId: string) {
    // https://www.speedrun.com/api/v1/games/xkdk4g1m?embed=regions
    const resp = await fetch(`https://www.speedrun.com/api/v1/games/${gameId}?embed=regions`);
    if (resp.status !== 200) {
      return undefined;
    }
    const respData: any = await resp.json();
    let regs: Region[] = [];
    for (const reg of respData.data.regions.data) {
      regs.push({
        srcId: reg.id,
        regionName: reg.name,
      });
    }
    return regs;
  }

  async getLevel(gameId: string) {
    // https://www.speedrun.com/api/v1/games/xkdk4g1m?embed=levels
    const resp = await fetch(`https://www.speedrun.com/api/v1/games/${gameId}?embed=levels`);
    if (resp.status !== 200) {
      return undefined;
    }
    const respData: any = await resp.json();
    console.log( respData.data.levels.data )
    let levs: Level[] = [];
    for (const lev of respData.data.levels.data) {
      levs.push({
        srcId: lev.id,
        levelName: lev.name,
        gameId: gameId  //weird lol
      });
    }
    return levs;
  }


}



export function createSpeedrunAPIClient(): SRCApi {
  return new SRCApi();
}
