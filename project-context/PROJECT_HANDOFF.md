# AIVirtualReceptionist.online — Project Context Handoff

Last consolidated: 2026-11-08

Read this file before making changes. It captures the user's project decisions, technical architecture, current requests and development rules. The root README remains the detailed technical setup guide.

## Product and business model
AIVirtualReceptionist.online is a managed AI receptionist service for small and service-based businesses; roofing is the first demonstration use case. The agency configures and manages each client's AI phone receptionist. This is a done-for-you service, not a self-serve voice-agent builder.

Core offer: answer incoming calls 24/7, answer approved business questions, capture/qualify leads, help schedule appointments and route calls when configured. The agency handles setup, call flows, phone routing, monitoring and ongoing support.

Brand/domain: https://aivirtualreceptionist.online/
Founder/About name: Solomon Jarman.
Operator/footer reference: SIMIAPP CLOUD.

## Visual and UX decisions
- User prefers a vivid lime-green accent.
- Premium modern SaaS design; dark, space-inspired visual language with strong contrast and readable navigation.
- Hero model/avatar should be smaller and positioned toward the upper-left of its column.
- Speech bubble should originate near the model's mouth, not have a long misplaced tail.
- Add a meaningful digital AI-brain background resembling Earth at night with illuminated network/city lights and aurora-like light. Avoid a plain circular glow.
- Keep navigation/menu and Client Login visible at the top of every page. Promotional banners must not push them off-screen.
- Remove the “Onboarding Clients” / “ONBOARDING OPEN” item from the top banner. If onboarding messaging is retained, put it in the hero/avatar speech bubble.
- Dashboard preview data must be clearly marked illustrative; do not present fictional sample metrics as customer results.
- Retell platform-wide metrics must be attributed and clearly distinguished from this agency's results.

## Public website
Canonical repository: https://github.com/hisjarman/aivirtualreceptionistonline
Default branch: main.
The public static website is at the repository root and is published with GitHub Pages at the custom domain. The old docs subdirectory was moved to root; do not restore that layout.

Public site includes Home, Features, Pricing, How It Works, FAQ, About, Get Started, Demos, Insights, Industries, blog/story series, AI Trust Lab, partner program and interactive AI challenge (“The Receptionist Architect”).

The existing business discovery form MUST continue to use Formspree:
https://formspree.io/f/mrppjqdb
It collects business details for follow-up/demo preparation; it does not activate a subscription.

## Pricing and billing intent
Documented plans in the root README:
- Starter: $149/month, 300 included voice minutes.
- Growth: $249/month, 600 included voice minutes.
- Pro: $399/month, 1,000 included voice minutes.
- $99 one-time setup fee, invoiced separately.

User requires usage-based overage billing: once included minutes are exhausted, track additional minutes and bill per minute through Stripe metered billing, correctly associated with the customer's subscription/plan. This is not confirmed as configured. Do not invent the overage rate; verify current Stripe setup or ask the user for the rate. Confirm rounding and event/meter policy before charging.

## Technical architecture (documented in root README)
- GitHub Pages: public marketing site, client portal at /client/, admin console at /admin/.
- Cloudflare Worker: avr-platform-api, documented URL https://avr-platform-api.hisjarman.workers.dev.
- Cloudflare D1: Worker binding DB points to existing avr-trust-lab database. New platform tables use avr_ prefixes to avoid collisions.
- Clerk: frontend authentication; Worker validates Clerk JWTs and performs server-side user lookup. Admin access is enforced server-side with ADMIN_EMAILS.
- Stripe: Checkout, customer billing portal and signed webhooks.
- Retell AI: agent/phone-number sync, customer assignments, signed call webhooks, call summaries/transcripts and usage records.
- Existing avr-trust-lab-api and Trust Lab/contact/newsletter/partner features are separate and must remain intact.
- User explicitly does NOT want Render. Do not revive old Render/Manus deployments. Use GitHub Pages for static hosting and Cloudflare Workers/D1 for backend needs.

The root README describes customer portal capabilities (assigned agents/numbers, call recordings/transcripts/summaries, usage, profile, summary-email recipients, Stripe billing portal) and admin capabilities (customer workspaces, support/upgrade requests, client supervision, Retell sync/assignments, cross-customer calls and billing events). Verify the code and live configuration before claiming every capability is production-ready.

## Integrations and security
- Clerk production migration was previously listed as pending: frontend publishable key and Worker issuer must match the same production Clerk instance. Verify before changing.
- Worker secrets expected: CLERK_SECRET_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RETELL_API_KEY. Never place secrets in GitHub, HTML, browser JS, public config or chat.
- Stripe subscription state should be updated from verified webhooks, not only browser redirects.
- Retell webhook signatures must be verified and events deduplicated.
- Verify tenant isolation and admin authorization with separate test accounts.
- Recording consent, retention/deletion and privacy/legal requirements must be addressed before exposing recordings/transcripts or sending summaries.
- Root README references migration cloudflare/migrations/2026-11-07-call-email-settings.sql; confirm it has been applied before relying on those settings.

