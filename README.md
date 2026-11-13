# Star69AI

**Star69AI** is a managed AI receptionist service for local service businesses. We configure, customize, test and maintain AI phone receptionists so business owners do not have to learn another software platform or build call flows themselves.

- **Website:** [https://star69ai.com](https://star69ai.com)
- **Demo request:** [Request a custom demo](https://star69ai.com/get-started.html)
- **Repository:** [hisjarman/star69ai](https://github.com/hisjarman/star69ai)
- **Founder:** Solomon Jarman
- **Business/operator disclosure:** SIMIAPP CLOUD

## What Star69AI provides

The managed service is designed for local-service businesses such as roofing, plumbing, HVAC, general contracting, cleaning, automotive services and real estate.

Depending on the client's configured agent and integrations, the receptionist can:
- Answer incoming calls around the clock.
- Respond to approved business FAQs.
- Capture caller details and qualify leads.
- Help with appointment requests and scheduling workflows.
- Route or escalate calls according to the client's instructions.
- Provide call summaries and related call activity in the client portal.

Star69AI handles agent configuration, call-flow customization, phone setup, testing, ongoing maintenance and support. Features depend on the selected plan, customer configuration and third-party provider capabilities.

## Plans and published pricing

| Plan | Monthly subscription | Included voice minutes | Overage rate |
|---|---:|---:|---:|
| Starter | $149/month | 300 | $0.49/minute |
| Growth | $249/month | 600 | $0.39/minute |
| Pro | $399/month | 1,000 | $0.29/minute |

A **$99 one-time setup fee** is invoiced separately. Annual billing may have different setup-fee terms as displayed at checkout or in the current offer.

**Billing implementation note:** The plan prices and overage rates above are published offer details. Automatic Stripe metered overage billing must not be represented as active until Stripe meter reporting, usage reconciliation, rounding rules and end-to-end billing tests have been implemented and verified. Any portal usage estimate must be clearly identified as an estimate.

## Website and repository structure

The public website is a static site published from the repository root through GitHub Pages using the custom domain in `CNAME`.

- Root HTML/CSS/JavaScript — public marketing website and content.
- `client/` — customer portal frontend.
- `admin/` — agency administration frontend.
- `cloudflare/platform-worker.js` — customer/admin API, authentication, billing and voice-provider integration.
- `cloudflare/trust-lab-worker.js` — separate Trust Lab, contact, newsletter and partner workflows.
- `cloudflare/schema.sql` and `cloudflare/migrations/` — D1 schema and migrations.
- `docs/` — implementation notes and technical documentation.
- `project-context/PROJECT_HANDOFF.md` — current product decisions, architecture notes, known limitations and development rules.

## Production architecture

| Component | Responsibility |
|---|---|
| GitHub Pages | Hosts the public Star69AI website, customer portal and admin frontend |
| Cloudflare Workers | Runs the API and server-side integrations |
| Cloudflare D1 | Stores application, customer, call, support and Trust Lab data |
| Clerk | Customer and administrator authentication; authorization is also enforced server-side |
| Voice AI provider | Configured voice agents, phone numbers, call events and call analysis |
| Stripe | Subscription checkout, customer billing portal and webhook-driven subscription state |
| Formspree | Receives the public demo/discovery form |
| Resend | Sends branded transactional emails from the verified Star69AI domain |

The production custom domain is `star69ai.com`. The platform Worker has been documented at `https://avr-platform-api.hisjarman.workers.dev`; the separate Trust Lab Worker remains independent. Confirm live Worker routes and bindings before changing deployment configuration.

## Demo request form

The public discovery form uses the existing Formspree endpoint:

```text
https://formspree.io/f/mrppjqdb
```

The form collects business and contact details so the team can prepare and respond to a demo request. It does not create a customer account or activate a paid subscription. The form submission code now uses a native browser POST rather than a cross-origin JavaScript `fetch()` request to avoid the browser fetch/CORS failure previously reported on mobile. A successful live Formspree delivery still requires an end-to-end test.

## Email identity

- Website: `https://star69ai.com`
- General email: `hello@star69ai.com`
- Support/reply-to: `support@star69ai.com`
- Administrative notifications: configured privately for the operator

Outgoing transactional email templates use Star69AI branding. API keys, signing secrets and other credentials must remain in provider secret stores and must never be committed to this repository.

## Development and deployment

1. Work on a feature or fix branch; inspect the current source and project handoff before changing behavior.
2. Preserve the existing GitHub Pages root layout, custom domain, client login/navigation, Formspree form, Trust Lab and partner workflows.
3. Use GitHub Pages for static hosting and Cloudflare Workers/D1 for backend services. **Do not introduce Render or restore obsolete Manus deployment paths.**
4. Keep secrets out of source code, commits, issues and public frontend configuration.
5. Test mobile and desktop layouts, form submission, navigation, authentication boundaries, tenant isolation and relevant integrations.
6. Deploy Worker code separately from GitHub Pages. SQL migrations must be applied explicitly; a website commit does not deploy a Worker or apply a database migration.
7. Never describe a feature as live, billable or production-ready unless its deployment and end-to-end behavior have been verified.

## Security and operational checklist

Before onboarding paying customers, verify:
- Clerk frontend keys and Worker issuer refer to the same production Clerk instance.
- Worker secrets and allowed origins are configured in Cloudflare.
- Admin access and customer-to-customer data isolation are enforced server-side.
- Stripe products, price IDs, customer portal settings and signed webhooks are configured and tested.
- Voice-provider webhooks validate signatures, deduplicate events and associate calls with the correct customer.
- D1 migrations required by the deployed Worker have been applied.
- Recording consent, access, retention, deletion and applicable privacy obligations are addressed.
- Automatic usage/overage billing is not enabled or advertised as automatic until the metering implementation is complete and tested.
- The Formspree demo form is tested with a real submission and the request is received by the intended inbox.

See [project context and handoff](project-context/PROJECT_HANDOFF.md) for the latest implementation notes and open work. All new pages and substantial edits must also follow [Star69AI Design, Readability & Content Standards](docs/STAR69AI_DESIGN_CONTENT_STANDARDS.md). The [Industry Agent Configuration & QA Playbooks](docs/INDUSTRY_AGENT_CONFIGURATION_PLAYBOOKS.md) define the reusable client setup, safety boundaries, test suite and launch approval gates. The five public legal documents share `legal.css` for consistent, high-contrast presentation.

## Intellectual property

This repository contains proprietary Star69AI software and original materials. See [LICENSE](LICENSE). Third-party libraries, frameworks, services and assets remain subject to their respective terms and licenses.


## Partner program

- Public applications: [Star69AI Partner Program](https://star69ai.com/partners/).
- Partner self-service: [Partner Center](https://star69ai.com/partner-portal/).
- Private administration: `/partners-admin.html`.
- First-party referral tracking and commission accounting use Cloudflare Workers/D1 and Stripe; Systeme.io is not required.
- The partner portal source and D1 migration are under review on `feature/star69ai-partner-portal`. Referral tracking and Stripe commission processing are not production-active until the PR is approved, the D1 migration is applied, both Workers are deployed, and signed webhook tests pass.
