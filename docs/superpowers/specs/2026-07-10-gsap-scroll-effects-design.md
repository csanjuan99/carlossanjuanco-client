# GSAP Scroll Effects — Design

## Context

The fresco portfolio (see `2026-07-09-fresco-portfolio-design.md`) was built entirely
in framer-motion, with an explicit "no GSAP" constraint carried through that spec
and its implementation plan. That constraint held for porting the original design
handoff's animations (Hero, RevealText, GoldCursor, StackSection, Obras brush-wipe,
Frieze sticky-scroll) faithfully without adding a second animation library.

This spec adds GSAP for **new, additive** effects only — a persistent animated
background and two section-entrance transitions — inspired by real Awwwards-style
ScrollTrigger patterns (god-ray/light backgrounds, staggered "blinds" reveals,
pinned mask reveals). It does **not** revisit or replace any existing
framer-motion animation; those stay exactly as they are. This is a deliberate,
scoped override of the earlier "no GSAP" constraint, not a reversal of it — the
original constraint was about *porting the handoff without adding a dependency*,
and no longer applies to genuinely new effects the handoff never specified.

## Decisions

- **New dependencies**: `gsap`, plus its `ScrollTrigger` plugin, plus `@gsap/react`
  (the official React hook — handles GSAP context creation/cleanup automatically
  via `useGSAP`, avoiding manual `useEffect` + `ctx.revert()` boilerplate).
- **Scope**: two new pieces — a persistent animated background layer, and a
  "blinds" curtain-reveal transition on two section headings (Obras, Frieze).
  No other section or existing animation changes.
- Both new effects respect `prefers-reduced-motion` (static fallback, no motion)
  and are paused via the Page Visibility API when the tab isn't visible, matching
  the accessibility bar already set by `GoldCursor`.

## Background layer — "Living Dome"

A new `FrescoDome` component: a `<canvas>` element, `position: fixed; inset: 0;
z-index: -10; mix-blend-mode: soft-light`, mounted once in `HomePage` next to the
existing `GoldCursor`. It sits **on top of** the existing `bg-sky-gradient` CSS
background — enhancing it, not replacing it, so the base gradient (and its earlier
fix history) is untouched.

The canvas draws soft radiating light rays from a focal point, using
`gsap.to(..., { repeat: -1 })` to rotate the ray field almost imperceptibly
(~120s per full revolution — slow enough to read as "living," not distracting).
A `ScrollTrigger` bound to overall document scroll (`start: 'top top', end:
'bottom bottom', scrub: true`) drives two things as the user scrolls toward
Contact: ray opacity increases, and the focal point drifts downward — turning
"la luz entra por la cúpula" (the epilogue's own copy) into a literal visual
payoff rather than just text.

Ray-angle and intensity math live in a separate pure module,
`fresco-dome-math.ts`, so the interpolation logic is unit-testable independent of
canvas rendering (mirroring the `use-frieze-scroll.ts` pattern from the original
build — pure calculation function plus a thin component/hook that calls it).

Under `prefers-reduced-motion`: the canvas renders one static frame (no rotation,
no scroll-linked intensity change) rather than being hidden outright, so the
background texture itself doesn't visibly disappear — only the motion stops.
The rAF loop pauses on `visibilitychange` when the tab is hidden.

## Section transitions — "Blinds Reveal"

A new shared `BlindsReveal` component wraps a section's heading block (label +
title). It renders N vertical slat `<div>`s absolutely positioned over its
children. A `ScrollTrigger` on the wrapper (`start: 'top 80%'`, fires once, not
scrubbed — matching the timing model of the existing `data-reveal` fade-ins)
staggers each slat's exit (`scaleY`/`translateX`) in sequence, like a canvas
curtain opening to reveal a fresco panel underneath.

This is an overlay, not a replacement: the existing `RevealText` word-stagger on
the heading and the section's own fade-in continue to run underneath, unmodified.
The blinds add a dramatic "unveiling" beat on top, not a new content-animation
system.

Scope is intentionally narrow — only `ObrasSection`'s and `FriezeSection`'s
heading blocks get this treatment, not every section. Applying it everywhere
would read as noise rather than a deliberate accent; these two were chosen
because Obras ("Catálogo de Obras") and Frieze ("Friso Cronológico") are
literally framed as gallery/museum reveals in the copy, where a curtain-opening
motion reinforces the metaphor.

## File structure

```
src/shared/
├── components/
│   ├── fresco-dome/
│   │   ├── FrescoDome.tsx          — canvas + GSAP background, mounted once in HomePage
│   │   └── fresco-dome-math.ts     — pure ray-angle/intensity functions, unit-tested
│   └── blinds-reveal/
│       └── BlindsReveal.tsx        — slat overlay wrapper, used by ObrasSection + FriezeSection
└── hooks/
    └── use-prefers-reduced-motion.ts  — extracted shared hook (3rd consumer: GoldCursor,
                                          FrescoDome, BlindsReveal — rule-of-three DRY)
```

`GoldCursor` is refactored to consume the new shared hook instead of its own
inline `matchMedia` check, since this is the point where the same check appears
a third time.

## Testing

- `fresco-dome-math.ts`: unit-tested pure functions (ray angle/intensity given a
  scroll progress value), same pattern as `use-frieze-scroll.ts`.
- `use-prefers-reduced-motion.ts`: unit-tested via a mocked `matchMedia`.
- `FrescoDome` and `BlindsReveal` themselves: no unit tests (canvas rendering and
  GSAP timeline behavior aren't meaningfully unit-testable) — verified manually
  in a live browser, same as `GoldCursor` and `BrushWipeImage` before them.

## Out of scope

- No changes to any existing framer-motion animation (Hero, RevealText,
  GoldCursor's cursor-follow behavior, StackSection, Obras brush-wipe, Frieze
  sticky-scroll).
- No WebGL/shader background — canvas 2D is sufficient for the god-ray effect
  and avoids a much heavier dependency for a portfolio site.
- No blinds-reveal on sections other than Obras and Frieze.
