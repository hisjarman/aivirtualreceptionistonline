# Retell client portal setup

The customer workspace includes a tenant-scoped Retell call history page at `/app/calls`. It uses the server-side Retell API and never exposes the Retell API key to browser code.

## 1. Configure the server secret

For Cloudflare Containers, add the Retell API key as a Worker secret:

```bash
npx wrangler secret put RETELL_API_KEY
```

Paste the Retell **secret API key** when Wrangler prompts you. Do not put the public chat-agent key in this setting, do not commit the secret, and do not place it in a browser-side `VITE_*` variable.

The Worker forwards configured secrets into the container when it starts. Restart/redeploy the container after changing secrets so its process receives the updated values.

## 2. Create the customer login and organization

The existing application uses its configured OAuth identity provider. Before production onboarding, configure and test the OAuth project values and confirm that external customer accounts can sign in. A successful sign-in creates a user; the onboarding flow creates or associates that user's organization.

## 3. Assign a Retell agent to a customer

1. Sign in using an account that has the application's administrator role.
2. Open `/admin/retell`.
3. Find the customer's organization ID in the organization/customer records.
4. Paste the Retell voice agent ID from the Retell dashboard.
5. Select `Live` only after the customer has approved the configuration and the agent is actually deployed.
6. Save the assignment.

A customer can only list calls from Retell agent IDs assigned to their organization. The call-detail endpoint verifies the call belongs to one of those assigned agents before returning the transcript or recording link.

## 4. What is available in the first integration

- Recent call list, caller number, direction/type, status, start time, and duration.
- Retell call summary and success/sentiment analysis when returned by Retell.
- Recording playback when Retell returns a recording URL and recording access is enabled.
- Full transcript on demand from the Retell Get Call endpoint.

Retell's v3 List Calls endpoint intentionally omits full transcript fields. The app fetches a selected call's detail through Get Call only after verifying tenant ownership. See the [Retell List Calls API](https://docs.retellai.com/api-references/list-calls) and [Get Call API](https://docs.retellai.com/api-references/get-call).

## 5. Still required before real customer launch

- Configure a production identity provider and verify customer sign-up, login, logout, password/account recovery, and admin-role assignment.
- Configure a production MySQL database, migrations, backups, and retention/deletion procedures.
- Set and verify `RETELL_API_KEY` in the deployed Worker/container.
- Assign each customer their own Retell agent ID and confirm that no customer shares an agent unless that shared access is explicitly intended.
- Test tenant isolation with at least two separate customer accounts.
- Confirm call recording, transcription, AI disclosure, consent, retention, and access policies for the regions in which customers operate.

The call history page does not yet provide live in-progress transcripts, call controls, agent editing, phone-number management, billing, or automated agent provisioning. Those require additional verified Retell API workflows and customer-facing permission design.