DROP TABLE IF EXISTS Category;
CREATE TABLE IF NOT EXISTS Category(
        CatId           INTEGER PRIMARY KEY,
        SRId            TEXT,
        CatName         TEXT,
        GameID          INTEGER,
        IL              INTEGER,
        RowCreatedDate  TEXT,
        Misc            INTEGER
        );
