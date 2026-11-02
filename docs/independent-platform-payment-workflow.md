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