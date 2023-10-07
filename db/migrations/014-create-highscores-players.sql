CREATE TABLE IF NOT EXISTS highscores_players(
  id INTEGER PRIMARY KEY autoincrement,
  player_name TEXT UNIQUE
);
CREATE UNIQUE INDEX IF NOT EXISTS highscores_players_index_player_name ON highscores_players (player_name);
