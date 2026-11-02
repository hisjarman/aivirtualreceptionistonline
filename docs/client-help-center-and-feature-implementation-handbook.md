# Customer Help Center and Integration Implementation Handbook

Status: implementation specification and seed content. Provider connections remain disabled until credentials, scopes, tests, and production approval are complete.

## 1. Product support assistant

The customer workspace includes a separate Retell chat agent named AI Customer Success Assistant. It is not the business's inbound receptionist agent. The support agent answers product questions using only published Help Center articles and the authenticated tenant's permitted configuration summary.

### Retell setup

1. Create a dedicated Retell Chat Agent for platform support. Do not reuse a customer's inbound voice agent.
2. Add this Help Center content as the agent's knowledge base. Keep the source of truth in the platform's published help articles and refresh the Retell knowledge base when articles are published.
3. Create a Retell Public Key restricted to the production dashboard domain. The browser receives only this public key and the Chat Agent ID.
4. Store RETELL_SUPPORT_PUBLIC_KEY, RETELL_SUPPORT_CHAT_AGENT_ID, and optional RETELL_SUPPORT_AGENT_VERSION as hosting environment variables. Never expose RETELL_API_KEY or webhook signing secrets.
5. Test answers about onboarding, call summaries, calendar bookings, CRM syncing, notifications, billing, privacy, and escalation before enabling the public widget.
6. The assistant may explain settings and create a support/change request through authenticated platform actions. It must not directly edit live agent prompts, phone routing, billing, CRM permissions, calendar permissions, or delete data.

### Support agent instruction

You are the AI Customer Success Assistant for AI Virtual Receptionist. Help signed-in customers understand their account, receptionist service, setup progress, call reporting, calendar and CRM connections, email notifications, billing, privacy, and support process. Use only published platform Help Center content and the authenticated customer's explicitly supplied account context. Never reveal another customer's information, internal credentials, private provider tokens, admin notes, or platform secrets. Never claim a calendar appointment was booked, a CRM record was saved, an email was delivered, or a phone setting changed unless the platform tool confirms success. When unsure, say what is unknown and offer to create a support ticket. You may create a proposed change request after confirming the requested change with the customer; this is not approval to deploy it. Live configuration changes require administrator review, testing, and audit logging. Do not provide legal or carrier guarantees.

## 2. Email notifications

### Implementation

- Use a transactional email provider such as Resend through a server-only adapter. The provider API key is stored only in the hosting environment.
- Verify the sending domain and configure SPF, DKIM, and DMARC before production sending.
- Implement one notification service called by application events; do not send emails directly from random UI components.
- Store per-organization recipients and event preferences. Support immediate alerts and optional daily/weekly digests.
- Queue messages with event ID, organization ID, recipient, template key, retry count, provider message ID, status, and timestamps.
- Use idempotency keys to prevent duplicate notices when webhooks retry. Retry transient errors with bounded backoff; move repeated failures to an admin review queue.
- Show delivery states accurately: queued, provider accepted, bounced/failed, or unconfigured. Provider acceptance is not proof the recipient read the email.
- Include a concise summary and secure dashboard link. Do not include passwords, API keys, full payment data, or unnecessary transcripts/recordings in email.
- Email failure must never interrupt a live phone call or discard a captured lead.

### Initial event catalogue

| Event | Default recipient | Message purpose |
|---|---|---|
| new_lead | configured lead recipients | New caller and approved lead summary |
| appointment_booked | assigned staff and configured recipients | Confirmed booking details and dashboard link |
| appointment_changed | assigned staff and configured recipients | Changed/cancelled appointment |
| missed_or_failed_call | configured operations recipients | Call needs review or callback |
| follow_up_needed | lead owner | Callback/task reminder |
| integration_attention | organization owner | Calendar/CRM authorization expired or failed |
| usage_threshold | organization owner | Usage approaching configured plan allowance |
| setup_status_changed | organization owner | Demo, setup, testing, or go-live progress |
| support_request_updated | request creator | Support/change request status |
| billing_status_changed | billing contact | Payment/subscription status from verified provider event |

### Customer controls

