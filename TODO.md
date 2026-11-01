# CallPilot AI delivery tasks

## 1. Public brand shell and route coverage
- [ ] Build the CallPilot AI responsive shell with original premium SaaS styling, dark navy/charcoal text, white surfaces, restrained teal/blue accents, generous whitespace, rounded cards, subtle shadows, readable accessible typography, mobile navigation, and a consistent footer.
- [ ] Add working routes and navigation for Home, Features, How It Works, Pricing, About, Contact, Blog, Help Center, Terms, Privacy, Cookie Policy, AI Disclosure, Acceptable Use, Cancellation & Refund, Third-Party Service Disclosure, eight industry pages (plumber, HVAC, roofer, contractor, salon, real estate, auto repair, cleaning), customer login/onboarding/workspace, and admin workspace.
- [ ] Add `public/manus-routes.json`, semantic metadata, canonical/OG data, sitemap/robots handling, and conversion-event hooks without personal information.

## 2. Conversion-focused marketing and honest demo
- [ ] Plan CTAs must open a discovery form rather than instant checkout; the form collects contact, business, call-volume, service, phone-setup, caller-question, and workflow information, requires separate contact/privacy acknowledgements, and clearly states that no payment is collected.
- [ ] After a discovery request, the owner can review the brief, build a personalized demo, mark the demo as approved only after client approval, store a secure hosted payment-link reference, and move the request through New, Under Review, Needs Information, Demo Approved, Payment Link Sent, Converted, Declined, or Archived without claiming that payment or deployment happened when it did not.
- [ ] Home includes the exact requested hero headline/supporting promise, “Get Your AI Receptionist” and “See How It Works” CTAs, fictional demo call flow, benefits, “We Build It for You”, industry cards, three-step process, pricing preview, FAQ, and final CTA.
- [ ] Features distinguishes immediately available, provider-dependent, and setup-required capabilities; never advertises unsupported features as operational.
- [ ] How It Works explains the managed-service workflow from business questions through manual configuration, testing, approval, telephony setup, deployment, and ongoing changes; make clear customers do not manage prompts or infrastructure.
- [ ] Pricing includes Launch $39/month, Growth $79/month, Pro $129/month, and Custom with comparison, managed-service framing, configurable allowances/overages/onboarding fees, and no invented unlimited claims.
- [ ] Demo is clearly labeled fictional/simulated and does not look like a real customer call; metrics use empty states until connected.
- [ ] No fabricated testimonials, awards, credentials, office history, contact information, revenue claims, or compliance certifications.

## 3. Authentication, tenant model, and onboarding
- [ ] Preserve Manus OAuth-compatible application sessions and server-side role checks; support login/logout, account profile, business profile, customer/admin roles, and organization data isolation.
- [ ] Require explicit acceptance before account registration continues: Terms of Service and Privacy Policy are separate linked documents, unchecked by default, and the current document versions are recorded server-side.
- [ ] Build save-and-resume onboarding with progress, validation, review, and the ten requested steps: business info; hours/contact; personality; services/FAQs; call handling; lead capture; appointment handling; integrations/notifications; phone setup; plan/review/disclosures.
- [ ] FAQs are dynamic add/edit/delete; booking captures a request when no verified calendar integration exists; third-party passwords are never collected; phone routing is never changed automatically.
- [ ] Submission creates private status “Awaiting Review” and displays: “Your setup information has been received. We will review your requirements, configure your AI receptionist, and contact you if anything needs clarification.” It must not claim the agent is live before deployment.

## 4. Customer workspace
- [ ] Overview shows plan, subscription, setup progress, deployment status, pending actions, tickets, change requests, and real provider metrics only when available.
- [ ] Customers can view the last approved configuration and submit proposed changes for hours, greetings, FAQs, services, lead fields, call handling, escalation, booking, and notifications; changes are not pushed to a live agent without a verified API.
- [ ] Track requested change, submitted date, status, administrator response, approval, and completion date with Draft, Submitted, Under Review, Awaiting Customer Information, Approved, In Progress, Testing, Completed, and Rejected statuses.
- [ ] Include testing/approval with genuine results only, sample conversation/config review, customer scenarios, approval, and correction requests.
- [ ] Calls/reports and billing use real connected data only; otherwise show useful empty states and unconfigured integration notes.
- [ ] Support tickets include category, priority, description, attachments, replies, status, history, and related help articles.

