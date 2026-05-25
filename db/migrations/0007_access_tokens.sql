-- Add access_token column to players table for token-based authentication
ALTER TABLE players ADD COLUMN access_token TEXT;

-- Create unique index on access_token for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_access_token ON players(access_token);
