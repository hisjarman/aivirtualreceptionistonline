-- AIVirtualReceptionist platform tables; run against existing avr-trust-lab D1.
CREATE TABLE IF NOT EXISTS avr_customers (id TEXT PRIMARY KEY, business_name TEXT NOT NULL, contact_name TEXT, email TEXT NOT NULL, phone TEXT, clerk_user_id TEXT UNIQUE, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','suspended','closed')), plan_key TEXT CHECK(plan_key IN ('starter','growth','pro')), stripe_customer_id TEXT UNIQUE, stripe_subscription_id TEXT, subscription_status TEXT, current_period_end TEXT, included_minutes INTEGER NOT NULL DEFAULT 0, admin_notes TEXT, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
CREATE TABLE IF NOT EXISTS avr_agents (agent_id TEXT PRIMARY KEY, agent_name TEXT, customer_id TEXT, voice_id TEXT, language TEXT, status TEXT NOT NULL DEFAULT 'active', raw_json TEXT, synced_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
CREATE TABLE IF NOT EXISTS avr_numbers (phone_number TEXT PRIMARY KEY, nickname TEXT, customer_id TEXT, agent_id TEXT, phone_number_type TEXT, raw_json TEXT, synced_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
CREATE TABLE IF NOT EXISTS avr_calls (call_id TEXT PRIMARY KEY, customer_id TEXT, agent_id TEXT, phone_number TEXT, from_number TEXT, to_number TEXT, direction TEXT, call_status TEXT, duration_ms INTEGER, start_timestamp INTEGER, end_timestamp INTEGER, transcript TEXT, recording_url TEXT, call_summary TEXT, user_sentiment TEXT, disconnection_reason TEXT, raw_json TEXT, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
CREATE INDEX IF NOT EXISTS avr_calls_customer_date_idx ON avr_calls(customer_id,start_timestamp DESC);
CREATE TABLE IF NOT EXISTS avr_billing_events (event_id TEXT PRIMARY KEY, customer_id TEXT, event_type TEXT NOT NULL, event_created INTEGER, payload_json TEXT, processed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
CREATE TABLE IF NOT EXISTS avr_webhook_events (provider TEXT NOT NULL, event_id TEXT NOT NULL, received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), PRIMARY KEY(provider,event_id));
CREATE TABLE IF NOT EXISTS avr_admin_audit (id TEXT PRIMARY KEY, admin_user_id TEXT NOT NULL, action TEXT NOT NULL, customer_id TEXT, detail_json TEXT, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
-- Run once against the existing avr-trust-lab D1 database before deploying the updated Worker.
CREATE TABLE IF NOT EXISTS avr_call_email_settings (
  customer_id TEXT PRIMARY KEY REFERENCES avr_customers(id) ON DELETE CASCADE,
  enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)),
  recipients_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

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
