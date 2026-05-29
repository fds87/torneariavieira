-- Mercado Livre integration tables

CREATE TABLE IF NOT EXISTS ml_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  ml_user_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ml_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  ml_item_id TEXT NOT NULL UNIQUE,
  ml_status TEXT NOT NULL DEFAULT 'active',
  ml_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
