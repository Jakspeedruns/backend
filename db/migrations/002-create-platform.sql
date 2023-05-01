CREATE TABLE IF NOT EXISTS Platform(
        PlatformId      INTEGER PRIMARY KEY,
        SRId            TEXT UNIQUE,
        PlatformName    TEXT,
        ShortName       TEXT
        );
