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


## Click-to-chat homepage bubble and Concierge layout correction — 2026-11-11

- The homepage receptionist speech bubble is now an accessible button with the message: “I can help you design a receptionist around the way your business works.” Visitors can click it to open the embedded AI Concierge panel without leaving the homepage. The panel includes a close control, Escape-key support, dialog labeling, and an iframe title.
- The embedded panel loads the existing `star69ai-concierge` Worker UI; it reuses the same `/api/chat` conversation endpoint rather than creating a second chat implementation. The Worker already allows `https://star69ai.com` and `https://www.star69ai.com` as frame ancestors.
- The Concierge desktop frame now gives the chat approximately 70% of the workspace and confines the receptionist portrait to a narrow right-side column with a 470px maximum image height. At 640px and below, the model becomes a compact 112px header row and the chat occupies the remaining frame height. This prevents the portrait from forcing the chat/composer below the visible frame.
- Updated Concierge Worker deployed successfully to Cloudflare Worker `star69ai-concierge` on 2026-11-11 (deployment ID `50dc3138a93d4ce8b372ef044a0b912d`). The existing AI and D1 bindings were preserved; Cloudflare accepted the module upload with no validation errors.
- GitHub changes are on `feature/concierge-hero-chat-launch`, based on the still-open PR #74 branch. The homepage iframe and styling are not live on GitHub Pages until the dependent PR is merged. No merge to `main` is performed.
- Browser verification of the homepage iframe, live chat submission, and responsive layout remains required; the tool environment previously blocked direct requests to the Worker hostname.


## Concierge full-width header and chat-only frame — 2026-11-11

- Reworked the Concierge page so the Star69AI logo, Concierge title, descriptor, online status, and receptionist model share one full-width branded header. The model is positioned as a small visual at the upper-right of that header, not in a separate column or chat content area.
- Removed the split model/chat workspace. The conversation history now fills the main frame below the banner, and the message composer remains anchored at the bottom of that chat frame.
- Responsive header rules shrink the logo and model on mobile while preserving the full-height chat and composer.
- Updated Worker successfully deployed to Cloudflare `star69ai-concierge` on 2026-11-11 (deployment ID `a3517580524a4825aaa36d259e9f8641`); existing AI and D1 bindings were retained.
- Change committed to `feature/concierge-hero-chat-launch`; PR #75 remains open and depends on PR #74. No GitHub Pages merge performed.


## Merge recovery — 2026-11-11

- PR #74 merged to `main` on 2026-11-11 (squash commit `8e31edd75952f013ff0f887069e890145072738d`).
- PR #75 was retargeted to `main` but GitHub reported a content conflict because the Concierge Worker source was independently added on both branches. Its homepage/Worker changes were transplanted to `feature/concierge-chat-homepage-merge`, created from the post-PR-74 `main` commit, to preserve the full-width branded header and chat-only main frame while retaining the homepage click-to-chat implementation.
- The replacement branch carries the current full-width Concierge Worker, homepage bubble/panel integration, responsive panel styles, and this handoff. PR #75 remains unmerged until the replacement PR is reviewed/merged.
- Latest Worker deployment ID for the full-width header/chat-only frame: `a3517580524a4825aaa36d259e9f8641` (2026-11-11). Homepage GitHub Pages activation still requires merging the replacement PR.


## AI-assisted discovery form coaching — implementation branch, 2026-11-11

- New feature branch: `feature/ai-discovery-form-coach` (based on the post-PR-76 `main` commit).
- Adds an optional AI Discovery Coach panel to `get-started.html`, using the existing `star69ai-concierge` Worker UI and chat endpoint.
- The form page shares a limited allowlist of business/call-handling fields with the embedded Concierge: industry, service area, services, call volume, hours, caller tasks, FAQs, recording/transcription preference, outbound AI preference, SMS preference, phone setup and additional notes. It sends the active field label/value plus current step so the AI can offer contextual examples while the visitor types.
- Contact name, email, phone, business name, website, human escalation contact and privacy-consent choice are excluded from the context payload. The UI explains what is shared and warns visitors not to enter sensitive/customer data.
- Worker independently re-applies the field allowlist and length limits before adding the form context to the model prompt. Visitor-provided values are explicitly treated as untrusted data, not instructions.
- The public form continues to submit natively to Formspree `https://formspree.io/f/mrppjqdb`; the AI helper does not submit the form or alter the user's answers.
- This is an implementation branch only. No Worker deployment, Formspree configuration change, D1 change or merge to `main` has been performed. Test privacy behavior, mobile layout, contextual suggestions and form submission before merge/deploy.


