# AI Virtual Receptionist

Managed AI receptionist service for service businesses. The agency handles each client's receptionist setup, configuration, phone routing, monitoring, and ongoing support.

## Live repository structure

- Root-level HTML/CSS/JS — existing public marketing website (preserved).
- \`client/\` — customer portal (GitHub Pages static frontend).
- \`admin/\` — private agency admin console (GitHub Pages static frontend; API-enforced admin authorization).
- \`cloudflare/platform-worker.js\` — Cloudflare Workers API for Clerk authentication, customer workspaces, Stripe billing, Retell sync, assignments, calls and webhooks.
- \`cloudflare/schema.sql\` — platform D1 schema.
- Existing \`avr-trust-lab-api\` Worker and its Trust Lab/contact/newsletter/partner features remain separate and unchanged.

## Hosting architecture

- **GitHub Pages:** marketing site, customer portal at \`https://aivirtualreceptionist.online/client/\`, admin console at \`https://aivirtualreceptionist.online/admin/\`.
- **Cloudflare Workers:** API at \`https://avr-platform-api.hisjarman.workers.dev\`.
- **Cloudflare D1:** uses the existing \`avr-trust-lab\` database; new platform tables are prefixed \`avr_\` to avoid collisions with existing tables.
- **Clerk:** existing Clerk instance and verified-email login. The Worker verifies Clerk JWT signatures and performs a server-side user lookup. Admin access is separately restricted by \`ADMIN_EMAILS\`.
- **Stripe:** subscription Checkout, customer billing portal and signed webhook processing.
- **Retell:** agent/phone-number sync, phone assignment, signed call webhooks, call summaries/transcripts and usage records.

No Render service is required.

## Existing marketing form

The website discovery form continues to use:

\`\`\`text
https://formspree.io/f/mrppjqdb
\`\`\`

The form collects business information for follow-up; it does not itself activate a subscription.

## Customer and admin portal

Customer portal:
- Play available Retell call recordings, read transcripts and review AI-generated call summaries.
- Configure automatic call-summary emails to the business mailbox or up to 10 authorized team recipients (including a team distribution list).
- View assigned agent and phone numbers.
- View recent calls, summaries and call duration.
- View monthly minutes used versus included allowance.
- Edit business contact details.
- Start a subscription or open the Stripe customer portal to update payment details, view invoices, change plans or cancel (subject to Stripe portal configuration).

Admin console:
- Create customer workspaces and link them by verified Clerk email.
- View support inbox and client upgrade requests, with open/pending counts on the command-center overview.
- Open a per-client supervision workspace showing profile, service status, plan, assigned Retell agents and phone numbers, call-summary email settings, recent calls, support requests and upgrade requests.
- Edit client contact/profile details, service status, plan allowance, internal admin notes and automatic call-summary email recipients from the supervision workspace.
- Reply to support tickets and update ticket and upgrade fulfillment statuses; clients see support replies in their portal.
- Sync Retell voice agents and phone numbers and assign them to customer workspaces.
- View cross-customer calls and Stripe billing events.
- Admin authorization is enforced in the Worker, not merely hidden in the browser.

## Cloudflare Worker setup

Worker name: \`avr-platform-api\`

Worker URL: \`https://avr-platform-api.hisjarman.workers.dev\`

The Worker is already deployed with:
- D1 binding \`DB\` -> existing \`avr-trust-lab\` database.
- \`CLERK_ISSUER\` -> current Clerk development issuer.
- \`ADMIN_EMAILS\` -> current admin email.
- \`ALLOWED_ORIGINS\` -> the marketing site origins.

### Add these Worker secrets

In Cloudflare Dashboard -> Workers & Pages -> \`avr-platform-api\` -> Settings -> Variables and Secrets, add the following as **Secret** values:

| Secret name | Value |
|---|---|
| \`CLERK_SECRET_KEY\` | Secret key from the existing Clerk instance |
| \`STRIPE_SECRET_KEY\` | Stripe API secret key (start with test mode) |
| \`STRIPE_WEBHOOK_SECRET\` | Signing secret from the Stripe webhook endpoint |
| \`RETELL_API_KEY\` | Retell API key marked as the webhook key |

Never put these values in GitHub, HTML, browser JavaScript, a public Worker variable or a chat message.

### Add these Worker variables

Add the following as plain-text variables. Use the recurring monthly Price IDs created in Stripe for the exact existing plans:

| Variable | Plan | Existing price |
|---|---|---:|
| \`STRIPE_PRICE_STARTER\` | Starter | $149/month, 300 included voice minutes |
| \`STRIPE_PRICE_GROWTH\` | Growth | $249/month, 600 included voice minutes |
| \`STRIPE_PRICE_PRO\` | Pro | $399/month, 1,000 included voice minutes |

Do not change the published plan prices. The $99 one-time setup fee remains separately invoiced and is not added to subscription Checkout.

After adding or changing variables/secrets, redeploy or restart the Worker if the dashboard requests it.

## Stripe configuration

1. Start in Stripe test mode.
2. Create three recurring monthly Products/Prices: $149, $249 and $399 USD.
3. Copy each Stripe Price ID into the matching Worker variable above.
4. Configure the Stripe customer portal to allow payment-method updates, invoice history, subscription cancellation and plan changes.
5. Add a Stripe webhook endpoint:
   \`https://avr-platform-api.hisjarman.workers.dev/webhooks/stripe\`
6. Subscribe to at least:
   - \`checkout.session.completed\`
   - \`customer.subscription.created\`
   - \`customer.subscription.updated\`
   - \`customer.subscription.deleted\`
   - \`invoice.payment_failed\`
7. Copy the endpoint signing secret into \`STRIPE_WEBHOOK_SECRET\`.

Stripe webhooks—not the browser success redirect—update the local subscription status. Checkout will not work until the API secret, webhook secret and three Price IDs are configured.

## Retell configuration

1. Add \`RETELL_API_KEY\` using the Retell API key that has the **Webhook** badge.
2. Set the Retell account webhook URL to:
   \`https://avr-platform-api.hisjarman.workers.dev/webhooks/retell\`
3. Enable call events including \`call_started\`, \`call_ended\` and \`call_analyzed\`.
4. Run `cloudflare/migrations/2026-11-07-call-email-settings.sql` once against the existing D1 database before deploying the updated Worker.
5. Use **Sync Retell account** in the admin console to import agents and numbers.
5. Assign a customer, agent and phone number in the admin console.
6. Make a test call and confirm the call appears under the correct customer. Enable automatic call-summary emails in the client portal and verify delivery to configured recipients.

The Worker verifies the Retell \`x-retell-signature\` using the designated Retell webhook API key. Calls are deduplicated by call ID/event.

## API routes

Public:
- \`GET /health\`
- \`POST /webhooks/stripe\`
- \`POST /webhooks/retell\`

Authenticated customer:
- `GET|PUT /api/client/call-email-settings`
- \`GET /api/me\`
- \`GET /api/client/dashboard\`
- \`PATCH /api/client/profile\`
- \`POST /api/billing/checkout\`
- \`POST /api/billing/portal\`

Admin-only:
- \`GET /api/admin/overview\`
- \`GET|POST /api/admin/customers\`
- \`PATCH /api/admin/customers/:id\`
- \`POST /api/admin/retell/sync\`
- \`GET /api/admin/retell/resources\`
- \`POST /api/admin/assignments\`
- \`GET /api/admin/calls\`
- \`GET /api/admin/billing-events\`

## Important launch checks

- The Clerk publishable key in the static pages currently references the existing **development** Clerk instance. Replace it with the production Clerk publishable key when you switch Clerk to production, and update \`CLERK_ISSUER\` in the Worker to the matching production issuer. Keep the secret key server-side.
- Add \`https://aivirtualreceptionist.online\` and any active www origin to Clerk's allowed origins.
- Configure Stripe test mode first and complete a test purchase, portal update and cancellation before switching to live mode.
- Confirm the Retell webhook is set to the API key with the Webhook badge.
- Verify customer-to-customer data isolation and admin permissions with separate test accounts.
- Confirm recording consent, retention, deletion and applicable privacy/legal requirements before exposing recordings or transcripts or emailing call summaries. Customers must add only authorized recipients. Automatic emails are sent on Retell `call_analyzed` events and include call summary metadata, not the full transcript or audio.
- Usage is currently derived from Retell call duration events and rounded up to whole minutes for display. Confirm the exact billable-minute policy and any overage rates before charging overages.
- Admin plan allowance edits do not silently alter Stripe subscriptions. Use the Stripe customer portal or Stripe Dashboard for actual subscription changes.

## Local preview

The portal pages are static and can be previewed with any static HTTP server. The Worker is deployed separately on Cloudflare. The existing root marketing site and Formspree form are preserved.
