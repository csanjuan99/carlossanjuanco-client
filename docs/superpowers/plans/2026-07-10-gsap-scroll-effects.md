# GSAP Scroll Effects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent GSAP-driven "living dome" light-ray background and a curtain-style "blinds" reveal transition on the Obras and Frieze section headings, without touching any existing framer-motion animation.

**Architecture:** Two new, self-contained shared components (`FrescoDome`, `BlindsReveal`) built on GSAP + ScrollTrigger + `@gsap/react`'s `useGSAP` hook, plus a shared `usePrefersReducedMotion` hook (GoldCursor is refactored to consume it too, since this is its third use site). `FrescoDome` mounts once in `HomePage`. `BlindsReveal` wraps two existing heading blocks in place.

**Tech Stack:** gsap, @gsap/react (new), alongside the existing React 19 + TypeScript + Tailwind + framer-motion + Vitest stack.

## Global Constraints

- New dependencies: `gsap` and `@gsap/react` — the first GSAP usage in this project.
- Scope is additive only: the new background layer and the two blinds-reveal wrappers. No existing framer-motion animation (Hero, RevealText, GoldCursor's cursor-follow, StackSection, Obras brush-wipe, Frieze sticky-scroll) is modified in behavior.
- `FrescoDome` renders on top of the existing `bg-sky-gradient` CSS background — it does not replace it.
- Both new effects respect `prefers-reduced-motion` with a **static fallback** (content/texture still shows, motion stops) rather than being hidden outright, and pause via the Page Visibility API when the tab is hidden.
- `BlindsReveal` wraps only the heading blocks of `ObrasSection` and `FriezeSection` — no other section.
- `BlindsReveal`'s reveal fires once per page load (`ScrollTrigger` `once: true`), is not scroll-scrubbed, and does not modify the `RevealText`/fade-in animations already running on the content underneath.
- Pure calculation logic (`fresco-dome-math.ts`) and the reduced-motion hook are unit-tested with Vitest. `FrescoDome` and `BlindsReveal` themselves are not unit-tested (canvas rendering and GSAP timeline behavior are not meaningfully testable that way) — verified manually in a browser instead, matching how `GoldCursor` and `BrushWipeImage` were verified.

---

### Task 1: Install GSAP dependencies

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `gsap` and `@gsap/react` available as project dependencies for all later tasks.

- [ ] **Step 1: Install the dependencies**

```bash
yarn add gsap @gsap/react
```

- [ ] **Step 2: Verify the existing project still typechecks, tests, and builds**

Run: `npx tsc -b && npx vitest run && yarn build`
Expected: typecheck passes with no errors, all existing tests pass (11/11 at time of writing), build succeeds. This confirms the new dependency didn't break anything before any new code is written.

- [ ] **Step 3: Commit**

```bash
git add package.json yarn.lock
git commit -m "chore: add gsap and @gsap/react dependencies"
```

---

### Task 2: usePrefersReducedMotion shared hook

**Files:**
- Create: `src/shared/hooks/use-prefers-reduced-motion.ts`
- Test: `src/shared/hooks/use-prefers-reduced-motion.test.ts`

**Interfaces:**
- Produces: `getPrefersReducedMotion(): boolean` (pure, reads `window.matchMedia` synchronously) and `usePrefersReducedMotion(): boolean` (React hook, re-renders on change) — both exported from `@/shared/hooks/use-prefers-reduced-motion`. Consumed by Task 3 (GoldCursor refactor), Task 5 (FrescoDome), Task 6 (BlindsReveal).

- [ ] **Step 1: Write the failing test**

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPrefersReducedMotion } from './use-prefers-reduced-motion'

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

