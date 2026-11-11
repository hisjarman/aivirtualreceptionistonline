# Star69AI — Project Context Handoff

Last consolidated: 2026-11-11

Read this file before making substantial changes. It records current project decisions, technical architecture, development rules and known follow-ups. Verify all implementation claims against the current repository and live provider configuration.

## Brand and business

- **Brand:** Star69AI
- **Canonical website:** https://star69ai.com
- **GitHub repository:** https://github.com/hisjarman/star69ai
- **Founder:** Solomon Jarman
- **Business/operator disclosure:** SIMIAPP CLOUD
- **General email:** hello@star69ai.com
- **Support/reply-to:** support@star69ai.com
- **Hosting:** GitHub Pages for static pages; Cloudflare Workers and D1 for backend services.
- The previous project branding has been retired. Use Star69AI branding in current user-facing materials, page titles, footers, email templates, repository descriptions and documentation. Do not reintroduce the previous domain as the current website.

## Product positioning

Star69AI is a managed, done-for-you AI receptionist service, not a self-service software platform. The agency builds, configures, customizes, tests and maintains each client's receptionist and phone workflow.

Target customers include roofing, plumbing, HVAC, general contractors, cleaning, automotive services and real estate businesses.

Depending on customer configuration and third-party provider capabilities, the service may answer calls, respond to approved FAQs, capture and qualify leads, assist with appointment requests, route/escalate calls, and provide call summaries and call activity.

## Visual and UX direction

- Premium, modern interface with a dark space-inspired visual language where appropriate.
- Lime green is the preferred brand accent; sky blue is a supporting accent.
- Prioritize readable contrast, calm spacing, accessible focus states and responsive layouts.
- Keep navigation and Client Login visible and usable on desktop and mobile.
- Do not put onboarding promotions in the top banner if they push navigation or login off-screen.
- Homepage hero direction: Earth-at-night / illuminated global AI network artwork and receptionist model, with speech bubble visually aligned near the model's mouth.
- Use supplied assets from `assets/` after verifying exact filenames and current usage.
- Dashboard preview figures must be identified as illustrative; never imply sample data is real customer performance.
- Retell-wide metrics must be attributed to Retell and distinguished from Star69AI customer results.

## Public website and content

GitHub Pages publishes the static site from the repository root using the root `CNAME` file. Do not move the site back into a `docs/` publishing folder.

The site includes marketing pages, pricing, FAQs, demos, industries, insights, the weekly business-comedy series, partner pages, the Trust Lab and the Receptionist Architect challenge. Preserve existing SEO metadata, canonical URLs, navigation, footer, forms and responsive behavior when editing shared components.

### Demo/discovery form

The public discovery form must keep using Formspree:

```text
https://formspree.io/f/mrppjqdb
```

The form is for demo/discovery follow-up only; it does not create an account or activate a subscription. The current form submission implementation was changed from JavaScript cross-origin `fetch()` to a native browser POST to avoid the mobile browser “Failed to fetch” error. The Formspree endpoint and live delivery still require an end-to-end test after the website update is published.

## Published pricing

| Plan | Monthly price | Included voice minutes | Advertised overage |
|---|---:|---:|---:|
| Starter | $149 | 300 | $0.49/minute |
| Growth | $249 | 600 | $0.39/minute |
| Pro | $399 | 1,000 | $0.29/minute |

- One-time setup fee: $99, invoiced separately.
- Do not silently change these published values in one page or portal surface without synchronizing all pricing displays and legal summaries.
- Automatic Stripe metered overage billing is not to be claimed as implemented until usage meter reporting, reconciliation, rounding rules and end-to-end billing tests are complete.
- Usage estimates must be labeled as estimates until actual billing is implemented and verified.
- Any annual offer or setup-fee waiver must match the active checkout and written offer terms.

## Technical architecture

