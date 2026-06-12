-- Migration 0011: Extend rackets table with specs, demo/sale flags,
-- player racket setups, and demo sessions tracking.

-- SQLite does not support ALTER COLUMN, so we recreate the rackets table
-- with nullable player_id and additional columns.

-- 1. Create new rackets table with extended schema
CREATE TABLE IF NOT EXISTS rackets_new (
  id TEXT PRIMARY KEY,
  player_id TEXT,  -- nullable: NULL = shop-owned (demo/sale), set = player-owned
  brand TEXT,
  model TEXT,
  year INTEGER,
  notes TEXT,
  -- Spec fields
  head_size TEXT,
  length TEXT,
  static_weight TEXT,
  swing_weight TEXT,
  balance TEXT,
  stiffness TEXT,
  string_pattern TEXT,
  beam_width TEXT,
  grip_size TEXT,
  color TEXT,
  image_url TEXT,
  -- Demo/sale flags (default 0 = not available)
  available_for_demo INTEGER DEFAULT 0,
  available_for_sale INTEGER DEFAULT 0,
  sale_price REAL,
  sale_quantity INTEGER DEFAULT 0,
  demo_condition TEXT,
  -- Meta
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- 2. Copy existing data
INSERT INTO rackets_new (id, player_id, brand, model, year, notes, created_at, updated_at)
SELECT id, player_id, brand, model, year, notes, created_at, updated_at
FROM rackets;

-- 3. Drop old table and rename new
DROP TABLE IF EXISTS rackets;
ALTER TABLE rackets_new RENAME TO rackets;

-- 4. Recreate indexes
CREATE INDEX IF NOT EXISTS idx_rackets_player_id ON rackets(player_id);
CREATE INDEX IF NOT EXISTS idx_rackets_brand ON rackets(brand);
CREATE INDEX IF NOT EXISTS idx_rackets_demo ON rackets(available_for_demo);
CREATE INDEX IF NOT EXISTS idx_rackets_sale ON rackets(available_for_sale);

-- 5. Player racket setups (stock vs customized, per racket)
CREATE TABLE IF NOT EXISTS player_racket_setups (
  id TEXT PRIMARY KEY,
  racket_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  -- Stock specs (from manufacturer)
  stock_static_weight TEXT,
  stock_swing_weight TEXT,
  stock_balance TEXT,
  -- Customized specs (after modifications)
  custom_static_weight TEXT,
  custom_swing_weight TEXT,
  custom_balance TEXT,
  -- Modification details
  modification_notes TEXT,
  mass_added TEXT,
  mass_location TEXT,
  -- Meta
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (racket_id) REFERENCES rackets(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_player_racket_setups_racket_id ON player_racket_setups(racket_id);
CREATE INDEX IF NOT EXISTS idx_player_racket_setups_player_id ON player_racket_setups(player_id);

-- 6. Demo sessions (who demoed what racket)
CREATE TABLE IF NOT EXISTS demo_sessions (
  id TEXT PRIMARY KEY,
  racket_id TEXT NOT NULL,
  player_id TEXT,  -- nullable for walk-ins
  player_name TEXT,
  checked_out_at TEXT NOT NULL,
  returned_at TEXT,  -- NULL = still on demo
  notes TEXT,
  created_at TEXT,
  FOREIGN KEY (racket_id) REFERENCES rackets(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_demo_sessions_racket_id ON demo_sessions(racket_id);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_player_id ON demo_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_active ON demo_sessions(returned_at);