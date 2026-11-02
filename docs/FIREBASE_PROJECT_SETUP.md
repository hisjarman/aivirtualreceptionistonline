# Firebase project setup

Project: `aivirtualreceptionist-a8a56`

The repository is now pointed at this Firebase project through `.firebaserc`.
This is configuration only. It does not deploy Hosting, Functions, Authentication,
Firestore data, or change the live site.

## Console setup

1. Open the [Firebase console](https://console.firebase.google.com/project/aivirtualreceptionist-a8a56/overview).
2. Register a **Web App** under Project settings. Copy its `apiKey`, `authDomain`,
   `projectId`, and `appId` values into a local `.env` file using
   `.env.firebase.example` as the template. The web config is public app
   configuration, not an Admin SDK credential. Never add a service-account JSON
   file, private key, Stripe secret, Retell key, or email-provider secret to Git.
3. In Authentication → Sign-in method, enable **Email/Password**. Google sign-in is
   optional and can be enabled later. The app's login screens must be migrated
   before customer login is switched over.
4. Create the Cloud Firestore database only after deciding its location. Firestore's
   database location is not something to casually change later. Record the exact
   location shown in the Firebase console.
5. Use the Firestore location to select the closest supported Cloud Functions region.
   Keep Functions and Firestore geographically aligned to limit latency and
   cross-region costs. The repository deliberately does not hard-code a region yet.
6. Cloud Functions deployment requires the Blaze pay-as-you-go plan. Create a
   budget alert before deployment. A budget alert is a notification, not a hard
   spending cap.

## What is already configured in this branch

- `.firebaserc` selects `aivirtualreceptionist-a8a56` as the default Firebase project.
- `firebase.json` points the Firebase CLI to the reviewed Firestore rules and
  index manifest.
- `firestore.rules` and `storage.rules` deny direct client access by default.
  This is intentional until all server-side authorization and tenant checks have
  been implemented and tested.
- `firestore.indexes.json` is an initially empty manifest. Required composite
  indexes will be added alongside the actual Firestore query implementation.

## Important deployment boundary

Do **not** run `firebase deploy` yet. The live application still uses its existing
Manus OAuth/session flow and MySQL/Drizzle queries. Deploying only the Vite build
to Hosting would make the public pages appear while breaking demo intake,
authentication, the customer workspace, and admin review.

The next code stage is to migrate the Express/tRPC API to a Cloud Functions v2
entry point, replace Manus authentication with Firebase Authentication token
verification, and migrate every current data query to Firestore. Then the
existing routes can be rewritten through Hosting without changing the front-end
page URLs. The migration branch remains separate from production until the full
test suite passes.
