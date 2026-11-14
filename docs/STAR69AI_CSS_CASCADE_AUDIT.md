# Star69AI CSS Cascade Audit — Phase 2

**Date:** 2026-11-13  
**Scope:** Homepage source and shared public-site primitives  
**Branch:** design/unified-experience-2-2026-11-13

## Verified source structure

The homepage stylesheet order is:

1. styles.css
2. homepage-polish.css
3. contact.css
4. story-series.css
5. dashboard-demo.css
6. experience.css
7. demo-center.css
8. homepage-refresh.css
9. /readability.css (last)

This means the homepage has multiple feature-specific layers before the final readability guardrails. The last-loaded homepage-refresh.css can override many earlier shared rules, while readability.css intentionally uses important declarations for legibility.

## Findings

- homepage-refresh.css contains successive historical hero compositions, including centered hero, Earth/assistant layers and a later model-left/product-video-right layout. These are not safe to flatten mechanically without comparing the actual rendered page.
- styles.css contains the shared navigation and button primitives. Legacy --teal variables are compatibility aliases to the approved green token, so broad deletion or replacement could break older page-specific rules.
- The homepage metadata previously advertised a white browser theme color despite the dark navigation chrome.
- The global readability stylesheet is intentionally last-loaded and contains scoped dark-surface handling; changing its order could reintroduce low-contrast text.

## Changes in this phase

- Updated the shared .button primitive to use canonical green tokens and the shared control radius.
- Added a dedicated green hover token and blue keyboard-focus outline to the shared button primitive.
- Updated the homepage theme-color metadata to match its dark navigation chrome; kept light form-control color scheme.
- Kept all legacy token aliases and feature-specific stylesheets intact.

## Not yet verified

This is a source-level audit, not a browser visual audit. No claim is made that the live site has been checked at 360px, 768px or 1280px, or that contrast has been measured with a browser tool. The next safe step is to compare and consolidate one shared component family at a time, beginning with navigation and buttons across the public page templates.

## Guardrails

Do not remove historical homepage selectors, important declarations, feature stylesheets or compatibility aliases until their live usage and visual impact have been checked. Preserve the Formspree native POST, Client Login, SEO metadata, CNAME and all existing integrations.
