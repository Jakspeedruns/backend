CREATE TABLE IF NOT EXISTS Region(
        id INTEGER PRIMARY KEY autoincrement,
        SRId TEXT UNIQUE,
        RegionName TEXT
);
