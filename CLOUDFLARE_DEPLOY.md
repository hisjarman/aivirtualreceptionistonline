# Deploy AI Virtual Receptionist to Cloudflare Containers

AI Virtual Receptionist is a full-stack Express + tRPC + Drizzle/MySQL application. Deploy it as a Cloudflare Worker front door backed by a Cloudflare Container. Do not deploy it to Pages as a static-only site: Pages would omit the server, authentication, consent recording, tRPC procedures, and database access.

## Prerequisites

- A Cloudflare account with Workers/Containers enabled.
- Wrangler authenticated with the correct account: `npx wrangler login` followed by `npx wrangler whoami`.
- Docker installed and running locally. Cloudflare's Wrangler container flow builds and pushes the Docker image during `wrangler deploy`.
- A reachable production MySQL database and its connection string.
- Production authentication configuration and secrets. Manus OAuth values from the managed Webdev environment do not automatically transfer to a standalone Cloudflare account.

## Configure secrets

From the project root, set production secrets using Wrangler. Do not commit them:

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put MANUS_JWT_SECRET
npx wrangler secret put PAYMENT_PROVIDER_SECRET
npx wrangler secret put PAYMENT_WEBHOOK_SECRET
npx wrangler secret put EMAIL_PROVIDER_API_KEY
npx wrangler secret put RETELL_API_KEY
npx wrangler secret put FIREBASE_API_KEY
npx wrangler secret put FIREBASE_PROJECT_ID
npx wrangler secret put FIREBASE_AUTH_DOMAIN
npx wrangler secret put OWNER_EMAIL
```

The Worker explicitly forwards configured Worker secrets and runtime variables into the Container process. Firebase email/password authentication is the public customer login; configure it as described in `FIREBASE_AUTH_SETUP.md`. Legacy Manus OAuth remains only as a migration fallback for existing sessions. Add `RETELL_API_KEY` as a Worker secret; it is passed only to the server container and must never be exposed to the browser. See `RETELL_PORTAL_SETUP.md` for agent assignment and customer call-history setup.

## GitHub deployment

The repository includes `.github/workflows/deploy-cloudflare.yml`. After connecting the repository to GitHub, add these GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN` — a scoped token with Workers Scripts, Workers Routes, Containers/Cloudchamber, and account read permissions.
- `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account ID for the intended production account.

The workflow deploys the Worker and Container on pushes to `main` or from a manual workflow dispatch. It does not upload application secrets or activate billing automatically.

## First deployment

```bash
npx wrangler whoami
npx wrangler deploy --config wrangler.jsonc
```

Wrangler will build the Docker image from `Dockerfile`, push it to Cloudflare's managed registry, deploy the Worker and Container, and print the `workers.dev` URL. The first request may take longer while the container provisions.

## Database

Run the Drizzle migration against the production database through a trusted release environment, not from a public request:

```bash
DATABASE_URL='[production connection string]' pnpm drizzle-kit migrate
```

Confirm the consent migration is applied before accepting registrations, demo requests, or checkout orders.

## Approval-first sales flow

Public pricing buttons lead to `/demo`, not an instant checkout. A prospect submits the discovery form and explicitly agrees to the contact and privacy notices. The owner queue at `/admin/demo-requests` supports these stages:

`New → Under review → Needs information → Demo approved → Payment link sent → Converted`

The owner builds and reviews the demo, records the secure hosted payment link only after the prospect approves the proposed direction, and then sends that link through a configured transactional-email provider. The form never collects card details and does not activate a subscription. Payment webhooks must be implemented and verified before a payment link can activate service.

## Required production checks

- `GET /api/health` returns an unauthenticated 2xx response.
- `GET /manus-routes.json` returns JSON rather than SPA HTML.
- OAuth callback and secure session cookies work on the Cloudflare hostname.
- Consent rows are written with document versions and request context.
- Database access works from the Container network.
- Hosted checkout is not activated until webhook signature verification and idempotency are configured.
- Configure a custom domain only after the `workers.dev` deployment is healthy.

## Important limitations

Cloudflare Container deployment is not complete merely because the Worker deploys. The production database, authentication provider, payment provider, email provider, domain, backups, retention policy, and legal documents must each be configured and verified. Keep the app's honest `Unconfigured` states until those integrations are tested.


## Retell client portal

The `/app/calls` customer page reads calls from Retell for agent IDs assigned to the signed-in customer organization. The administrator assignment screen is `/admin/retell`. Configure `RETELL_API_KEY` as a Worker secret and follow `RETELL_PORTAL_SETUP.md`. Test with two separate customer accounts to verify tenant isolation before inviting real customers.


## Firebase customer authentication

The public customer login now uses Firebase email/password authentication, mandatory email verification, and password-reset emails. Configure the Firebase web app and Cloudflare Worker values by following `FIREBASE_AUTH_SETUP.md`. The Worker forwards the Firebase project settings and owner email into the application container. The application server validates Firebase ID tokens against Google's signing keys and requires `email_verified=true` before granting an authenticated customer session.