### AI Discovery Coach refinements and validation — 2026-11-11

- The coach receives live updates as visitors focus, change or type into allowlisted discovery fields; it also receives the last active field when opened and refreshes context when the visitor moves between form steps.
- The Worker enforces the allowlist a second time and limits each field before model inference. The Concierge prompt explicitly treats all visitor-provided form values as untrusted data and instructs the model to explain fields, tailor examples to industry/prior answers, and never edit or submit the form.
- Updated the Get Started privacy note to clarify that dedicated contact/business identity fields are excluded and that visitors should not place those details in free-text fields.
- Updated privacy.html to disclose optional Cloudflare Workers AI processing for selected business and call-handling answers when the visitor opens the coach.
- Corrected assistant panel button typography and whitespace normalization in the field-label extraction.
- Static source checks passed for the assistant entry point/panel, parent-to-iframe context messaging, Worker-side allowlist and model prompt, privacy disclosure, and retention of the existing native Formspree POST. Live browser testing, real inference and end-to-end form submission remain outstanding.
- No Cloudflare Worker deployment or GitHub Pages deployment has been performed from this feature branch. Merge and Worker deployment require review/approval; do not claim the helper is live.


## AI Discovery Coach merged to main — 2026-11-11

- PR #77 merged successfully to `main` on 2026-11-11. Squash merge commit: `839a5d0e660349fa927847371f38584280e9beca`.
- The Get Started discovery form now includes an optional AI coach panel using the existing Star69AI Concierge iframe. It receives the current step, active field and allowlisted business/call-handling answers as the visitor focuses, types, changes answers and navigates steps.
- The Concierge shows the active field and can offer industry-tailored explanations and example wording for longer descriptions. The model is instructed not to invent business facts or submit/change the form.
- The client-side and Worker-side allowlists exclude dedicated contact and identity fields; Worker-side length limits and untrusted-input handling remain in place. Visitors are warned not to put sensitive or customer data in free text.
- `privacy.html` discloses optional Cloudflare Workers AI processing. The existing Formspree endpoint `https://formspree.io/f/mrppjqdb` remains unchanged.
- Static source checks passed before merge. **The new Worker source has not yet been deployed to Cloudflare**, and live browser, real AI inference, mobile rendering and end-to-end Formspree submission tests remain outstanding. Do not describe the AI coach as live until the Worker is deployed and tested.


## Hero model chat invitation visibility — 2026-11-11

- New branch `feature/hero-model-chat-cta` makes the homepage hero receptionist's interactive nature explicit. The speech bubble now says the pictured receptionist is the AI and invites visitors to chat about their business, ask questions or explore capabilities.
- The chat control is restyled as a prominent dark teal/lime bordered call-to-action card with a clear "START CHATTING WITH ME" action label, keyboard focus and hover feedback, including a compact mobile treatment.
- Existing dialog/iframe wiring and Concierge URL are unchanged. The click opens the live Star69AI Concierge panel.
- Awaiting branch checks/PR merge and live browser verification. The AI Discovery Coach Worker deployment is tracked separately below.


## AI Discovery Coach Worker deployment and hero chat CTA — 2026-11-11

- Deployed the merged `main` version of `cloudflare/concierge-worker.js` to Cloudflare Worker `star69ai-concierge` on 2026-11-11.
- Cloudflare upload/deployment ID: `a16f3e3c-1619-420d-a6db-e606eaaf6102`; deployed Worker version ID: `f7a8fd29-984b-4117-acd2-fa634f6a7e74`; 100% of traffic assigned to this version.
- Verified Worker settings after deployment: AI binding `AI` retained; D1 binding `DB` retained with database ID `6cf68b12-2aa8-4ed4-9f92-8a7824520d1a`; compatibility date remains `2026-11-10`.
- The deployed Worker source includes the discovery form context message receiver, Worker-side safe field allowlist and length limits, untrusted-input treatment, practical form-coach prompt, and active-field indicator in the Concierge UI.
- Homepage hero CTA visibility update merged in PR #78, squash commit `d5372a67561e0d1fad9ed05b01c1417d33b5a6e1`. The hero receptionist now speaks in first person, explains visitors can chat about their business, and shows a prominent "START CHATTING WITH ME" action label. The existing accessible dialog and iframe still open the deployed Concierge.
- GitHub Pages source changes are merged to `main`. Workflow run #395 (commit `317585197e49a54ef413d8899682364a7106e331`) was observed queued and then in progress; final Pages publish status was not yet available at the last check. Track at https://github.com/hisjarman/star69ai/actions/runs/42966615120.
- Static source checks passed. A live external browser request could not be completed in this tool environment (DNS/network resolution unavailable), so do not claim visual browser or end-to-end inference/form submission verification. The Cloudflare API confirms the new Worker version is deployed and active.


