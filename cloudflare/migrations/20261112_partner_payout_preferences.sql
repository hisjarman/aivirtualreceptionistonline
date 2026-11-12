-- Partner payout preferences (manual PayPal payouts at launch).
-- Apply to the existing avr-trust-lab D1 database before deploying trust-lab-worker.js.
ALTER TABLE affiliate_applications ADD COLUMN payout_method TEXT NOT NULL DEFAULT 'paypal' CHECK (payout_method IN ('paypal'));
ALTER TABLE affiliate_applications ADD COLUMN paypal_email TEXT;
ALTER TABLE affiliate_applications ADD COLUMN payout_updated_at TEXT;
