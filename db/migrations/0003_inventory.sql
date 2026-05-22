-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  price REAL,
  quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_stock',
  notes TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
