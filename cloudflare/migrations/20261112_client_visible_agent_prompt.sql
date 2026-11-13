-- Dedicated, admin-published business prompt for each assigned client agent.
-- Apply to the existing platform D1 database before deploying the Worker.
ALTER TABLE avr_agents ADD COLUMN client_visible_prompt TEXT;