## Compact hero receptionist prompt and discovery form readability — 2026-11-11

- Homepage hero receptionist is presented as a small portrait/avatar beside a compact speech-bubble CTA rather than a large portrait occupying the hero column.
- The bubble asks visitors to ask the AI receptionist a question and remains the clickable entry point to the existing Concierge dialog/iframe. Chat URL and behavior are unchanged.
- Get Started discovery form typography is enlarged for readability: labels, field values, placeholders, step headings, helper copy, privacy disclosures, consent text and buttons receive larger sizes, stronger contrast and more comfortable line-height. Mobile inputs use 16px to avoid browser zoom on focus.
- Changes are on `feature/compact-hero-chat-readable-discovery`; no merge, Pages publication or Worker deployment has been performed.
- Static source checks: verify hero CTA text/ARIA label and discovery stylesheet overrides. Browser/mobile visual checks and live chat/form submission tests remain outstanding.


## Compact hero receptionist and discovery form readability merged — 2026-11-11

- PR #79 was squash-merged into `main` on 2026-11-11.
- Merge commit: `62d120cea23cda699a40fa80b18868767d6fc5d1`.
- The homepage hero receptionist is now styled as a compact avatar with an adjacent speech bubble inviting visitors to ask a question. The bubble remains the clickable trigger for the existing Concierge chat iframe/dialog.
- The Get Started discovery form now has larger, higher-contrast labels, inputs, placeholders, instructions, privacy/consent copy and buttons; mobile form inputs use 16px text.
- Static source checks passed before merge. Browser visual verification, live chat, and Formspree submission testing remain outstanding.
- GitHub Pages publication status was not verified at the time of this handoff update. No Worker deployment was needed because the Concierge backend was unchanged.


## Expanded industry discovery and AI coach — 2026-11-11

- Added a grouped industry selector to `get-started.html`, covering home services/contractors, automotive/transportation, healthcare/wellness, professional services, hospitality/retail/lifestyle, and community organizations.
- Added an optional custom-industry description that appears and becomes required only when the visitor chooses “Other / not listed.” The custom field is disabled and cleared when not in use.
- Added `industryOther` to the client-side and Worker-side AI context allowlists. The coach receives the custom industry description only as business context; dedicated identity/contact/escalation/consent fields remain excluded.
- Expanded the Concierge instructions to recognize the supported industry groups and provide relevant call scenarios plus sample receptionist responses when helpful. Examples must be labeled illustrative and cannot invent a business's actual services, prices, hours, policies or capabilities.
- Preserved the existing three-step discovery form, native Formspree POST destination (`https://formspree.io/f/mrppjqdb`), privacy boundaries, and existing Worker endpoints.
- Implementation branch: `feature/expanded-industry-discovery`. No merge to `main`, GitHub Pages publish, Cloudflare Worker deployment, or live end-to-end test has been performed. Review the branch, test desktop/mobile selector behavior and custom-industry validation, verify coach context and scenarios, then test a real Formspree submission before deployment.

## Manual call-details email reliability fix — 2026-11-11

