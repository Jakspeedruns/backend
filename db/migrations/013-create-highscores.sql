CREATE TABLE IF NOT EXISTS highscores(
  id INTEGER PRIMARY KEY autoincrement,
  game_id TEXT, -- jak1/jak2/jak3/jakx/jaktlf/daxter
  highscore_name TEXT,
  requires_video INTEGER
);
CREATE INDEX IF NOT EXISTS highscores_index_game_id ON highscores (game_id);
