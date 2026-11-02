# Firebase email/password authentication setup

This branch adds customer registration, email/password sign-in, mandatory email verification, password-reset email requests, ID-token refresh, and server-side Firebase token verification.

## 1. Create or open the Firebase web app

1. Open the [Firebase console](https://console.firebase.google.com/).
2. Select project `aivirtualreceptionist-a8a56`.
3. Open **Project settings → General**.
4. Under **Your apps**, register a Web app if one does not exist.
5. Copy its **Web API Key**. The Firebase project ID is `aivirtualreceptionist-a8a56`.
6. Open **Authentication → Sign-in method**.
7. Enable **Email/Password**.
8. Open **Authentication → Settings → Authorized domains** and add:
   - `aivirtualreceptionist.online`
   - `www.aivirtualreceptionist.online` if you use it
   - The exact Cloudflare preview/deployment hostname while testing
9. Under **Authentication → Templates**, review the verification and password-reset email wording and sender settings.

## 2. Configure the Cloudflare Worker

From the repository root, with Wrangler authenticated to the correct Cloudflare account, set these values:

```bash
npx wrangler secret put FIREBASE_API_KEY
npx wrangler secret put FIREBASE_PROJECT_ID
npx wrangler secret put FIREBASE_AUTH_DOMAIN
npx wrangler secret put OWNER_EMAIL
```

Enter the Firebase Web API Key when prompted for the first value, `aivirtualreceptionist-a8a56` for the project ID, and the Firebase Auth domain from Project settings for the third value (usually `aivirtualreceptionist-a8a56.firebaseapp.com`). Set `OWNER_EMAIL` to `hisjarman@gmail.com` for the verified owner account that should receive administrator privileges.

The Web API Key and project ID are public Firebase client configuration, not privileged credentials. They are stored as Worker secrets here for simpler configuration and are intentionally emitted by the server's public config endpoint. The server verifies Firebase ID tokens using Google's signing keys, the configured project issuer/audience, and the `email_verified` claim. The Retell secret remains separate and server-only.

After setting these values, redeploy the Worker/container so the container process receives them.

## 3. Test customer account flows

1. Visit `/signup` or click **Create account** at `/login`.
2. Register using an email address you can access and a password of at least 6 characters.
3. Open the Firebase verification email and click its link.
4. Return to `/login` and sign in again. The first sign-in after verification obtains a fresh verified ID token.
5. Open `/app` and confirm the customer workspace loads.
6. Sign out and test **Forgot your password?** with the same address.
7. Confirm the password-reset email arrives and the Firebase action page allows a new password.

New registrations must accept the site's Terms and Privacy links. Unverified Firebase accounts are rejected by the server and cannot access protected customer procedures.

## 4. Administrator account

After the verified owner email signs in for the first time, the server promotes that exact verified email (configured in `OWNER_EMAIL`) to the administrator role. Keep `OWNER_EMAIL` set to `hisjarman@gmail.com` and use that same address to create and verify the owner account. Do not use a public/shared inbox.

## 5. Security and production checklist

- Restrict the Firebase Web API Key to the Identity Toolkit and Secure Token APIs where practical; add HTTP referrer restrictions for the production and preview domains.
- Configure email templates and verify delivery/spam placement.
- Test verification-required access before and after email verification.
- Test password reset and refresh-token behavior.
- Test with two separate customer accounts and confirm each can only see their own organization and assigned Retell agents.
- Confirm production database connectivity and migrations before inviting customers.
- Do not put Firebase service-account private keys, Retell API keys, or other server secrets in Vite/browser environment variables.
- The current password-reset and verification links use Firebase's hosted email action handler and return users to `/login`.

Firebase Authentication's REST API is used for the browser sign-up/sign-in/email actions. The application server independently verifies signed Firebase ID tokens before creating an authenticated application user.