- Investigation compared historical Resend delivery records and Cloudflare Worker versions. A successful manual call-details send was recorded on 2026-11-11 at 01:15 UTC from `hello@star69ai.com`, before the Star69AI email-wrapper deployment. The record's body retained legacy AIVirtualReceptionist.online wording. Current Worker configuration was inspected without exposing secret values: `RESEND_API_KEY` remains a secret binding, `RESEND_FROM_EMAIL` is `hello@star69ai.com`, and the D1 binding remains present. This historical delivery is not proof of current end-to-end reliability.
- The active Worker source uses the Star69AI shared email wrapper for manually requested call details. The manual send path previously made one Resend request, logged the full provider response, and converted most non-401/403 failures into the same generic `call_email_send_failed_try_again` error.
- Branch `fix/manual-call-email-reliability` updates the manual path to retry once after transport errors, HTTP 429 responses or HTTP 5xx responses, with a short delay and the same Resend idempotency key to reduce duplicate-send risk. Permanent provider rejections are not retried.
- Failure logs now contain only the HTTP status, a sanitized provider error identifier, attempt number, or transport error class. They do not log the provider response body, recipient address, email content, call transcript, or secrets.
- The Worker now returns distinct error categories/statuses for sender configuration (503), rate limiting (429), temporary provider/transport unavailability (503), and permanent provider rejection (502). The client portal maps these categories to actionable messages while preserving the existing manual-send form and endpoint.
- Existing Star69AI sender, brand wrapper, logo/footer, email subject, call content, tenant-scoped call lookup, recipient validation and idempotency-key format are preserved.
- Implementation is on `fix/manual-call-email-reliability`; source checks confirmed the bounded one-retry loop, stable idempotency key, sanitized logging and client error mappings. A live Resend failure simulation and authenticated browser send test have not been run. No Cloudflare configuration, secrets, D1 data, or Worker deployment were changed.
- Merge authorization does not authorize Worker deployment. After merge, deploy `cloudflare/platform-worker.js` separately to `avr-platform-api` only with explicit deployment approval, then verify a manual send and inspect Worker logs for any categorized failure.

## Manual call-details email reliability deployment — 2026-11-11

- PR #81 was merged to `main` at commit `199555f5c015d4f189e6c94476d5acebf92d9a1f`. It adds a single bounded retry for transient Resend/network failures, stable idempotency-key reuse, privacy-safe structured diagnostics, distinct provider error codes, and actionable client-portal messages.
- The merged `cloudflare/platform-worker.js` was deployed to Cloudflare Worker `avr-platform-api` on 2026-11-11.
- Active Worker version: **27**, version ID `16b6c7fc-f0f5-4f21-939b-e7487ce7ac1e`.
- Deployment ID: `7805c97c-1c5f-49a9-bce3-04643c998871`; Cloudflare deployment inspection confirmed the version is receiving **100%** of traffic.
- Existing production bindings were preserved: `ADMIN_EMAILS`, `ALLOWED_ORIGINS`, `CLERK_ISSUER`, D1 binding `DB`, and secret bindings `CLERK_SECRET_KEY`, `RESEND_API_KEY`, and `RETELL_API_KEY`. No secret values were read or changed. D1 database binding ID and compatibility date were retained.
- No D1 schema/data, Stripe configuration, Resend configuration, or other Worker was changed.
- Verification limitation: direct HTTP access to `https://avr-platform-api.hisjarman.workers.dev/health` is blocked by the current tool environment (HTTP 403 generated by the tool network policy). Cloudflare's deployment/version APIs confirmed the 100% rollout and bindings, but the manual email button has not yet been exercised in an authenticated browser session. A real manual-send test and transient-provider-failure test remain outstanding.


## Resend sender-binding correction — 2026-11-11

- Post-deployment verification found that Worker version 27 did not contain the plain-text RESEND_FROM_EMAIL binding. This was an error in the version-upload metadata, not a Resend API-key failure. Version 26 had the sender configured as hello@star69ai.com.
- Corrected by uploading the merged main source from cloudflare/platform-worker.js again and explicitly restoring RESEND_FROM_EMAIL=hello@star69ai.com.
- Corrected Worker version: 28, version ID 5ad3cff5-705e-4546-bd63-d982c5982b76.
- Active deployment ID: 7a9dece9-39e4-444d-a459-1c961b23528d; Cloudflare deployment inspection confirms version 28 receives 100% of traffic.
- Verified version 28 bindings include RESEND_FROM_EMAIL=hello@star69ai.com, RESEND_API_KEY (secret binding), CLERK_SECRET_KEY (secret binding), RETELL_API_KEY (secret binding), D1 DB (same database ID), and the existing ADMIN_EMAILS, ALLOWED_ORIGINS, and CLERK_ISSUER values. Secret values were not read or changed.
- No D1 data/schema or unrelated service configuration was changed. A live authenticated manual-send test is still required to confirm delivery; if it fails, inspect the new categorized Worker logs and Resend response status rather than assuming the sender configuration is still missing.


