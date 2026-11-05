# HelloAnswer Agency Support custom page

## HelloAnswer custom-page settings

Create a custom page in the HelloAnswer agency dashboard with:

- Menu label: `Agency Support`
- Icon: `Featured` or `Document`
- Page URL: `https://support.aivirtualreceptionist.online/embed/agency-support`
- Show to every client: enabled only after the support host and access flow have been tested

The HelloAnswer dashboard itself remains on `clients.aivirtualreceptionist.online`. The embedded page must be hosted on a separate origin; do not point the custom-page URL back to the HelloAnswer dashboard domain.

## Hosting and DNS

Deploy the existing full-stack application (not the GitHub Pages `docs/` site) to the configured Node host. Add `support.aivirtualreceptionist.online` as a custom domain on that host and configure the DNS record the host provides. Confirm HTTPS is active before adding the URL in HelloAnswer.

## Authentication and privacy

The embedded route currently uses the repository's existing application authentication provider and organization membership checks. This repository currently uses its existing Manus OAuth session flow; it does not yet use Clerk. Clients therefore authenticate separately from HelloAnswer unless a future supported SSO integration is implemented.

The route is configured to allow framing by `helloanswer.ai` and `clients.aivirtualreceptionist.online`. Test in the actual HelloAnswer client workspace and in Chrome/Safari privacy modes. Browser third-party-cookie restrictions may affect embedded authentication; do not enable this page for all clients until the login, request submission, and tenant-isolation tests pass.

## Client workflow

- Client submits a service change request in the embedded Agency Support Center.
- Requests are stored against the authenticated user's organization.
- The client sees only requests belonging to their organization.
- Agency administrators can review requests at `/admin/changes`, update status, and post a client-visible response.
- Submission does not modify a live HelloAnswer agent. An administrator performs and tests the change in HelloAnswer, then records the outcome in the portal.

## Verification checklist

1. Sign in as a test client and open the embedded page from HelloAnswer.
2. Submit a harmless test request.
3. Confirm it appears in the admin change-request queue.
4. Update its status and add a client-visible response.
5. Confirm the client sees the response and status.
6. Sign in as a second test organization and verify the first organization's request is not visible.
7. Repeat in a browser with third-party cookies restricted.
8. Only then enable the custom page for all client workspaces.
