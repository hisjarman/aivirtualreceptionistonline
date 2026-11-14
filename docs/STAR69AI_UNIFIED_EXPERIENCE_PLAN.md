# Star69AI Unified Experience 1.0

**Status:** Phase 1 design-token foundation merged to main in PR #128 (2026-11-13). Phase 2 shared-component consolidation is in progress on design/unified-experience-2-2026-11-13; this phase is not merged or deployed.

## Objective
Create one readable, coherent Star69AI experience across the public site, discovery flow, legal pages, Insights, partner pages, challenge, client portal and admin console without breaking the current managed-service journey or integrations.

## Approved visual system
- Premium dark/space-inspired identity, with the homepage Earth-at-night artwork and glass treatment retained as a signature.
- Purple #E156FF, blue #21B7FF, green #14D251; darker accessible companions #A52AB8, #0875A9, #167A3D for light surfaces.
- Green is the primary action/status accent; blue supports links and interaction; purple is selective emphasis.
- DM Sans for body/UI, Manrope for headings, DM Mono for technical labels. Existing pages must be checked before changing font loading to avoid layout regressions.
- Readable body text, consistent spacing, card/control radii, clear focus states and responsive behavior at 360px, 768px and 1280px.

## Product and integration guardrails
- Star69AI remains a managed, done-for-you AI receptionist service, not a DIY platform.
- Preserve GitHub Pages root publishing, CNAME, navigation, Client Login, SEO and current routes.
- Keep the discovery form on Formspree https://formspree.io/f/mrppjqdb. Do not replace its native POST with a JavaScript fetch or switch it to Resend.
- Discovery submission is inquiry/demo follow-up only; it must not create an account, activate a subscription or authorize phone-number changes.
- Any personalized preview must distinguish proposed configuration from tested/approved/live functionality. Do not imply that an agent has been created, published or activated until provider-side confirmation exists.
- Preserve separate Trust Lab workflows, partner flows, Clerk authorization boundaries, Stripe billing safeguards and Retell integration. No secrets in source.
- GitHub Pages remains the static host; Cloudflare Workers/D1 remain backend infrastructure. Do not introduce Render or obsolete Manus paths.

## Delivery sequence
1. Establish canonical design tokens and reconcile conflicting brand documentation.
2. Inventory page-specific CSS and identify redundant/overridden rules; reduce cascade complexity without removing working component behavior. The first source-level pass found that the homepage loads seven feature/page stylesheets after styles.css, then readability.css last; homepage-refresh.css contains several successive hero compositions, so those rules must be reconciled only after browser comparison.
3. Standardize shared navigation, buttons, cards, forms, content widths and footer patterns.
4. Bring marketing, Insights, story, challenge and partner pages into the shared system in small batches.
5. Unify the five legal pages through legal.css; preserve legal text unless separately reviewed for accuracy.
6. Build the discovery-to-preview experience as a separate, clearly labelled proposed configuration. Keep Formspree delivery intact and add a safe post-submit journey only after its delivery path is tested.
7. Run source checks and inspect desktop/mobile layouts; record browser, accessibility and provider checks that cannot be completed in this environment.

## Phase 2 implementation notes — 2026-11-13

- Created a shared primitive refinement on styles.css: primary buttons now use the canonical green token, shared control radius, a dedicated hover token and visible blue keyboard focus. Legacy --teal aliases remain for compatibility; no global search-and-replace was performed.
- Updated the homepage browser theme-color metadata to match the dark navigation chrome. The page retains color-scheme: light because it contains light form controls and light content surfaces.
- Source inspection confirms index.html loads styles.css, homepage-polish.css, contact.css, story-series.css, dashboard-demo.css, experience.css, demo-center.css, homepage-refresh.css, and finally /readability.css. The refresh file contains multiple historical hero implementations; avoid deleting or flattening these without visual regression checks.
- The current environment has not performed a real browser screenshot, WCAG contrast measurement or responsive visual test. Those remain release gates.

## Known audit items to resolve
- homepage-refresh.css is approximately 78 KB and contains over 1,200 !important declarations. It should be decomposed and consolidated in focused changes, not mechanically stripped.
- The homepage loads multiple page-specific stylesheets; other page families have their own overlapping styling layers.
- Legacy --teal tokens and hard-coded teal values remain in stylesheets and legal-page inline styles.
- readability.css has important readability guardrails; keep it last where the standards require it, but do not rely on it to repair every underlying contrast issue.
- Discovery form currently provides generic confirmation copy; a personalized, evidence-based preview is not yet implemented in the production submission path.

## Release gates
- No merge to main or GitHub Pages deployment without Solomon's explicit approval.
- No Worker deployment, D1 migration or provider setting change as part of a static visual pass.
- Verify no horizontal overflow, clipped text, broken navigation, hidden Client Login, form destination changes, SEO regressions or portal regressions.
- Report what was actually tested and what still requires browser/provider verification.
