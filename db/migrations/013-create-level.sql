CREATE TABLE IF NOT EXISTS Level(
        id           INTEGER PRIMARY KEY autoincrement,
        SRId         TEXT UNIQUE,
        LevelName    TEXT,
        GameId       INTEGER,
        GameSrcId    TEXT
        );
