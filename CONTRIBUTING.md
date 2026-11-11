# Contributing to Star69AI

## Source of truth

- Repository: `hisjarman/star69ai`
- Production branch: `main`
- Production website: GitHub Pages from the repository root at `https://star69ai.com`
- Backend: Cloudflare Workers and D1
- Authentication: Clerk
- Payments: Stripe
- Public discovery form: Formspree
- Transactional email: Resend

Read `project-context/PROJECT_HANDOFF.md` before changing code. Verify its instructions against the current files and live architecture; do not revive retired hosting, auth, database, or deployment plans.

## Required branch workflow

1. Fetch the latest `main` before starting work.
2. Create one short-lived branch directly from the current `main`, using a descriptive prefix such as `fix/`, `feat/`, `design/`, `seo/` or `chore/`.
3. Keep each branch focused on one coherent change. Do not base a new feature branch on another unfinished feature branch.
4. Before opening or updating a PR, bring the branch up to date with current `main` and resolve conflicts deliberately. Never force-merge an old snapshot over newer production work.
5. Open a PR targeting `main`. Use the repository pull-request template and complete its validation and handoff checklist.
6. Update `project-context/PROJECT_HANDOFF.md` in the same change whenever code, architecture, product behavior, deployment configuration or an operational decision changes.
7. Prefer squash merges for focused PRs. After a successful merge, delete the feature branch; do not keep using a merged branch for new work.

## Conflict prevention

- Check open PRs before starting work. If another PR touches the same files, coordinate or wait rather than creating competing snapshots.
- Reapply useful work from stale branches onto a fresh branch from current `main`; do not merge stale branches wholesale.
- Close PRs that are already implemented, superseded or incompatible, and state why in the PR description.
- Keep unfinished work as a draft PR. A draft is not permission to deploy or merge.
- Do not delete an unmerged branch until its work is either preserved in a replacement PR or explicitly abandoned.

## Production safety

- Never commit secrets, API keys, private customer data or credential files.
- GitHub Pages publishes the static frontend. Cloudflare Worker/D1 changes require their own validation and deployment; a Pages success does not prove a Worker deployment.
- Preserve existing Formspree, Clerk, Stripe, Resend and Cloudflare configuration unless the task explicitly requires a reviewed change.
- Keep public marketing copy free of third-party voice-provider branding. Technical integration references may remain in internal code and documentation. Legal processor disclosures must remain accurate.
- Do not claim automatic overage billing, live integrations, browser testing or production readiness unless verified.

## Validation expectation

Run the narrowest relevant checks for the files changed, inspect the final diff, and record what was and was not tested in the PR and project handoff. UI changes require desktop and mobile review; forms and authenticated flows require real end-to-end checks before being described as verified.
