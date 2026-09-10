CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  public_message TEXT NOT NULL DEFAULT '',
  show_public_message INTEGER NOT NULL DEFAULT 0 CHECK (show_public_message IN (0, 1)),
  updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO site_settings (id, public_message, show_public_message, updated_at)
VALUES (1, '', 0, CURRENT_TIMESTAMP);