describe('getPrefersReducedMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when the media query matches', () => {
    mockMatchMedia(true)
    expect(getPrefersReducedMotion()).toBe(true)
  })

  it('returns false when the media query does not match', () => {
    mockMatchMedia(false)
    expect(getPrefersReducedMotion()).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/shared/hooks/use-prefers-reduced-motion.test.ts`
Expected: FAIL — `Cannot find module './use-prefers-reduced-motion'`

- [ ] **Step 3: Create `src/shared/hooks/use-prefers-reduced-motion.ts`**

```ts
import { useEffect, useState } from 'react'

export function getPrefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getPrefersReducedMotion)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    function handleChange(event: MediaQueryListEvent) {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/shared/hooks/use-prefers-reduced-motion.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/shared/hooks/use-prefers-reduced-motion.ts src/shared/hooks/use-prefers-reduced-motion.test.ts
git commit -m "feat: add usePrefersReducedMotion shared hook"
```

---

### Task 3: Refactor GoldCursor to use the shared hook

**Files:**
- Modify: `src/shared/components/gold-cursor/GoldCursor.tsx`

**Interfaces:**
- Consumes: `getPrefersReducedMotion` from `@/shared/hooks/use-prefers-reduced-motion` (Task 2).
- Produces: no change to `GoldCursor`'s external behavior or exports — this is an internal DRY refactor only (removes the third copy of the same `matchMedia('(prefers-reduced-motion: reduce)')` check).

- [ ] **Step 1: Read the current file**

Read `src/shared/components/gold-cursor/GoldCursor.tsx` — it currently has a local `isFinePointerWithoutReducedMotion()` function that inlines both the `(pointer: fine)` check and the `(prefers-reduced-motion: reduce)` check.

- [ ] **Step 2: Replace the inline reduced-motion check with the shared hook's pure function**

Change the top of the file from:

```tsx
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

function isFinePointerWithoutReducedMotion(): boolean {
  const finePointer = window.matchMedia('(pointer: fine)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return finePointer && !reducedMotion
}
```

to:

```tsx
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { getPrefersReducedMotion } from '@/shared/hooks/use-prefers-reduced-motion'

function isFinePointerWithoutReducedMotion(): boolean {
  const finePointer = window.matchMedia('(pointer: fine)').matches
  return finePointer && !getPrefersReducedMotion()
}
```

The rest of the file (the `GoldCursor` component itself, the hover-scale logic from the earlier task) is unchanged.

- [ ] **Step 3: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 4: Manual smoke check**

Run: `yarn dev`, open the site, confirm the gold cursor still follows the mouse on desktop and still scales up over links/medallions (behavior must be identical to before this refactor — only the internal reduced-motion check changed).

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/gold-cursor/GoldCursor.tsx
git commit -m "refactor: GoldCursor consumes shared usePrefersReducedMotion check"
```

---

### Task 4: fresco-dome-math pure functions

**Files:**
- Create: `src/shared/components/fresco-dome/fresco-dome-math.ts`
- Test: `src/shared/components/fresco-dome/fresco-dome-math.test.ts`

**Interfaces:**
- Produces: `clampProgress(progress: number): number`, `calculateRayIntensity(scrollProgress: number): number`, `calculateFocalPointYPercent(scrollProgress: number): number`, `calculateRayRotationDegrees(elapsedSeconds: number, revolutionDurationSeconds: number): number` — all exported from `@/shared/components/fresco-dome/fresco-dome-math`. Consumed by Task 5 (`FrescoDome.tsx`).

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest'
import {
  calculateFocalPointYPercent,
  calculateRayIntensity,
  calculateRayRotationDegrees,
  clampProgress,
} from './fresco-dome-math'

describe('clampProgress', () => {
  it('clamps values below 0 to 0', () => {
    expect(clampProgress(-0.5)).toBe(0)
  })

  it('clamps values above 1 to 1', () => {
    expect(clampProgress(1.5)).toBe(1)
  })

  it('passes through in-range values unchanged', () => {
    expect(clampProgress(0.4)).toBe(0.4)
  })
})

describe('calculateRayIntensity', () => {
  it('is the minimum opacity at progress 0', () => {
    expect(calculateRayIntensity(0)).toBeCloseTo(0.12)
  })

  it('is the maximum opacity at progress 1', () => {
    expect(calculateRayIntensity(1)).toBeCloseTo(0.55)
  })

  it('is proportional at the midpoint', () => {
    expect(calculateRayIntensity(0.5)).toBeCloseTo(0.335)
  })

  it('clamps out-of-range progress before mapping', () => {
    expect(calculateRayIntensity(2)).toBeCloseTo(0.55)
  })
})

describe('calculateFocalPointYPercent', () => {
  it('starts at 30% at progress 0', () => {
    expect(calculateFocalPointYPercent(0)).toBe(30)
  })

  it('ends at 85% at progress 1', () => {
    expect(calculateFocalPointYPercent(1)).toBe(85)
  })

  it('is proportional at the midpoint', () => {
    expect(calculateFocalPointYPercent(0.5)).toBeCloseTo(57.5)
  })
})

describe('calculateRayRotationDegrees', () => {
  it('is 0 degrees at elapsed time 0', () => {
    expect(calculateRayRotationDegrees(0, 120)).toBe(0)
  })

  it('is 180 degrees at half the revolution duration', () => {
    expect(calculateRayRotationDegrees(60, 120)).toBe(180)
  })

  it('wraps around past one full revolution', () => {
    expect(calculateRayRotationDegrees(150, 120)).toBe(90)
  })

  it('returns 0 for a non-positive revolution duration', () => {
    expect(calculateRayRotationDegrees(50, 0)).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/shared/components/fresco-dome/fresco-dome-math.test.ts`
Expected: FAIL — `Cannot find module './fresco-dome-math'`

- [ ] **Step 3: Create `src/shared/components/fresco-dome/fresco-dome-math.ts`**

```ts
const MIN_RAY_OPACITY = 0.12
const MAX_RAY_OPACITY = 0.55
const START_FOCAL_Y_PERCENT = 30
const END_FOCAL_Y_PERCENT = 85

export function clampProgress(progress: number): number {
  return Math.min(Math.max(progress, 0), 1)
}

export function calculateRayIntensity(scrollProgress: number): number {
  const clamped = clampProgress(scrollProgress)
  return MIN_RAY_OPACITY + (MAX_RAY_OPACITY - MIN_RAY_OPACITY) * clamped
}

export function calculateFocalPointYPercent(scrollProgress: number): number {
  const clamped = clampProgress(scrollProgress)
  return START_FOCAL_Y_PERCENT + (END_FOCAL_Y_PERCENT - START_FOCAL_Y_PERCENT) * clamped
}

export function calculateRayRotationDegrees(elapsedSeconds: number, revolutionDurationSeconds: number): number {
  if (revolutionDurationSeconds <= 0) return 0
  const cycleProgress = (elapsedSeconds % revolutionDurationSeconds) / revolutionDurationSeconds
  return cycleProgress * 360
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/shared/components/fresco-dome/fresco-dome-math.test.ts`
Expected: PASS (11 tests)

- [ ] **Step 5: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/shared/components/fresco-dome/fresco-dome-math.ts src/shared/components/fresco-dome/fresco-dome-math.test.ts
git commit -m "feat: add fresco-dome pure ray-math functions"
```

---

### Task 5: FrescoDome canvas background component

**Files:**
- Create: `src/shared/components/fresco-dome/FrescoDome.tsx`
- Modify: `src/modules/portfolio/pages/home/index.tsx`

**Interfaces:**
- Consumes: `usePrefersReducedMotion` from `@/shared/hooks/use-prefers-reduced-motion` (Task 2); `clampProgress`, `calculateRayIntensity`, `calculateFocalPointYPercent`, `calculateRayRotationDegrees` from `./fresco-dome-math` (Task 4).
- Produces: default export `FrescoDome` component, no props — mounted once in `HomePage`.

- [ ] **Step 1: Create `src/shared/components/fresco-dome/FrescoDome.tsx`**

```tsx
import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '@/shared/hooks/use-prefers-reduced-motion'
import { calculateFocalPointYPercent, calculateRayIntensity } from './fresco-dome-math'

gsap.registerPlugin(ScrollTrigger)

const REVOLUTION_DURATION_SECONDS = 120
const RAY_COLOR_RGB = '212, 175, 106'
const RAY_COUNT = 10

function drawRays(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rotationDegrees: number,
  intensity: number,
  focalYPercent: number,
) {
  ctx.clearRect(0, 0, width, height)
  const focalX = width / 2
  const focalY = (focalYPercent / 100) * height
  const maxRadius = Math.max(width, height)

  // Rotate the whole coordinate space around the focal point rather than each ray
  // individually — keeps the rays evenly spaced as a rigid fan while it slowly spins.
  ctx.save()
  ctx.translate(focalX, focalY)
  ctx.rotate((rotationDegrees * Math.PI) / 180)

  for (let i = 0; i < RAY_COUNT; i++) {
    // Each ray is an evenly-spaced spoke from the (now-translated) focal point outward.
    const angle = (i / RAY_COUNT) * Math.PI * 2
    const endX = Math.cos(angle) * maxRadius
    const endY = Math.sin(angle) * maxRadius
    const gradient = ctx.createLinearGradient(0, 0, endX, endY)
    gradient.addColorStop(0, `rgba(${RAY_COLOR_RGB}, ${intensity})`)
    gradient.addColorStop(1, `rgba(${RAY_COLOR_RGB}, 0)`)
    ctx.strokeStyle = gradient
    ctx.lineWidth = maxRadius / RAY_COUNT
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  }

  ctx.restore()
}

export default function FrescoDome() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return

      function resizeCanvas() {
        canvas!.width = window.innerWidth
        canvas!.height = window.innerHeight
      }
      resizeCanvas()
      window.addEventListener('resize', resizeCanvas)

      const state = {
        rotation: 0,
        intensity: calculateRayIntensity(0),
        focalYPercent: calculateFocalPointYPercent(0),
      }

      function render() {
        drawRays(ctx!, canvas!.width, canvas!.height, state.rotation, state.intensity, state.focalYPercent)
      }

      if (prefersReducedMotion) {
        render()
        return () => window.removeEventListener('resize', resizeCanvas)
      }

      const rotationTween = gsap.to(state, {
        rotation: 360,
        duration: REVOLUTION_DURATION_SECONDS,
        repeat: -1,
        ease: 'none',
      })

      // Tracks scroll across the whole document (not just this canvas) so ray intensity/
      // focal point evolve with how far into the page the user is, independent of viewport size.
      const scrollTrigger = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          state.intensity = calculateRayIntensity(self.progress)
          state.focalYPercent = calculateFocalPointYPercent(self.progress)
        },
      })

      // gsap.ticker drives the redraw every frame (not a scroll or tween callback) because
      // the slow rotation must keep animating even while the user isn't actively scrolling.
      gsap.ticker.add(render)

      // Stop redrawing when the tab is hidden so a background tab doesn't keep painting.
      function handleVisibilityChange() {
        if (document.hidden) {
          gsap.ticker.remove(render)
        } else {
          gsap.ticker.add(render)
        }
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        window.removeEventListener('resize', resizeCanvas)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        gsap.ticker.remove(render)
        rotationTween.kill()
        scrollTrigger.kill()
      }
    },
    { dependencies: [prefersReducedMotion] },
  )

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ mixBlendMode: 'soft-light' }}
    />
  )
}
```

- [ ] **Step 2: Mount `FrescoDome` in `HomePage`**

Modify `src/modules/portfolio/pages/home/index.tsx`. Add the import and mount it alongside `GoldCursor`:

```tsx
import FrescoDome from '@/shared/components/fresco-dome/FrescoDome'
import GoldCursor from '@/shared/components/gold-cursor/GoldCursor'
import HeroSection from './sections/hero/HeroSection'
import ManifestoSection from './sections/manifesto/ManifestoSection'
import StackSection from './sections/stack/StackSection'
import ObrasSection from './sections/obras/ObrasSection'
import FriezeSection from './sections/frieze/FriezeSection'
import TestimonialsSection from './sections/testimonials/TestimonialsSection'
import ContactSection from './sections/contact/ContactSection'
import Footer from './sections/footer/Footer'

export default function HomePage() {
  return (
    <div className="relative bg-sky-gradient font-newsreader text-ink">
      <FrescoDome />
      <GoldCursor />
      <HeroSection />
      <ManifestoSection />
      <StackSection />
      <ObrasSection />
      <FriezeSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 4: Manual browser check**

Run: `yarn dev`, open the site. Confirm: a very subtle warm light-ray texture is visible behind the content (it should read as barely-there ambient texture, not an obvious overlay), it does not obscure or discolor any text or card, and it intensifies subtly by the time you reach the Contact section. Toggle `prefers-reduced-motion` (Chrome DevTools → Rendering tab → "Emulate CSS media feature prefers-reduced-motion: reduce") and confirm the rays stay static (no rotation) rather than disappearing.

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/fresco-dome/FrescoDome.tsx src/modules/portfolio/pages/home/index.tsx
git commit -m "feat: add FrescoDome scroll-linked light-ray background"
```

---

### Task 6: BlindsReveal component

**Files:**
- Create: `src/shared/components/blinds-reveal/BlindsReveal.tsx`

**Interfaces:**
- Consumes: `usePrefersReducedMotion` from `@/shared/hooks/use-prefers-reduced-motion` (Task 2).
- Produces: default export `BlindsReveal` component with props `{ children: ReactNode; className?: string }` — used by Tasks 7 and 8.

- [ ] **Step 1: Create `src/shared/components/blinds-reveal/BlindsReveal.tsx`**

```tsx
import { useRef } from 'react'
import type { ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '@/shared/hooks/use-prefers-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

const SLAT_COUNT = 6

interface BlindsRevealProps {
  children: ReactNode
  className?: string
}

export default function BlindsReveal({ children, className }: BlindsRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (prefersReducedMotion) return
      const slats = containerRef.current?.querySelectorAll('[data-blind-slat]')
      if (!slats || slats.length === 0) return

      // once: true — this is a one-time "unveiling," not a scroll-scrubbed effect, so
      // scrolling back up and down again must not replay it or fight the reveal underneath.
      const scrollTrigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          // Shrinking from the top edge (transformOrigin: 'top') reads as a curtain
          // lifting away, rather than a plain fade, echoing the "unveiled fresco" panel.
          gsap.to(slats, {
            scaleY: 0,
            transformOrigin: 'top',
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.inOut',
          })
        },
      })

      return () => scrollTrigger.kill()
    },
    { dependencies: [prefersReducedMotion] },
  )

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      {children}
      {!prefersReducedMotion && (
        <div className="pointer-events-none absolute inset-0 flex" aria-hidden="true">
          {Array.from({ length: SLAT_COUNT }).map((_, index) => (
            <div key={index} data-blind-slat className="h-full flex-1 bg-parchment" />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/blinds-reveal/BlindsReveal.tsx
git commit -m "feat: add BlindsReveal curtain-style scroll transition"
```

---

### Task 7: Wire BlindsReveal into ObrasSection heading

**Files:**
- Modify: `src/modules/portfolio/pages/home/sections/obras/ObrasSection.tsx`

**Interfaces:**
- Consumes: `BlindsReveal` from `@/shared/components/blinds-reveal/BlindsReveal` (Task 6).

- [ ] **Step 1: Wrap the heading block**

In `ObrasSection.tsx`, add the import:

```tsx
import BlindsReveal from '@/shared/components/blinds-reveal/BlindsReveal'
```

Replace the heading block:

```tsx
<div className="mb-16 px-6 text-center">
  <div className="mb-4 font-mono text-[11px] tracking-[0.34em] text-sienna">{t('obras.label')}</div>
  <h2 className="font-fraunces text-[clamp(36px,5vw,64px)] font-medium tracking-tight">{t('obras.title')}</h2>
</div>
```

with:

```tsx
<BlindsReveal className="mb-16 px-6 text-center">
  <div className="mb-4 font-mono text-[11px] tracking-[0.34em] text-sienna">{t('obras.label')}</div>
  <h2 className="font-fraunces text-[clamp(36px,5vw,64px)] font-medium tracking-tight">{t('obras.title')}</h2>
</BlindsReveal>
```

Nothing else in the file changes — the `PROJECTS.map(...)` gallery below is untouched.

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 3: Manual browser check**

Run: `yarn dev`, scroll to the Obras section. Confirm the "SALA III · CATÁLOGO DE OBRAS" label and "Obras destacadas" heading are covered by parchment-colored vertical slats that peel away (top-anchored, shrinking vertically) in a left-to-right stagger as the section scrolls into view, revealing the heading beneath — and that this only happens once (scrolling back up and down again should not replay it).

- [ ] **Step 4: Commit**

```bash
git add src/modules/portfolio/pages/home/sections/obras/ObrasSection.tsx
git commit -m "feat: add blinds-reveal transition to Obras heading"
```

---

### Task 8: Wire BlindsReveal into FriezeSection heading

**Files:**
- Modify: `src/modules/portfolio/pages/home/sections/frieze/FriezeSection.tsx`

**Interfaces:**
- Consumes: `BlindsReveal` from `@/shared/components/blinds-reveal/BlindsReveal` (Task 6).

- [ ] **Step 1: Wrap the heading block**

In `FriezeSection.tsx`, add the import:

```tsx
import BlindsReveal from '@/shared/components/blinds-reveal/BlindsReveal'
```

Replace the heading block:

```tsx
<div className="mx-auto mb-14 max-w-[1180px] px-6">
  <div className="mb-4 font-mono text-[11px] tracking-[0.34em] text-sienna">{t('frieze.label')}</div>
  <h2 className="font-fraunces text-[clamp(36px,5vw,64px)] font-medium tracking-tight">{t('frieze.title')}</h2>
</div>
```

with:

```tsx
<BlindsReveal className="mx-auto mb-14 max-w-[1180px] px-6">
  <div className="mb-4 font-mono text-[11px] tracking-[0.34em] text-sienna">{t('frieze.label')}</div>
  <h2 className="font-fraunces text-[clamp(36px,5vw,64px)] font-medium tracking-tight">{t('frieze.title')}</h2>
</BlindsReveal>
```

Nothing else in the file changes — the sticky-scroll desktop track and the mobile vertical stack below are untouched.

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 3: Manual browser check**

Run: `yarn dev`, scroll to the Frieze/Experience section. Confirm the same blinds-reveal behavior on the "SALA IV · FRISO CRONOLÓGICO" / "Experiencia" heading, and confirm the sticky horizontal scroll of the job cards below still works exactly as before (this task must not have touched that logic).

- [ ] **Step 4: Commit**

```bash
git add src/modules/portfolio/pages/home/sections/frieze/FriezeSection.tsx
git commit -m "feat: add blinds-reveal transition to Frieze heading"
```

---

### Task 9: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full automated check**

Run: `npx tsc -b && npx eslint . && npx vitest run && yarn build`
Expected: typecheck clean, lint clean, all tests passing (11 pre-existing + the new hook and math tests from Tasks 2 and 4), production build succeeds.

- [ ] **Step 2: Manual browser walkthrough — both languages**

Run: `yarn dev`, scroll the full page in Spanish, then toggle to English with the language toggle and scroll the full page again. Confirm: the light-ray background and both blinds-reveal transitions look and behave identically in both languages (they're visual-only, not copy-dependent, but confirm nothing broke from the `ObrasSection`/`FriezeSection` edits).

- [ ] **Step 3: Manual browser walkthrough — reduced motion**

Enable `prefers-reduced-motion: reduce` (Chrome DevTools → Rendering tab). Reload and scroll the full page. Confirm: the light rays render as a static texture (no rotation, no scroll-linked intensity change), the Obras and Frieze headings appear immediately with no slats covering them (no blinds animation plays), and the gold cursor still doesn't render (unchanged behavior from before this plan).

- [ ] **Step 4: Manual browser walkthrough — mobile width**

Resize to <768px (or use device emulation). Confirm: the background and both blinds-reveal transitions still render sensibly at mobile width (no layout breakage), and the Frieze section still falls back to its existing plain vertical stack (unrelated to this plan, but confirm it wasn't broken by the heading-block edit in Task 8).

- [ ] **Step 5: Report results**

If all checks above hold, the GSAP scroll effects are complete. If any check fails, note which one and fix before considering this plan done — do not report success without having driven the actual page in a browser.