## 5. Administrator back office
- [ ] Secure admin-only overview shows customers, new submissions, review queue, configuration/deployment status, live customers, tickets, change requests, and subscription status.
- [ ] Customer detail supports onboarding answers, FAQs/rules, internal notes, status, assignee, clarification requests, approved configuration, provider agent ID/non-secret identifiers, testing notes, and go-live notes.
- [ ] Manual fulfillment checklist tracks review onboarding, plan/payment, requirements, provider configuration, voice/prompt/FAQ/call flows, testing/results, preview, customer approval, phone routing, deployment confirmation, and Live status.
- [ ] Change-request inbox supports diff review, follow-up questions, approve/reject, in-progress, provider notes, test attachments, complete, and customer notification.
- [ ] Support queue includes assignment, priority, status, internal notes, customer replies, notification triggers, and history.
- [ ] Admin content settings manage plans/prices/allowances/overages/setup fees/discounts/features, industry/blog/help/FAQ content, contact settings, legal drafts, and homepage CTAs.
- [ ] Unit-economics screen accepts wholesale/platform/telephony costs, estimates calls/duration/usage/phone charges, calculates `(revenue - direct service costs) / revenue * 100`, and warns below a configurable margin threshold; internal costs are never customer-visible.
- [ ] Audit important account, role, subscription, configuration, agent-status, support, and admin-content actions; never store secrets in notes/logs.

## 6. Persistence, integrations, and security
- [ ] Add normalized Drizzle tables for users, organizations, memberships, locations, onboarding, approved/proposed configurations, agents/provider references, deployment tasks, test scenarios/results, call records, support tickets/replies, subscriptions, invoices/payment refs, blog, help articles, email records, demo requests, versioned legal consents, consent preferences, and audit logs.
- [ ] Add migrations, indexes, timestamps, status enums, validation, tenant-safe query helpers, rate limiting, CSRF/XSS/injection defenses, secure upload validation, secrets management, consent/retention, export/deletion workflows, and backup/recovery documentation.
- [ ] At demo intake, require a contact-consent checkbox and notice-at-collection link; keep optional marketing consent separate and off by default. At onboarding/order submission, require separate acceptance of Terms, Privacy/data processing, AI/third-party/call disclosure, and authority to provide business/customer data.
- [ ] Preserve an immutable acceptance record containing user or lead identity, organization when known, document key/version/hash, consent type, source flow, timestamp, and request context subject to the disclosed retention policy. Material document changes require re-acceptance; never overwrite prior acceptance.
- [ ] Provider abstraction supports manual operation without a public API and only implements verified API capabilities later; no invented endpoints or automatic synchronization claims.
- [ ] Payment integration is hosted/tokenized and webhook-safe when configured; browser success pages cannot activate service; audited admin override exists for testing/corrections.
- [ ] Transactional email templates cover verification/reset, onboarding, setup status, approvals, changes, support, billing, and cancellation; absent credentials show a safe development fallback and never pretend delivery.
- [ ] Deliver `.env.example`, setup/deployment/customer/admin instructions, and an explicit operational-vs-unconfigured integration list.

## 7. Validation and delivery
- [ ] Run typecheck/build and resolve actionable diagnostics.
- [ ] Verify route manifest returns HTTP 200 JSON and matches source routes.
- [ ] Verify the public app is responsive on desktop/mobile layouts and all primary CTAs navigate to their intended destination.
- [ ] Check empty states, form validation, legal-review warnings, and honest unconfigured integration messaging.
- [ ] Checkpoint the completed project and publish only when the project’s configured publishing policy allows it.
