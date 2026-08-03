---
name: Carlos Sanjuan — Portfolio
description: A Renaissance vault ceiling rendered as a portfolio; the visitor stands beneath the work.
colors:
  sky-high: "#cdd6de"
  sky-deep: "#8fa0b3"
  sky-panel: "#ccd2d8"
  parchment: "#e8dfd0"
  parchment-dark: "#ded2bd"
  gold: "#d4af6a"
  gold-light: "#e8cf98"
  gold-deep: "#a97f3e"
  sienna: "#7a3d24"
  sienna-glaze: "#8f4a2e"
  terracotta-haze: "#b56a4a"
  ink: "#2b2622"
typography:
  display:
    fontFamily: "'Fraunces Variable', Georgia, serif"
    fontSize: "clamp(52px, 9.5vw, 148px)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Fraunces Variable', Georgia, serif"
    fontSize: "clamp(36px, 5vw, 64px)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'Fraunces Variable', Georgia, serif"
    fontSize: "clamp(30px, 3.6vw, 52px)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  quote:
    fontFamily: "'Fraunces Variable', Georgia, serif"
    fontSize: "clamp(24px, 3.4vw, 40px)"
    fontWeight: 500
    lineHeight: 1.32
    letterSpacing: "normal"
  body:
    fontFamily: "'Newsreader Variable', Georgia, serif"
    fontSize: "clamp(17px, 1.6vw, 21px)"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.30em"
rounded:
  panel: "2px"
  control: "2px"
  medallion: "9999px"
spacing:
  gutter: "24px"
  stack: "28px"
  panel: "40px"
  panel-wide: "88px"
  movement: "10vh"
  movement-wide: "16vh"
components:
  medallion-stack:
    backgroundColor: "{colors.parchment}"
    textColor: "{colors.sienna}"
    rounded: "{rounded.medallion}"
    size: "118px"
  medallion-contact:
    backgroundColor: "{colors.gold}"
    textColor: "#3d2413"
    rounded: "{rounded.medallion}"
    size: "158px"
  panel-parchment:
    backgroundColor: "{colors.parchment}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "40px"
  panel-sky:
    backgroundColor: "{colors.sky-panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "40px"
  plate-label:
    backgroundColor: "{colors.parchment}"
    textColor: "{colors.sienna}"
    rounded: "{rounded.control}"
    padding: "6px 16px"
  link-inline:
    textColor: "{colors.sienna}"
    typography: "{typography.label}"
    height: "44px"
  link-inline-hover:
    textColor: "{colors.gold}"
---

# Design System: Carlos Sanjuan — Portfolio

## Overview

**Creative North Star: "The Vault Ceiling"**

The visitor is standing underneath the work, looking up. The page is not a document scrolled through but a painted dome walked beneath — the background is sky, light rakes down from a focal point that descends as you scroll, and everything made of substance hangs in front of that sky rather than sitting on it. This is why the page has no white: white is paper, and there is no paper here. There is atmosphere, and there are objects suspended in it.

The system is warm, low-contrast, and unhurried. Every material is borrowed from a real fresco: lime-plaster sky in the ceiling's cool blue-grey, parchment for anything bearing text, sienna earth pigment for the writing itself, gold leaf for anything the light catches. Nothing is neutral grey and nothing is pure black — `#2b2622` ink is a warm near-black mixed from the same earths. Three typefaces do three jobs and never trade: Fraunces speaks, Newsreader explains, JetBrains Mono labels. The mono is not a technical costume; it is the engraver's hand on a museum plate, which is why it only ever appears in small caps-height tracked-out runs and never in a paragraph.

Density is generous to the point of ceremony. Sections breathe in viewport units, not pixels, so the rhythm holds from phone to ultrawide. Movement is slow and one-directional: things are unveiled, wiped, or lifted into place, never bounced. The one continuous motion in the whole system is the dome's rotation, at two minutes per revolution — slow enough that you feel it rather than watch it.

