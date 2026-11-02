# Static sales website — Firebase Spark

This repository now includes a standalone, no-backend marketing website in `static-site/`.
It is designed for Firebase Hosting on the Spark plan. It does not require Cloud Functions,
Firestore, Authentication, MySQL, or a server runtime.

## Before publishing

1. Open `static-site/script.js`.
2. Replace `SET_YOUR_SALES_EMAIL` with the real inbox that should receive demo inquiries.
3. Check the pricing and service terms in `static-site/index.html` against the wholesale AI/telephony costs and service you can actually deliver. The page labels minute allowances and usage as subject to confirmation.
4. Make sure your domain `aivirtualreceptionist.online` is added under Firebase Hosting → Custom domains.

## Deploy to Firebase Spark

From the repository root, with Firebase CLI installed and authenticated:

```bash
firebase use aivirtualreceptionist-a8a56
firebase hosting:channel:deploy preview --config firebase.static.json
```

Review the preview URL on desktop and mobile. When ready to publish to the live Hosting channel:

```bash
firebase deploy --only hosting --config firebase.static.json
```

This uses the separate `firebase.static.json` file on purpose. It deploys only the static marketing site and does not deploy Firestore rules or any backend services. Do not run a general `firebase deploy` with the existing `firebase.json` during this static-only launch.

## Demo inquiry form limitation

The lead form is static and uses the visitor's email application (`mailto:`) to prepare the inquiry. The visitor must press Send in their email app. This does not silently store leads or guarantee delivery. For automatic lead capture, connect a hosted form endpoint or a future backend before relying on it for paid advertising.