## Current active user requests
### Challenge game
- Current challenge reportedly has only about five question/scenario variations and becomes repetitive.
- Expand the scenario/question library substantially.
- Repeated attempts should receive different questions; randomize from a larger bank and avoid immediate repeats where practical.
- Add difficulty levels.
- Higher difficulty must provide higher rewards. Define/display a clear progression, but do not promise cash or real-world rewards unless explicitly configured.
- Keep scoring, answer validation, completion and rewards consistent with difficulty.
- Candidate branch: feature/challenge-difficulty-question-bank. Inspect it before use/merge.

### Homepage/header
- Lime green accent.
- Remove “Onboarding Clients” from top banner/topbar.
- Preserve clear, visible navigation and Client Login at the top across pages and screen sizes.
- Smaller upper-left hero avatar, mouth-aligned speech bubble, Earth-at-night/aurora AI brain background.
- Candidate branches visible at consolidation time: design/remove-onboarding-banner, design/compact-receptionist-speech, fix/header-onboarding-speech-bubble, feat/homepage-client-dashboard-login, feature/global-client-login-button, feat/retell-powered-homepage-hero, merge/homepage-hero-dashboard. Do not merge blindly; compare diffs and test.

### Other recent requests
- Voice-clone explanation should be concise, opened in a modal/window from a button; explain the process, likely third-party providers, required recordings/consent and steps.
- Actual client dashboard should resemble the advertised preview, with left sidebar and top panel.
- Client Login should be clearly visible on every page.
- The founder letter/About content should use Solomon Jarman.
- Explain Retell AI technology and vendor scale only with legally supportable, attributed facts. Never imply platform stats are this agency's customer results.
- Weekly business-comedy series title direction: “Saved by the AI Receptionist!”

## Known issues / launch follow-ups
1. Verify Clerk is on production keys/issuer and production domain is correctly configured; earlier notes said development instance remained.
2. Verify Worker secrets exist (never reveal their values).
3. Verify Stripe plan Price IDs: STRIPE_PRICE_STARTER, STRIPE_PRICE_GROWTH, STRIPE_PRICE_PRO.
4. Implement/test Stripe metered overage after included minutes are used; obtain exact rate and policy first.
5. Verify Retell webhook at /webhooks/retell, required events, sync agents/numbers, assign resources and test a real call.
6. Confirm D1 migration for call-email settings is applied.
7. User previously saw: D1_ERROR: no such table: avr_addon_orders. Inspect current Worker/frontend references and migrations for schema mismatch; do not invent a table without examining the code and migrations.
8. Preserve and test Formspree endpoint after form edits.
9. End-to-end test login, admin/customer authorization, tenant isolation, calls, recordings, summaries, email delivery, usage, checkout, portal, webhooks and cancellation.
10. Confirm Pages and Worker deploy separately; a static-site commit does not deploy Worker code or apply SQL migrations.

## Main-branch inspection snapshot (2026-11-08)
- Root README exists and documents the GitHub Pages + Cloudflare Worker + D1 + Clerk + Stripe + Retell architecture.
- Root index.html links to homepage-polish.css, contact.css, story-series.css, dashboard-demo.css, experience.css and demo-center.css.
- The homepage HTML on main still contained an “ONBOARDING OPEN” topbar item and an extra unmatched closing span near it. This likely contributes to the header/layout issue; recheck the branch before changing.
- Hero image asset referenced: assets/AIVirtualReceptionist_Hero_Frame_LeftFacing.png. Icon assets referenced: assets/ai-receptionist-icon.svg and assets/favicon.svg.
- Homepage includes a dashboard preview with fictional sample metrics and a disclaimer.
- Homepage copy still described the challenge as five puzzles; the challenge branch may supersede this.
This is a snapshot, not a guarantee that main is the newest user-approved design.

## Recommended next steps
1. Inspect feature/challenge-difficulty-question-bank; implement/test the expanded randomized question bank, difficulty levels and reward progression.
2. Compare homepage/header branches and consolidate approved lime-green, avatar, speech-bubble, brain-background and login/header changes.
3. Diagnose avr_addon_orders D1 error against actual Worker queries and SQL migrations.
4. Verify Clerk production setup and portal behavior.
5. Complete Stripe metered overage only after confirming rate, meter event and billing policy.
6. Run launch checks and update this handoff whenever decisions or implementation status change.

## Development rules (must follow)
- Work in branches. User explicitly asked to use GitHub branches. Do not silently commit feature work directly to main.
- Inspect target branch and diffs before editing or merging. Do not merge branches without explicit user approval.
- Make focused commits with descriptive messages and report branch + commit.
- Read source files, related CSS/JS, Worker routes and D1 migrations before changing behavior.
- Preserve Formspree, Trust Lab, partner features, navigation, SEO and existing working behavior.
- Test responsive layout, menu/login visibility, links, forms, assets and scripts.
- Never claim a feature is complete or deployed unless verified.
- Never commit secrets or customer data.

