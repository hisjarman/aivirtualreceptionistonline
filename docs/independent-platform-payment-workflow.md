# Independent Platform Implementation Plan

## Product decisions
- Remove all Manus runtime, authentication, preview, and deployment dependencies.
- Customer authentication: Google OAuth 2.0 Authorization Code flow handled by the server.
- Sessions: signed, secure, HTTP-only, SameSite cookies; never store provider tokens in browser storage.
- Payments: PayPal Checkout Orders for the one-time setup payment and PayPal Subscriptions for recurring monthly billing.
- Voice: Retell AI, with one production agent per paying customer and a separate demo agent/configuration.
- Email: Resend (or another explicitly configured transactional email provider).
- Preserve the existing MySQL/Drizzle data model where appropriate.

## Customer acquisition and activation workflow
1. Visitor submits the all-industry onboarding form and creates/signs into an account using Google.
2. Submission is saved as a lead/request. No payment is collected at this stage.
3. Admin reviews requirements, configures a dedicated Retell demo agent and demo phone number, and sends the customer demo access.
4. Customer tests the demo and can submit requested changes.
5. Customer explicitly approves the demo. Approval is timestamped and recorded; it does not itself activate production service.
6. Admin issues a PayPal payment request for the one-time USD $99 setup fee.
7. After the PayPal webhook is verified and the setup order is confirmed as paid, the customer is sent to authorize the selected recurring monthly PayPal subscription.
8. Production activation is allowed only after both conditions are met: setup fee order is verified as completed/paid; recurring subscription is verified as active (or its documented approval/activation state has been confirmed server-side).
9. Admin completes production provisioning: assign the production Retell agent/number, configure forwarding/routing, test, and mark the service active.
10. Customer dashboard displays demo approval, setup payment, subscription, provisioning, and service statuses.

## Payment rules
- Setup fee: one-time USD $99, charged only after demo approval.
- Monthly recurring plan: selected by customer from the existing published plans; store the PayPal plan ID server-side.
- Do not trust browser redirects as proof of payment.
- Verify PayPal webhook signatures and fetch/verify order or subscription state with PayPal server-side before updating records.
- Store PayPal order ID, subscription ID, plan ID, currency, amount, status, event IDs, timestamps, and relevant audit history.
- Make webhook processing idempotent; duplicate events must not duplicate charges, invoices, or activations.
- Handle failed, cancelled, suspended, refunded, and disputed payments. Suspend or flag service according to an explicit admin policy; do not silently delete customer data.
- Clearly disclose that the $99 setup fee is separate from the monthly subscription, and publish the refund/cancellation policy before checkout.
- Confirm PayPal account eligibility, live API access, and recurring subscription support for the merchant's registered country before production launch.

## Security and tenant isolation
- Google identity is matched by verified Google subject (sub), not by email alone.
- Never accept client-supplied organization IDs as authorization. Resolve accessible organizations from the authenticated user's memberships on the server.
- Admin access is assigned only by trusted server-side provisioning; never from user-submitted profile data.
- Keep Google, PayPal, Retell, and email credentials in deployment secrets. Never commit credentials or return them to the browser.
- Verify OAuth state/PKCE, use secure session cookies, rotate secrets, rate-limit auth/payment endpoints, and log security-sensitive actions.
- Verify Retell and PayPal webhooks before processing.
- Test cross-tenant access for calls, transcripts, recordings, settings, invoices, and change requests.

## Manus removal checklist
- Replace Manus OAuth/token exchange and user-info lookup with Google OAuth.
- Replace Manus JWT/session identity and cookie/storage assumptions with application-owned sessions.
- Remove Manus preview auto-login and browser sessionStorage bearer-token logic.
- Remove Manus-specific frontend SDK/hooks, environment variables, URLs, and branding where present.
- Remove Manus-only Vite debug collector and preview host allowlists.
- Remove Manus-specific server routes, scheduled-job identity paths, and deployment assumptions after identifying any required replacement.
- Update package dependencies, environment examples, README, and deployment configuration.
- Search the complete repository for remaining Manus references and classify each before removal.

