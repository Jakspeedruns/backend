CREATE TABLE IF NOT EXISTS Category(
        id INTEGER PRIMARY KEY autoincrement,
        GameID INTEGER REFERENCES Games(id),
        SRId TEXT UNIQUE,
        CatName TEXT,
        IL INTEGER,
        Misc INTEGER,
        CatExt INTEGER,
        Diff INTEGER
);