## Open questions — do not guess
- Exact challenge reward at each difficulty (points, badge, coupon or other).
- Exact per-minute overage rate and rounding/billing policy.
- Whether Clerk has since been migrated to production.
- Which candidate UI/challenge branches have been merged or approved since this snapshot.


## 2026-11-08 visual refresh
A new visual direction is being introduced on branch `design/academic-lime-sky-refresh`:
- White/light backgrounds with dark navy body text for legibility.
- Lime green as the restrained brand accent; sky blue for primary action buttons.
- Academic/editorial design principles: strong typographic hierarchy, generous whitespace, consistent grid, restrained color, clear focus states and reduced-motion support.
- Homepage hero uses a custom vector illustration of an interconnected world and AI neural network (`assets/ai-world-network.svg`).
- Brand icon and favicon use a simple, scalable connected-globe/network symbol (`assets/brand-symbol.svg`); existing icon paths are updated to match.
- The top “ONBOARDING OPEN” banner is removed from the main public pages; the Client Login link is exposed in the header. Onboarding messaging remains in the homepage receptionist speech bubble.
- Main homepage and shared CSS were updated; validate every page and mobile navigation before merging. Changes are in a branch and have not been merged to `main`.


## 2026-11-09 — user-supplied Earth and receptionist artwork
- User confirmed the assets are in the root repository's `assets/` folder on `main`.
- Exact files: `assets/Asistente virtual con headset futurista.png` (receptionist) and `assets/Conexión global_ Tierra e inteligencia artificial.png` (Earth/AI background).
- A focused visual update is being prepared on branch `design/earth-receptionist-hero-onboarding`: use the new receptionist portrait in the homepage hero, Earth artwork as the hero background, preserve the existing dialogue and place it beside the avatar's face, and add a small receptionist companion beside the discovery form.
- Preserve the Formspree action `https://formspree.io/f/mrppjqdb`, all form fields, existing Client Login/navigation, and responsive behavior. This branch must be reviewed before merge; main remains untouched.


## 2026-11-09 — accessible lime and sky-blue typography
- User requested bright lime-green and light-blue text throughout the website, with every text element remaining legible.
- Added a shared typography color system to styles.css: vivid lime and pale sky blue on dark/navy surfaces; darker, high-contrast lime and blue variants on white/light surfaces; improved muted text contrast and visible keyboard focus.
- Added homepage-specific overrides to homepage-refresh.css so the Earth-at-night hero retains bright lime/sky-blue accents and light sections keep readable text.
- Committed on design/earth-receptionist-hero-onboarding; not merged to main. Review desktop and mobile before merge.


## 2026-11-09 homepage model and contrast update (working branch)
- New user direction: put the newly added `assets/Asistente virtual con headset futurista.png` model in the homepage hero; move the previous `AIVirtualReceptionist_Hero_Frame_LeftFacing.png` model into the global-language section as a supporting brand portrait.
- Keep the Earth-at-night/AI network background and existing hero speech bubble; no onboarding promotion in the top navigation/header.
- Improve header contrast with a deep navy header, bright readable sky-blue navigation, lime-green brand accent and a clearly visible lime Client Login action. Keep the Get Started action on desktop/tablet; hide it on narrow mobile widths to protect Client Login and menu visibility.
- Improve contrast for hero copy, stats, language section and supporting homepage panels. Add responsive menu behavior for tablet/mobile and a supporting model portrait in the language section.
- Implementation branch: `design/hero-model-swap-readable-contrast`. Not merged into `main`. Verify the new model asset path in browser preview and inspect mobile/tablet layout before merging.


## 2026-11-09 challenge expansion update (working branch)
- The Receptionist Architect now contains 45 scenarios (15 each for Starter, Pro and Expert), with five questions per run and three difficulty tiers.
- Each difficulty has a distinct reward tier: Starter 10% / CALLSMART10, Pro 15% / CALLSMART15, Expert 20% / CALLSMART20. The page explicitly states that the matching Stripe promotion must be activated before a code can redeem; these codes are not confirmed as configured in Stripe.
- Replays avoid the immediately previous five questions at the same difficulty when browser session storage is available; graceful fallback remains randomized if storage is unavailable.
- Homepage challenge card now advertises the 45-scenario bank and three difficulty levels.
- Implemented on `design/hero-model-swap-readable-contrast`; not merged into `main`.


## 2026-11-09 — corrected model placement per user's clarification
- User's exact layout direction: `Asistente virtual con headset futurista` belongs in the upper-left of the homepage hero at the original hero scale; `AIVirtualReceptionist_Hero_Frame_LeftFacing` belongs elsewhere, specifically beside the intake/discovery form.
- Corrected `index.html`: keep the new model as the hero image; remove the old model from the global-language section.
- Corrected `get-started.html`: replace the small discovery-form companion with the old model asset. Preserve the existing Formspree endpoint and form structure.
- Corrected `homepage-refresh.css`: restore the original hero image sizing (desktop max-width 540px / max-height 650px; original tablet/mobile sizing) while keeping the portrait aligned upper-left. Retain the speech bubble treatment beside the model.
- This correction is on `design/hero-model-swap-readable-contrast`, not merged into `main`.