## Discovery form usability and accessibility update — 2026-11-11

- Branch: feature/discovery-form-ux-accessibility (based on main). No changes were made to main and no deployment or merge has occurred.
- Updated get-started.html to make the discovery form feel lower-pressure: the intro explains that most questions are optional, and step 2 tells visitors a short answer is enough and they can skip uncertain items.
- Added an explicit affirmative recording/transcription preference, alongside no-recording, transcript-only and discuss-first choices. The copy states that recording/transcription is subject to legal review, caller notice/consent, access controls and retention settings; this is a preference only, not automatic recording activation.
- Added optional multi-select feature interests: appointment booking, call recordings/transcripts, emailed summaries, lead qualification, live transfers/urgent escalation, after-hours coverage, multiple languages, software integrations, consent-based SMS follow-ups, and other workflows.
- Updated app.js so the AI Discovery Coach receives the selected optional interests and the Formspree brief includes every checked option. The native POST flow and Formspree endpoint https://formspree.io/f/mrppjqdb are preserved. No credentials or external services changed.
- Added high-contrast typography, readable helper/disclosure text, clearer form controls, accessible focus and mobile single-column preference cards in contact.css. Overrides are scoped to the Get Started/onboarding form to avoid changing unrelated pages.
- Validation status: source-level replacement checks passed during editing. Browser/mobile visual verification, keyboard testing, Formspree delivery test, and color-contrast measurement are still required before merge/publish.

- Pull request: #82 (https://github.com/hisjarman/star69ai/pull/82), merged to main on 2026-11-11 at commit `1388731013d4cb3b13c60d08d5111fa0a8d29dba`. A follow-up source correction restored actual line breaks in app.js after the optional-checkbox context and Formspree summary logic was added. Automated browser testing and a live Formspree delivery test remain outstanding.


## Technical SEO and AI crawler implementation — 2026-11-11

- SEO implementation is prepared on branch `seo/technical-crawlability-ai-discovery`; production branch `main` remains unchanged pending explicit approval to merge.
- Confirmed production site architecture: repository-root GitHub Pages publishing with root `CNAME` set to `star69ai.com`. Do not move publishing to `docs/`.
- Root `robots.txt` allows public marketing, editorial, pricing and public Trust Lab content. It explicitly excludes `/client/`, `/admin/`, `/api/`, `/dashboard/`, `/private/` and `/newsletter-admin.html`; OAI-SearchBot and PerplexityBot have explicit public crawl allowances with the same private-path exclusions. Robots directives are not access control; Clerk and Worker authorization remain the security boundary.
- Root `sitemap.xml` has been reconciled against the known static public routes. It includes marketing, industry, blog, challenge, insights, Trust Lab, partner and legal pages; it excludes client/admin and API routes.
- Homepage title and description now emphasize the managed service. Homepage Open Graph/Twitter metadata and JSON-LD Organization, WebSite and Service entities are included. Structured data does not assert unverified ratings, reviews or Star69AI customer-performance statistics.
- Four insights pages had canonical and Open Graph URLs on the retired `aivirtualreceptionist.online` domain; these are corrected to `star69ai.com`.
- Public Trust Lab dashboard and partner landing page have self-referencing canonicals; Trust Lab and public legal pages also have self-referencing canonicals.
- Client and admin portal entry pages carry `noindex,nofollow,noarchive` metadata and are excluded from robots crawling and the sitemap.
- IndexNow verification key file is `c2bce683c78de699b10abff8601ac838.txt`. This is a public verification token, not an application secret. `scripts/submit-indexnow.ps1` reads the published sitemap and submits its URLs after deployment.
- After merge/deployment, still verify live HTTP status and redirects; ensure GitHub Pages publishes root files; inspect rendered HTML and canonical URLs; validate JSON-LD; submit the sitemap in Google Search Console and Bing Webmaster Tools; test the IndexNow key URL and submission; review Cloudflare security events for crawler challenges.
- DNS ownership verification and Search Console/Bing account actions must be completed by the account owner. Sitemap submission, IndexNow notification and live URL tests do not guarantee indexing or ranking.

