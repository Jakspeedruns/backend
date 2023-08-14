export interface Category {
  SRId: string;
  CatName: string;
  IL: number;
  Misc: number;
}

export interface Game {
  srcId: string;
  gameName: string;
  shortName: string;
  categories: Category[];
  platforms: Platform[];
  regions: Region[];
  levels: Level[];
}

export interface Run {
  SRId: string;
  gameId: string;
  levelId: string;
  categoryId: string;
  time: string;
  timeSecs: number;
  platformId: string;
  emulated: number;
  regionId: string;
  videoLink: string;
  comment: string;
  submitDate: string;
  status: string;
  examiner: string;
  verifyDate: string;
  variables: string;
}

export interface Runner {
  SRId: string;
  name: string;
  guest: number;
  twitch: string;
  SRC: string;
}

export interface Platform {
  srcId: string;
  platformName: string;
  shortName: string;
}

export interface Region {
  srcId: string;
  regionName: string;
}

//as in Original/2017
export interface Version {
  srcId: string;
  versionName: string;
}

export interface Level {
  srcId: string;
  levelName: string;
  gameId: string;
}
