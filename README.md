# AI Virtual Receptionist

Managed AI receptionist service for service businesses. The agency handles each client's receptionist setup, configuration, phone routing, monitoring, and ongoing support.

## Product model

- **Managed service:** the agency configures and maintains each client's AI receptionist.
- **Separate client workspaces:** client data, calls, usage, and support activity must be isolated by account.
- **Client portal:** clients should be able to review their own calls, leads, usage, billing, and support activity. Clients do not directly edit production agent prompts or provider settings.
- **Agency console:** agency administrators manage clients, Retell agents, phone numbers, assignments, configuration changes, and cross-client operations.
- **Provider integration:** Retell is the intended voice-agent provider. Provider features must not be shown as active until the API and webhook integration is configured and verified.

## Repository layout

- `client/` — React application and customer/admin workspaces.
- `server/` — Express API, authentication integration, and tRPC procedures.
- `drizzle/` — database schema and migrations.
- `cloudflare/` — Cloudflare Worker source, if present in the current checkout.
- Root-level HTML, CSS, JavaScript, and asset folders — static marketing website.

## Local development

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev
```

Useful checks:

```bash
pnpm check
pnpm test
pnpm build
```

Apply database migrations only after confirming the target database and backup:

```bash
pnpm db:migrate
```

Use the repository's package scripts as the source of truth if a command is unavailable in a particular branch.

## Static website / GitHub Pages

The static marketing website lives at the repository root. To publish it with GitHub Pages:

1. Open repository **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Choose branch **main** and folder **/ (root)**, then save.
4. GitHub will show the published URL in Pages settings.

The website's root `index.html` is the static-site entry point. GitHub Pages serves static files only; it does not run the Express/tRPC backend or database.

### Discovery form (Formspree)

The discovery form should submit to this Formspree endpoint:

```text
https://formspree.io/f/mrppjqdb
```

The form integration is configured in the root-level `app.js`. Keep the endpoint in sync with the value above, then test the form from the published website and confirm that a submission reaches the Formspree inbox. Do not put passwords, payment details, private API keys, or provider credentials in the form or browser code.

The discovery form collects business information for follow-up; it does not itself activate service or process payment.

## Retell integration and live-call data

Retell credentials must remain server-side. Never expose a Retell API key in browser code, public environment variables, GitHub commits, or client-visible responses.

The intended integration flow is:

1. Store the Retell API key as a secret in the Cloudflare Worker (for example, `RETELL_API_KEY`).
2. Receive Retell events through a Worker webhook endpoint.
3. Verify webhook authenticity, reject invalid requests, and deduplicate events before processing.
4. Forward verified events to the application backend over an authenticated server-to-server connection.
5. Persist call events and transcripts, then associate each call with the correct client using the agency's agent/phone-number assignment records.
6. Enforce authorization on the backend: agency administrators can access authorized cross-client views; each client can access only its own calls and records.

The expected event lifecycle includes call start, transcript updates, call end, and post-call analysis. The application should treat provider webhooks as the source of event updates and reconcile completed calls with Retell's call-detail API when needed.

This section describes the intended integration contract; it is not proof that the Worker, webhook, API credentials, or live-call dashboard are already deployed. Mark provider-backed features as unavailable until an end-to-end test confirms them.

## Authentication and deployment

The full-stack application requires a Node-compatible server, a configured database, and a working authentication provider. Preserve the authentication provider's existing production environment settings unless a replacement has been implemented and tested. Never commit authentication secrets.

GitHub Pages hosts only the static marketing site. The full-stack portal requires its own server deployment, database connection, environment variables, and secure authentication configuration.

## Trust Lab

The public Trust Lab page is `trust-lab.html`. Public submissions should remain pending until moderated. Only authorized agency administrators should be able to approve or publish submissions.

## Pricing and service notes

Confirm setup fees, included minutes, overages, telephony charges, SMS charges, and third-party usage in the current written offer before accepting payment. Keep website pricing, checkout configuration, and service terms consistent.

## Production readiness checklist

Before launch or enabling a provider-backed feature, verify:

- Authentication, role permissions, and client-to-client data isolation.
- Database connectivity, migrations, backups, and restore procedures.
- CORS, server-side secrets, webhook signature verification, and event deduplication.
- Retell agent and phone-number assignment, call lifecycle events, transcripts, recordings, and usage reconciliation.
- Client dashboard visibility is limited to that client's records.
- Agency-only controls are not exposed to client accounts.
- Payment processing, transactional email, support workflows, and privacy disclosures.
- Call recording consent, retention, deletion, and applicable legal requirements.
- All public claims accurately distinguish live features from planned or unconfigured integrations.
