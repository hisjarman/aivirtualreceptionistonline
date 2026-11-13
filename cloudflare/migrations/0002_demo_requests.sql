CREATE TABLE IF NOT EXISTS avr_demo_requests (
 id TEXT PRIMARY KEY, contact_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
 business_name TEXT NOT NULL, industry TEXT NOT NULL, details TEXT,
 lead_source TEXT NOT NULL DEFAULT 'Website demo request',
 status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','reviewing','approved','creating_demo','demo_created','demo_presented','converted','declined')),
 agent_id TEXT, llm_id TEXT, admin_notes TEXT,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS avr_demo_requests_status_created_idx ON avr_demo_requests(status,created_at DESC);
CREATE INDEX IF NOT EXISTS avr_demo_requests_email_created_idx ON avr_demo_requests(email,created_at DESC);