## Legacy HelloAnswer script removal — 2026-11-11

- Removed the obsolete HelloAnswer client widget script (`clients.aivirtualreception.online/w/w_xin7g6jkr6au9gqlo18h.js`) from the homepage `index.html` on branch `seo/technical-crawlability-ai-discovery`.
- The script was confirmed to be a legacy HelloAnswer integration and is no longer needed. The current Star69AI Concierge remains embedded through the existing `star69ai-concierge` Cloudflare Worker iframe and its homepage click-to-chat controls; those were not changed.
- Verified the retired HelloAnswer hostname no longer appears in the homepage source. No other scripts, chat behavior, backend configuration or production branch were changed.


## Hero Concierge left-rail placement — 2026-11-11

- Implementation branch: `fix/hero-concierge-left-rail`, based on the current `main` commit after the technical SEO / obsolete HelloAnswer cleanup. Pull request #84 (https://github.com/hisjarman/star69ai/pull/84) was merged to `main` on 2026-11-11 at squash commit `24192f2566601f40f80c864e80b1950db2c9869c`.
- Updated `homepage-refresh.css` with a final, scoped layout contract for the homepage hero. At desktop widths, the hero reserves a dedicated left column for the receptionist avatar and clickable AI prompt, while the sales copy remains in a separate right column. The assistant prompt is anchored within that left rail and cannot sit over the sales headline or sales copy.
- At tablet and mobile widths, the assistant remains left-aligned in its own row above the sales copy instead of overlapping it. The existing model asset, prompt text, accessible button, Concierge iframe URL, and chat behavior are unchanged.
- When opened, the Concierge chat panel is anchored to the lower-left side of the viewport on desktop so it does not cover the sales pitch. On mobile it expands within the viewport margins for usable chat controls.
- This is a CSS-only change; no Worker, D1, authentication, form, SEO metadata, or provider configuration was changed.
- Validation performed: inspected the current homepage DOM, stylesheet load order, existing competing hero overrides and the active chat iframe markup; confirmed the new override is appended to the final-loaded `homepage-refresh.css`. PR #84 was merged as noted above. A real desktop/mobile browser visual test and live chat submission test remain outstanding because browser access to the deployed site/Worker is unavailable in this tool session.


## Discovery Coach side-by-side UX implementation — 2026-11-11

- Working branch: `ux/discovery-coach-side-by-side-2026-11-11`, created from the verified current `main` after PR #84 and PR #82 had both merged. Pull request #85 (https://github.com/hisjarman/star69ai/pull/85) was marked ready and squash-merged into `main` on 2026-11-11 as commit `1bcb1fe66ab261009a3de5b514b197c78e17395c`.
- Reworked `get-started.html` so the AI Discovery Coach is a permanent, independently labeled panel in the left onboarding column and the existing three-step Formspree discovery form remains in the right column. The floating/toggle panel and duplicate assistant controls were removed.
- Desktop uses a two-column layout; widths at 900px and below stack the assistant above the form. Mobile uses a shorter assistant viewport while keeping its composer and conversation frame available without fixed-position overlays.
- Preserved the existing Concierge Worker iframe URL, exact allowed `postMessage` target origin, contextual form payload, field allowlist and privacy exclusions. The contact name, email, phone, business name, website, human escalation and privacy-consent fields remain excluded. No Worker, D1, secrets or provider configuration changed.
- Preserved the existing Formspree endpoint `https://formspree.io/f/mrppjqdb`, native POST submission, three-step validation, optional feature selections, recording preference, plan interest and disclosures.
- Improved the assistant privacy copy and increased helper/disclosure text sizes and focus visibility on the discovery form.
- Homepage demo CTA now says “Watch a Sample Call” to avoid implying the scripted simulator is a live AI call. The demos navigation label was clarified and the demos footer now uses the current Star69AI logo asset.
- Removed the obsolete HelloAnswer client widget script from `get-started.html`; the current Star69AI Concierge iframe remains the only discovery assistant integration on that page. The privacy notice's conditional HelloAnswer vendor disclosure was not deleted because whether it applies to any existing deployment still requires an operational vendor/configuration review.
- Source-level validation: confirmed one Discovery Coach iframe remains, the toggle and floating panel are removed, the obsolete HelloAnswer widget script is absent from `get-started.html`, the Formspree endpoint remains unchanged, the Worker origin target remains exact, and the sensitive contact/identity fields are not added to the allowlist. JavaScript syntax and CSS brace-balance checks passed. Automated browser rendering, keyboard/screen-reader testing, live Formspree submission and live Concierge conversation tests remain outstanding; do not claim these are complete. GitHub Pages workflow run https://github.com/hisjarman/star69ai/actions/runs/43066785839 was queued and then observed in progress for the subsequent handoff commit `e25a28ac182836daabe208798f492880d06939ba`; production deployment success is not yet confirmed.


