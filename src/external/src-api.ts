import { time } from "console";
import { Game, Run, Runner, Platform, Region, Level, VarVal } from "../storage/models";

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
    minutes = minutes.padStart(2, '0') + 'm ';
  } else {
    minutes = '';
  }
  if (seconds != '0') {
    seconds = seconds.padStart(2, '0') + 's';
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
  //gets the info needed to set up a table for game, level, category, platform, region, and variables
  async getGameInfo(gameId: string): Promise<Game | undefined> {
    // https://www.speedrun.com/api/v1/games/xkdk4g1m?embed=categories,platforms,regions,levels,variables
    const resp = await fetch(`https://www.speedrun.com/api/v1/games/${gameId}?embed=categories,platforms,regions,levels,variables`);
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
      levels: [],
      varvals: []
    };
    for (const category of respData.data.categories.data) {
      let cat = {
        SRId: category.id,
        CatName: category.name,
        IL: 0, // TODO - this requires a different lookup, tbh levels should probably be their own table for that reason
        Misc: category.miscellaneous === true ? 1 : 0,
      };
      if ( category.type === 'per-level' ) {
        cat.IL = 1
      }
      newGame.categories.push(cat)
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
        gameSrcId: gameId
      });
    }
    for (const variable of respData.data.variables.data) {
      for (const [key, value] of Object.entries(variable.values.values)) {
        
        let varval = {
          VariableId: variable.id,
          VariableName: variable.name,
          CategorySrcId: variable.category,
          ValueId: '',
          ValueName: '',
          IsSubcategory: variable['is-subcategory'] * 1,
        };

        console.log( key + value )
        varval.ValueId = key;
        varval.ValueName = value.label; //this part probably needs some check on key/value
        console.log(varval.ValueId + varval.ValueName);

        newGame.varvals.push(varval);
      }

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

  //getting only a leaderboard is kinda meh. 
  async getLeaderboard(gameId: string, categoryId: string) {
    // https://www.speedrun.com/api/v1/leaderboards/xkdk4g1m/category/5dw8r40d?embed=players,variables
    const resp = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${gameId}/category/${categoryId}?embed=players,variables`);
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
          runnerId: 0,
          runnerSrcId: '',
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
          if (run.run.videos.links !== null) {
            arun.videoLink = run.run.videos.links[0].uri; //currently only first video
          }
        }
        if (run.run.status !== null) {
          arun.status = run.run.status.status;
          arun.examiner = run.run.status.examiner;
          arun.verifyDate = run.run.status["verify-date"];
        }
        console.log(run.run.players)
        console.log("--")
        for (const player of run.run.players) {
          if (player.rel === "guest") {
            arun.runnerSrcId = 'ID' + player.name; 
          } else if (player.rel === "user") {
            arun.runnerSrcId = player.id;
          }
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
      let playerset = new Set(players)  //making a set deduplicates
      players = [...playerset]      //the spread operator "..." spreads the values into the array 
      //fetch variables per leaderboard
      let varvals: VarVal[] = [];
      for (const variable of respData.data.variables.data) {
        for (const [key, value] of Object.entries(variable.values.values)) {
          
          let varval = {
            VariableId: variable.id,
            VariableName: variable.name,
            GameId: 0,
            CategorySrcId: variable.category,
            ValueId: '',
            ValueName: '',
            IsSubcategory: variable['is-subcategory'] * 1,
          };

          console.log( key + value )
          varval.ValueId = key;
          varval.ValueName = value.label; //this part probably needs some check on key/value
          console.log(varval.ValueId + varval.ValueName);

          varvals.push(varval);
        }

      }

      return { leaderboard , players , varvals };
  }

  //I think these are old since they're hanlded in fetchGameinfo
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
        gameSrcId: gameId  
      });
    }
    return levs;
  }

  async getRuns(gameId: string, offset: number = 0 ) {
    // https://www.speedrun.com/api/v1/runs?game=xkdk4g1m&max=200&offset=0
    // https://www.speedrun.com/api/v1/runs?game=xkdk4g1m&max=200&offset=3000
    // &embed=players probably get players here
    const resp = await fetch(`https://www.speedrun.com/api/v1/runs?game=${gameId}&max=200&offset=${offset}&embed=players`);
    if (resp.status !== 200) {
      return undefined;
    }
    const respData: any = await resp.json();
    //one page of runs
    let runlist: Run[] = [];
    let playerlist: Runner[] = [];
      for (const run of respData.data) {
        let arun = {
          SRId: run.id,
          gameId: run.game,
          levelId: run.level,
          categoryId: run.category,
          runnerId: 0,
          runnerSrcId: '',
          time: '',
          timeSecs: run.times.primary_t,
          platformId: run.system.platform,
          emulated: run.system.emulated * 1, //converts t/f to 1/0
          regionId: run.system.region,
          videoLink: '',
          comment: run.comment,
          submitDate: run.submitted,
          status: '',
          examiner: '',
          verifyDate: '',
          variables: JSON.stringify(run.values),
        };
        //set the things that can be null
        if (run.videos !== null) {
          if (run.videos.links !== undefined) { //needs undefined specifically
            arun.videoLink = run.videos.links[0].uri; //currently only first video
          }
        }
        if (run.status !== null) {
          arun.status = run.status.status;
          arun.examiner = run.status.examiner;
          arun.verifyDate = run.status["verify-date"];
        }
        //runnersrcid
        for (const player of run.players.data) {
          if (player.rel === "guest") {
            arun.runnerSrcId = 'ID' + player.name; 
          } else if (player.rel === "user") {
            arun.runnerSrcId = player.id;
          }
        }
        //time stuff
        let dateObj = new Date(arun.timeSecs * 1000)        
        arun.time = makeTimeString(dateObj);
        //add to list
        runlist.push(arun);
        //console.log(arun.SRId)
        //runner stuff
        let runner = {
              SRId: '',
              name: '',
              guest: 0,
              twitch: '',
              SRC: '',
            };
        for (const player of run.players.data) {
          if (player.rel === "guest") {
            //make a fake SRId for guests so that we have a unique field to OR IGNORE with
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
          playerlist.push(runner);
          //console.log("player: " + runner.name)
        }
      }
      console.log("offset:" + offset)
      //pagination
      //they give a link but lets build our own
      if (respData.pagination !== null) {
        let newOffset = respData.pagination.size + respData.pagination.offset
        for (const link of respData.pagination.links) {
          if (link.rel == "next") {
            console.log("-----------going deeper--------------")
            console.log("ts:" + Date.now())
            let [ rl, pl ] = await this.getRuns(gameId, newOffset);
            //append the results of our deeper call
            if (rl !== undefined) {
              runlist.push.apply(runlist, rl)
              console.log("-----------success--------------")
            }
            if (pl !== undefined) {
              runlist.push.apply(playerlist, pl)
              console.log("-----------success--------------")
            }
          }
        }
      }

    let playerset = new Set(playerlist)  //making a set deduplicates
    playerlist = [...playerset]      //the spread operator "..." spreads the values into the array 

    console.log("List length:" + runlist.length)
    return [ runlist, playerlist ];
  }

  //basically a copy of getRuns, api call sorted for recent
  async getRecentRuns(gameId: string) {
    // https://www.speedrun.com/api/v1/runs?game=xkdk4g1m&max=200&orderby=submitted&direction=desc
    // &embed=players probably get players here
    const resp = await fetch(`https://www.speedrun.com/api/v1/runs?game=${gameId}&max=200&embed=players&orderby=submitted&direction=desc`);
    if (resp.status !== 200) {
      return undefined;
    }
    const respData: any = await resp.json();
    //one page of runs
    let runlist: Run[] = [];
    let playerlist: Runner[] = [];
      for (const run of respData.data) {
        let arun = {
          SRId: run.id,
          gameId: run.game,
          levelId: run.level,
          categoryId: run.category,
          runnerId: 0,
          runnerSrcId: '',
          time: '',
          timeSecs: run.times.primary_t,
          platformId: run.system.platform,
          emulated: run.system.emulated * 1, //converts t/f to 1/0
          regionId: run.system.region,
          videoLink: '',
          comment: run.comment,
          submitDate: run.submitted,
          status: '',
          examiner: '',
          verifyDate: '',
          variables: JSON.stringify(run.values),
        };
        //set the things that can be null
        if (run.videos !== null) {
          if (run.videos.links !== undefined) { //needs undefined specifically
            arun.videoLink = run.videos.links[0].uri; //currently only first video
          }
        }
        if (run.status !== null) {
          arun.status = run.status.status;
          arun.examiner = run.status.examiner;
          arun.verifyDate = run.status["verify-date"];
        }
        //runnersrcid
        for (const player of run.players.data) {
          if (player.rel === "guest") {
            arun.runnerSrcId = 'ID' + player.name; 
          } else if (player.rel === "user") {
            arun.runnerSrcId = player.id;
          }
        }
        //time stuff
        let dateObj = new Date(arun.timeSecs * 1000)        
        arun.time = makeTimeString(dateObj);
        //add to list
        runlist.push(arun);
        //console.log(arun.SRId)
        //runner stuff
        let runner = {
              SRId: '',
              name: '',
              guest: 0,
              twitch: '',
              SRC: '',
            };
        for (const player of run.players.data) {
          if (player.rel === "guest") {
            //make a fake SRId for guests so that we have a unique field to OR IGNORE with
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
          playerlist.push(runner);
          //console.log("player: " + runner.name)
        }
      }

    let playerset = new Set(playerlist)  //making a set deduplicates
    playerlist = [...playerset]      //the spread operator "..." spreads the values into the array 
    
    return [ runlist, playerlist ];
  }

}

export function createSpeedrunAPIClient(): SRCApi {
  return new SRCApi();
}
