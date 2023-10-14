CREATE TABLE IF NOT EXISTS highscores_entries(
  id INTEGER PRIMARY KEY autoincrement,
  player_id INTEGER REFERENCES highscores_players(id) NOT NULL,
  highscore_id INTEGER REFERENCES highscores(id) NOT NULL,
  score REAL NOT NULL,
  video_link TEXT,
  timestamp TEXT, --- YYYY-MM-DD
  archived INTEGER
);
CREATE INDEX IF NOT EXISTS highscores_entries_index_highscore_id ON highscores_entries (highscore_id);
CREATE INDEX IF NOT EXISTS highscores_entries_index_archived ON highscores_entries (archived);