**Key Characteristics:**
- Sky is the ground; every surface floats in front of it, never on it
- Warm earth palette only — no true grey, no true black, no white
- Three faces, three fixed jobs: display serif, reading serif, engraved mono
- Ceremonial spacing measured in viewport height
- Motion as unveiling: curtains, wipes, and slow light

## Colors

A quattrocento fresco palette: cool lime-plaster sky against warm earth pigments, with gold reserved for what the light touches.

### Primary

- **Gold Leaf** (`#d4af6a`): the interactive accent and the light itself. It carries hover states, link underlines, frame gilding, the dome's rays, the cursor, and text selection. Nothing decorative is gold; gold means either "the light hits this" or "you can act on this."
- **Gold Highlight** (`#e8cf98`): the lit edge of any gold surface. Only ever appears as the first stop of a gradient, never as a flat fill.
- **Gold Shadow** (`#a97f3e`): the turned edge of gold. Only ever the far stop of a gradient.

### Secondary

- **Sienna** (`#7a3d24`): burnt earth pigment, and the writing voice of the whole system. Every mono label, every room title, every catalogue number, and every link at rest is sienna. It is the only colour that reliably clears contrast on every surface here, which is why it also carries the focus ring.
- **Sienna Glaze** (`#8f4a2e`): the inner ring on medallions and the deepest stop of the contact seal. A darkening of sienna, not a separate hue.
- **Terracotta Haze** (`#b56a4a`): atmospheric only. Appears exclusively as blurred radial fog in the hero at ≤34% alpha. Never a fill, never text.

### Neutral

- **Sky High** (`#cdd6de`): the top of the ceiling gradient, where the light is.
- **Sky Deep** (`#8fa0b3`): the bottom of the gradient, where the vault turns away. The full ground is `linear-gradient(175deg, #cdd6de 0%, #c9d3dc 30%, #a8b6c4 68%, #8fa0b3 100%)` — 175° rather than 180° so the light is very slightly off-axis, as a real dome's would be.
- **Sky Panel** (`#ccd2d8`): a panel cut from the sky itself, used for testimonial cards so quotations read as inscriptions in the ceiling rather than notes pinned to it.
- **Parchment** (`#e8dfd0`): the surface of anything bearing extended text — manifesto, experience cards, plates.
- **Parchment Shadow** (`#ded2bd`): the recessed plane inside a gilded frame, where artwork sits.
- **Ink** (`#2b2622`): a warm near-black for body text. Never `#000`.

### Named Rules

**The No-Paper Rule.** There is no white and no true grey anywhere in this system. If a surface needs to hold text, it is parchment or sky-panel. A `#fff` or `#f5f5f5` value in this codebase is a bug.

**The Gold-Means-Act Rule.** Gold is the interactive accent: hover, link underlines, the contact seal, the cursor. Sienna is the resting state of the same elements. A gold thing that cannot be acted on must be light — a ray, a gild, a highlight — and nothing else.

**The Gold-Is-Never-A-Focus-Ring Rule.** Gold at `#d4af6a` does not reach 3:1 against either the sky gradient or parchment, so despite owning interaction it cannot carry focus indication. The focus ring is sienna (`2px solid #7a3d24`, `3px` offset). This is the one place where the interaction accent and the interaction affordance deliberately diverge.

**The Atmosphere-Only Rule.** Terracotta Haze and every `blur-3xl` radial exist below the content, `aria-hidden`, `pointer-events-none`, at low alpha. They are weather, not design elements. Never promote one to a border, fill, or divider.

## Typography

**Display Font:** Fraunces Variable (with Georgia, serif)
**Body Font:** Newsreader Variable (with Georgia, serif)
**Label/Mono Font:** JetBrains Mono (weights 400 and 500 only)

**Character:** Two serifs that share Renaissance bones but not temperament — Fraunces is the carved inscription, high-contrast and slightly theatrical, especially in its italic, which the system uses to mark every emphasized phrase. Newsreader is the reading voice underneath it: quieter, wider, built for paragraphs. JetBrains Mono is neither; it is the brass plate screwed to the wall beside the work.

### Hierarchy

