# CallPilot AI — implementation plan

## Product scope
CallPilot AI is a managed AI receptionist service for small and medium-sized service businesses. The first shipped slice combines the public conversion website with a credible, navigable preview of the customer portal, onboarding flow, and administrator back office. The UI must be clear that CallPilot configures and manages the underlying reseller agent; customer edits become proposed change requests until an administrator reviews and deploys them.

## Architecture
- Frontend: React 19 + TypeScript + Vite, with Wouter for route-level navigation, Tailwind CSS v4, Radix primitives where useful, lucide-react icons, and Framer Motion for restrained transitions.
- Backend: existing Express + tRPC starter, preserving Manus OAuth session conventions and `/api/health`.
- Data: Drizzle ORM over the managed MySQL-compatible database. Extend the schema with organizations, memberships, onboarding submissions, configurations, change requests, agents, deployment tasks, support tickets, content, pricing, and audit records. Use additive migrations and keep provider credentials out of application tables.
- Provider boundary: a `providerAdapter` interface documents manual fulfillment today and leaves room for verified provider API calls later; no fake synchronization or live call metrics.
- Configuration: marketing copy, plan prices, allowances, onboarding fees, contact settings, and legal drafts are content/config records so an administrator can edit them later without code changes.

## Delivery slices
1. Brand shell, responsive navigation/footer, home, features, how-it-works, pricing, industries, about, contact, blog/help/legal routes, SEO route manifest, and public demo.
2. Manus OAuth-aware application shell, database schema, tenant model, and tRPC procedures for profile, onboarding, change requests, tickets, and admin fulfillment.
3. Customer workspace with setup progress, approved vs pending configuration, test/approval area, call/report empty states, billing status, and support ticket UI.
4. Admin workspace with submissions queue, fulfillment checklist, change-request inbox, support queue, content/pricing controls, margin calculator, and audit log.
5. Payment/email/storage integrations remain explicitly configuration-gated. Provide env documentation, safe fallbacks, and operational-vs-unconfigured status badges.

## Design direction
Three considered directions: “Quiet enterprise” 0.07 — restrained navy/teal SaaS with strong hierarchy; “Warm service desk” 0.06 — cream and coral hospitality cues; “Signal studio” 0.04 — high-contrast charcoal with electric cyan. Chosen: **Quiet enterprise**.

- Design movement: editorial B2B SaaS with service-design warmth, closer to Linear/Stripe clarity than consumer AI futurism.
- Core principles: calm authority, high scanability, human handoff, and honest system states.
- Color philosophy: ink navy communicates reliability; mist backgrounds keep the service approachable; teal is reserved for moments of progress and trust; amber flags review-required work rather than pretending everything is live.
- Layout paradigm: asymmetric split sections and a left-rail “signal” motif create movement without relying on a centered card grid.
- Signature elements: thin signal-line rules, compact status chips, and a “human in the loop” badge language shared across marketing and portal screens.
- Interaction philosophy: every CTA explains the next step; every preview state labels whether it is sample, proposed, connected, or not configured.
- Animation: short 180–280ms fades/slides, gentle signal pulse in the demo only, and no distracting perpetual motion.
- Typography: Plus Jakarta Sans for display and body with a compact mono accent for statuses and metrics; 700/800 display weight, 500 navigation, 400 readable body.
- Brand essence: managed AI reception for busy operators who want the outcome, not another tool to configure. Personality: calm, capable, candid.
- Brand voice: direct, practical, reassuring. Example lines: “Your calls are handled. Your team stays focused.” and “We build the receptionist around the way your business already works.”
- Wordmark/logo: a rounded “C” formed by two offset signal arcs, paired with a compact wordmark; use a small signal mark in navigation and the full wordmark in the footer.
- Signature brand color: Harbor Teal `#0F766E`.

## Project structure
- `client/src/App.tsx`: route map and app providers.
- `client/src/components/`: site shell, navigation, reusable cards, status and data-display primitives.
- `client/src/pages/`: public marketing pages plus customer and admin workspace screens.
- `client/src/data/`: honest seed content for demo states, pricing, industries, blog, and help center.
- `client/src/index.css`: design tokens, typography, responsive utilities, animation rules.
- `server/routers.ts`: tRPC surface for auth, onboarding, customer requests, tickets, and admin workflows.
- `server/db.ts`: typed persistence helpers and tenant-safe query boundaries.
- `drizzle/schema.ts` and `drizzle/`: relational schema and migrations.
- `public/manus-routes.json`: complete page route manifest for Preview and SEO tooling.
- `README.md` / `.env.example`: operating, deployment, email, payment, and provider setup notes.

## Material constraints and safeguards
- Do not fabricate testimonials, customer metrics, live call data, provider integrations, contact details, credentials, or compliance claims.
- Usage allowances and overage values are labeled “configurable placeholder” until reseller/telephony costs are verified.
- Legal content is an editable initial draft and marked for professional review.
- Customer-facing configuration changes are proposals, not live agent mutations, unless a verified API integration is configured.
- Use relative browser URLs and preserve Preview cookie/session behavior from the starter.
