-- Run once against the existing avr-trust-lab D1 database before deploying the updated Worker.
CREATE TABLE IF NOT EXISTS avr_call_email_settings (
  customer_id TEXT PRIMARY KEY REFERENCES avr_customers(id) ON DELETE CASCADE,
  enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)),
  recipients_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
