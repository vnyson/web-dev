-- History table (customization/matching records)
CREATE TABLE IF NOT EXISTS history (
  id TEXT PRIMARY KEY,
  player_id TEXT,
  racquet TEXT,
  notes TEXT,
  current_weight REAL,
  target_weight REAL,
  current_balance REAL,
  target_balance REAL,
  mass_added REAL,
  mass_location REAL,
  sw_delta REAL,
  sw_result REAL,
  created_at TEXT,
  price_currency TEXT,
  price_overgrip REAL,
  price_specs_measurement REAL,
  price_specs_matching REAL,
  price_grip_replacement REAL,
  price_bumper_grommet REAL,
  price_other REAL,
  price_other_label TEXT,
  price_total REAL,
  player_name TEXT,
  FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_history_player_id ON history(player_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at);