- **Display** (500, `clamp(52px, 9.5vw, 148px)`, line-height 0.98): the hero statement only. One per page. Its emphasized half is set in Fraunces italic and sienna.
- **Headline** (500, `clamp(36px, 5vw, 64px)`, line-height ~1.05): room titles — one per section. The contact seal's headline scales further, to `clamp(40px, 6vw, 84px)`, because it is the closing line of the whole page.
- **Title** (600, `clamp(30px, 3.6vw, 52px)`): project names in the catalogue. The only weight-600 display type in the system.
- **Quote** (500, `clamp(24px, 3.4vw, 40px)`, line-height 1.32): the manifesto inscription and testimonial quotations. Set in Fraunces, not Newsreader — a quotation is spoken, not read.
- **Body** (400, `clamp(17px, 1.6vw, 21px)`, line-height 1.625, measure 44–46ch): Newsreader. Constrained to `max-w-[44ch]` for centred lead paragraphs and `max-w-[46ch]` for catalogue descriptions.
- **Label** (400, 11–12px, letter-spacing 0.22–0.34em, uppercase): JetBrains Mono. Room labels, field names, catalogue plates, the scroll hint, footer links.

### Named Rules

**The Three-Jobs Rule.** Fraunces speaks, Newsreader explains, JetBrains Mono labels. No face does a second job. A mono paragraph, a Fraunces field label, or a Newsreader headline is out of system.

**The Italic-Is-Emphasis Rule.** Emphasis in display type is carried by Fraunces italic in sienna, never by weight, colour alone, or a background highlight. This is why the hero splits its headline into two spans.

**The Tracked-Label Rule.** Mono never appears below 0.22em letter-spacing and never above 12px. It is set as if stamped into metal. Correspondingly, mono is never justified, never wrapped to more than two lines, and never used for anything a visitor must actually read at length.

**The Reveal-Needs-Air Rule.** Any word-by-word reveal mask must carry `padding-inline: 0.12em` with a matching negative margin. Fraunces italic overshoots its advance width, and a flush mask shears the terminal off letters like `f`.

## Layout

The page is one uninterrupted vertical scroll with no navigation and no router — a single walk beneath the ceiling, top to bottom, in eight movements: hero, manifesto, stack, catalogue, frieze, testimonials, contact, colophon.

Vertical rhythm is measured in viewport height, not pixels, so the ceremony holds at every size: sections breathe at `10vh` to `16vh` of vertical padding, the hero and contact seal each claim a full viewport (`min-h-screen`, `min-h-[88vh]`), and each catalogue entry claims one as well. Horizontal gutters are a flat `24px` everywhere; the containers do the work instead, at four deliberate widths — `820px` for the manifesto inscription (a single column of reading), `1100px` for testimonials, `1180px` for the stack and frieze headings, `1240px` for the catalogue.

Breakpoints are Tailwind's defaults and only two are load-bearing. At `sm` (640px) testimonials go from one column to two. At `md` (768px) the catalogue splits into a two-column plate-and-caption spread, panel padding opens from `40px` to `88px`, and the experience frieze switches from a plain vertical stack to a sticky horizontal scroll. That last switch is deliberate: the horizontal frieze is a desktop reading of a Roman relief, and scroll-jacking a phone would be hostile.

### Named Rules

**The Viewport-Rhythm Rule.** Section spacing is expressed in `vh`, never in a fixed pixel scale. The page should feel equally ceremonial on a laptop and a 32" display.

**The No-Jack-On-Touch Rule.** Any scroll-driven horizontal or pinned sequence must have a plain stacked equivalent below `md`. Touch scroll is never hijacked.

## Elevation & Depth

Objects hang in front of the sky. The shadow is not decoration and not an ambient room effect — it is the proof that a panel is a physical thing suspended in air rather than something painted onto the ceiling. Accordingly the system uses real drop shadows with generous blur and no visible offset colour, and it does not pair them with borders: a panel is either elevated or it is inline, never both.

Depth escalates with permanence. A card of text lifts a little; a framed work lifts a lot; the closing seal lifts most and is the only element that also emits light.

### Shadow Vocabulary

