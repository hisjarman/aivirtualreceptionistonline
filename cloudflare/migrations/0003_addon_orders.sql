-- Customer-requested add-ons and agency fulfillment queue.
CREATE TABLE IF NOT EXISTS avr_addon_orders (
 id TEXT PRIMARY KEY,
 customer_id TEXT NOT NULL,
 addon_key TEXT NOT NULL,
 addon_name TEXT NOT NULL,
 billing_type TEXT NOT NULL CHECK(billing_type IN ('one_time','monthly','usage','quote')),
 status TEXT NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','approved','in_progress','active','declined','cancelled')),
 customer_note TEXT,
 admin_note TEXT,
 stripe_checkout_session_id TEXT,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS avr_addon_orders_customer_idx ON avr_addon_orders(customer_id,created_at DESC);
CREATE INDEX IF NOT EXISTS avr_addon_orders_status_idx ON avr_addon_orders(status,created_at DESC);
