CREATE TABLE IF NOT EXISTS Runner(
        id INTEGER PRIMARY KEY autoincrement,
        SRId TEXT UNIQUE,
        Name TEXT,
        Guest INTEGER,
        DiscordUser TEXT,
        Twitch TEXT,
        RowCreatedDate TEXT,
        Image TEXT
);
