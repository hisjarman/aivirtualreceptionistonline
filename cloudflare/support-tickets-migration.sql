-- Apply this once to the Cloudflare D1 database bound to the AVR platform Worker.
CREATE TABLE IF NOT EXISTS avr_support_tickets (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('change_request','technical_support','concern','billing','general')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal','high','urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','waiting_on_customer','resolved','closed')),
  admin_reply TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (customer_id) REFERENCES avr_customers(id)
);
CREATE INDEX IF NOT EXISTS idx_avr_support_tickets_customer_created
  ON avr_support_tickets(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_avr_support_tickets_status_priority
  ON avr_support_tickets(status, priority, created_at DESC);
