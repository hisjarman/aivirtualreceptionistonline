# GitHub Pages client-onboarding website

This is a standalone, static version of the AI Virtual Receptionist website. It is intentionally kept in `docs/` so the existing full-stack application (React, Express, tRPC, database, authentication, and admin workflows) remains intact in the repository.

## Publish with GitHub Pages

1. Open the repository **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Choose branch **main** and folder **/docs**, then click **Save**.
4. GitHub will show the published URL in the Pages settings panel.

The website uses relative asset paths and does not require a Node build step.

## Connect client onboarding submissions (required)

GitHub Pages only hosts static files. It cannot run the existing Express/tRPC backend or securely store form submissions by itself. Before sending prospects to this page, connect the form to a hosted form endpoint:

1. Create a free form endpoint with [Formspree](https://formspree.io/).
2. Open `docs/app.js`.
3. Replace `https://formspree.io/f/REPLACE_WITH_YOUR_FORM_ID` in `FORM_ENDPOINT` with the endpoint Formspree gives you.
4. Commit the change and wait for GitHub Pages to redeploy.
5. Submit a test request and verify it arrives in the configured inbox.

Do not place passwords, payment data, private API keys, or third-party account credentials in this static site. The form asks for business discovery information only.

## Pricing and service notes

The page uses the starting prices and included minute allowances documented in the repository README. Setup fees, overages, telephony, and third-party usage must be confirmed in a written proposal before payment. The discovery form does not take payment or activate a service.

## Existing application

The original full-stack application remains in the repository source folders. It is not replaced by this static Pages site. The Pages site is a separate lightweight public website suitable for GitHub Pages hosting.
