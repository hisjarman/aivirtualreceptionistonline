# Deploy AI Virtual Receptionist to Cloudflare Containers

AI Virtual Receptionist is a full-stack Express + tRPC + Drizzle/MySQL application. Deploy it as a Cloudflare Worker front door backed by a Cloudflare Container. Do not deploy it as a static-only Pages site: Pages would omit the server, authentication, tRPC procedures, and database access.

## Prerequisites

- A Cloudflare account with Workers/Containers enabled.
- Wrangler authenticated to the intended account: `npx wrangler login` and `npx wrangler whoami`.
- Docker installed and running locally.
- A reachable production MySQL database.
- The existing OAuth identity provider configured for the production hostname. The current sign-in implementation depends on that provider; replacing it requires a separate authentication migration and testing.

## Configure secrets

Set production secrets through Wrangler or the Cloudflare dashboard. Never commit credentials:

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put PAYMENT_PROVIDER_SECRET
npx wrangler secret put PAYMENT_WEBHOOK_SECRET
npx wrangler secret put EMAIL_PROVIDER_API_KEY
```

Configure the existing authentication provider's required environment values separately, using the names expected by the current application. Do not rename or remove them until an alternative sign-in provider is implemented and verified.

## GitHub deployment

The repository may be connected to GitHub Actions using a scoped Cloudflare API token and the intended account ID. Review the workflow before enabling automatic production deployment. The workflow must not contain credentials in source control.

## First deployment

```bash
npx wrangler whoami
npx wrangler deploy --config wrangler.jsonc
```

The first request may take longer while the container provisions.

## Database

Run Drizzle migrations against the production database through a trusted release environment, not from a public request:

```bash
pnpm db:migrate
```

Confirm the target database and backup before applying migrations.

## Approval-first sales flow

Public pricing buttons lead to the discovery flow, not an instant checkout. The owner reviews the brief, prepares a demo, and shares a secure hosted payment link only after the customer approves the proposed service. Payment webhooks must be implemented, signature-verified, and tested before they can activate subscriptions.

## Required production checks

- `GET /api/health` returns an unauthenticated 2xx response.
- OAuth callback and secure session cookies work on the production hostname.
- Database reads and writes work from the Container network.
- Trust Lab submissions are saved as pending and only approved entries appear publicly.
- Consent records, backups, retention rules, and deletion workflows are verified.
- Hosted checkout is not activated until webhook signature verification and idempotency are configured.
- Configure a custom domain only after the deployment is healthy.

## Important limitations

A successful Worker deployment does not by itself complete production setup. The database, authentication provider, payment provider, email provider, domain, backups, privacy controls, and legal documents must each be configured and verified. Keep unconfigured features clearly labeled.