- **GitHub Pages:** public website, client portal at `/client/`, admin console at `/admin/`.
- **Cloudflare Workers:** server-side API and integrations.
- **Cloudflare D1:** application data; existing D1 binding and table prefixes must be preserved.
- **Clerk:** authentication. Worker-side JWT verification and authorization are required; hiding controls in browser code is not sufficient.
- **Stripe:** subscription checkout, customer billing portal and signed webhook processing.
- **Retell AI:** voice agents, phone numbers, assignments, call webhooks and call analysis.
- **Formspree:** public demo/discovery form.
- **Resend:** transactional email.
- The platform API Worker has been documented as `avr-platform-api` at `https://avr-platform-api.hisjarman.workers.dev`. Verify the deployed Worker URL and routes before changing configuration.
- The separate Trust Lab Worker and its contact, newsletter and partner workflows must remain independent and operational.
- Do not use Render. Do not restore obsolete Manus/CallPilot deployment paths.

## Repository map

- Root HTML/CSS/JS: public marketing site.
- `client/`: customer portal frontend.
- `admin/`: agency admin frontend.
- `cloudflare/platform-worker.js`: platform API.
- `cloudflare/trust-lab-worker.js`: Trust Lab/contact/newsletter/partner API.
- `cloudflare/schema.sql` and `cloudflare/migrations/`: database schema and migrations.
- `docs/`: implementation notes.
- `assets/`: brand, illustration and media assets.

## Email and domain configuration notes

- Resend domain `star69ai.com` has been reported verified.
- Production sender is `Star69AI <hello@star69ai.com>`.
- Support/reply-to address is `support@star69ai.com`.
- Branded email templates use the Star69AI logo and footer.
- Cloudflare Worker secrets must be managed in Cloudflare, never committed here.
- Never print or expose API keys, Clerk secrets, Stripe secrets, webhook signing secrets or customer information in source code or documentation.

## Implementation history verified in this conversation

- PR #70 added Star69AI branding to outgoing email templates and was merged to `main`. Platform and Trust Lab Workers were deployed after that change; deployment success was confirmed, but do not infer endpoint health from deployment status alone.
- PR #71 changed the demo request form from JavaScript `fetch()` to native Formspree POST and was merged to `main` at commit `afe041a6bd39249e43de261618ca247ac41f7b5f`.
- The actual Formspree submission and return confirmation have not yet been verified with a real end-to-end request.
- The prior call-details email attempt showed a generic portal error even though an earlier Resend email was delivered. That earlier delivery predated the new email-branding deployment and does not prove the current manual email path is healthy. If revisiting, add safe diagnostic error codes without exposing provider secrets or private details.

## Security and production-readiness checks

Before onboarding customers, verify:

1. Clerk frontend publishable key and Worker issuer belong to the same production Clerk instance.
2. Cloudflare Worker bindings, secrets and allowed origins are configured for the production domain.
3. Admin authorization is enforced in the Worker and customer records are isolated by tenant.
4. Stripe Price IDs, checkout, portal, signed webhooks, cancellation and payment-failure handling work in test mode before live mode.
5. Retell webhook signatures are validated, events are deduplicated, and calls are associated with the correct client.
6. Required D1 migrations are applied. A static website deployment does not apply SQL migrations or deploy Worker code.
7. Recording consent, access control, retention, deletion and applicable privacy/legal requirements are addressed.
8. Email delivery is tested for automatic call summaries, manually requested call details, support notifications and Trust Lab flows.
9. The Formspree discovery form is tested with a real submission and confirmed receipt.
10. Overage rates are not automatically charged until Stripe metering, rounding, reconciliation and billing tests are complete.

Known prior issue to recheck against current source: a portal request reported `D1_ERROR: no such table: avr_addon_orders`. Inspect Worker queries, frontend calls and migrations before adding or changing a table.

## Development rules

- Always inspect the root README, this handoff, current branch, related source files and relevant migrations before making substantial changes.
- Work in a dedicated branch. Do not silently commit feature work to `main`.
- Inspect diffs and test changes before proposing a merge. Never merge to `main` without the user's explicit approval.
- Keep commits focused and descriptive; report branch, PR and commit details.
- Preserve the GitHub Pages root layout, CNAME, navigation, Client Login, SEO, Formspree, Trust Lab, partner workflows and existing working functionality.
- Use GitHub Pages for static hosting and Cloudflare Workers/D1 for backend needs. No Render.
- Never commit secrets or customer data.
- Do not claim a feature is deployed, healthy, billable or production-ready unless the relevant behavior has been verified.