## Marketing-page legacy wordmark cleanup — 2026-11-11

- On this branch, replaced the retired “AI VIRTUAL RECEPTIONIST” text wordmark in the roofing, plumbing and HVAC industry landing-page headers and both existing “Saved by the AI Receptionist!” blog headers with the canonical Star69AI logo asset.
- Used the correct relative asset path for each page depth and descriptive Star69AI alternative text. No page copy, canonical metadata, structured data, or industry content was changed.
- These pages now match the current Star69AI identity at the header; broader navigation harmonization across every marketing page remains a separate follow-up.


## Discovery Coach replaces the full left column — 2026-11-11

- Correction to PR #85's side-by-side implementation: the previous layout retained the “START YOUR CUSTOM SETUP” heading, introduction and three numbered steps above the assistant. This did not match the requested composition.
- On branch `fix/discovery-coach-replace-left-column`, removed that entire left-side introduction block. The AI Discovery Coach is now the sole content in the left column; the existing three-step Formspree discovery form remains in the right column on desktop.
- At widths of 900px and below, the coach stacks first and the form follows beneath it. The coach panel starts at the top of its column with no top margin and has a taller desktop viewport. Mobile retains a compact but usable panel.
- Preserved the existing Concierge iframe URL, privacy disclosure, safe contextual form-sharing behavior, Formspree endpoint, fields, validation and submission logic. No Worker, D1, auth, billing or provider configuration was changed.
- Source checks passed: exactly one coach iframe and one intake form; old setup heading and numbered intro block absent; coach markup precedes the form and is the only content in the left column; original Formspree endpoint and Concierge Worker URL remain unchanged; desktop two-column and <=900px stacked responsive rules are present.
- Browser-rendered desktop/mobile testing and live form/assistant interaction tests remain outstanding. Do not claim visual deployment verification until the PR is merged, Pages deployment succeeds and the live page is checked.


## Homepage Concierge opens beneath receptionist model — 2026-11-11

- Follow-up branch: `fix/hero-concierge-opens-below-model`, based on main after PR #86.
- The homepage hero's Concierge panel previously used fixed viewport positioning at the bottom-left. It now uses normal flow inside `.hero-model-column`, directly below the receptionist portrait and clickable speech-bubble trigger.
- The panel remains hidden until the existing accessible speech-bubble button is activated. The existing close button, Escape-key behavior, dialog labeling, iframe source and shared Concierge Worker conversation endpoint are unchanged.
- Desktop panel width is constrained to the model column (up to 440px) and uses a bounded responsive height. On mobile it remains full-column width with a bounded viewport-relative height; it does not cover the sales-copy column.
- No Concierge Worker, AI endpoint, D1, authentication, Formspree, billing or provider configuration was changed.
- Source-level validation and live browser verification are pending. Do not claim the layout is published until the PR is approved/merged and GitHub Pages deployment succeeds.

## Intake-page Concierge conversation viewport expansion — 2026-11-11

- On branch `fix/hero-concierge-opens-below-model` (PR #87), increased the inline Discovery Coach panel height so more of the Concierge conversation and generated responses remain visible without an overly short embedded viewport.
- Desktop panel now uses a 760px minimum with an 88vh preferred height and 940px maximum. Tablet uses 760px; mobile uses 700px. The iframe is explicitly allowed to flex and fill the remaining panel height.
- The Concierge Worker iframe URL, internal Worker UI, conversation endpoint, contextual form-sharing behavior, privacy exclusions, and Formspree form are unchanged. No Worker, D1, auth, billing, secrets or provider configuration changed.
- Source-level validation confirms the new sizing overrides are appended after the existing responsive rules. Browser visual testing on desktop/mobile and live conversation testing remain outstanding; do not claim the larger panel is visually verified until checked in a browser.
