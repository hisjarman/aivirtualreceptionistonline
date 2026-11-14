# Dialzen-Inspired Upgrade Assessment

Date: 2026-11-08
Target branch: `feature/dialzen-inspired-upgrades`
Production status: no production code or database changes are made by this assessment.

## Decision

Keep AIVirtualReceptionist.online's existing architecture. Do not replace it with Dialzen.

- Frontend: GitHub Pages.
- API: Cloudflare Worker (`avr-platform-api`).
- Data: Cloudflare D1 (`avr-trust-lab`).
- Authentication: Clerk.
- Voice: Retell AI.
- Billing: Stripe.
- Email: Resend.

Dialzen is a useful MIT-licensed reference implementation, not a drop-in replacement. Its application is a Next.js/Node.js control plane with its own workspace, database, scheduler, provider adapters, billing and file-storage assumptions. Porting it wholesale would replace several working parts of this platform and require a different hosting model.

## What was inspected

### AIVirtualReceptionist.online

Inspected the current main-branch:
- `cloudflare/platform-worker.js`
- `cloudflare/schema.sql`
- `client/index.html`
- `client/client.js`
- `admin/admin.js`

Verified in source:
- Clerk JWT validation and verified-email lookup.
- Customer workspaces and admin-only customer supervision.
- Retell agent/number synchronization and admin assignment to customers.
- Call ingestion, transcript/recording/summary storage and call-summary email preferences.
- Stripe Checkout and subscription webhook handling.
- Existing plans: Starter 300 minutes, Growth 600 minutes, Pro 1,000 minutes.
- The client UI explicitly describes overage as an estimate and says automatic overage charging is not enabled. Do not market or implement as active until metering is completed and tested.
- The client receptionist view currently displays assigned agents and phone numbers; it is not a full agent builder.
- Current schema has customers, agents, numbers, calls, billing events, webhook events and admin audit, but no first-class knowledge-base, agent-tool, consent/DNC or usage-ledger tables.

### Dialzen

Inspected its README, application README, Retell adapter and MIT license:
- Next.js 16 / React 19 / Tailwind 4 application.
- Provider-adapter pattern for Retell, ElevenLabs and simulated testing.
- Agent builder, templates, prompt variables, voices/languages, knowledge bases, tools and post-call analysis.
- Retell number purchase/import/routing.
- Call detail, recordings, transcripts, summaries and analytics.
- Workspace roles/invites, plan limits and API keys.
- Consent records, DNC, opt-out detection, outbound calling controls, compliance audit log.
- Credit wallet with reserve/settle/release, credit packs and tenant P&L.
- Calendar integrations, signed webhooks, Google Sheets and call transfers.
- Background scheduler, file storage and reconciliation jobs.

Dialzen's README says its Retell and ElevenLabs adapters follow provider APIs and are tested with mocks; it asks users to report live-account issues. Therefore, do not treat those integrations as proven in production without real-account testing.

## Capability gap and recommended work

| Area | Current platform | Recommended action |
|---|---|---|
| Agent builder | Admin assigns existing Retell agents; customer sees assigned agents | Add controlled agent configuration, initially admin-managed |
| Knowledge base | No first-class KB UI/schema | Add per-agent URL and text knowledge sources first |
| Tools and appointments | No tool runtime | Add appointment/calendar integration only after agent/KB foundation |
| Usage billing | Subscription webhook and estimated usage; no proven automatic overage charge | Implement idempotent Stripe usage metering and reconciliation |
| Compliance | Basic platform controls; no complete customer consent/DNC center | Add explicit disclosure, consent records, DNC and retention controls before outbound calling |
| Analytics | Call list, summaries and monthly usage | Add per-agent trends and call outcomes after data quality is validated |
| Outbound campaigns | Not implemented | Defer; require compliance controls and kill switch first |

## Proposed delivery phases

### Phase 1 — Agent configuration and knowledge base (recommended first)

Keep Retell as the live voice engine. Build a platform-owned configuration layer in D1 and synchronize changes to Retell from the Worker.

Initial scope:
1. Admin-only create/edit/assign workflow for Retell agents.
2. Persist platform-owned agent settings without relying on opaque provider JSON as the source of truth.
3. Add per-agent knowledge sources for website URLs and plain text.
4. Validate ownership before every agent/knowledge-base operation.
5. Synchronize to Retell and persist provider IDs/status only after successful provider responses.
6. Display configuration and sync status in the admin client workspace.
7. Keep client-side agent editing disabled initially; expose a safe preview/read-only view.
8. Add a dry-run/test mode and clear sync errors.

Do not start with file uploads: D1 is not file storage. Add R2 or another private object store with signed uploads and access controls before supporting documents/audio/PDF uploads.

### Phase 2 — Metered overage billing

Implement only after confirming the Stripe account's meter/product/price configuration:
1. Record billable usage per completed call with a unique idempotency key.
2. Apply included-minute allowance before overage.
3. Send only excess usage to the Stripe meter.
4. Prevent duplicate charges from repeated Retell webhooks.
5. Reconcile internal usage against Stripe meter summaries.
6. Display estimated and finalized overage separately.

### Phase 3 — Compliance controls

Before outbound calls or campaigns:
1. AI disclosure and recording notice configuration.
2. Customer consent records with timestamps and source.
3. DNC list and opt-out handling.
4. Recording retention and deletion controls.
5. Append-only audit events and a global outbound kill switch.

### Phase 4 — Appointment and business integrations

Start with one calendar provider and a narrowly scoped booking tool. Add signed webhook tools and human call transfer only after the core agent configuration is stable.

## Security and deployment guardrails

- All code changes stay on this feature branch until reviewed.
- Never copy Dialzen's provider credentials, user data, secrets or deployment configuration.
- Keep customer data tenant-scoped in every D1 query.
- Keep Retell API keys, Clerk secrets, Stripe secrets and Resend keys in Worker secrets; never in GitHub Pages assets.
- Preserve existing Worker bindings when deploying.
- Add D1 migrations as separate versioned SQL files; do not edit production schema manually without a migration.
- GitHub Pages publishes the frontend; Worker code requires a separate Cloudflare deployment.
- Test Clerk authorization, cross-tenant access, duplicate webhooks, Retell API failures and Stripe idempotency before enabling new features.

## License note

Dialzen's repository declares the MIT License, copyright EpiFive (2026). If code is copied or adapted, retain the required copyright and license notice in the relevant distributed portions and inspect the licenses of any vendored dependencies separately. This assessment itself does not copy Dialzen source code.

## Recommendation

Proceed with Phase 1 on this branch, starting with an admin-managed agent configuration and URL/text knowledge base. Keep the current website, Clerk login, D1 customer records, Retell account and Cloudflare Worker. Do not migrate to Next.js or Render.