## Open launch work

- Verify the Formspree native POST with an actual demo request and confirm receipt.
- Verify current Clerk production configuration.
- Run customer/admin authorization and tenant-isolation tests.
- Verify Stripe checkout, customer portal, webhooks and cancellation; complete the overage-metering implementation before enabling automatic overage charges.
- Verify Retell agent/number sync, assignments, call events, recordings and analysis.
- Verify call email delivery after the Star69AI template deployment.
- Reconcile the prior `avr_addon_orders` missing-table report against current schema and Worker code.
- Update this handoff whenever brand, architecture, implementation or launch status changes.


## Star69AI logo delivery update — 2026-11-11

- Canonical supplied logo source: `assets/star69ai-logo.png` (approximately 1.95 MB in the repository).
- The shared platform email wrapper now places the supplied logo in the email footer using the PNG-compatible endpoint `https://star69ai-concierge.hisjarman.workers.dev/brand-logo.png`. Both automatic call-summary emails and manually requested call-details emails pass through this wrapper.
- The Concierge Worker serves `/brand-logo.png` (500px target, PNG for email-client compatibility) and `/brand-logo.webp` (440px target, WebP for browser display) from the canonical GitHub logo source using Cloudflare image resizing. Responses are cached for reuse; a source-fetch fallback is retained if transformation is unavailable.
- Concierge header now uses the horizontal Star69AI logo, with a compact mobile width. The Concierge browser icon uses `assets/favicon.svg`.
- Deployment to Cloudflare Worker `star69ai-concierge` completed on 2026-11-11 (deployment ID `4e03ab9755f74934877b8a7e36d173c2`).
- Verification limitation: the tool environment blocks direct requests to this Worker hostname, so the optimized response size and visual rendering could not be independently confirmed here. Verify `/brand-logo.png` and `/brand-logo.webp` in a browser and check the `X-Logo-Transform` response header. Do not claim an exact byte reduction until measured.

- The shared email-wrapper change was deployed to `avr-platform-api` on 2026-11-11 (deployment ID `7cc3259dfa0f4b6783e6889cf3ecaa78`). Post-deployment settings inspection confirmed the existing `CLERK_SECRET_KEY`, `RESEND_API_KEY`, and `RETELL_API_KEY` secret bindings plus the D1 binding remained present.
- GitHub implementation branch: `branding/optimized-logo-email-concierge`; PR #73: https://github.com/hisjarman/star69ai/pull/73 (merged to main on 2026-11-11; squash commit `afa4fbff990e74c1abcd08c1d7f9c745fa62cb45`).

- Final Concierge deployment after strengthening the image-source fallback: `58317661beb449f6bbc446a43c883e8a` (2026-11-11). This supersedes the earlier Concierge deployment ID listed above.


## AI Concierge hero model layout — 2026-11-11

- The deployed `star69ai-concierge` Worker now uses a wider two-column desktop layout: chat on the left and the same virtual receptionist image used by the homepage hero on the right (`assets/Asistente virtual con headset futurista.png`).
- The model image is served through `/receptionist-model.webp`, which requests a 760px Cloudflare image transformation and caches the result; it falls back to the original PNG if transformation is unavailable.
- On narrow screens, the model becomes a compact banner above the chat so the conversation and composer remain usable.
- Worker deployment ID: `ec94eecee3fc451f9df5f846f2b11cfc` (2026-11-11). Existing AI and D1 bindings were preserved.
- The deployed Worker source is now tracked at `cloudflare/concierge-worker.js`.
- Verification limitation: requests to the Worker hostname are blocked in the current tool environment, so the page and image transformation still need browser verification. Do not claim the visual result or WebP byte reduction is confirmed until checked in a browser.
