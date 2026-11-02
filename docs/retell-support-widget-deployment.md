# Retell Customer Support Widget Deployment

## Required runtime variables

Set these on the production application runtime (Cloudflare Worker/container environment), not in GitHub source files:

- `RETELL_SUPPORT_PUBLIC_KEY`: Retell Public Key allowed to run on `aivirtualreceptionist.online` and the dashboard's actual production hostname.
- `RETELL_SUPPORT_CHAT_AGENT_ID`: Retell Chat Agent ID (normally an identifier beginning with `agent_`).
- `RETELL_SUPPORT_AGENT_VERSION`: optional published agent version; omit to use the latest published version.

The public key is intentionally exposed to the browser by the safe public configuration endpoint. It is not a Retell private API key. Never put `RETELL_API_KEY`, webhook secrets, or OAuth credentials in the public configuration or frontend bundle.

## Configure in Cloudflare

1. Open the Cloudflare dashboard and select the production Worker for this application.
2. Open Settings → Variables and Secrets.
3. Add `RETELL_SUPPORT_PUBLIC_KEY` as a runtime variable (it is a public widget credential; still restrict it to the production domain in Retell).
4. Add `RETELL_SUPPORT_CHAT_AGENT_ID` as a runtime variable.
5. Optionally add `RETELL_SUPPORT_AGENT_VERSION` for a pinned published version.
6. Save and deploy/restart the Worker/container so the runtime receives the variables.
7. In Retell, edit the Public Key's allowed domains to include only the exact production dashboard hostname(s), such as `aivirtualreceptionist.online` and `www.aivirtualreceptionist.online` only if both are actually used.

## Retell dashboard prerequisites

1. Create or open a Chat Agent (not a voice agent).
2. Publish the agent and copy its actual Chat Agent ID from Retell.
3. Create a Public Key for the website widget and restrict allowed domains.
4. Ensure the agent has been tested with onboarding, plan, billing, call reports, calendar, CRM, notification, privacy, and escalation questions.

## Verification

1. Confirm the production `/api/platform/config.js` response includes `retellSupportPublicKey` and `retellSupportChatAgentId` but contains no private API key or webhook secret.
2. Sign in to a customer account and open the dashboard. The Retell floating chat button should appear.
3. Open browser developer tools and confirm `https://dashboard.retellai.com/retell-widget-v2.js` loads without errors.
4. Send a test question and confirm the published support Chat Agent responds.
5. Test the same page from a non-allowed domain; the Retell Public Key should reject the unauthorized origin.
6. Do not mark the feature live until a real signed-in dashboard chat succeeds.

## Current handoff status

The application code is committed on `remove-manus-google-paypal`. The supplied public key can be entered as `RETELL_SUPPORT_PUBLIC_KEY` in the runtime environment. The supplied value `aivirtualreceptionistonline` does not resemble a Retell Chat Agent ID; obtain the actual ID from the Retell Chat Agent details before setting `RETELL_SUPPORT_CHAT_AGENT_ID`. No runtime secret or Cloudflare deployment setting has been changed by this GitHub commit.