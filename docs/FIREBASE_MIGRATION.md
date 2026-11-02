# Firebase migration plan

## Status: preparation only — production is unchanged

This repository is currently a full-stack React/Vite + Express + tRPC application. Its server uses Drizzle ORM with a MySQL-compatible database, Manus OAuth/session verification, and Manus-backed S3 presigned uploads. It is not a static-only site. Pointing Firebase Hosting at the Vite build without moving the API and data/auth layers would break public demo intake, customer login, onboarding, admin review, and customer workspace operations.

This document defines a staged migration that preserves the existing tRPC contract while replacing the infrastructure. No production routes, database, or login provider are switched by this preparation commit.

## Target architecture

- **Firebase Hosting:** serve the existing Vite build from `dist/public`; retain the current React pages and relative API URLs.
- **Cloud Functions for Firebase, 2nd gen (Node.js 22):** host the Express/tRPC API behind Hosting rewrites. Keep `/api/health`, `/api/trpc`, OAuth replacement routes, and `/manus-routes.json` working.
- **Cloud Firestore:** replace MySQL/Drizzle persistence with tenant-scoped documents. Use the Admin SDK only in trusted server code for privileged writes.
- **Firebase Authentication:** replace Manus OAuth and the custom Manus session cookie with Firebase client sign-in and server-side Firebase ID-token verification. Use secure, httpOnly session cookies for browser sessions where appropriate.
- **Cloud Storage for Firebase:** replace Manus/S3 storage only for validated attachments and other explicitly permitted files. Apply tenant-scoped authorization and retention/deletion rules.
- **Secrets:** store Retell, Stripe, email-provider and other private credentials in Secret Manager / Functions secrets. Never expose them through Vite variables or browser config.

## Important billing note

Firebase Hosting, Authentication and Firestore have no-cost quotas. Cloud Functions deployment requires the Blaze (pay-as-you-go) plan. Firebase Storage bucket access also requires Blaze under current Firebase requirements. Blaze is not a fixed monthly subscription, but usage can incur charges. Set budget alerts and conservative Functions scaling/concurrency before production. Budget alerts notify; they are not a hard spending cap.

## Data migration map

Keep stable document IDs and tenant ownership during import. Do not delete the MySQL source until the imported data has been reconciled and a backup retained.

| Existing MySQL/Drizzle table | Firestore target |
| --- | --- |
| users | users/{uid} (Firebase Auth UID as canonical identity; preserve legacy openId as migration metadata) |
| organizations | organizations/{organizationId} |
| memberships | organizations/{organizationId}/members/{uid} and users/{uid}.organizationIds |
| locations | organizations/{organizationId}/locations/{locationId} |
| onboarding_submissions | organizations/{organizationId}/onboarding/{submissionId} |
| approved_configurations | organizations/{organizationId}/approvedConfigurations/{configurationId} |
| proposed_changes | organizations/{organizationId}/changeRequests/{requestId} |
| agents | organizations/{organizationId}/agents/{agentId} |
| deployment_tasks | organizations/{organizationId}/deploymentTasks/{taskId} |
| test_scenarios | organizations/{organizationId}/testScenarios/{scenarioId} |
| call_records | organizations/{organizationId}/callRecords/{callId} |
| support_tickets | organizations/{organizationId}/supportTickets/{ticketId} |
| support_replies | organizations/{organizationId}/supportTickets/{ticketId}/replies/{replyId} |
| subscriptions | organizations/{organizationId}/subscriptions/{subscriptionId} |
| invoices | organizations/{organizationId}/invoices/{invoiceId} |
| blog_posts | blogPosts/{slug} |
| help_articles | helpArticles/{articleId} |
| email_notifications | emailNotifications/{notificationId} |
| demo_requests | demoRequests/{requestId} |
| legal_consents | legalConsents/{consentId} (append-only) |
| consent_preferences | consentPreferences/{preferenceId} |
| audit_logs | auditLogs/{auditId} (append-only) |

Firestore has no SQL joins or relational constraints. Every query must enforce tenant ownership in trusted server code, and indexes must be added for the actual query patterns. Avoid storing unbounded arrays or growing transcripts in one document; use subcollections or Storage objects with retention controls.

## Migration phases