## Release gates
- A clean install and production build pass.
- Google sign-in, sign-out, session expiry, and account linking are tested.
- Demo approval and $99 setup payment are tested in PayPal sandbox.
- Monthly subscription creation, cancellation, failed payment, and webhook replay are tested.
- Retell webhook signatures and call-to-customer association are tested.
- Tenant-isolation and admin authorization tests pass.
- No production secrets are present in Git history or client bundles.

## Customer-facing service catalogue

The website must describe capabilities accurately. Distinguish standard included features, optional features that require setup/approval, and items that depend on the customer's phone carrier, country, CRM, or external account.

### Standard managed receptionist service (subject to selected plan)
- Dedicated AI receptionist configured for the customer's business, industry, services, FAQs, service area, business hours, and call-handling rules.
- Inbound call answering on a Retell-managed number or an approved/imported customer number.
- Custom greeting, business identity, voice, language, and escalation instructions.
- Lead capture: caller name, callback number, reason for calling, service requested, location, urgency, and preferred callback time.
- Structured call summaries and outcomes; call history and usage in the customer dashboard.
- Call transfer to designated staff/numbers when configured and supported.
- After-hours, overflow, unavailable-staff, and fallback handling.
- Knowledge base built from customer-provided text, documents, and approved website URLs.
- Admin-managed updates and customer change requests.
- Call recording/transcription only when enabled, legally appropriate, and disclosed; retention and access settings must be configurable.

Do not advertise every feature as included in every price tier until plan entitlements, usage allowances, and overage rules are finalized.

### Optional services customers can request
1. **Dedicated phone number**: request a new Retell number, preferred country/area code, or port/import an existing number. Number availability, regulatory requirements, and charges must be confirmed by admin.
2. **Existing-number connection**: request routing/forwarding or SIP/Twilio/Telnyx/Vonage integration. Collect provider, account owner, number, current routing, and whether they can edit carrier settings. Never collect provider passwords.
3. **Outbound calling**: request callback campaigns, appointment confirmations, lead follow-up, or other outbound use cases. Admin approval required; collect purpose, countries, caller-ID number, expected volume, calling hours/time zone, consent source, opt-out/DNC process, and sample script. Do not enable automated outbound campaigns by default.
4. **SMS and two-way texting**: request missed-call text-back, appointment reminders, links, or two-way text. Collect sending number, countries, message examples, opt-in language/source, opt-out handling, and expected monthly volume. SMS requires carrier/provider capability and applicable registration/approval; do not promise it is available on every number/country.
5. **Appointment booking**: request calendar connection and booking rules. Collect calendar provider, calendar owner, timezone, appointment types/durations, buffers, working hours, lead time, cancellation/reschedule rules, and whether the agent may book, reschedule, or cancel.
6. **CRM integration**: request HubSpot, Salesforce, GoHighLevel, Zoho, Zendesk, or custom API integration. Collect CRM, desired read/write actions, fields, pipeline/stage, owner, and authorization contact. Connect OAuth or scoped credentials securely; never ask customers to submit passwords in a form.
7. **Website chat / callback widget**: request text chat, web voice, or callback widget. Collect website URL, desired widget type, placement, brand colors, and domain administrator contact.
8. **Verified phone number (U.S. numbers)**: request Retell's verified-number service. Requires a completed business profile and review; do not guarantee approval or spam-label removal.
9. **Branded calling (U.S. numbers)**: request branded caller ID. Requires business profile and carrier/vendor approval; collect exact legal business name and requested display name. Do not guarantee approval or display on every carrier/device.
10. **Multiple locations/departments**: request location-specific greetings, hours, routing, numbers, service areas, and reporting.
11. **Multilingual receptionist**: request languages and language-selection behavior. Confirm supported speech recognition and voice provider compatibility before accepting.
12. **Custom workflows**: request dispatch, estimate intake, emergency escalation, payment link delivery, ticket creation, or other API workflow. Require written scope and admin feasibility review.
13. **Call analytics / QA**: request custom extracted fields, lead scoring, call-quality metrics, and reporting.
14. **Data retention / privacy configuration**: request retention duration, recording disablement, transcript restrictions, or sensitive-data handling. Admin must confirm what Retell settings and legal requirements permit.

