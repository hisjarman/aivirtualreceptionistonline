-- Preserve every Retell webhook event independently of the latest call snapshot.
CREATE TABLE IF NOT EXISTS avr_retell_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  call_id TEXT NOT NULL,
  agent_id TEXT,
  customer_id TEXT,
  payload_json TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY(customer_id) REFERENCES avr_customers(id)
);
CREATE INDEX IF NOT EXISTS idx_avr_retell_events_received_at
  ON avr_retell_events(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_avr_retell_events_call_id
  ON avr_retell_events(call_id);
CREATE INDEX IF NOT EXISTS idx_avr_retell_events_customer_id
  ON avr_retell_events(customer_id, received_at DESC);
