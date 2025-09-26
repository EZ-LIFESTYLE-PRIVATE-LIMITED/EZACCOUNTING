-- Create migrations tracking table
-- This should always be the first migration

CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
