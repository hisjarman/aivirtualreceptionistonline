# AI Virtual Receptionist

AI Virtual Receptionist is a managed AI receptionist SaaS experience for service businesses. This repository contains the public marketing site, a save-and-resume onboarding flow, a customer workspace preview, and an administrator operations console. The product language intentionally separates **sample**, **proposed**, **approved**, **connected**, and **live** states so the site does not imply provider capabilities that have not been verified.

## Run locally

Use the initialized Manus Webdev environment and run:

```bash
pnpm dev
```

The app listens on `PORT` (3000 by default) and exposes `/api/health`. Use `pnpm check` for TypeScript diagnostics and `pnpm build` for the production bundle.

## Customer authentication

Public customer registration and login use Firebase email/password authentication with required email verification, password-reset email, ID-token refresh, and server-side Firebase token verification. Configure the Firebase web app and Cloudflare Worker values by following `FIREBASE_AUTH_SETUP.md`. The customer and administrator workspaces require a verified signed-in account; the admin console also requires the configured owner email.

## Product boundaries

The reseller AI receptionist platform is treated as a manual fulfillment dependency in the first version. Onboarding submissions are stored for administrator review. Customer configuration edits are proposed change requests; they are not pushed to a live agent without a verified API adapter. Appointment handling falls back to booking requests when a supported calendar connection is unavailable. The site never changes phone routing automatically and never collects third-party account passwords.

Public pricing now shows Launch at $39/month with 100 included AI call minutes and $0.35/minute overage, Growth at $79/month with 300 included minutes and $0.30/minute overage, and Pro at $129/month with 600 included minutes and $0.25/minute overage. One-time setup is normally $99 and may be waived for the first three customers. Telephony and third-party charges remain subject to confirmation before payment. Launch, Growth, Pro, and Custom are visible as starting points, but final contract terms belong in the administrator content and pricing settings.

The sales flow is approval-first rather than instant checkout: a prospect chooses a plan, submits `/demo`, the owner reviews the discovery brief and builds a personalized demo, the prospect approves the proposed direction, and only then does the owner send a secure hosted payment link. No card details are collected on the discovery form and a browser success page cannot activate service. Owner review status and payment-link references are managed at `/admin/demo-requests`.

## Configuration checklist before launch

1. Confirm the underlying reseller platform’s API availability, authentication, endpoints, webhook support, rate limits, data handling, and commercial permissions. Implement only verified adapter functions.
2. Configure a real payment provider using hosted/tokenized checkout. Add signature-verified, idempotent webhook handling before activating subscriptions from payment events.
3. Configure transactional email credentials and templates. Until configured, keep the development-safe fallback and do not claim that emails were sent.
4. Configure support email, service area, response-time language, analytics consent controls, and conversion events without sending personal information in event payloads.
5. Replace legal drafts with qualified-professional review for the countries in which the service operates, including call-recording, transcription, telecommunications, privacy, retention, deletion, and disclosure requirements.
6. Add secure object storage for permitted support attachments, with content validation, retention rules, authorization checks, and deletion workflows.
7. Set actual wholesale platform, telephony, and variable costs in the administrator-only unit economics screen. Review margin alerts before publishing final allowances and overage pricing.
8. Create the production database migration and backup/recovery procedure. The managed database is shared between development and publication, so treat schema/data changes as production-sensitive.

## Operational versus unconfigured integrations

Operational in this preview: public marketing routes, interactive fictional demo, pricing and industry content, searchable blog/help content, onboarding step navigation, customer/admin workspace navigation, proposed change request states, empty-state disclosures, and manual fulfillment UI.

The new approval-first discovery flow is also operational at the UI/API level: plan CTAs lead to a validated form, submissions persist as `demo_requests`, owner status changes are restricted to admin procedures, and payment-link references are stored only after the owner marks the demo approved.

Still requiring configuration or verified implementation: Manus OAuth deployment policy confirmation, persistent onboarding and ticket procedures, payment checkout and webhooks, transactional email delivery, provider API synchronization, calendar/CRM/SMS connections, call history/transcripts/recordings, secure attachments, consent-aware analytics, and counsel-reviewed legal documents.

## Data model direction

`drizzle/schema.ts` is the source of truth for the managed MySQL-compatible database. Extend the existing users table with organizations, memberships, locations, onboarding submissions, approved configurations, proposed changes, agents/provider references, deployment tasks, test scenarios/results, call records, tickets/replies, subscriptions, invoice/payment references, blog/help content, email notification records, consent records, and audit logs. Keep tenant ownership in every customer-facing record, add status enums and timestamps, and enforce access in server procedures rather than relying on hidden buttons.

## Deployment

The initialized Webdev project includes the container and health route defaults. Before publishing, run `pnpm check`, `pnpm build`, verify `GET /manus-routes.json` returns JSON rather than SPA HTML, confirm `/api/health` returns an unauthenticated 2xx response, and review the configured runtime/publish settings. Keep browser-facing URLs relative so embedded Preview and published routing remain compatible.
