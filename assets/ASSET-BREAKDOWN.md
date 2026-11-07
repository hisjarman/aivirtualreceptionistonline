# Global AI Receptionist — Asset Breakdown

Source: `GlobalAIReceptionistinSpace.png` (1536 × 1024, RGB)

## Important extraction note

This reference is a flattened hero screenshot, not a layered design file. The crops in this folder are visual references and starter assets. For a production redesign, rebuild the text, navigation, buttons, language selector, call cards, icons, and language cards as live HTML/CSS components so they remain responsive, accessible, translatable, and crisp. The woman, space background, and globe/network artwork are the strongest candidates for image assets or separate regenerated artwork.

## Suggested asset inventory

| Asset | Crop | Recommended use | Production treatment |
|---|---|---|---|
| Full reference | `00-reference-full.png` | Design reference | Keep unchanged as a visual benchmark |
| Hero background | `01-hero-background.png` | Hero composition reference | Rebuild as layered background + foreground artwork |
| Brand header | `02-brand-header.png` | Logo and tagline reference | Recreate logo as SVG/wordmark; tagline as live text |
| Hero copy | `03-hero-copy.png` | Typography/layout reference | Rebuild as live text; use responsive line breaks |
| Assistant portrait | `04-assistant-portrait.png` | AI receptionist visual reference | Isolate/regenerate as transparent PNG/WebP if possible |
| Globe and network | `05-globe-and-network.png` | Hero lower artwork reference | Use as separate image layer behind content; preserve glow |
| Language selector | `06-language-selector.png` | Dropdown reference | Rebuild as accessible button/menu; flags can be SVG or emoji fallback |
| Call cards | `07-call-card-cluster.png` | Global call-routing visual reference | Rebuild cards in CSS/HTML; use real data and responsive positioning |
| CTA row | `08-hero-cta-row.png` | Button styling reference | Rebuild as live buttons with hover/focus states |
| Feature strip | `09-feature-strip.png` | Benefits row reference | Rebuild as icon + label components |
| Language cards | `10-language-cards.png` | Supported-language section | Rebuild as responsive cards with selectable states |
| Business section | `11-global-business-section.png` | Section composition reference | Rebuild heading/body/cards as live layout |

## Visual system observations

- **Theme:** deep-space SaaS / AI communications.
- **Primary background:** near-black navy with a subtle blue gradient and star field.
- **Accent:** electric cyan/blue used for highlights, borders, glows, icons, and primary CTAs.
- **Text:** white for headings; cool pale blue-gray for body copy.
- **Cards:** translucent navy panels, thin blue borders, large rounded corners, soft outer glow.
- **Layout:** two-column hero; copy anchored left; assistant/globe artwork dominates right; benefits sit below the copy; language cards form a horizontal row in the next section.
- **Typography direction:** geometric sans-serif with heavy display weight. Suggested starting families: Inter, Manrope, Plus Jakarta Sans, or Sora. Verify licensing and match the final brand voice.

## Suggested component tree

```text
LandingPage
├── Header
│   ├── BrandMark
│   ├── PrimaryNav
│   ├── LanguageMenu
│   └── HeaderCTA
├── Hero
│   ├── HeroCopy
│   ├── BenefitList
│   ├── HeroActions
│   ├── AssistantArtwork
│   ├── GlobeArtwork
│   └── CallRoutingCards
└── GlobalBusinessSection
    ├── SectionIntro
    └── LanguageCardGrid
```

## Suggested responsive behavior

- Desktop: retain the split composition and orbiting call cards.
- Tablet: reduce portrait/globe scale, move call cards into a compact grid, and keep the copy readable.
- Mobile: stack copy first, artwork second; hide or simplify orbit lines; convert language selector and language cards into touch-friendly controls; keep CTA buttons full width.

## Crop coordinates

Coordinates are `(left, top, right, bottom)` in source-image pixels.

- `00-reference-full.png` — `(0, 0, 1536, 1024)`
- `01-hero-background.png` — `(0, 0, 1536, 790)`
- `02-brand-header.png` — `(35, 8, 525, 105)`
- `03-hero-copy.png` — `(38, 170, 510, 535)`
- `04-assistant-portrait.png` — `(790, 90, 1215, 505)`
- `05-globe-and-network.png` — `(425, 470, 1536, 790)`
- `06-language-selector.png` — `(1165, 10, 1355, 270)`
- `07-call-card-cluster.png` — `(500, 145, 1515, 575)`
- `08-hero-cta-row.png` — `(42, 635, 510, 710)`
- `09-feature-strip.png` — `(42, 545, 520, 615)`
- `10-language-cards.png` — `(625, 825, 1500, 990)`
- `11-global-business-section.png` — `(0, 790, 1536, 1024)`

## Dominant sampled colors

These are approximate visual samples, not an authoritative brand palette:

| Color | Hex |
|---|---|
| `rgb(0, 8, 27)` | `#00081B` |
