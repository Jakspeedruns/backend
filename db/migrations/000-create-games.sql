CREATE TABLE IF NOT EXISTS Games(
        id INTEGER PRIMARY KEY autoincrement,
        SRId TEXT UNIQUE,
        GameName TEXT,
        ShortName TEXT
);