### Phase 1 — Prepare Firebase project
1. Create a Firebase project and register the web app.
2. Enable the required sign-in providers in Firebase Authentication.
3. Create Firestore in a region close to the expected customer base and select the location carefully; Firestore location cannot be changed after creation.
4. Enable the default Storage bucket only if file uploads are needed.
5. Link billing to Blaze for Functions/Storage, set budget alerts, and restrict who can deploy.
6. Record the Firebase project ID. Do not commit service-account keys.

### Phase 2 — Preserve the API on Functions
1. Refactor the Express bootstrap so the app can be exported without calling `listen()`.
2. Create a Functions v2 HTTPS entrypoint that wraps the exported Express app.
3. Add Hosting rewrites for API routes to the function and serve the built Vite assets from Hosting.
4. Preserve health checks, SPA fallback, route manifest, body-size limits, CORS/cookie behavior, and tRPC serialization.
5. Add emulator-based integration tests before switching DNS or the production deployment.

### Phase 3 — Authentication
1. Add Firebase client SDK initialization using the Firebase web app config (these values identify the project; they are not server secrets).
2. Replace `startLogin()`, Manus OAuth callback, Manus session cookies, and Manus session-storage fallback with Firebase Auth.
3. Verify ID tokens/session cookies in the Functions runtime using Firebase Admin SDK.
4. Migrate users by matching verified email only where an explicit, reviewed account-linking process exists; never silently merge accounts based on unverified email.
5. Bootstrap the first administrator through a trusted one-time script and assign a custom claim. Never grant admin from a browser field or email string alone.
6. Update logout, `auth.me`, protected procedures, admin procedures, and account deletion flows together.

### Phase 4 — Firestore persistence
1. Introduce typed repository functions for each collection and keep the existing tRPC procedure names/input/output shapes.
2. Move public demo intake first; validate input, rate-limit it, record contact consent and privacy-notice version, and write to Firestore from Functions only.
3. Move organizations/memberships and onboarding next, then approved configurations, changes, support, agents, billing references, content, consents, and audit logs.
4. Add tenant-isolation tests for every customer read/write and role tests for every admin procedure.
5. Keep legal consent and audit records append-only; restrict PII access and implement disclosed retention/export/deletion processes.
6. Import historical records from a verified SQL export using stable IDs; compare counts and sampled records before cutover.

### Phase 5 — Storage, integrations and release
1. Replace Manus/S3 storage helper with server-issued, short-lived upload/download authorization or signed URLs.
2. Validate MIME type, file size, extension, malware scanning requirements, ownership and retention.
3. Move secrets to Secret Manager. Do not store secrets in Firestore, client bundles, or Git.
4. Keep payment activation webhook-driven with signature verification and idempotency; a browser redirect must never activate a subscription.
5. Deploy to a preview channel, test all existing public/customer/admin flows, then switch production only after sign-off.
6. Retain a tested rollback path and the original database backup until the new system is verified.

## Security defaults

The accompanying Firestore and Storage rules deny direct client access by default. This is intentional: the migration must first implement and test the server-side authorization layer. Firebase Admin SDK calls from trusted Functions bypass Firestore/Storage Security Rules, so every server procedure must independently authenticate the caller and enforce tenant/role checks.

## Launch acceptance checklist

- [ ] Production Hosting serves every existing public route and assets.
- [ ] `/api/health` returns 2xx and `/api/trpc` procedures work through Hosting rewrites.
- [ ] Demo form persists to Firestore and records the exact consent document version.
- [ ] Firebase sign-in, logout, session expiry and account recovery work.
- [ ] Customer A cannot read or change Customer B's records (including guessed IDs).
- [ ] Non-admin users cannot call any admin procedure directly.
- [ ] Admin claim assignment is restricted to trusted deployment tooling.
- [ ] Onboarding save/resume/submit and customer workspace flows pass integration tests.
- [ ] Upload/download permissions and retention are tested, or upload features remain disabled.
- [ ] Payment webhooks are signature-verified and idempotent.
- [ ] Backups, restore test, retention, deletion and incident-response procedures are documented.
- [ ] Cost alerts and Functions scaling limits are configured.
- [ ] Build, typecheck, emulator tests and production smoke tests pass.

## Required project-specific input before deployment

- Firebase project ID and selected Firestore region.
- Which Firebase Auth providers to enable (email/password and Google are common starting points).
- Whether any production MySQL data already exists and must be imported.
- A verified owner identity for the first admin claim (assigned via trusted tooling, not supplied by a public signup form).
