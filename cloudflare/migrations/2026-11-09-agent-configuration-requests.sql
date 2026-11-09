-- Client-visible, read-only Retell configuration and approval-gated change requests.
CREATE TABLE IF NOT EXISTS avr_agent_change_requests (
 id TEXT PRIMARY KEY,
 customer_id TEXT NOT NULL REFERENCES avr_customers(id) ON DELETE CASCADE,
 agent_id TEXT,
 request_type TEXT NOT NULL,
 title TEXT NOT NULL,
 details TEXT NOT NULL,
 priority TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('normal','high','urgent')),
 status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','reviewing','quoted','approved','in_progress','completed','declined')),
 quote_summary TEXT,
 client_approved_at TEXT,
 admin_note TEXT,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS avr_agent_change_requests_customer_idx ON avr_agent_change_requests(customer_id,created_at DESC);
CREATE INDEX IF NOT EXISTS avr_agent_change_requests_status_idx ON avr_agent_change_requests(status,priority,created_at DESC);