- **Lifted** (`box-shadow: 0 20px 25px -5px rgb(0 0 0 / .1), 0 8px 10px -6px rgb(0 0 0 / .1)` — Tailwind `shadow-xl`): experience cards and testimonial panels. Present but modest.
- **Suspended** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / .25)` — Tailwind `shadow-2xl`): the manifesto inscription, the gilded catalogue frame, the contact seal. The system's primary elevation.
- **Struck** (`inset 0 0 0 1px rgba(212,175,106,.9), inset 0 0 0 5px rgba(232,223,208,.9), inset 0 0 0 6px rgba(143,74,46,.35), 0 10px 20px -12px rgba(43,38,34,.45)`): the stack medallion at rest. Concentric inset rings read as a struck coin; the outer shadow keeps it off the sky.
- **Struck, lit** (the same rings at full strength plus `0 14px 28px -10px rgba(43,38,34,.55), 0 0 30px rgba(212,175,106,.5)`): the medallion on hover. The gold glow is the light catching the raised edge.

### Named Rules

**The Elevated-Or-Inline Rule.** Declare depth once. A panel gets a shadow or a border, never both. The one exception is the catalogue plate label, whose hairline `sienna/30` border exists because it sits half-off its frame and needs an edge to read against two surfaces at once.

**The Never-Inline-A-Shadow Rule.** Resting shadows live in classes, not in a `style` prop. An inline `box-shadow` outranks every `hover:` rule and silently kills the hover state.

## Shapes

The system is almost square. Panels, plates, and frames use a 2px radius (`rounded-sm`) — enough to take the mechanical edge off a corner, not enough to read as a rounded card. Nothing in the system uses a mid-scale radius; there are no 12px or 16px cards here, because a soft-cornered rectangle is a modern UI object and this world has none.

Against that squareness, the circle is the system's only other form, and it is always a struck object: the 118px stack medallions, the 158px contact seal, the 16px cursor. Circles are minted things — coins, seals, wax — never avatars or buttons-that-happen-to-be-round.

Two irregular geometries carry the fresco fiction, both authored as explicit `clip-path` polygons rather than as filters or textures. The hero image is clipped to a slightly wavering rectangle so its edges read as a plastered panel rather than a photograph. The catalogue artwork is revealed by animating a brush-stroke polygon out to a full panel as it scrolls into view. Both are exact coordinate lists; neither uses `feTurbulence`, noise, or a sketch filter.

### Named Rules

**The Square-Or-Struck Rule.** Every shape is either a 2px-radius rectangle or a true circle. There is no middle radius in this system.

**The Hand-Cut-Edge Rule.** Irregular edges are authored `clip-path` polygons with real coordinates. Never a generated noise texture, never a `feTurbulence` filter, never a sketch-style SVG border.

## Components

### Buttons

The system has exactly one button-shaped thing and it is a seal, not a button.

- **Contact Seal:** a 158px circle filled `radial-gradient(circle at 36% 30%, #e8cf98, #d4af6a 48%, #a97f3e 82%, #8f4a2e)`, carrying an 11–12px tracked mono label in `#3d2413`, at `shadow-2xl`. The off-centre gradient origin is the light source; it must stay at roughly 36%/30% so the seal reads as lit from the same direction as the dome.
- **Hover / Focus:** scales to 1.05 over 500ms. Focus draws the sienna ring at 3px offset; it does not change fill.
- **There is no secondary button.** Every other action in the system is a link.

### Links

- **Inline link (catalogue CTA):** mono label in sienna over a `1px` gold bottom rule, sitting inside a 44px-tall hit area. The rule stays on the text; the hit area is invisible padding around it.
- **Hover:** text shifts sienna → gold over the default transition. The rule does not change.
- **Accessible naming:** repeated CTAs (three identical "view the work" links) must each carry an `aria-label` naming their project. Identical link text without distinguishing names is a defect, not a style choice.
- **Footer / utility links:** mono, sienna, same gold hover, 44px minimum target.

### Panels (cards)

- **Corner:** 2px (`rounded-sm`).
- **Parchment panel:** `#e8dfd0`, `40px` padding rising to `88px` above `md`, `shadow-2xl`. Holds the manifesto inscription.
- **Experience card:** parchment, `32px` padding, `shadow-xl`, fixed width `min(380px, 82vw)` so the frieze reads as a repeating relief.
- **Testimonial panel:** sky-panel `#ccd2d8`, `40px` padding, `shadow-xl`. Quotations sit in the ceiling, not on parchment.
- **Border:** none on any panel. See the Elevated-Or-Inline Rule.

### Stack Medallion

A 118px struck coin: `radial-gradient(circle at 38% 32%, #f0e8d8, #e2d5ba 55%, #cbb287)` with the concentric inset rings from the Elevation section, holding a centred Fraunces 600 label in sienna. Hover brightens the outer ring to full gold and adds the ambient glow. This is the system's signature component and the only place a technology name appears.

### Catalogue Frame

A gilded surround — `linear-gradient(to bottom right, #e8cf98, #d4af6a, #7a3d24)` at `16px` — around a `8px` parchment mat, around the recessed `#ded2bd` artwork plane. A plate label hangs half-off the bottom edge: parchment, hairline sienna border, 10px mono at 0.30em, reading `WORK № {numeral} · {year}`.

### Room Label

The recurring `SALA {N} · {NAME}` line above every section title: 11px JetBrains Mono, sienna, 0.34em letter-spacing, uppercase. It is a museum room plate, not a marketing eyebrow — it carries the sequence and the room's name, which is information the visitor uses.

### Navigation

There is none, by design. The only persistent control is the language toggle, top-right of the hero: an 11px mono glyph (`ES` / `EN`) in a 44×44 target, sienna with gold hover.

### Signature: The Dome

A fixed full-viewport canvas behind everything, `mix-blend-mode: soft-light`, `-z-10`, drawing ten gold rays from a focal point. The fan rotates once every 120 seconds. Scroll drives two values: ray opacity from 0.12 to 0.55, and the focal point from 30% to 85% down the viewport — so as the visitor descends, the light source sinks with them and intensifies. Under `prefers-reduced-motion` it paints one static frame and stops. This is the element that makes the page a ceiling rather than a background.

## Do's and Don'ts

### Do:

- **Do** put every surface in front of the sky, never on a solid page colour. `bg-sky-gradient` is the ground.
- **Do** use sienna (`#7a3d24`) for text and gold (`#d4af6a`) for interaction and light.
- **Do** keep the three faces in their three jobs — Fraunces speaks, Newsreader explains, JetBrains Mono labels.
- **Do** measure section rhythm in `vh` (10–16vh) and keep gutters at a flat 24px.
- **Do** give every scroll-driven horizontal sequence a plain stacked fallback below `md`.
- **Do** honour `prefers-reduced-motion` — the page is wrapped in `<MotionConfig reducedMotion="user">` and the canvas and GSAP reveals check the hook directly.
- **Do** keep radii at 2px or make the thing a full circle.
- **Do** give every control a 44px minimum target and the sienna focus ring.
- **Do** author irregular edges as explicit `clip-path` polygons.

### Don't:

- **Don't** introduce white, `#f5f5f5`, true grey, or `#000`. The palette is earth and sky only.
- **Don't** set gold as body text, a label colour, or a focus ring — it fails contrast on every surface in this system.
- **Don't** put a resting `box-shadow` in a `style` prop; it silently overrides every `hover:` rule.
- **Don't** pair a border with a shadow on the same panel.
- **Don't** use a mid-scale radius (8px, 12px, 16px). There is no rounded-card in this world.
- **Don't** set mono below 0.22em tracking, above 12px, or in running prose.
- **Don't** add noise textures, `feTurbulence`, grain filters, or sketch-style SVG to imply age. The fresco is carried by palette, clip-path, and light.
- **Don't** add a second display face, a sans-serif, or a system font. Three faces, fixed.
- **Don't** scroll-jack on touch.
- **Don't** add navigation, a sticky header, or a second page-level control. The walk is linear.
