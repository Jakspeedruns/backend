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
}
