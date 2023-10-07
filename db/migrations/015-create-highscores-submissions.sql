CREATE TABLE IF NOT EXISTS highscores_submissions(
  id INTEGER PRIMARY KEY autoincrement,
  highscore_id INTEGER REFERENCES highscores(id),
  player_name TEXT, -- once the submission is verified, we commit the player name
  submission_id TEXT UNIQUE,
  submission_status INTEGER, -- 0 = awaiting approval, 1 = approved, 2 = rejected
  score TEXT,
  video_link TEXT,
  rejection_reason TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS highscores_submissions_index_submission_id ON highscores_submissions (submission_id);
CREATE INDEX IF NOT EXISTS highscores_submissions_index_submission_status ON highscores_submissions (submission_status);
