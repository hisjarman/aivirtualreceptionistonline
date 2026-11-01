# AI Virtual Receptionist website — complete Cloudflare Pages folder

This folder contains the AI Virtual Receptionist marketing website and the demo-request form.
The homepage and pricing buttons open `/demo/`. The form collects the business
information needed to prepare a personalized AI receptionist demo.

## Files included

- `index.html` — AI Virtual Receptionist homepage
- `styles.css` — site styling
- `demo/index.html` — demo-request form
- `functions/api/lead.js` — server-side form handler that emails submissions
- `wrangler.toml` — Cloudflare Pages project configuration
- `EMAIL_SETUP.txt` — exact instructions for routing form submissions to your inbox
- `assets/README.txt` — instructions for adding your logo and favicon

## Where demo requests go

Set the Cloudflare Pages variable `LEADS_TO_EMAIL` to `hisjarman@gmail.com`.
Your Gmail address is not included in the public website source. The form uses
the Cloudflare Pages Function at `/api/lead` as a server-side handler, which
sends the details through Resend.

You must also configure:

- `RESEND_API_KEY` — add as an encrypted Secret in Cloudflare.
- `LEADS_FROM_EMAIL` — a sender address verified in Resend, for example
  `leads@aivirtualreceptionist.online`.
- `LEADS_TO_EMAIL` — `hisjarman@gmail.com`.

Verify `aivirtualreceptionist.online` as a sending domain in Resend and add the DNS records
Resend provides. Then redeploy the Cloudflare Pages project. The form will not
send email until these settings are configured. See `EMAIL_SETUP.txt`.

## Deploy or update the website

1. Download and unzip this complete folder.
2. Upload the **contents** of the folder to the root of your GitHub repository.
   Do not upload an extra enclosing folder level.
3. In Cloudflare, open **Workers & Pages** and select your Pages project.
4. If not already connected, connect the GitHub repository.
5. Set framework preset to **None**, leave the build command blank, and use `/`
   as the build output directory.
6. Ensure the `functions` directory is at the repository root.
7. Add the three variables/secrets above and redeploy.
8. Submit a test request at `https://aivirtualreceptionist.online/demo/`.

## Security note

Do not put your Gmail address or Resend API key in public HTML or JavaScript.
The `/api/lead` URL is a backend route; it is not your inbox address. The
recipient is read only by the server-side function from Cloudflare settings.

## Current displayed plans

- Launch: $39/month, 100 included AI call minutes, $0.35/min overage
- Growth: $79/month, 300 included AI call minutes, $0.30/min overage
- Pro: $129/month, 600 included AI call minutes, $0.25/min overage

The public calls to action request a demo; they do not immediately send visitors
to Stripe checkout.
