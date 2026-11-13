-- Extend demo requests to retain the complete business discovery brief.
ALTER TABLE avr_demo_requests ADD COLUMN discovery_json TEXT;
ALTER TABLE avr_demo_requests ADD COLUMN discovery_complete INTEGER NOT NULL DEFAULT 0 CHECK(discovery_complete IN (0,1));