### Business profile and caller-ID application intake
The Retell business profile screen shown in the supplied screenshot includes business name, business type, industry, registration ID type, and further identity/business details. Build a separate optional request form for this process. Collect:
- Legal business name and public-facing/DBA name.
- Business type/entity type and industry.
- Country of registration and operating country.
- Registration identifier type and value (e.g. EIN, company number, VAT number, DUNS, or Other) only where required.
- Registered business address, website, business contact name, email, and phone.
- Requested phone number(s), country, and caller-ID service requested (verified number, branded calling, or both).
- Upload fields for required proof documents only when the provider application requires them; restrict access, encrypt at rest, set retention/deletion rules, and never expose documents in the customer-facing public area.
- Explicit authorization for AIVirtualReceptionist to submit the application on the business's behalf.
- Status values: not requested, awaiting customer information, submitted, under review, approved, rejected, resubmission required, cancelled.

Avoid collecting tax IDs or government registration numbers in the general onboarding form. Collect them only in the secure optional application workflow when necessary.

## Onboarding and admin processing forms

### Form A — Request a demo (public / Google-authenticated)
Required:
- Contact name, business name, email, phone, country, timezone.
- Industry (select plus Other), website (optional), service area.
- Business hours and after-hours instructions.
- Services/products offered and common caller reasons.
- Main call goals: capture leads, answer FAQs, route calls, book appointments, emergency triage, take messages, other.
- Existing phone setup: current business number, carrier/provider, desired approach (new number, forward existing, SIP/custom, undecided).
- Human transfer destination and escalation hours.
- Frequently asked questions and answers, or upload/link for later review.
- Expected monthly call volume and busiest hours.
- Preferred language(s), voice style, and pronunciation notes.
- Consent to be contacted and acknowledgment of privacy/call-recording disclosures.

### Form B — Optional feature request (customer dashboard)
- Multi-select feature categories from the optional services list.
- For each selected feature, reveal only its relevant fields.
- Desired launch date, business impact/priority, special requirements, attachments.
- Checkbox confirming request is not active until reviewed, priced if applicable, and approved.
- Status timeline: submitted, needs information, quoted, awaiting customer approval, approved, in progress, testing, completed, declined.

### Form C — Demo approval
- Demo version/phone number being approved.
- Customer test checklist: greeting, business facts, lead capture, transfer, after-hours, FAQs, pronunciation.
- Approve demo or request changes.
- Customer name, timestamp, terms acknowledgement.
- Approval freezes the demo scope used to generate the $99 setup invoice/order; material scope changes may require a revised quote.

### Form D — Admin setup worksheet
- Organization/customer and approved submission.
- Demo and production agent IDs, agent type, version/tag, knowledge base IDs.
- Retell phone number ID, E.164 number, country, inbound/outbound agent assignment.
- Call routing, transfer destinations, business hours, timezone, fallback number.
- Dynamic variables and metadata schema.
- Post-call extraction schema (lead name, phone, email, intent, service, location, urgency, appointment request, outcome, summary).
- Webhook URL and signing/verification configuration status.
- Optional integrations and external connection status.
- Test cases, test results, reviewer, approval and go-live timestamps.
- Never expose API keys or webhook secrets in this worksheet.

