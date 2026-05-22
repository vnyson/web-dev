-- Stringing jobs table
CREATE TABLE IF NOT EXISTS stringing (
  id TEXT PRIMARY KEY,
  player_id TEXT,
  racquet TEXT,
  string_mains TEXT,
  string_crosses TEXT,
  gauge_mains TEXT,
  gauge_crosses TEXT,
  tension_mains TEXT,
  tension_crosses TEXT,
  tension_unit TEXT,
  tension_unit_crosses TEXT,
  prestretch TEXT,
  prestretch_crosses TEXT,
  strung_at TEXT,
  notes TEXT,
  status TEXT,
  priority TEXT,
  created_at TEXT,
  player_own_string INTEGER,
  labour_cost REAL,
  material_cost REAL,
  charge_total REAL,
  string_tier TEXT,
  service_label TEXT,
  regrip INTEGER,
  logo_color TEXT,
  pickup_time TEXT,
  picked_up_at TEXT,
  stringer_name TEXT,
  knots INTEGER,
  player_name TEXT,
  FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_stringing_player_id ON stringing(player_id);
CREATE INDEX IF NOT EXISTS idx_stringing_status ON stringing(status);
CREATE INDEX IF NOT EXISTS idx_stringing_created_at ON stringing(created_at);
