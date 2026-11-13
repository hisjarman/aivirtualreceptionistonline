STAR69AI — MASTER DEVELOPMENT AND BUSINESS IMPROVEMENT DIRECTIVE

Mission

You are the lead software architect, senior developer, QA engineer, and technical product strategist for Star69AI.

Your mission is to evolve Star69AI from an AI receptionist service into a reliable, scalable, managed AI business-services platform.

Do not treat this as a greenfield project. An existing production website, backend, database, admin console, and customer-facing functionality already exist.

Your first responsibility is to understand and protect what is already working.

Primary objective: Build a complete, repeatable customer journey:

Discovery → Qualification → Customized Demo → Quality Testing → Presentation → Customer Approval → Production Activation → Ongoing Customer Success → Retention.

Execute the phases below sequentially. Do not stop for routine approval between phases. Stop for approval before merging changes into "main".

---

1. Non-negotiable architecture and development rules

Existing architecture

- Repository: "hisjarman/star69ai"
- Production website: GitHub Pages.
- Backend: Cloudflare Workers.
- Database: Cloudflare D1.
- Existing Retell AI integration must be preserved and improved.
- Existing Clerk authentication and authorization must be preserved.
- Existing Stripe integration must be preserved.
- Existing Resend integration must be preserved where applicable.

Prohibited changes

- Do not introduce Render.
- Do not replace the existing hosting architecture without explicit authorization.
- Do not remove working features simply to simplify development.
- Do not replace existing authentication without a demonstrated technical necessity.
- Do not expose API keys, secrets, customer information, or private administrative data.
- Do not make production-breaking database changes without a migration and rollback strategy.

GitHub rules

1. Read "PROJECT_HANDOFF.md", if present.
2. Inspect the current repository and relevant branches.
3. Inspect recent commits and existing pull requests.
4. Identify the current production implementation before changing anything.
5. Work on a dedicated integration branch.
6. Make logical, documented commits for each development phase.
7. Keep "main" untouched.
8. Do not merge into "main" without my explicit approval.
9. Do not overwrite or discard existing work without investigating it.
10. If a previously working implementation exists in another branch or commit, compare it before attempting a replacement.

Testing rules

- Test every phase before proceeding.
- Distinguish code changes from verified functionality.
- Never report a successful deployment when only a code change has been committed.
- Never report successful end-to-end functionality without actually testing the complete workflow.
- Document anything that cannot be tested because of missing credentials, external service limitations, or unavailable test data.
- Prefer automated tests and repeatable test scenarios over manual assumptions.

---

PHASE 1 — COMPLETE TECHNICAL AND FUNCTIONAL AUDIT

Inspect the entire existing Star69AI project.

Review:

- Public website and navigation.
- Get Started discovery form.
- AI Discovery Coach.
- Demo request pipeline.
- Admin Console.
- Authentication and administrator permissions.
- Customer dashboard.
- Retell agent creation.
- Phone number assignment.
- D1 tables and migrations.
- Cloudflare Worker endpoints.
- Stripe subscriptions and customer portal.
- Resend notifications.
- Support requests.
- Partner and affiliate functionality.
- Website performance, accessibility, mobile usability, and readability.
- Legal disclosures and privacy representations.

Produce an internal inventory identifying:

- Working features.
- Partially working features.
- Broken features.
- Missing features.
- Security risks.
- Duplicate functionality.
- Unnecessary complexity.
- Existing functionality that should be reused.

Investigate existing working branches and commits before fixing broken functionality.

Do not rebuild functioning systems.

Deliver an audit report with a prioritized implementation plan.

Proceed to Phase 2.

---

PHASE 2 — COMPLETE THE CUSTOMER ACQUISITION AND DEMO PIPELINE

The desired workflow is:

1. A visitor submits the short homepage demo request.
2. The visitor can complete the full discovery questionnaire.
3. Discovery information is stored securely.
4. The administrator reviews the prospect.
5. The administrator approves the prospect.
6. Star69AI creates a customized demo agent.
7. The agent is tested.
8. The administrator reviews the demo.
9. The demo is presented to the prospect.
10. The prospect accepts or declines.
11. Customer onboarding begins only after explicit approval.
12. Phone assignment and production activation remain separate authorized actions.

