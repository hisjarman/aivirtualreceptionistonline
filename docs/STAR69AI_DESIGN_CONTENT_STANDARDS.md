# Star69AI Design, Readability & Content Standards

**Status:** Required for all new pages and material edits  
**Applies to:** Public website, Insights, story blog, challenge, partner pages, client/admin interfaces, forms, legal pages and email-linked web experiences.

These standards are the source of truth for visual consistency. Do not introduce one-off styling or typography decisions that conflict with them. When an existing page differs, bring it into compliance deliberately rather than adding another temporary override.

## 1. Brand and visual consistency

- Preserve the Star69AI premium, modern visual identity.
- Use the approved photo-matched neon palette: purple `#E156FF`, blue `#21B7FF`, and green `#14D251`. Keep the translucent white/glass film over the Earth-at-night hero artwork. Use vivid neon colors for decorative lighting and accents, with darker accessible companions (`#A52AB8`, `#0875A9`, `#167A3D`) for small text on white.
- Accent colors are for emphasis, links, focus states and actions—not long paragraphs or large blocks of body copy.
- Use consistent card radii, border treatments, shadows, button styles, section spacing and content widths.
- A light section must use dark text; a dark section must use light text. Never rely on inherited colors when changing a section background.
- Do not use pale gray text on white, dark text on dark, or low-opacity text for important information.
- Avoid harsh, unplanned white flashes or abrupt background changes between adjacent sections.

## 2. Typography

Use the following defaults unless a specific component has a documented, tested reason to differ:

| Element | Standard |
|---|---:|
| Main body and article paragraphs | 16–17px |
| Legal paragraphs and list items | 16px |
| Section headings | 30–42px, responsive |
| Legal section headings | 20–24px |
| Card headings | 19–23px |
| Card descriptions | 14–15px |
| Form labels | 14–15px |
| Form helper and validation text | 13–14px |
| Legal effective-date metadata | 12px |
| Nonessential metadata | 12px minimum |

- Do not use 6–11px text for information a visitor needs to understand, compare, decide, submit or consent to.
- Avoid reducing text size on mobile to make a layout fit. Reflow, wrap, scroll horizontally only for genuinely tabular data, or simplify the layout.
- Body copy should normally use line-height 1.6–1.8; legal copy should use 1.7–1.85.
- Keep paragraphs to a comfortable reading width (typically 60–80 characters per line).
- Use consistent heading hierarchy; do not skip levels for visual styling.

## 3. Contrast and accessibility

- Meet WCAG 2.2 AA contrast: at least 4.5:1 for normal text and 3:1 for large text and meaningful interface graphics.
- Check actual foreground/background pairs, including hover, disabled, placeholder, validation and focus states.
- Do not communicate status by color alone; pair color with text or an icon/label.
- All links must be visually distinguishable from surrounding text, including when not hovered.
- All interactive elements must have visible keyboard focus and usable hit areas.
- Inputs need persistent labels; placeholders are examples, not labels.
- Respect reduced-motion preferences.
- Use semantic headings, landmarks, table headers, button labels and accessible names.

## 4. Layout and responsive behavior

- Use a consistent spacing scale; avoid arbitrary one-off margins and padding.
- Keep content widths comfortable and align section headings, cards and forms to a clear grid.
- Test at minimum 360px mobile, 768px tablet and 1280px desktop widths.
- No horizontal page overflow, clipped headings, overlapping navigation, hidden Client Login controls or inaccessible mobile menus.
- Tables must remain readable on mobile; use a labelled horizontal scroll container or a stacked presentation.
- Buttons and form controls must remain comfortably tappable.

## 5. Forms and interactive states

- Labels, field text, helper copy, consent language and error messages must be readable at the sizes above.
- Focus, success, error, disabled and loading states must be visually distinct and understandable.
- Explain why sensitive or optional information is requested.
- Do not use placeholder-only labels.
- Preserve existing form destinations, consent logic, integrations and submission behavior unless the change explicitly includes a tested migration.

## 6. Legal document standards

The five public legal pages must use the shared `legal.css` stylesheet and the same document navigation/footer:

- `privacy.html`
- `terms.html`
- `ai-compliance.html`
- `recording-notice.html`
- `sms-terms.html`

Requirements:
- Dark, high-contrast reading surface with 16px paragraphs/list items and comfortable line spacing.
- Consistent page width, title hierarchy, section spacing, callouts, link styling, navigation and footer.
- Show an accurate effective date; update it only when the legal text materially changes.
- Cross-link the related legal documents and support contact.
- Keep operator identity and SIMIAPP CLOUD invoice-name language accurate and consistent. Do not imply a DBA/fictitious-name filing is complete unless verified.
- Do not claim that optional services (recording, transcription, SMS, AI processing, automatic overage billing, or a vendor integration) are active for every customer.
- Keep published pricing and usage terms synchronized with the website and customer order. Do not describe unimplemented billing automation as live.
- Distinguish website terms from a signed customer agreement, DPA or BAA. Do not imply these documents replace attorney-reviewed customer contracts.
- Never claim legal compliance, certification or regulatory approval without verified evidence.
- Legal content changes require review of the relevant laws, providers, data flows and actual product behavior. Visual cleanup is not legal advice.

## 7. Content and business-fact consistency

Before publishing, verify:
- Star69AI is described as a managed service, not a DIY software platform.
- Service capabilities are qualified by customer configuration, written scope and provider availability.
- Prices, included minutes, setup fees, overage rates and annual offers match every public display and the accepted customer order.
- The discovery form is for inquiry/demo follow-up and does not create an account or authorize a subscription.
- Dashboard examples and sample metrics are explicitly labelled illustrative.
- Third-party statistics are attributed to the source and never presented as Star69AI customer results.
- Email addresses, contact links, business/operator identity and provider disclosures are current.
- SEO title, meta description, canonical URL, heading structure, internal links and sitemap entry are correct.

## 8. CSS and code hygiene

- Prefer shared design tokens and reusable components over page-specific duplicate rules.
- Do not append another override to compensate for an earlier override without removing or consolidating the conflicting rule.
- Avoid `!important` except for a documented, scoped compatibility fix.
- Keep legal-page presentation in `legal.css`; do not copy the same legal styles inline across documents.
- Do not create new color, spacing, typography or breakpoint values without a clear reason and documentation.
- Preserve existing SEO, navigation, forms, authentication boundaries, integrations and working behavior.
- Keep content, layout and backend behavior changes separate when practical.

## 9. Required pre-publish quality gate

A page or significant edit is not ready until all applicable checks pass:

1. **Readability:** inspect every section; no clipped, tiny, faint or crowded text.
2. **Contrast:** verify all text/background combinations against WCAG AA.
3. **Responsive:** test 360px, 768px and 1280px layouts.
4. **Navigation:** verify logo/home link, menus, footer links and Client Login.
5. **Forms:** verify labels, keyboard use, validation, consent, submission and confirmation.
6. **Content:** check spelling, grammar, repeated copy, claims, pricing and contact details.
7. **SEO:** check title, description, canonical, headings, internal links and sitemap when relevant.
8. **Legal:** check effective date, related links, operator disclosure, optional-feature qualifiers and consistency with current implementation.
9. **Regression:** confirm existing working features and integrations remain intact.
10. **Review:** inspect the final diff and record any checks that could not be performed.

Do not mark a check as passed when it was not actually performed. Record browser/provider checks that remain outstanding.

## 10. Automated checks and review template

- GitHub Actions runs `scripts/check-legal-pages.mjs` for legal-page and legal-stylesheet changes.
- The check requires all five legal pages to load the shared stylesheet, use consistent navigation/footer, show an effective date and retain the legal cross-links.
- Use `.github/pull_request_template.md` for the human review gate on all other readability, accessibility, responsive, content, SEO and regression checks.
- Automated checks do not replace visual browser testing or attorney review.

## 11. Change control

- Read this standard, the root README and `project-context/PROJECT_HANDOFF.md` before substantial website changes.
- Work on a dedicated branch and keep commits focused.
- Do not merge to `main` without the user's explicit approval.
- Report the branch, changed files, tests performed, known limitations and any owner action required.