Provide recipient management, event toggles, immediate versus digest preference, timezone for digest delivery, and a test-email action. Validate recipient addresses. Keep marketing consent separate from operational notifications.

## 3. Calendar connections

### Supported first provider

Implement Google Calendar first. Add Microsoft 365/Outlook only after the provider adapter contract and tests are stable. The platform must never ask customers to paste their calendar password.

### Customer setup information

- Calendar provider and account to connect.
- Calendar(s) or staff calendars the receptionist may use.
- Business timezone using an IANA identifier such as America/Chicago.
- Normal business hours, holidays, blackout dates, and staff availability.
- Appointment types, durations, buffers, minimum notice, and maximum booking horizon.
- Assignment/round-robin rules where multiple calendars are selected.
- Required caller details and cancellation/reschedule policy.
- Whether the agent may book, reschedule, cancel, or only create a callback request.

### Connection implementation

1. Start OAuth from the authenticated dashboard using state and PKCE; validate the callback state.
2. Request minimum scopes required for free/busy lookup and event creation. Explain scopes before consent.
3. Encrypt refresh/access tokens at rest with a server-side key. Never return tokens to the browser or send them to Retell.
4. Let the customer select calendars and staff resources after connection.
5. Save booking rules and timezone separately from provider credentials.
6. Implement narrow backend operations: get availability, create event, fetch event, and optional reschedule/cancel.
7. Expose only those narrow operations through authenticated backend endpoints or a signed Retell custom function. Validate tenant, agent, caller data, permitted calendar, and booking policy on every call.
8. Query live availability; do not treat an old cached slot as available. Recheck immediately before creating the event.
9. Use an idempotency key for event creation. Save the provider event ID and booking status.
10. Tell the caller the appointment is confirmed only after the provider confirms event creation. Then create the CRM activity and enqueue notifications.
11. Subscribe to provider change notifications where supported and reconcile changes; do not assume webhooks are always delivered.

### Customer-facing flow

1. Caller asks to book an inspection.
2. Receptionist collects name, callback number, service address, appointment type, and any required details.
3. Backend checks the selected calendar and offers only available slots.
4. Caller chooses a slot.
5. Backend rechecks availability and creates the event.
6. Only after success does the receptionist confirm the date, local time, timezone, and business name.
7. Platform records the booking and notifies configured recipients.

### Failure behavior

- Expired authorization: mark connection as needs attention and notify the owner; do not pretend to book.
- Calendar outage or timeout: offer a callback/booking request and create a follow-up task if configured.
- Slot conflict: refresh availability and offer alternatives.
- Ambiguous timezone: ask the caller to confirm local date/time; store canonical timezone.
- Never disclose private event titles, attendee details, or unrelated calendar information.

### Calendar acceptance tests

- Available slot books successfully and appears in the correct calendar.
- Two callers competing for the same slot cannot both receive confirmed bookings.
- No availability produces alternatives or a callback request.
- Expired OAuth token refresh works or enters needs-attention state.
- Daylight-saving transitions and timezone boundaries are correct.
- Reschedule/cancel requires authorized policy and confirms only after provider success.
- Duplicate Retell webhook or retry does not create a duplicate event.

## 4. CRM connections

### Customer setup information

- CRM provider, workspace, and connected account.
- Objects/modules to use (contacts, leads, opportunities, activities, tasks).
- Matching rules: normalized phone, email, or provider record ID.
- Duplicate policy and required fields.
- Field mapping for lead source, service type, urgency, address, status, and owner.
- Approved read/write permissions and any fields that must never be changed.
- Lead stages, tags, follow-up rules, and assignment rules.

### Connection implementation

1. Connect through provider OAuth or an approved marketplace app; never collect CRM passwords.
2. Encrypt tokens server-side and request minimum scopes.
3. Retrieve the allowed schema and display a field-mapping screen to the customer.
4. Normalize phone numbers to E.164 where possible and normalize email casing/whitespace.
5. Match existing records using the configured priority. If ambiguous, avoid creating a duplicate and flag for review.
6. Create/update only approved fields. Append a dated call activity or note rather than overwriting historical notes.
7. Use idempotency keys and provider IDs to prevent duplicate records on retries.
8. Queue transient failures and show connection health, last sync, and retry state.
9. Never convert an AI guess into a verified CRM fact. Store unknown values as unknown and distinguish caller-stated details from inferred intent.

