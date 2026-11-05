# AI Virtual Receptionist

Managed AI receptionist software for service businesses.

## Repository layout

- `client/` — React application and customer/admin workspaces.
- `server/` — Express API, authentication integration, and tRPC procedures.
- `drizzle/` — MySQL-compatible schema and migrations.
- `docs/` — Static marketing website published from the `main` branch's `/docs` folder.
- `cloudflare/` — Cloudflare Worker deployment source.

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

## Deployment notes

The full-stack application requires a Node-compatible server, configured MySQL database, and working authentication provider. The existing OAuth integration is part of the sign-in flow; do not remove or rename its production environment settings until a replacement provider has been implemented and tested.

The static marketing site in `docs/` is separate from the full-stack application. It calls the deployed backend for Trust Lab submissions. GitHub Pages alone cannot run the server or database.

## Trust Lab

The public Trust Lab page is `docs/trust-lab.html`. The backend exposes public submission and approved-wall endpoints. Submissions are stored as pending and require moderation before public display. The admin moderation route is part of the full-stack application.

## Production readiness

Before launch, verify authentication, database connectivity, migrations, CORS, backups, payment processing, transactional email, provider integrations, privacy disclosures, call recording/retention rules, and legal documents. Keep unconfigured capabilities clearly labeled; do not represent a planned integration as operational.
