# Client agent configuration and change requests

## What the feature does

- The client portal's **Receptionist** page shows a read-only, sanitized snapshot of each AI receptionist assigned to that client.
- It displays available non-secret configuration fields such as language, voice label, model, greeting, speech settings, knowledge-base count and configured tool names.
- It deliberately does not expose raw system prompts, API credentials, webhook URLs, private integration endpoints or the raw raw provider JSON.
- Clients can browse common improvements, see whether an optional improvement is available and request a quote and submit a change request.
- The request is also copied into the existing client support inbox so it is visible in the agency's normal support workflow.
- The agency console has an **Agent changes** tab to review requests, set status and write a client-visible quote.
- The client must explicitly approve a quote before the admin API will allow work to move to in-progress or completed.

## SMS business-information intake

When a client selects SMS, the portal collects the legal business name, business structure, physical address, website, authorized contact details, industry, tax-ID status, message use case, opt-in method and exact disclosure, opt-out and HELP handling, sample messages, links/phone-number flags, recipient countries, estimated monthly volume and number type. It deliberately does not collect a full EIN or SSN in the general form; request any required tax ID through a separately secured verification process. The intake is visible only in the authenticated agency admin console.

## D1 migration

Before deploying the updated Worker, apply:

`cloudflare/migrations/2026-11-09-agent-configuration-requests.sql`

to the existing `avr-trust-lab` D1 database. It creates `avr_agent_change_requests` and indexes. It is additive and does not alter existing customer, call, billing or Trust Lab tables.

## New API routes

Authenticated client:
- `GET /api/client/agent-configuration`
- `GET|POST /api/client/agent-change-requests`
- `POST /api/client/agent-change-requests/:id/approve`

Admin-only:
- `GET /api/admin/agent-change-requests`
- `PATCH /api/admin/agent-change-requests/:id`

All client reads and writes are scoped to the authenticated Clerk customer workspace. Admin routes call the existing server-side admin authorization. The browser never calls Retell directly.

## Quote and approval policy

A quote should explicitly itemize:
1. Incremental underlying provider operating cost, with the model/voice/add-on and estimated usage assumptions.
2. Any AVR recurring service fee.
3. Any one-time setup/configuration fee.
4. The resulting monthly total and whether taxes/carrier/provider charges are excluded.

Mark a request as **Quote ready** only after a written quote has been entered. The client sees an **Approve this quote** action. Only after that approval can the agency mark the request in progress or completed. The quote approval does not itself edit the Retell agent or charge a payment method; the agency still performs and tests the change and handles billing through the separately approved process.

## Internal provider-cost reference

The portal labels these as indicative published provider rates, not a guaranteed quote. the provider pricing page currently lists (USD):
- Voice infrastructure: $0.055/min.
- Standard platform voices and several listed TTS providers: $0.015/min.
- ElevenLabs Flash: $0.040/min; other ElevenLabs variants are listed at higher rates.
- Knowledge-base processing: +$0.005/min; first 10 knowledge bases free, additional knowledge bases $8/month each.
- Advanced denoising: +$0.005/min.
- Safety guardrails: +$0.005/min.
- PII removal: +$0.010/min.
- SMS: $0.01/message.
- Retell phone number: $2/month.
- Additional concurrency beyond the first 20: $8/concurrency/month.
- Verified phone number: $10/number/month.

Exact model, voice, telephony country, carrier, plan, account and usage can change the cost. Refresh the official pricing page and inspect the actual assigned agent before issuing any client quote:
https://www.retellai.com/pricing