### Example mappings for a roofing business

| Receptionist data | CRM destination | Rule |
|---|---|---|
| Caller name | Contact name | Update only if supplied and mapping permits |
| Callback number | Phone | Normalize; use for matching |
| Email | Email | Validate; use for matching |
| Property address | Service address/custom field | Preserve caller-stated value |
| Roof issue | Lead description/service type | Store caller's words or concise summary |
| Urgency | Priority/custom field | Use only approved values |
| Appointment | Activity/event reference | Only after calendar confirms |
| Call outcome | Call activity | Append, never overwrite previous activity |

### Failure behavior

CRM downtime must not interrupt the phone call. Keep the lead/call payload in a secure retry queue, show sync pending/failed status in the dashboard, and alert the administrator after the retry policy is exhausted. Do not create a second contact merely because a previous request timed out.

## 5. Combined calendar + CRM + email workflow

Example: a caller requests a roof inspection. The receptionist looks up the caller in CRM using permitted fields, collects missing details, checks calendar availability, offers slots, rechecks the selected slot, and creates the calendar event. Only after event confirmation does it tell the caller the booking is complete. The platform then appends the call activity and event reference to CRM and queues an email notification. If CRM is unavailable, the booking remains valid and the CRM write is queued. If calendar creation fails, the receptionist must not claim the appointment is booked; it offers a callback request instead.

## 6. Customer workspace pages

- Overview: real setup status, plan, next action, integration health, recent calls, and support assistant.
- Calls & reports: tenant-scoped calls, summaries, outcomes, lead fields, transcripts/recordings only when enabled and permitted.
- Configuration: approved configuration version, proposed changes, and clear status history.
- Calendar: connected account, selected calendars, timezone, business hours, booking rules, test connection, reauthorize/disconnect.
- CRM: connected account, field mapping, matching policy, sync status, test connection, reauthorize/disconnect.
- Notifications: recipients, event preferences, test email, delivery history.
- Billing: verified provider subscription and payment status; no client-side status changes.
- Help center: searchable published articles and Retell customer support assistant.

## 7. Admin operations

Admin tools must include organization and user lookup, demo/setup queue, Retell agent and phone-number references, integration scopes and health, calendar rules, CRM field mappings, notification queue, webhook delivery/retries, usage and wholesale cost, customer change requests, and audit history.

Sensitive actions—publishing an agent, changing phone routing, enabling outbound calls, changing CRM write scopes, disconnecting an integration, deleting records, or changing billing—require role checks, explicit confirmation, audit events, and a rollback or recovery path.

## 8. Tenant isolation and privacy

- Every customer record and background job must carry organization ID.
- Derive organization access from authenticated membership on the server; never trust an organization ID sent by the browser without checking membership.
- Retell support agent receives only the signed-in tenant's permitted summary, never raw cross-tenant search results.
- Encrypt integration credentials and redact secrets from logs.
- Enforce recording/transcript consent, retention, access, and deletion rules before enabling those features.
- Use signed short-lived URLs for recordings and attachments.
- Verify provider webhook signatures against the raw request body and make webhook processing idempotent.

## 9. Delivery sequence

1. Remove Manus authentication and preview dependencies; establish Google OAuth sessions and trusted admin bootstrap.
2. Enforce tenant membership and audit logging.
3. Connect Retell voice-agent provisioning and signed call webhooks.
4. Implement email event queue, preferences, and delivery log.
5. Publish the Help Center CMS and search.
6. Implement Google Calendar availability and confirmed booking.
7. Implement one CRM provider's lookup, lead creation, and call activity.
8. Add integration health, retries, and admin replay.
9. Enable Retell Customer Success Assistant with published knowledge and tenant-safe context.
10. Complete end-to-end, privacy, and security acceptance tests before production launch.

## 10. Definition of done

A feature is not production-ready merely because its button or empty state appears. It is complete only when the backend permission checks, provider authorization, tenant isolation, failure handling, audit trail, customer instructions, and automated tests all work. Never display a successful state before the underlying provider confirms it.