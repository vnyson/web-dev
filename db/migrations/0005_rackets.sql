-- Rackets table for one-to-many association with players
CREATE TABLE IF NOT EXISTS rackets (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  year INTEGER,
  notes TEXT,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_rackets_player_id ON rackets(player_id);
CREATE INDEX IF NOT EXISTS idx_rackets_brand ON rackets(brand);
