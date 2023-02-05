DROP TABLE IF EXISTS Games;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Platform;
DROP TABLE IF EXISTS Region;
DROP TABLE IF EXISTS Version;

CREATE TABLE IF NOT EXISTS Games(
        GameId      INTEGER PRIMARY KEY,
        SRId        TEXT UNIQUE,
        GameName    TEXT,
        ShortName   TEXT
        );