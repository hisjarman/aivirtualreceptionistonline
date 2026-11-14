-- Link a converted demo prospect to a pending customer workspace.
ALTER TABLE avr_demo_requests ADD COLUMN customer_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS avr_demo_requests_customer_unique_idx
  ON avr_demo_requests(customer_id)
  WHERE customer_id IS NOT NULL;
