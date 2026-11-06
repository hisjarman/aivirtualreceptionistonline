# AI Virtual Receptionist

Managed AI receptionist software for service businesses.

## Repository layout

- `client/` — React application and customer/admin workspaces.
- `server/` — Express API, authentication integration, and tRPC procedures.
- `drizzle/` — MySQL-compatible schema and migrations.
- `cloudflare/` — Cloudflare Worker deployment source.
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

## Static website / GitHub Pages

The static marketing website now lives at the repository root. To publish it with GitHub Pages:

1. Open repository **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Choose branch **main** and folder **/ (root)**, then save.
4. GitHub will show the published URL in Pages settings.

The website uses relative asset paths and does not require a Node build step. The root `index.html` is the static-site entry point.

### Connect client onboarding submissions

GitHub Pages only hosts static files. It cannot run the Express/tRPC backend or securely store form submissions by itself. Before sending prospects to this page:

1. Create a Formspree form endpoint.
2. Open the root-level `app.js`.
3. Set `FORM_ENDPOINT` to the Formspree endpoint.
4. Commit the change and wait for Pages to redeploy.
5. Submit a test request and verify it arrives in the configured inbox.

Do not place passwords, payment data, private API keys, or third-party account credentials in this static site. The form asks for business discovery information only.

### Pricing and service notes

Setup fees, overages, telephony, and third-party usage must be confirmed in a written proposal before payment. The discovery form does not take payment or activate a service.

## Deployment notes

The full-stack application requires a Node-compatible server, configured MySQL database, and working authentication provider. The existing OAuth integration is part of the sign-in flow; do not remove or rename its production environment settings until a replacement provider has been implemented and tested.

GitHub Pages serves only the static website. It does not run the server or database.

## Trust Lab

The public Trust Lab page is `trust-lab.html`. The backend exposes public submission and approved-wall endpoints. Submissions are stored as pending and require moderation before public display. The admin moderation route is part of the full-stack application.

## Production readiness

Before launch, verify authentication, database connectivity, migrations, CORS, backups, payment processing, transactional email, provider integrations, privacy disclosures, call recording/retention rules, and legal documents. Keep unconfigured capabilities clearly labeled; do not represent a planned integration as operational.