## Customer dashboard requirements
- Overview cards: service state, assigned number, current plan, setup-fee status, subscription status, calls this month, minutes/usage, open requests.
- Call history with filters, call time, duration, inbound/outbound, status, outcome, summary, extracted lead fields, transcript and recording access subject to retention/privacy settings.
- Leads/contact list with export where permitted.
- Business profile and editable operating details, with changes submitted for admin approval where they affect the live agent.
- Knowledge base sources and update requests; do not let unreviewed changes silently publish.
- Demo test and approval panel.
- Optional services catalogue and request forms.
- Support tickets and modification requests.
- Billing page: $99 one-time setup fee, monthly subscription, invoices/receipts, payment status, cancellation request.
- Clear usage and overage information before a customer reaches a billable threshold.
- No direct access to Retell API keys, workspace credentials, or other customers' records.

## Admin console requirements
- Lead/demo pipeline with status, assignment, notes, and next action.
- Review each submission and request missing information.
- Create/assign demo and production agents and phone numbers; store Retell resource IDs.
- Review demo changes and approval.
- Create setup-fee payment request and monthly subscription checkout only after demo approval.
- Process optional-service requests with estimate, pass-through costs, customer approval, and completion status.
- Configure business profile, verified-number, and branded-calling applications.
- Monitor webhook health, failed events, call ingestion, Retell usage, customer usage, and cost/margin.
- Suspend/reactivate service with reason and audit log.
- View customer records only under admin permissions; all actions audited.
- Configure plans, entitlements, setup fee, optional-service prices, and usage limits without code changes.

## Retell integration architecture and implementation knowledge

Use the official Retell documentation and API as the source of truth. The docs index is https://docs.retellai.com/llms.txt. Core implementation areas:

1. **Agent lifecycle**: create a base agent template per use case; create a customer-specific agent from approved business data; use draft versions and publish only after testing. Store provider agent IDs and version IDs per tenant. Keep demo and production agents distinct where practical.
2. **Agent types**: support single-prompt agents for straightforward receptionist workflows and conversation-flow agents when deterministic routing/branching is needed. Do not force every customer onto a conversation flow.
3. **Dynamic variables**: pass tenant-specific business name, hours, service area, transfer number, and other approved values through per-call dynamic variables or metadata. Never depend on a global prompt being manually edited between demos.
4. **Knowledge base**: create and attach tenant-specific knowledge sources (approved URLs, files, text); track indexing state and source ownership. Avoid cross-tenant knowledge-base reuse unless content is intentionally shared and sanitized.
5. **Phone numbers**: create/buy or import numbers; bind inbound and outbound agent IDs explicitly. Store Retell phone-number ID and E.164 value. Test inbound, outbound, transfer, and fallback separately. Buying/importing numbers and enabling outbound are admin-approved actions.
6. **Inbound webhook**: use only where dynamic agent selection or per-call context is required. Authenticate the request and resolve the called number to a server-side tenant mapping; do not trust arbitrary tenant IDs from the payload.
7. **Call webhooks**: receive call_started, call_ended, and call_analyzed events. Verify X-Retell-Signature against the raw request body using the official SDK/helper or documented method. Make ingestion idempotent and tolerate retries/out-of-order delivery. Store provider call ID, agent/number IDs, timestamps, direction, duration, status, transcript, recording URL/reference, analysis, extraction fields, cost fields where available, and tenant mapping.
8. **Post-call extraction**: define structured fields for lead capture and outcome reporting. Use call_analyzed data or retrieve call details via API; do not parse transcripts alone when structured extraction is available.
9. **Call detail and recording security**: fetch details via Get Call when needed; honor Retell data-storage and retention controls. If using signed secure URLs, do not cache or expose permanent recording URLs. Authorize every recording/transcript request against the owning organization.
10. **Transfers and tools**: configure transfer-call or conversation-flow call-transfer nodes for staff escalation. Add custom functions or integrations only after the business has authorized the action and required credentials are connected.
11. **SMS**: Retell docs describe SMS tools/nodes and SMS-enabled numbers; Twilio/SMS campaign requirements may apply. Separate voice service from SMS add-on and confirm country/number compatibility.
12. **Testing**: use LLM Playground, simulation tests, batch tests, web calls, and real phone calls. Create standard test suites for greeting, FAQs, lead capture, invalid requests, interruptions, background noise, transfer, after-hours, voicemail, language, and safety boundaries.
13. **Reliability and monitoring**: track latency, call connection failures, concurrency, webhook failures, agent errors, usage/cost, and alerts. Configure fallback/backup behavior for inbound call concurrency and outages.
14. **Security**: use a dedicated Retell API key with least-privilege scopes, store it only in server secrets, rotate it, and use a separate webhook signing secret. Restrict public keys/domains if web calls or widgets are enabled. Apply rate limits and destination-country restrictions to outbound calling to prevent fraud.
15. **Version control**: publish a tested agent version; preserve prior versions and record which version handled each call. Use staging/demo before production rollout.
16. **Privacy**: set data storage and retention intentionally; decide whether recordings, transcripts, caller IDs, dynamic variables, and logs are stored. Provide disclosures and customer controls, and avoid promising that deletion in the website automatically deletes provider data unless both systems are synchronized.

