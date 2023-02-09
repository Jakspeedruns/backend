CREATE TABLE IF NOT EXISTS Games(
        GameId      INTEGER PRIMARY KEY,
        SRId        TEXT UNIQUE,
        GameName    TEXT,
        ShortName   TEXT
        );
