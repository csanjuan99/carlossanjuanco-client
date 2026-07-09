# Fresco Portfolio — Design

## Context

A design handoff ("Portfolio Fresco.dc.html") specifies a Renaissance-fresco-themed
portfolio: parchment/gold/sienna palette, serif display type, museum-gallery copy
conceit ("SALA II · PANTEÓN DE HERRAMIENTAS", "OBRA Nº"), and heavy GSAP
scroll animation. It was authored in a DC (design-component) export format and
is not directly usable as React code.

This design replaces the project's current dark-minimalist portfolio
(Hero/Marquee/About/Services/Projects, `#0C0C0C`, framer-motion fades) with the
Fresco concept, rebuilt natively in the project's stack: React 19 + TypeScript +
Tailwind + framer-motion (no GSAP added). Fable 5 was consulted as a design
advisor on animation-porting risk and creative pacing; its recommendations are
folded in below.

## Decisions

- **Scope**: full replacement of the current portfolio, not a parallel variant.
- **Content**: placeholder copy for now (structure first); real content filled
  in later.
- **Language**: bilingual ES/EN via `react-i18next`, default `es` (the
  handoff's original language).
- **Animation library**: framer-motion only. No GSAP/ScrollTrigger/SplitText
  dependency is added — every handoff animation is re-derived from
  framer-motion primitives (`useScroll`, `useTransform`, `useMotionValue`,
  `whileInView`).
- **File structure**: bounded-context `modules/` + `shared/` split (per the
  project's `bounded-contexts` skill), applied even though the site is
  single-page, per explicit user preference.
- **Hero illustration**: the handoff references a bespoke `hero-creacion.png`
  Renaissance illustration that does not exist in the repo. No such asset is
  generated or sourced. The hero visual is a CSS/SVG gradient-mass stand-in
  (the "converging masses + spark" motif, which is already part of the
  design) instead of an `<img>`. Swapping in real art later means adding the
  file to `src/assets/` and wiring an `<img>` into `HeroSection`.

## Architecture

```
src/
├── shared/
│   ├── components/
│   │   ├── fade-in/FadeIn.tsx              (existing, kept as-is)
│   │   ├── reveal-text/RevealText.tsx      (new)
│   │   ├── gold-cursor/GoldCursor.tsx      (new)
│   │   ├── brush-wipe-image/BrushWipeImage.tsx  (new)
│   │   └── language-toggle/LanguageToggle.tsx   (new)
│   ├── i18n/
│   │   ├── es.json
│   │   ├── en.json
│   │   └── i18n.ts
│   └── hooks/
│       └── use-frieze-scroll.ts            (new)
└── modules/
    └── portfolio/
        └── pages/
            └── home/
                ├── index.tsx                (assembles all sections)
                ├── data/                    (non-translatable structural data)
                └── sections/
                    ├── hero/HeroSection.tsx
                    ├── manifesto/ManifestoSection.tsx
                    ├── stack/StackSection.tsx
                    ├── obras/ObrasSection.tsx
                    ├── frieze/FriezeSection.tsx
                    ├── testimonials/TestimonialsSection.tsx
                    ├── contact/ContactSection.tsx
                    └── footer/Footer.tsx
```

`App.tsx` becomes a thin shell rendering the `home` page. Existing dark-theme-only
components (`ContactButton`, `LiveProjectButton`, `Magnet`, `AnimatedText`) are
removed or repurposed as sections are rebuilt — none of the Fresco CTAs (seal
button, "VER LA OBRA →" link) reuse their exact shape.

**Data split**: translatable copy (titles, descriptions, manifesto text, job
blurbs, testimonial quotes) lives in `shared/i18n/{es,en}.json`, keyed by id.
Non-translatable structural fields (years, tech-stack tags, links, image slot
ids, numerals) live in `modules/portfolio/pages/home/data/`.

## Visual system

- Tailwind theme extension with named colors (parchment, gold, sienna, sky
  gradient stops) instead of raw hex scattered through classes.
- Fonts self-hosted via `@fontsource` packages (Fraunces, Newsreader,
  JetBrains Mono) — no runtime Google Fonts CDN request.
- Sienna text color darkened from the handoff's `#8f4a2e` to roughly `#7a3d24`
  to clear WCAG AA contrast at label sizes (Fable flagged the original as
  borderline on parchment backgrounds).

## Animation system

Every handoff animation is re-derived from framer-motion, per Fable's
risk/value assessment:

| Handoff effect | Framer-motion approach | Risk |
|---|---|---|
| SplitText line reveal (manifesto, hero title) | `RevealText`: split copy into words, wrap each in an `overflow-hidden` span, stagger `y`/`opacity` on `whileInView` | Low |
| Brush clip-path wipe (project frames) | `BrushWipeImage`: `useScroll({ target })` + `useTransform` driving `clipPath` between the jagged "brush" polygon and the full-frame polygon | Low |
| Cloud parallax | `useScroll` + `useTransform` on `y` | Low |
| Gold cursor | `useMotionValue` + spring; desktop/`pointer: fine` only; disabled under `prefers-reduced-motion` | Low |
| Converging-hands hero gesture | Simplified to a one-time on-mount ease-in of the two gradient masses toward center — no scroll-jacked tracking | Dropped (lowest payoff, highest risk per Fable) |
| Pinned horizontal frieze (experience timeline) | `use-frieze-scroll` hook: sticky container (`height: N × 100vh`, inner `position: sticky; top: 0`) + `useScroll` mapped to horizontal `translateX` on the track. Below 768px, renders as a normal vertical stack — no scroll-jack forced on mobile | Medium — the one effect with no direct framer-motion equivalent to ScrollTrigger's `pin` |

Section priority (build order, per Fable): Hero + global type/palette system
→ Obras (projects) → Frieze (experience) → Stack medallions + Manifesto →
Testimonials + Contact + Footer polish.

## i18n

`react-i18next` initialized once in `main.tsx`. Language stored in
`localStorage`; `LanguageToggle` swaps `i18n.language` between `es`/`en`.
The museum-label conceit translates alongside the rest of the copy (e.g.
"SALA II" → "GALLERY II", "OBRA Nº" → "WORK No.").

## Out of scope

- Real content (name, bio, project details, work history, testimonials) —
  placeholders remain until supplied separately.
- A real hero illustration.
- Any HeroUI adoption — the project doesn't currently use a component
  library and the Fresco design is fully bespoke-styled; introducing one
  would be unrequested scope per the project's existing conventions.
