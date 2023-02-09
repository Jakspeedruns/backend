CREATE TABLE IF NOT EXISTS Runner(
        RunnerId        INTEGER PRIMARY KEY,
        SRId            TEXT UNIQUE,
        Name            TEXT,
        Guest           INTEGER,
        DiscordUser     TEXT,
        Twitch          TEXT,
        RowCreatedDate  TEXT,
        Image           TEXT
        );
