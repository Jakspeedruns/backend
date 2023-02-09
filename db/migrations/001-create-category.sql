CREATE TABLE IF NOT EXISTS Category(
        CatId           INTEGER PRIMARY KEY,
        SRId            TEXT UNIQUE,
        CatName         TEXT,
        GameID          INTEGER,
        IL              INTEGER,
        RowCreatedDate  TEXT,
        Misc            INTEGER
        );
