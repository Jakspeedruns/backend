CREATE TABLE IF NOT EXISTS Platform(
        id      INTEGER PRIMARY KEY autoincrement,
        SRId            TEXT UNIQUE,
        PlatformName    TEXT,
        ShortName       TEXT,
        GameId          INTEGER
        );
