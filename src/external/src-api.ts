import { time } from "console";
import { Game, Run, Runner, Platform, Region, Level } from "../storage/models";

function makeTimeString(date: Date) {
  let hours = date.getUTCHours().toString()
  ,minutes = date.getUTCMinutes().toString()
  ,seconds = date.getUTCSeconds().toString()
  ,milliseconds = date.getUTCMilliseconds().toString()
  ,timeString = '';

  if (hours != '0') {
    hours = hours + 'h ';
  } else {
    hours = '';
  }
  if (minutes != '0') {
    minutes = minutes + 'm ';
  } else {
    minutes = '';
  }
  if (seconds != '0') {
    seconds = seconds + 's';
  } else {
    seconds = '';
  }
  if (milliseconds != '0') {
    milliseconds = ' ' + milliseconds.padStart(3, '0') + 'ms';
  } else {
    milliseconds = '';
  }

  timeString = hours + minutes + seconds + milliseconds;

  return timeString
}

class SRCApi {
  async getGameInfo(gameId: string): Promise<Game | undefined> {
    // https://www.speedrun.com/api/v1/games/xkdk4g1m?embed=categories,platforms,regions,levels
    const resp = await fetch(`https://www.speedrun.com/api/v1/games/${gameId}?embed=categories,platforms,regions,levels`);
    if (resp.status !== 200) {
      return undefined;
    }
    const respData: any = await resp.json();
    let newGame: Game = {
      srcId: respData.data.id,
      gameName: respData.data.names.international,
      shortName: respData.data.abbreviation,
      categories: [],
      platforms: [],
      regions: [],
      levels: []
    };
    for (const category of respData.data.categories.data) {
      newGame.categories.push({
        SRId: category.id,
        CatName: category.name,
        IL: 0, // TODO - this requires a different lookup, tbh levels should probably be their own table for that reason
        Misc: category.miscellaneous === true ? 1 : 0,
      });
    }
    for (const plat of respData.data.platforms.data) {
      newGame.platforms.push({
        srcId: plat.id,
        platformName: plat.name,
        shortName: '', //not included in json, eg: ps2, bcps3
      });
    }
    for (const reg of respData.data.regions.data) {
      newGame.regions.push({
        srcId: reg.id,
        regionName: reg.name,
      });
    }
    for (const lev of respData.data.levels.data) {
      newGame.levels.push({
        srcId: lev.id,
        levelName: lev.name,
        gameId: gameId  //weird lol
      });
    }
    return newGame;
  }

  async getSeriesGames() {
    // this has all the info needed for a Game obj. 
    // but for now we just make a game SRID list to call getGameInfo on
    // https://www.speedrun.com/api/v1/series/d5nk0e49/games
    const resp = await fetch(`https://www.speedrun.com/api/v1/series/d5nk0e49/games`);
    if (resp.status !== 200) {
      return undefined;
    }
    const respData: any = await resp.json();
    let gameList = [];
    for (const game of respData.data) {
      gameList.push(game.id);
    }
    return gameList;
  }

  async getLeaderboard(gameId: string, categoryId: string) {
    // https://www.speedrun.com/api/v1/leaderboards/xkdk4g1m/category/5dw8r40d?embed=players
    const resp = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${gameId}/category/${categoryId}?embed=players`);
    if (resp.status !== 200) {
      return undefined;
    }
    const respData: any = await resp.json();
    //leaderboard
    let leaderboard: Run[] = [];
      for (const run of respData.data.runs) {
        //console.log(run.run.id)
        let arun = {
          SRId: run.run.id,
          gameId: run.run.game,
          levelId: run.run.level,
          categoryId: run.run.category,
          time: '',
          timeSecs: run.run.times.primary_t,
          platformId: run.run.system.platform,
          emulated: run.run.system.emulated * 1, //converts t/f to 1/0
          regionId: run.run.system.region,
          videoLink: '',
          comment: run.run.comment,
          submitDate: run.run.submitted,
          status: '',
          examiner: '',
          verifyDate: '',
          variables: JSON.stringify(run.run.values),
        };
        //set the things that can be null
        if (run.run.videos !== null) {
          arun.videoLink = run.run.videos.links[0].uri; //currently only first video
        }
        if (run.run.status !== null) {
          arun.status = run.run.status.status;
          arun.examiner = run.run.status.examiner;
          arun.verifyDate = run.run.status["verify-date"];
        }
        //time stuff
        let dateObj = new Date(arun.timeSecs * 1000)        
        arun.time = makeTimeString(dateObj);
        //add to list
        leaderboard.push(arun);
      }
    //this is one of the ways to fetch players
    //so we fetch players here
    let players: Runner[] = [];
      for (const player of respData.data.players.data) {
        let runner = {
          SRId: '',
          name: '',
          guest: 0,
          twitch: '',
          SRC: '',
        };
        if (player.rel === "guest") {
          //make a fake SRId for guests so that we have a unique field to OR REPLACE with
          runner.SRId = 'ID' + player.name; 
          runner.name = player.name;
          runner.guest = 1;
          runner.twitch = '';
          runner.SRC = '';
        } else if (player.rel === "user") {
          runner.SRId = player.id;
          runner.name = player.names.international;
          runner.guest = 0;
          if ( player.twitch !== null) {
            runner.twitch = player.twitch.uri;
          }
          runner.SRC = player.weblink;
        }
        //add to list
        players.push(runner);
      }

      return { leaderboard , players };
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
