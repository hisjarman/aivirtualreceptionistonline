-- Star69AI first-party partner attribution and commission ledger.
-- Apply to the existing avr-trust-lab D1 database after reviewing this PR.
ALTER TABLE affiliate_applications ADD COLUMN partner_code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS affiliate_applications_partner_code_uq ON affiliate_applications(partner_code) WHERE partner_code IS NOT NULL;
ALTER TABLE avr_customers ADD COLUMN affiliate_partner_id TEXT;
CREATE INDEX IF NOT EXISTS avr_customers_affiliate_partner_idx ON avr_customers(affiliate_partner_id);

CREATE TABLE IF NOT EXISTS partner_clicks (
  click_id TEXT PRIMARY KEY,
  affiliate_application_id TEXT NOT NULL,
  landing_path TEXT,
  referrer_domain TEXT,
  ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  expires_at TEXT NOT NULL,
  FOREIGN KEY (affiliate_application_id) REFERENCES affiliate_applications(id)
);
CREATE INDEX IF NOT EXISTS partner_clicks_partner_date_idx ON partner_clicks(affiliate_application_id, created_at DESC);
CREATE INDEX IF NOT EXISTS partner_clicks_ip_date_idx ON partner_clicks(ip_hash, created_at DESC);

CREATE TABLE IF NOT EXISTS partner_referrals (
  id TEXT PRIMARY KEY,
  affiliate_application_id TEXT NOT NULL,
  click_id TEXT,
  lead_email TEXT NOT NULL,
  lead_name TEXT,
  business_name TEXT,
  ip_hash TEXT,
  lead_status TEXT NOT NULL DEFAULT 'lead' CHECK (lead_status IN ('lead','customer','converted','unqualified')),
  customer_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  converted_at TEXT,
  attribution_expires_at TEXT NOT NULL,
  FOREIGN KEY (affiliate_application_id) REFERENCES affiliate_applications(id),
  FOREIGN KEY (click_id) REFERENCES partner_clicks(click_id),
  FOREIGN KEY (customer_id) REFERENCES avr_customers(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS partner_referrals_email_uq ON partner_referrals(lower(lead_email));
CREATE INDEX IF NOT EXISTS partner_referrals_partner_date_idx ON partner_referrals(affiliate_application_id, created_at DESC);
CREATE INDEX IF NOT EXISTS partner_referrals_customer_idx ON partner_referrals(customer_id);
CREATE INDEX IF NOT EXISTS partner_referrals_ip_date_idx ON partner_referrals(ip_hash, created_at DESC);

CREATE TABLE IF NOT EXISTS partner_commissions (
  id TEXT PRIMARY KEY,
  affiliate_application_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  stripe_subscription_id TEXT,
  invoice_amount_cents INTEGER NOT NULL,
  commission_rate REAL NOT NULL CHECK (commission_rate > 0 AND commission_rate <= 1),
  commission_amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','reversed')),
  invoice_paid_at TEXT NOT NULL,
  validation_until TEXT NOT NULL,
  paid_at TEXT,
  payout_reference TEXT,
  admin_note TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (affiliate_application_id) REFERENCES affiliate_applications(id),
  FOREIGN KEY (customer_id) REFERENCES avr_customers(id)
);
CREATE INDEX IF NOT EXISTS partner_commissions_partner_status_idx ON partner_commissions(affiliate_application_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS partner_commissions_customer_idx ON partner_commissions(customer_id);
