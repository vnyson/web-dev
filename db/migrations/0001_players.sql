-- Players table
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  club TEXT,
  level TEXT,
  style TEXT,
  grip TEXT,
  string_pref TEXT,
  tension TEXT,
  racquet TEXT,
  notes TEXT,
  email TEXT,
  phone TEXT,
  restring_interval_weeks INTEGER,
  created_at TEXT,
  updated_at TEXT
);

-- Create index on player name for search
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