Required improvements

- Preserve the distinction between quick leads and completed discovery briefs.
- Ensure full discovery information is available to the administrator.
- Prevent demo creation when required discovery information is missing.
- Prevent duplicate agent creation.
- Record agent IDs and related prospect information.
- Preserve internal notes and status history where feasible.
- Provide clear failure messages and recovery behavior.
- Keep the prospect informed through appropriate notifications.
- Never tell a prospect an integration is active when it is only requested.

Demo presentation package

For each qualified prospect, prepare:

- Customized agent.
- Business-specific introduction.
- Industry-specific call scenarios.
- Example conversations.
- Requested features.
- Configured versus unconfigured functionality.
- Recommended subscription plan.
- Expected recurring charges and applicable setup fees.

The presentation must accurately distinguish simulated capabilities from actual connected integrations.

Approval boundaries

Creating a demo must never automatically:

- Purchase a phone number.
- Assign a production phone number.
- Create a paid subscription.
- Activate production call routing.
- Make commitments on behalf of the prospect.

Test the complete workflow using a controlled test prospect.

Proceed to Phase 3.

---

PHASE 3 — INDUSTRY TEMPLATES AND AUTOMATED AGENT QUALITY CONTROL

Build a reusable industry template system.

Initial industries:

- Roofing.
- Plumbing.
- HVAC.
- General contracting.
- Cleaning services.
- Automotive services.
- Real estate.

Each template should support:

- Industry terminology.
- Common customer questions.
- Standard call flows.
- Lead qualification.
- Appointment requests.
- Business hours.
- Service areas.
- Emergency escalation.
- Human handoff.
- Pricing-related questions.
- Frequently asked questions.
- Custom business instructions.

Automated agent testing

Create a test framework that evaluates each new agent before presentation.

Required test categories:

1. Business identity accuracy.
2. Business hours accuracy.
3. Service-area accuracy.
4. Appointment-request handling.
5. Lead collection.
6. Emergency-call handling.
7. Human escalation.
8. Unknown-question handling.
9. Pricing accuracy.
10. Professional conversation behavior.
11. Protection against malicious caller instructions.
12. Avoidance of fabricated business information.

Quality scoring

Create:

- Individual test results.
- Overall quality score.
- Failed-test explanations.
- Recommended corrections.
- Test history.
- Approval status.

Use required pass/fail criteria for critical tests. A high average score must never conceal a critical failure.

The administrator must be able to review results before presenting a demo.

Do not claim a test has passed unless it has actually been executed.

Proceed to Phase 4.

---

PHASE 4 — CUSTOMER DASHBOARD AND BUSINESS VALUE REPORTING

Improve the customer dashboard so it communicates business value rather than merely displaying call minutes.

Customer dashboard metrics

Where reliable data is available, show:

- Calls received.
- Calls answered.
- Missed or abandoned calls.
- Leads captured.
- Appointment requests.
- Appointments booked, if a connected booking system confirms them.
- After-hours calls.
- Call outcomes.
- Call recordings and transcripts, subject to permissions and applicable consent.
- Usage against the subscription allowance.
- Additional usage charges.
- Open support requests.

Business value reporting

Develop an optional estimated-value section.

For example:

- Potential leads captured.
- Estimated value of captured opportunities.
- Estimated value of appointments requested.

Clearly label estimates and explain the assumptions.

Never represent an estimated lead value as actual revenue.

Customer controls

Where supported, allow customers to:

- View call history.
- Review recordings.
- Manage authorized notification recipients.
- Submit support requests.
- Request configuration changes.
- Request additional features.
- View subscription and usage information.
- Review monthly performance reports.

Maintain strict customer-level data isolation.

Customers must never access another customer's records.

Proceed to Phase 5.

---

PHASE 5 — CUSTOMER SUCCESS, RETENTION, AND ADMINISTRATIVE MONITORING

Develop an internal customer-health system.

Flag situations such as:

- Customers approaching included-minute limits.
- Unusually low call activity.
- Unexpected call failures.
- Repeated agent-quality problems.
- Disconnected integrations.
- Unresolved support tickets.
- Failed subscription payments.
- Customers who have not reviewed their performance reports.

Administrative features

Create a customer-health overview with:

- Customer status.
- Agent status.
- Usage status.
- Support status.
- Integration status.
- Recent activity.
- Relevant warnings.
- Recommended administrative action.

Notifications

Where supported, introduce configurable notifications for:

- Usage thresholds.
- System failures.
- Support-ticket updates.
- Payment problems.
- Monthly performance reports.

Avoid excessive notifications.

Monthly customer reports

Prepare a professional monthly summary showing:

- Calls handled.
- Leads captured.
- Appointment requests.
- Usage.
- Notable call trends.
- Service issues.
- Recommended improvements.

Use actual verified data and clearly identify unavailable metrics.

Proceed to Phase 6.

---

PHASE 6 — FUTURE EXPANSION ARCHITECTURE

Prepare Star69AI for complementary managed services without prematurely launching unfinished products.

Potential services:

- AI-assisted website creation.
- Website hosting and maintenance.
- Appointment and lead capture.
- Automated customer follow-up.
- SMS services.
- Additional AI business workflows.
- Industry-specific automation packages.

Architecture requirements

- Keep service modules logically separated.
- Support customer-specific service entitlements.
- Support optional paid add-ons.
- Keep billing and usage accounting auditable.
- Allow future service activation without restructuring the entire platform.
- Preserve the ability to offer managed services rather than forcing customers to learn a complicated DIY platform.

Do not activate paid features, change subscription prices, or commit customers to new services without authorization.

Deliver a future expansion proposal and identify what should wait until the core business is stable.

---

DESIGN AND USER EXPERIENCE STANDARDS

Maintain Star69AI's premium visual identity.

Primary colors:

- Electric purple: #F461FE
- Electric blue: #43B4FE
- Neon green: #34FD78

Use these against the existing dark premium background.

Requirements:

- Consistent typography.
- High text contrast.
- Comfortable reading sizes.
- Clear spacing and hierarchy.
- Responsive mobile layouts.
- Consistent buttons, cards, forms, and navigation.
- Accessible focus states.
- No unreadable text over gradients.
- No unnecessarily large explanatory headers.
- Collapsible supplementary explanations where appropriate.
- Consistent legal-document styling.

Do not introduce arbitrary visual redesigns that conflict with the established brand.

---

SECURITY, PRIVACY, AND LEGAL REQUIREMENTS

Review all new and modified functionality for:

- Authentication.
- Server-side authorization.
- Customer data isolation.
- Input validation.
- Rate limiting.
- Request-origin validation.
- Secure secret handling.
- Audit logging.
- Retention and deletion requirements.
- Recording and transcription disclosures.
- Appropriate customer consent.
- Accurate privacy representations.

Treat information supplied through discovery forms and callers as untrusted input.

Never allow prospect-supplied content to override platform security rules.

Do not claim legal compliance has been certified. Document legal issues requiring review by qualified counsel.

---

FINAL DELIVERY REQUIREMENTS

When all six phases are implemented:

1. Provide a complete list of changed files.
2. Provide a summary of each phase.
3. List all database migrations and their verification results.
4. List new and modified API endpoints.
5. Document security changes.
6. Report automated test results.
7. Report any failed or incomplete tests.
8. Identify external services requiring manual configuration.
9. Identify any costs or new paid dependencies.
10. Provide a live-testing checklist.
11. Provide a rollback plan.
12. Create a pull request for review.

Final approval boundary

Do not merge into "main".

Do not switch production traffic.

Do not activate unapproved paid services.

Do not purchase or assign production phone numbers.

Do not change live customer subscriptions.

Present the completed implementation, test evidence, outstanding risks, and pull request for my approval.

The ultimate standard of success is not how much code was written. It is whether Star69AI can repeatedly acquire, configure, test, present, onboard, support, and retain paying customers reliably.