## Official Retell documentation map

- Docs index: https://docs.retellai.com/llms.txt
- Agent build overview: https://docs.retellai.com/build/overview
- Prompt engineering: https://docs.retellai.com/build/prompt-engineering-guide
- Conversation flows: https://docs.retellai.com/build/conversation-flow/overview
- Dynamic variables: https://docs.retellai.com/build/dynamic-variables
- Knowledge bases: https://docs.retellai.com/build/knowledge-base
- Function calling: https://docs.retellai.com/build/single-multi-prompt/function-calling
- Transfer calls: https://docs.retellai.com/build/single-multi-prompt/transfer-call
- Phone number purchase: https://docs.retellai.com/deploy/purchase-number
- Inbound calls: https://docs.retellai.com/deploy/inbound-call
- Outbound calls: https://docs.retellai.com/deploy/outbound-call
- SMS: https://docs.retellai.com/deploy/enable-sms
- Business profile: https://docs.retellai.com/build/telephony/business-profile
- Verified phone: https://docs.retellai.com/build/telephony/verified-phone
- Branded calling: https://docs.retellai.com/build/telephony/branded-call
- Webhooks overview: https://docs.retellai.com/features/webhook-overview
- Webhook registration: https://docs.retellai.com/features/register-webhook
- Webhook security: https://docs.retellai.com/features/secure-webhook
- Post-call extraction: https://docs.retellai.com/features/post-call-analysis-overview
- Call history: https://docs.retellai.com/features/session-history
- Privacy and data storage: https://docs.retellai.com/accounts/privacy-disable
- Data retention: https://docs.retellai.com/accounts/data-retention
- API keys: https://docs.retellai.com/accounts/manage-api-keys
- API reference: https://docs.retellai.com/api-references/overview
- Create/update agent: https://docs.retellai.com/api-references/create-agent and https://docs.retellai.com/api-references/update-agent
- Create/update phone number: https://docs.retellai.com/api-references/create-phone-number and https://docs.retellai.com/api-references/update-phone-number
- Call detail/list: https://docs.retellai.com/api-references/get-call and https://docs.retellai.com/api-references/list-calls

## Pricing and disclosure rules
- Display the $99 one-time setup fee separately from recurring monthly plan prices.
- Treat Retell usage, phone-number rental, SMS, verification, branded calling, integrations, and custom workflows as separate cost components until actual account pricing and plan margins are confirmed.
- Screenshot-observed Retell add-on prices (SMS $20/month + $0.01/SMS; verified U.S. phone $10/month; branded U.S. outbound call $0.01/call) are reference observations only, not hard-coded price guarantees. Admin must be able to edit the sell price and mark availability by country.
- Show customer-facing optional service pricing as "quoted after review" when provider charges, regulatory approvals, or implementation effort are not yet known.
- Do not guarantee business-profile, verified caller ID, branded calling, number availability, SMS, international calling, or carrier-level display/approval.
