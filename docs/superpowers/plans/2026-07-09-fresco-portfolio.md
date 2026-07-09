# Fresco Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current dark-minimalist portfolio with the Renaissance-fresco-themed design from the handoff, rebuilt natively in React + Tailwind + framer-motion, bilingual (ES/EN), with placeholder content.

**Architecture:** Bounded-context file layout (`src/shared/` for generic primitives and i18n, `src/modules/portfolio/pages/home/` for the page itself). Every handoff animation is re-derived from framer-motion — no GSAP is added. Pure logic (word-splitting, frieze scroll math, language resolution) is unit-tested with Vitest; visual/animated components are verified manually in the browser at the end.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 3, framer-motion, react-i18next, Vite, Vitest + happy-dom (new, test-only).

## Global Constraints

- Full replacement of the current dark portfolio — no parallel/dual design.
- Content stays placeholder; no real name, bio, projects, or work history yet.
- Bilingual ES/EN via `react-i18next`, default language `es`.
- No GSAP/ScrollTrigger/SplitText dependency — every animation uses framer-motion primitives (`useScroll`, `useTransform`, `useMotionValue`, `whileInView`).
- File structure follows the bounded-context `modules/` + `shared/` split.
- No hero illustration asset exists or is generated — the hero visual is a CSS/SVG gradient-mass stand-in.
- Sienna text color is darkened from the handoff's `#8f4a2e` to `#7a3d24` for WCAG AA contrast on parchment backgrounds.
- Fonts (Fraunces, Newsreader, JetBrains Mono) are self-hosted via `@fontsource` packages — no Google Fonts CDN request.
- The experience "frieze" section uses a sticky-container + `useScroll`-driven horizontal track on desktop; below 768px it renders as a plain vertical stack — no scroll-jack forced on mobile.
- No HeroUI or other component library is introduced — the design is fully bespoke-styled, matching the project's existing convention.

---

### Task 1: Project setup — dependencies, path alias, Tailwind theme, global CSS

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `tsconfig.app.json`
- Modify: `tailwind.config.js`
- Modify: `src/index.css`
- Modify: `index.html`

**Interfaces:**
- Produces: `@/*` path alias resolving to `src/*` (used by every subsequent task's imports). Tailwind theme tokens: colors `parchment`, `parchment-dark`, `gold`, `gold-light`, `sienna`, `ink`, `sky-panel`; `fontFamily` keys `fraunces`, `newsreader`, `mono`; `backgroundImage` key `sky-gradient`. Vitest configured with `environment: 'happy-dom'`.

- [ ] **Step 1: Install runtime and dev dependencies**

```bash
yarn add react-i18next i18next @fontsource-variable/fraunces @fontsource-variable/newsreader @fontsource/jetbrains-mono
yarn add -D vitest happy-dom
```

- [ ] **Step 2: Add the `test` script to `package.json`**

In the `"scripts"` block, add a `test` entry alongside the existing ones:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 3: Add the `@` path alias and Vitest config to `vite.config.ts`**

Replace the full file contents with:

```ts
/// <reference types="vitest/config" />
import path from 'node:path'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'happy-dom',
  },
})
```

- [ ] **Step 4: Mirror the path alias in `tsconfig.app.json`**

Add `baseUrl` and `paths` to `compilerOptions` (insert after `"skipLibCheck": true,`):

```json
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
```

- [ ] **Step 5: Replace `tailwind.config.js` with the fresco theme**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#e8dfd0',
        'parchment-dark': '#ded2bd',
        gold: '#d4af6a',
        'gold-light': '#e8cf98',
        sienna: '#7a3d24',
        ink: '#2b2622',
        'sky-panel': '#ccd2d8',
      },
      fontFamily: {
        fraunces: ["'Fraunces Variable'", 'Georgia', 'serif'],
        newsreader: ["'Newsreader Variable'", 'Georgia', 'serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      backgroundImage: {
        'sky-gradient': 'linear-gradient(175deg, #cdd6de 0%, #c9d3dc 30%, #a8b6c4 68%, #8fa0b3 100%)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 6: Replace `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body,
#root {
  min-height: 100%;
}

body {
  overflow-x: hidden;
}

::selection {
  background: #d4af6a;
  color: #2b2622;
}
```

- [ ] **Step 7: Clean up `index.html`**

Remove the Kanit Google Fonts `<link>` tags (fonts are now self-hosted via `@fontsource`, imported in `main.tsx` in Task 18) and update the title:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portfolio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Verify the project still typechecks**

Run: `npx tsc -b`
Expected: no errors (the old `App.tsx`/sections still reference the old Tailwind classes, which remain valid CSS-in-class strings — no old code imports the removed theme keys, so nothing breaks yet).

- [ ] **Step 9: Commit**

```bash
git add package.json yarn.lock vite.config.ts tsconfig.app.json tailwind.config.js src/index.css index.html
git commit -m "chore: set up fresco theme, path alias, and vitest"
```

---

### Task 2: i18n resources and configuration

**Files:**
- Create: `src/shared/i18n/es.json`
- Create: `src/shared/i18n/en.json`
- Create: `src/shared/i18n/i18n.ts`
- Test: `src/shared/i18n/i18n.test.ts`

**Interfaces:**
- Produces: `getInitialLanguage(): 'es' | 'en'`, `LANGUAGE_STORAGE_KEY: string`, default export `i18n` (configured i18next instance), type `SupportedLanguage = 'es' | 'en'` — all from `@/shared/i18n/i18n`. Translation keys used by every later section task: `hero.*`, `manifesto.*`, `stack.*`, `obras.*`, `frieze.*`, `testimonials.*`, `contact.*`, `footer.*` (exact keys below).

- [ ] **Step 1: Create `src/shared/i18n/es.json`**

```json
{
  "hero": {
    "eyebrow": "Tu Nombre — Senior FullStack Engineer · MMXXVI",
    "titleBefore": "El código como",
    "titleEmphasis": "acto de creación",
    "subtitle": "Diez años esculpiendo sistemas que escalan — del primer trazo de la arquitectura al último detalle de la interfaz.",
    "scrollHint": "DESPLAZA · LA BÓVEDA CONTINÚA ↓"
  },
  "manifesto": {
    "label": "MANIFIESTO · INSCRIPCIÓN Nº 1",
    "quote": "Creo que el buen software se construye como se pintaba una bóveda: con oficio, paciencia y la obsesión por el detalle que nadie verá de cerca — pero que todos sienten. Escribe aquí tu bio en dos o tres líneas.",
    "technique": "TÉCNICA — SISTEMAS DISTRIBUIDOS · ÓLEO SOBRE PRODUCCIÓN"
  },
  "stack": {
    "label": "SALA II · PANTEÓN DE HERRAMIENTAS",
    "title": "Las herramientas del oficio"
  },
  "obras": {
    "label": "SALA III · CATÁLOGO DE OBRAS",
    "title": "Obras destacadas",
    "technique": "TÉCNICA",
    "role": "ROL",
    "year": "AÑO",
    "result": "RESULTADO",
    "cta": "VER LA OBRA →",
    "imagePlaceholder": "Captura / mockup del proyecto — arrastra tu imagen",
    "plateLabel": "OBRA Nº {{numeral}} · {{year}}",
    "items": {
      "obra1": {
        "title": "Nombre del Proyecto Uno",
        "desc": "Descripción breve del proyecto: qué problema resolvía, para quién, y qué lo hace notable. Dos o tres frases.",
        "role": "Arquitectura y desarrollo full-stack",
        "result": "Resultado clave medible (p. ej. +40% conversión)"
      },
      "obra2": {
        "title": "Nombre del Proyecto Dos",
        "desc": "Descripción breve del proyecto: contexto, reto técnico principal y tu aportación concreta.",
        "role": "Tech lead",
        "result": "Resultado clave medible"
      },
      "obra3": {
        "title": "Nombre del Proyecto Tres",
        "desc": "Descripción breve del proyecto: escala, restricciones y decisión de diseño de la que estás orgulloso.",
        "role": "Senior engineer",
        "result": "Resultado clave medible"
      }
    }
  },
  "frieze": {
    "label": "SALA IV · FRISO CRONOLÓGICO",
    "title": "Experiencia",
    "items": {
      "job1": { "years": "2022 — HOY", "company": "Empresa Actual", "role": "Senior FullStack Engineer", "feat": "Logro clave: qué construiste, a qué escala, y el impacto en negocio o equipo." },
      "job2": { "years": "2019 — 2022", "company": "Empresa Anterior", "role": "FullStack Engineer", "feat": "Logro clave de esta etapa: sistema, migración o producto que lideraste." },
      "job3": { "years": "2017 — 2019", "company": "Otra Empresa", "role": "Software Engineer", "feat": "Logro clave: primeras responsabilidades de arquitectura o mentoring." },
      "job4": { "years": "2015 — 2017", "company": "Primera Empresa", "role": "Junior Developer", "feat": "Dónde empezó todo: primer producto en producción." }
    }
  },
  "testimonials": {
    "label": "SALA V · PLACAS CONMEMORATIVAS",
    "title": "Lo que dicen de mi trabajo",
    "items": {
      "t1": { "quote": "Cita de recomendación: dos frases sobre cómo es trabajar contigo y el impacto que tuviste.", "author": "Nombre — Cargo, Empresa" },
      "t2": { "quote": "Segunda cita: otra voz, idealmente un founder o manager, sobre un resultado concreto.", "author": "Nombre — Cargo, Empresa" }
    }
  },
  "contact": {
    "label": "EPÍLOGO · LA LUZ ENTRA POR LA CÚPULA",
    "title": "Construyamos la próxima obra juntos",
    "subtitle": "Disponible para proyectos ambiciosos, equipos exigentes y problemas que merezcan una bóveda propia.",
    "cta": "ESCRÍBEME"
  },
  "footer": {
    "copyright": "© MMXXVI · TU NOMBRE · HECHO A MANO",
    "github": "GITHUB",
    "linkedin": "LINKEDIN",
    "email": "EMAIL"
  }
}
```

- [ ] **Step 2: Create `src/shared/i18n/en.json`**

```json
{
  "hero": {
    "eyebrow": "Your Name — Senior FullStack Engineer · MMXXVI",
    "titleBefore": "Code as an",
    "titleEmphasis": "act of creation",
    "subtitle": "Ten years sculpting systems that scale — from architecture's first stroke to the interface's last detail.",
    "scrollHint": "SCROLL · THE VAULT CONTINUES ↓"
  },
  "manifesto": {
    "label": "MANIFESTO · INSCRIPTION No. 1",
    "quote": "I believe good software is built the way a vault was once painted: with craft, patience, and an obsession for the details no one sees up close — but everyone feels. Write your two- or three-line bio here.",
    "technique": "TECHNIQUE — DISTRIBUTED SYSTEMS · OIL ON PRODUCTION"
  },
  "stack": {
    "label": "GALLERY II · PANTHEON OF TOOLS",
    "title": "The tools of the craft"
  },
  "obras": {
    "label": "GALLERY III · CATALOGUE OF WORKS",
    "title": "Featured works",
    "technique": "TECHNIQUE",
    "role": "ROLE",
    "year": "YEAR",
    "result": "RESULT",
    "cta": "VIEW THE WORK →",
    "imagePlaceholder": "Project screenshot / mockup — drop your image here",
    "plateLabel": "WORK No. {{numeral}} · {{year}}",
    "items": {
      "obra1": {
        "title": "Project Name One",
        "desc": "Brief project description: what problem it solved, for whom, and what makes it notable. Two or three sentences.",
        "role": "Full-stack architecture and development",
        "result": "Key measurable result (e.g. +40% conversion)"
      },
      "obra2": {
        "title": "Project Name Two",
        "desc": "Brief project description: context, main technical challenge, and your concrete contribution.",
        "role": "Tech lead",
        "result": "Key measurable result"
      },
      "obra3": {
        "title": "Project Name Three",
        "desc": "Brief project description: scale, constraints, and a design decision you're proud of.",
        "role": "Senior engineer",
        "result": "Key measurable result"
      }
    }
  },
  "frieze": {
    "label": "GALLERY IV · CHRONOLOGICAL FRIEZE",
    "title": "Experience",
    "items": {
      "job1": { "years": "2022 — NOW", "company": "Current Company", "role": "Senior FullStack Engineer", "feat": "Key achievement: what you built, at what scale, and the impact on the business or team." },
      "job2": { "years": "2019 — 2022", "company": "Previous Company", "role": "FullStack Engineer", "feat": "Key achievement from this stage: system, migration, or product you led." },
      "job3": { "years": "2017 — 2019", "company": "Another Company", "role": "Software Engineer", "feat": "Key achievement: first architecture or mentoring responsibilities." },
      "job4": { "years": "2015 — 2017", "company": "First Company", "role": "Junior Developer", "feat": "Where it all started: first product shipped to production." }
    }
  },
  "testimonials": {
    "label": "GALLERY V · COMMEMORATIVE PLAQUES",
    "title": "What people say about my work",
    "items": {
      "t1": { "quote": "Recommendation quote: two sentences on what it's like to work with you and the impact you had.", "author": "Name — Title, Company" },
      "t2": { "quote": "Second quote: another voice, ideally a founder or manager, on a concrete result.", "author": "Name — Title, Company" }
    }
  },
  "contact": {
    "label": "EPILOGUE · THE LIGHT ENTERS THROUGH THE DOME",
    "title": "Let's build the next great work together",
    "subtitle": "Available for ambitious projects, demanding teams, and problems that deserve their own vault.",
    "cta": "WRITE TO ME"
  },
  "footer": {
    "copyright": "© MMXXVI · YOUR NAME · HANDCRAFTED",
    "github": "GITHUB",
    "linkedin": "LINKEDIN",
    "email": "EMAIL"
  }
}
```

- [ ] **Step 3: Create `src/shared/i18n/i18n.ts`**

```ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './es.json'
import en from './en.json'

export type SupportedLanguage = 'es' | 'en'

export const LANGUAGE_STORAGE_KEY = 'fresco-portfolio-lang'

export function getInitialLanguage(): SupportedLanguage {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return stored === 'en' ? 'en' : 'es'
}

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lng)
})

export default i18n
```

- [ ] **Step 4: Write the failing test — `src/shared/i18n/i18n.test.ts`**

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { getInitialLanguage, LANGUAGE_STORAGE_KEY } from './i18n'

describe('getInitialLanguage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns "es" when nothing is stored', () => {
    expect(getInitialLanguage()).toBe('es')
  })

  it('returns "en" when "en" is stored', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en')
    expect(getInitialLanguage()).toBe('en')
  })

  it('falls back to "es" for an unrecognized stored value', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr')
    expect(getInitialLanguage()).toBe('es')
  })
})
```

- [ ] **Step 5: Run the test**

Run: `npx vitest run src/shared/i18n/i18n.test.ts`
Expected: PASS (the implementation already exists from Step 3 — this confirms it's correct, per the "write test against real implementation, then run" flow used for pure-logic modules in this plan).

- [ ] **Step 6: Commit**

```bash
git add src/shared/i18n
git commit -m "feat: add bilingual i18n resources and configuration"
```

---

### Task 3: RevealText component

**Files:**
- Create: `src/shared/components/reveal-text/RevealText.tsx`
- Test: `src/shared/components/reveal-text/RevealText.test.ts`

**Interfaces:**
- Produces: `splitIntoWords(text: string): string[]`, default export `RevealText` component with props `{ text: string; className?: string; wordClassName?: string; staggerDelay?: number; as?: 'p' | 'h1' | 'h2' | 'span' }` — used by Hero and Manifesto sections (Tasks 10, 11).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { splitIntoWords } from './RevealText'

describe('splitIntoWords', () => {
  it('splits on single spaces', () => {
    expect(splitIntoWords('acto de creación')).toEqual(['acto', 'de', 'creación'])
  })

  it('collapses repeated spaces without producing empty entries', () => {
    expect(splitIntoWords('hello   world')).toEqual(['hello', 'world'])
  })

  it('returns an empty array for an empty string', () => {
    expect(splitIntoWords('')).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/shared/components/reveal-text/RevealText.test.ts`
Expected: FAIL — `Cannot find module './RevealText'` (file doesn't exist yet).

- [ ] **Step 3: Create `src/shared/components/reveal-text/RevealText.tsx`**

```tsx
import { motion } from 'framer-motion'

interface RevealTextProps {
  text: string
  className?: string
  wordClassName?: string
  staggerDelay?: number
  as?: 'p' | 'h1' | 'h2' | 'span'
}

export function splitIntoWords(text: string): string[] {
  return text.split(' ').filter((word) => word.length > 0)
}

const containerVariants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: { staggerChildren: stagger },
  }),
}

const wordVariants = {
  hidden: { y: '110%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

export default function RevealText({
  text,
  className,
  wordClassName,
  staggerDelay = 0.05,
  as: Tag = 'p',
}: RevealTextProps) {
  const words = splitIntoWords(text)

  return (
    <Tag className={className}>
      <motion.span
        style={{ display: 'inline' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={containerVariants}
        custom={staggerDelay}
      >
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className={wordClassName}
            style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}
          >
            <motion.span style={{ display: 'inline-block' }} variants={wordVariants}>
              {word}
              {index < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/shared/components/reveal-text/RevealText.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/shared/components/reveal-text
git commit -m "feat: add RevealText word-stagger reveal component"
```

---

### Task 4: BrushWipeImage component

**Files:**
- Create: `src/shared/components/brush-wipe-image/BrushWipeImage.tsx`

**Interfaces:**
- Produces: default export `BrushWipeImage` component with props `{ className?: string; children: ReactNode }` — used by ObrasSection (Task 13) to wrap the placeholder project-screenshot slot.

- [ ] **Step 1: Create `src/shared/components/brush-wipe-image/BrushWipeImage.tsx`**

```tsx
import { useRef } from 'react'
import type { ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const BRUSH_START =
  'polygon(8% 46%, 30% 42%, 52% 47%, 74% 43%, 92% 48%, 93% 55%, 70% 58%, 48% 54%, 26% 59%, 7% 54%)'
const BRUSH_END =
  'polygon(0% 2%, 22% 0%, 50% 2%, 78% 0%, 100% 3%, 100% 98%, 76% 100%, 50% 98%, 24% 100%, 0% 97%)'

interface BrushWipeImageProps {
  className?: string
  children: ReactNode
}

export default function BrushWipeImage({ className, children }: BrushWipeImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'start 40%'] })
  const clipPath = useTransform(scrollYProgress, [0, 1], [BRUSH_START, BRUSH_END])
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div ref={ref} className={className} style={{ clipPath, opacity }}>
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/brush-wipe-image
git commit -m "feat: add BrushWipeImage scroll-driven clip-path reveal"
```

---

### Task 5: GoldCursor component

**Files:**
- Create: `src/shared/components/gold-cursor/GoldCursor.tsx`

**Interfaces:**
- Produces: default export `GoldCursor` component, no props — mounted once in `HomePage` (Task 18).

- [ ] **Step 1: Create `src/shared/components/gold-cursor/GoldCursor.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function GoldCursor() {
  const [enabled, setEnabled] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 300, damping: 30, mass: 0.4 })

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reducedMotion) return

    setEnabled(true)

    function handleMove(event: MouseEvent) {
      x.set(event.clientX)
      y.set(event.clientY)
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [x, y])

  if (!enabled) return null

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 16,
        height: 16,
        marginTop: -8,
        marginLeft: -8,
        borderRadius: '50% 42% 55% 45%',
        background: 'radial-gradient(circle at 35% 35%, #e8cf98, #d4af6a 60%, #b8853f)',
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
        zIndex: 80,
        x: springX,
        y: springY,
      }}
    />
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/gold-cursor
git commit -m "feat: add GoldCursor spring-following cursor"
```

---

### Task 6: LanguageToggle component

**Files:**
- Create: `src/shared/components/language-toggle/LanguageToggle.tsx`

**Interfaces:**
- Consumes: `useTranslation` from `react-i18next` (configured by Task 2's `@/shared/i18n/i18n`, imported globally in Task 18).
- Produces: default export `LanguageToggle` component, no props — mounted in HeroSection (Task 10).

- [ ] **Step 1: Create `src/shared/components/language-toggle/LanguageToggle.tsx`**

```tsx
import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const nextLanguage = i18n.language === 'es' ? 'en' : 'es'

  function handleClick() {
    i18n.changeLanguage(nextLanguage)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="font-mono text-[11px] tracking-[0.26em] text-sienna transition-colors hover:text-gold"
      aria-label={`Switch language to ${nextLanguage === 'en' ? 'English' : 'Español'}`}
    >
      {nextLanguage.toUpperCase()}
    </button>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/language-toggle
git commit -m "feat: add LanguageToggle ES/EN switch"
```

---

### Task 7: use-frieze-scroll hook

**Files:**
- Create: `src/shared/hooks/use-frieze-scroll.ts`
- Test: `src/shared/hooks/use-frieze-scroll.test.ts`

**Interfaces:**
- Produces: `calculateFriezeTranslateX(progress: number, trackWidth: number, viewportWidth: number): number`, `useFriezeScroll(): { containerRef: RefObject<HTMLDivElement>; trackRef: RefObject<HTMLDivElement>; x: MotionValue<number> }` — used by FriezeSection (Task 14).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { calculateFriezeTranslateX } from './use-frieze-scroll'

describe('calculateFriezeTranslateX', () => {
  it('is 0 at the start of the scroll range', () => {
    expect(calculateFriezeTranslateX(0, 3000, 1200)).toBe(-0)
  })

  it('reaches the full negative track distance at the end of the range', () => {
    expect(calculateFriezeTranslateX(1, 3000, 1200)).toBe(-1800)
  })

  it('is proportional at the midpoint', () => {
    expect(calculateFriezeTranslateX(0.5, 3000, 1200)).toBe(-900)
  })

  it('clamps progress values outside [0, 1]', () => {
    expect(calculateFriezeTranslateX(1.5, 3000, 1200)).toBe(-1800)
    expect(calculateFriezeTranslateX(-0.5, 3000, 1200)).toBe(-0)
  })

  it('never produces a positive distance when the track is narrower than the viewport', () => {
    expect(calculateFriezeTranslateX(1, 800, 1200)).toBe(-0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/shared/hooks/use-frieze-scroll.test.ts`
Expected: FAIL — `Cannot find module './use-frieze-scroll'`

- [ ] **Step 3: Create `src/shared/hooks/use-frieze-scroll.ts`**

```ts
import { useRef } from 'react'
import type { RefObject } from 'react'
import { useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'

export function calculateFriezeTranslateX(
  progress: number,
  trackWidth: number,
  viewportWidth: number,
): number {
  const distance = Math.max(trackWidth - viewportWidth, 0)
  const clampedProgress = Math.min(Math.max(progress, 0), 1)
  return -distance * clampedProgress
}

interface UseFriezeScrollResult {
  containerRef: RefObject<HTMLDivElement>
  trackRef: RefObject<HTMLDivElement>
  x: MotionValue<number>
}

export function useFriezeScroll(): UseFriezeScrollResult {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const x = useTransform(scrollYProgress, (progress) => {
    const track = trackRef.current
    const container = containerRef.current
    if (!track || !container) return 0
    return calculateFriezeTranslateX(progress, track.scrollWidth, container.clientWidth)
  })

  return { containerRef, trackRef, x }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/shared/hooks/use-frieze-scroll.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/shared/hooks/use-frieze-scroll.ts src/shared/hooks/use-frieze-scroll.test.ts
git commit -m "feat: add sticky-scroll frieze hook with pure translateX calculation"
```

---

### Task 8: Relocate FadeIn to shared/components

**Files:**
- Create: `src/shared/components/fade-in/FadeIn.tsx`
- Delete: `src/components/FadeIn.tsx`

**Interfaces:**
- Produces: default export `FadeIn` (unchanged behavior) at `@/shared/components/fade-in/FadeIn` — used by ManifestoSection (Task 11) and TestimonialsSection (Task 15).

- [ ] **Step 1: Move the file with its history preserved**

```bash
git mv src/components/FadeIn.tsx src/shared/components/fade-in/FadeIn.tsx
```

- [ ] **Step 2: Confirm the file contents are unchanged**

The component's implementation does not need to change — it has no internal project imports (only `framer-motion` and `react` types), so no import paths inside the file need updating.

- [ ] **Step 3: Typecheck**

Run: `npx tsc -b`
Expected: Errors from files that still import the old `../components/FadeIn` path (there are none yet — nothing currently imports `FadeIn`). If any appear, they belong to old dark-theme sections that are deleted in Task 18; ignore for now and re-verify after that task.

- [ ] **Step 4: Commit**

```bash
git add -A src/shared/components/fade-in src/components/FadeIn.tsx
git commit -m "refactor: move FadeIn into shared/components"
```

---

### Task 9: Page data files

**Files:**
- Create: `src/modules/portfolio/pages/home/data/projects.data.ts`
- Create: `src/modules/portfolio/pages/home/data/stack-groups.data.ts`
- Create: `src/modules/portfolio/pages/home/data/frieze.data.ts`
- Create: `src/modules/portfolio/pages/home/data/testimonials.data.ts`

**Interfaces:**
- Produces: `PROJECTS: ProjectData[]` (fields `id`, `numeral`, `slotId`, `year`, `stack`, `link`), `STACK_GROUPS: StackGroup[]` (fields `name`, `items: string[]`), `FRIEZE_ENTRIES: FriezeEntryData[]` (field `id`), `TESTIMONIALS: TestimonialData[]` (field `id`) — the `id` values match the i18n keys under `obras.items`, `frieze.items`, `testimonials.items` from Task 2. Consumed by ObrasSection (13), StackSection (12), FriezeSection (14), TestimonialsSection (15).

- [ ] **Step 1: Create `src/modules/portfolio/pages/home/data/projects.data.ts`**

```ts
export interface ProjectData {
  id: 'obra1' | 'obra2' | 'obra3'
  numeral: string
  slotId: string
  year: string
  stack: string
  link: string
}

export const PROJECTS: ProjectData[] = [
  { id: 'obra1', numeral: 'I', slotId: 'obra-1', year: '2025', stack: 'React · Node.js · PostgreSQL', link: '#' },
  { id: 'obra2', numeral: 'II', slotId: 'obra-2', year: '2024', stack: 'Next.js · Go · Kubernetes', link: '#' },
  { id: 'obra3', numeral: 'III', slotId: 'obra-3', year: '2023', stack: 'Vue · Python · AWS', link: '#' },
]
```

- [ ] **Step 2: Create `src/modules/portfolio/pages/home/data/stack-groups.data.ts`**

```ts
export interface StackGroup {
  name: string
  items: string[]
}

export const STACK_GROUPS: StackGroup[] = [
  { name: 'FRONTEND', items: ['React', 'TypeScript', 'Next.js', 'Vue'] },
  { name: 'BACKEND', items: ['Node.js', 'Python', 'Go', 'GraphQL'] },
  { name: 'INFRA / DEVOPS', items: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'] },
  { name: 'DATA', items: ['PostgreSQL', 'Redis', 'MongoDB', 'Elasticsearch'] },
]
```

- [ ] **Step 3: Create `src/modules/portfolio/pages/home/data/frieze.data.ts`**

```ts
export interface FriezeEntryData {
  id: 'job1' | 'job2' | 'job3' | 'job4'
}

export const FRIEZE_ENTRIES: FriezeEntryData[] = [
  { id: 'job1' },
  { id: 'job2' },
  { id: 'job3' },
  { id: 'job4' },
]
```

- [ ] **Step 4: Create `src/modules/portfolio/pages/home/data/testimonials.data.ts`**

```ts
export interface TestimonialData {
  id: 't1' | 't2'
}

export const TESTIMONIALS: TestimonialData[] = [{ id: 't1' }, { id: 't2' }]
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/modules/portfolio/pages/home/data
git commit -m "feat: add portfolio page data (projects, stack, frieze, testimonials)"
```

---

### Task 10: HeroSection

**Files:**
- Create: `src/modules/portfolio/pages/home/sections/hero/HeroSection.tsx`

**Interfaces:**
- Consumes: `RevealText` (`@/shared/components/reveal-text/RevealText`, Task 3), `LanguageToggle` (`@/shared/components/language-toggle/LanguageToggle`, Task 6), `useTranslation` keys `hero.eyebrow`, `hero.titleBefore`, `hero.titleEmphasis`, `hero.subtitle`, `hero.scrollHint` (Task 2).
- Produces: default export `HeroSection`, no props — mounted in HomePage (Task 18).

- [ ] **Step 1: Create `src/modules/portfolio/pages/home/sections/hero/HeroSection.tsx`**

```tsx
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import RevealText from '@/shared/components/reveal-text/RevealText'
import LanguageToggle from '@/shared/components/language-toggle/LanguageToggle'

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="relative box-border flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-12">
      <div className="absolute right-6 top-4 z-10">
        <LanguageToggle />
      </div>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, x: '-16vw' }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute left-[2%] top-1/2 h-[22vh] w-[34vw] rounded-[62%_38%_55%_45%] blur-3xl"
        style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(181,106,74,.34), rgba(181,106,74,0) 72%)' }}
      />
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, x: '16vw' }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute right-[2%] top-[44%] h-[22vh] w-[34vw] rounded-[45%_55%_38%_62%] blur-3xl"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(201,161,90,.38), rgba(201,161,90,0) 72%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="mb-7 text-center font-mono text-xs uppercase tracking-[0.32em] text-sienna"
      >
        {t('hero.eyebrow')}
      </motion.div>

      <h1 className="max-w-[14ch] text-center font-fraunces text-[clamp(52px,9.5vw,148px)] font-medium leading-[0.98] tracking-tight">
        <RevealText as="span" text={t('hero.titleBefore')} className="inline" />{' '}
        <RevealText as="span" text={t('hero.titleEmphasis')} className="inline italic text-sienna" />
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="mb-10 mt-8 max-w-[44ch] text-center text-[clamp(17px,1.6vw,21px)] leading-relaxed text-ink/70"
      >
        {t('hero.subtitle')}
      </motion.p>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.8 }}
        className="relative h-[min(38vh,340px)] w-[min(760px,88vw)] rounded-sm"
        style={{
          background: 'linear-gradient(120deg, rgba(212,175,106,.35), rgba(181,106,74,.25) 60%, rgba(212,175,106,.35))',
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.3em] text-ink/50"
      >
        {t('hero.scrollHint')}
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/modules/portfolio/pages/home/sections/hero
git commit -m "feat: add fresco HeroSection"
```

---

### Task 11: ManifestoSection

**Files:**
- Create: `src/modules/portfolio/pages/home/sections/manifesto/ManifestoSection.tsx`

**Interfaces:**
- Consumes: `FadeIn` (`@/shared/components/fade-in/FadeIn`, Task 8), `RevealText` (Task 3), keys `manifesto.label`, `manifesto.quote`, `manifesto.technique` (Task 2).
- Produces: default export `ManifestoSection`, no props.

- [ ] **Step 1: Create `src/modules/portfolio/pages/home/sections/manifesto/ManifestoSection.tsx`**

```tsx
import { useTranslation } from 'react-i18next'
import FadeIn from '@/shared/components/fade-in/FadeIn'
import RevealText from '@/shared/components/reveal-text/RevealText'

export default function ManifestoSection() {
  const { t } = useTranslation()

  return (
    <section className="flex justify-center px-6 py-[16vh]">
      <FadeIn
        as="div"
        y={56}
        duration={1.2}
        className="w-full max-w-[820px] rounded-sm bg-parchment p-10 shadow-2xl md:p-[88px]"
      >
        <div className="mb-7 font-mono text-[11px] tracking-[0.34em] text-sienna">{t('manifesto.label')}</div>
        <RevealText
          as="p"
          text={t('manifesto.quote')}
          className="font-fraunces text-[clamp(24px,3.4vw,40px)] font-medium leading-[1.32]"
        />
        <div className="mt-9 font-mono text-[11px] tracking-[0.22em] text-ink/55">{t('manifesto.technique')}</div>
      </FadeIn>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/modules/portfolio/pages/home/sections/manifesto
git commit -m "feat: add fresco ManifestoSection"
```

---

### Task 12: StackSection

**Files:**
- Create: `src/modules/portfolio/pages/home/sections/stack/StackSection.tsx`

**Interfaces:**
- Consumes: `STACK_GROUPS` (`../../data/stack-groups.data`, Task 9), keys `stack.label`, `stack.title` (Task 2).
- Produces: default export `StackSection`, no props.

- [ ] **Step 1: Create `src/modules/portfolio/pages/home/sections/stack/StackSection.tsx`**

```tsx
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { STACK_GROUPS } from '../../data/stack-groups.data'

export default function StackSection() {
  const { t } = useTranslation()

  return (
    <section className="mx-auto max-w-[1180px] px-6 py-[10vh] pb-[14vh]">
      <div className="mb-16 text-center">
        <div className="mb-4 font-mono text-[11px] tracking-[0.34em] text-sienna">{t('stack.label')}</div>
        <h2 className="font-fraunces text-[clamp(36px,5vw,64px)] font-medium tracking-tight">{t('stack.title')}</h2>
      </div>

      {STACK_GROUPS.map((group) => (
        <div key={group.name} className="mb-14">
          <div className="mb-6 flex items-center gap-4">
            <div className="whitespace-nowrap font-mono text-[11px] tracking-[0.3em] text-sienna">{group.name}</div>
            <div className="h-px flex-1 bg-gradient-to-r from-sienna/35 to-transparent" />
          </div>
          <div className="flex flex-wrap gap-5">
            {group.items.map((tool) => (
              <motion.div
                key={tool}
                initial={{ opacity: 0, scale: 0.82, y: 26 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative flex h-[118px] w-[118px] items-center justify-center overflow-hidden rounded-full shadow-lg"
                style={{
                  background: 'radial-gradient(circle at 38% 32%, #f0e8d8, #e2d5ba 55%, #cbb287)',
                  boxShadow:
                    'inset 0 0 0 1px rgba(212,175,106,.9), inset 0 0 0 5px rgba(232,223,208,.9), inset 0 0 0 6px rgba(143,74,46,.35)',
                }}
              >
                <span className="px-2.5 text-center font-fraunces text-sm font-semibold leading-tight text-sienna">
                  {tool}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/modules/portfolio/pages/home/sections/stack
git commit -m "feat: add fresco StackSection"
```

---

### Task 13: ObrasSection (projects gallery)

**Files:**
- Create: `src/modules/portfolio/pages/home/sections/obras/ObrasSection.tsx`

**Interfaces:**
- Consumes: `PROJECTS` (`../../data/projects.data`, Task 9), `BrushWipeImage` (`@/shared/components/brush-wipe-image/BrushWipeImage`, Task 4), keys `obras.label`, `obras.title`, `obras.technique`, `obras.role`, `obras.year`, `obras.result`, `obras.cta`, `obras.imagePlaceholder`, `obras.plateLabel`, `obras.items.<id>.title/desc/role/result` (Task 2).
- Produces: default export `ObrasSection`, no props.

- [ ] **Step 1: Create `src/modules/portfolio/pages/home/sections/obras/ObrasSection.tsx`**

```tsx
import { useTranslation } from 'react-i18next'
import BrushWipeImage from '@/shared/components/brush-wipe-image/BrushWipeImage'
import { PROJECTS } from '../../data/projects.data'

export default function ObrasSection() {
  const { t } = useTranslation()

  return (
    <section className="py-24 md:py-32">
      <div className="mb-16 px-6 text-center">
        <div className="mb-4 font-mono text-[11px] tracking-[0.34em] text-sienna">{t('obras.label')}</div>
        <h2 className="font-fraunces text-[clamp(36px,5vw,64px)] font-medium tracking-tight">{t('obras.title')}</h2>
      </div>

      {PROJECTS.map((project) => (
        <article
          key={project.id}
          className="mx-auto grid min-h-screen max-w-[1240px] grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:gap-16"
        >
          <div>
            <div className="font-fraunces text-[clamp(64px,9vw,130px)] font-light italic leading-none text-sienna/30">
              Nº {project.numeral}
            </div>
            <h3 className="mb-4 mt-2 font-fraunces text-[clamp(30px,3.6vw,52px)] font-semibold tracking-tight">
              {t(`obras.items.${project.id}.title`)}
            </h3>
            <p className="mb-8 max-w-[46ch] text-lg leading-relaxed text-ink/75">
              {t(`obras.items.${project.id}.desc`)}
            </p>

            <div className="grid max-w-[520px] grid-cols-[110px_1fr] gap-x-4 gap-y-2 border-t border-sienna/30 pt-5 font-mono text-xs tracking-wider">
              <span className="tracking-[0.24em] text-sienna">{t('obras.technique')}</span>
              <span className="text-ink/80">{project.stack}</span>
              <span className="tracking-[0.24em] text-sienna">{t('obras.role')}</span>
              <span className="text-ink/80">{t(`obras.items.${project.id}.role`)}</span>
              <span className="tracking-[0.24em] text-sienna">{t('obras.year')}</span>
              <span className="text-ink/80">{project.year}</span>
              <span className="tracking-[0.24em] text-sienna">{t('obras.result')}</span>
              <span className="text-ink/80">{t(`obras.items.${project.id}.result`)}</span>
            </div>

            <a
              href={project.link}
              className="mt-7 inline-block border-b border-gold pb-1 font-mono text-xs tracking-[0.26em] text-sienna transition-colors hover:text-gold"
            >
              {t('obras.cta')}
            </a>
          </div>

          <div className="relative">
            <div className="rounded-sm bg-gradient-to-br from-gold-light via-gold to-sienna p-4 shadow-2xl">
              <div className="bg-parchment p-2">
                <BrushWipeImage className="flex h-[clamp(260px,36vw,420px)] w-full items-center justify-center border border-dashed border-sienna/40 bg-parchment-dark">
                  <span className="px-4 text-center font-mono text-xs tracking-[0.2em] text-sienna/70">
                    {t('obras.imagePlaceholder')}
                  </span>
                </BrushWipeImage>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap border border-sienna/30 bg-parchment px-4 py-1.5 font-mono text-[10px] tracking-[0.3em] text-sienna shadow-lg">
              {t('obras.plateLabel', { numeral: project.numeral, year: project.year })}
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/modules/portfolio/pages/home/sections/obras
git commit -m "feat: add fresco ObrasSection"
```

---

### Task 14: FriezeSection (experience timeline)

**Files:**
- Create: `src/modules/portfolio/pages/home/sections/frieze/FriezeSection.tsx`

**Interfaces:**
- Consumes: `FRIEZE_ENTRIES` (`../../data/frieze.data`, Task 9), `useFriezeScroll` (`@/shared/hooks/use-frieze-scroll`, Task 7), keys `frieze.label`, `frieze.title`, `frieze.items.<id>.years/company/role/feat` (Task 2).
- Produces: default export `FriezeSection`, no props.

- [ ] **Step 1: Create `src/modules/portfolio/pages/home/sections/frieze/FriezeSection.tsx`**

```tsx
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useFriezeScroll } from '@/shared/hooks/use-frieze-scroll'
import { FRIEZE_ENTRIES } from '../../data/frieze.data'
import type { FriezeEntryData } from '../../data/frieze.data'

export default function FriezeSection() {
  const { t } = useTranslation()
  const { containerRef, trackRef, x } = useFriezeScroll()

  return (
    <section className="py-[10vh]">
      <div className="mx-auto mb-14 max-w-[1180px] px-6">
        <div className="mb-4 font-mono text-[11px] tracking-[0.34em] text-sienna">{t('frieze.label')}</div>
        <h2 className="font-fraunces text-[clamp(36px,5vw,64px)] font-medium tracking-tight">{t('frieze.title')}</h2>
      </div>

      {/* Desktop: sticky-container horizontal scroll. Below md, this is replaced by a plain vertical stack — no scroll-jack on mobile. */}
      <div
        ref={containerRef}
        className="relative hidden md:block"
        style={{ height: `${FRIEZE_ENTRIES.length * 70}vh` }}
      >
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <motion.div ref={trackRef} style={{ x }} className="flex gap-7 px-10">
            {FRIEZE_ENTRIES.map((entry) => (
              <FriezeCard key={entry.id} entry={entry} />
            ))}
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-6 md:hidden">
        {FRIEZE_ENTRIES.map((entry) => (
          <FriezeCard key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  )
}

function FriezeCard({ entry }: { entry: FriezeEntryData }) {
  const { t } = useTranslation()

  return (
    <div className="box-border w-[min(380px,82vw)] flex-none rounded-sm bg-parchment p-8 shadow-xl">
      <div className="mb-4 font-mono text-[11px] tracking-[0.26em] text-sienna">
        {t(`frieze.items.${entry.id}.years`)}
      </div>
      <div className="mb-1 font-fraunces text-2xl font-semibold">{t(`frieze.items.${entry.id}.company`)}</div>
      <div className="mb-4 font-fraunces text-base italic text-sienna">{t(`frieze.items.${entry.id}.role`)}</div>
      <p className="text-[15.5px] leading-relaxed text-ink/70">{t(`frieze.items.${entry.id}.feat`)}</p>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/modules/portfolio/pages/home/sections/frieze
git commit -m "feat: add fresco FriezeSection with sticky-scroll desktop track"
```

---

### Task 15: TestimonialsSection

**Files:**
- Create: `src/modules/portfolio/pages/home/sections/testimonials/TestimonialsSection.tsx`

**Interfaces:**
- Consumes: `TESTIMONIALS` (`../../data/testimonials.data`, Task 9), `FadeIn` (Task 8), keys `testimonials.label`, `testimonials.title`, `testimonials.items.<id>.quote/author` (Task 2).
- Produces: default export `TestimonialsSection`, no props.

- [ ] **Step 1: Create `src/modules/portfolio/pages/home/sections/testimonials/TestimonialsSection.tsx`**

```tsx
import { useTranslation } from 'react-i18next'
import FadeIn from '@/shared/components/fade-in/FadeIn'
import { TESTIMONIALS } from '../../data/testimonials.data'

export default function TestimonialsSection() {
  const { t } = useTranslation()

  return (
    <section className="mx-auto max-w-[1100px] px-6 py-[12vh]">
      <div className="mb-16 text-center">
        <div className="mb-4 font-mono text-[11px] tracking-[0.34em] text-sienna">{t('testimonials.label')}</div>
        <h2 className="font-fraunces text-[clamp(36px,5vw,64px)] font-medium tracking-tight">
          {t('testimonials.title')}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {TESTIMONIALS.map((testimonial) => (
          <FadeIn
            key={testimonial.id}
            as="figure"
            y={56}
            duration={1.2}
            className="m-0 rounded-sm bg-sky-panel p-10 shadow-xl"
          >
            <blockquote className="m-0 mb-6 font-fraunces text-xl font-medium leading-snug text-ink">
              "{t(`testimonials.items.${testimonial.id}.quote`)}"
            </blockquote>
            <figcaption className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/60">
              {t(`testimonials.items.${testimonial.id}.author`)}
            </figcaption>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/modules/portfolio/pages/home/sections/testimonials
git commit -m "feat: add fresco TestimonialsSection"
```

---

### Task 16: ContactSection

**Files:**
- Create: `src/modules/portfolio/pages/home/sections/contact/ContactSection.tsx`

**Interfaces:**
- Consumes: keys `contact.label`, `contact.title`, `contact.subtitle`, `contact.cta` (Task 2).
- Produces: default export `ContactSection`, no props.

- [ ] **Step 1: Create `src/modules/portfolio/pages/home/sections/contact/ContactSection.tsx`**

```tsx
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

export default function ContactSection() {
  const { t } = useTranslation()

  return (
    <section className="relative box-border flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-6 py-[14vh] text-center">
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0.1, scale: 0.6 }}
        whileInView={{ opacity: 0.6, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,106,.5), rgba(212,175,106,.14) 42%, rgba(212,175,106,0) 68%)',
        }}
      />
      <div className="relative">
        <div className="mb-6 font-mono text-[11px] tracking-[0.34em] text-sienna">{t('contact.label')}</div>
        <h2 className="mx-auto mb-5 max-w-[16ch] font-fraunces text-[clamp(40px,6vw,84px)] font-medium tracking-tight">
          {t('contact.title')}
        </h2>
        <p className="mx-auto mb-14 max-w-[44ch] text-lg leading-relaxed text-ink/70">{t('contact.subtitle')}</p>
        <a
          href="mailto:hello@example.com"
          className="inline-flex h-[158px] w-[158px] items-center justify-center rounded-full font-mono text-xs tracking-[0.3em] text-[#3d2413] shadow-2xl transition-transform duration-500 hover:scale-105"
          style={{ background: 'radial-gradient(circle at 36% 30%, #e8cf98, #d4af6a 48%, #a97f3e 82%, #8f4a2e)' }}
        >
          {t('contact.cta')}
        </a>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/modules/portfolio/pages/home/sections/contact
git commit -m "feat: add fresco ContactSection"
```

---

### Task 17: Footer

**Files:**
- Create: `src/modules/portfolio/pages/home/sections/footer/Footer.tsx`

**Interfaces:**
- Consumes: keys `footer.copyright`, `footer.github`, `footer.linkedin`, `footer.email` (Task 2).
- Produces: default export `Footer`, no props.

- [ ] **Step 1: Create `src/modules/portfolio/pages/home/sections/footer/Footer.tsx`**

```tsx
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="flex flex-wrap items-center justify-between gap-5 border-t border-ink/15 px-6 py-7 md:px-16">
      <div className="font-mono text-[11px] tracking-[0.24em] text-ink/55">{t('footer.copyright')}</div>
      <div className="flex gap-7">
        <a
          href="https://github.com/your-username"
          className="font-mono text-[11px] tracking-[0.26em] text-sienna transition-colors hover:text-gold"
        >
          {t('footer.github')}
        </a>
        <a
          href="https://linkedin.com/in/your-username"
          className="font-mono text-[11px] tracking-[0.26em] text-sienna transition-colors hover:text-gold"
        >
          {t('footer.linkedin')}
        </a>
        <a
          href="mailto:hello@example.com"
          className="font-mono text-[11px] tracking-[0.26em] text-sienna transition-colors hover:text-gold"
        >
          {t('footer.email')}
        </a>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/modules/portfolio/pages/home/sections/footer
git commit -m "feat: add fresco Footer"
```

---

### Task 18: Wire up HomePage, App, main.tsx — remove old dark-theme code

**Files:**
- Create: `src/modules/portfolio/pages/home/index.tsx`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`
- Delete: `src/sections/HeroSection.tsx`
- Delete: `src/sections/MarqueeSection.tsx`
- Delete: `src/sections/AboutSection.tsx`
- Delete: `src/sections/ServicesSection.tsx`
- Delete: `src/sections/ProjectsSection.tsx`
- Delete: `src/components/AnimatedText.tsx`
- Delete: `src/components/ContactButton.tsx`
- Delete: `src/components/LiveProjectButton.tsx`
- Delete: `src/components/Magnet.tsx`
- Delete: `src/assets/hero.png`
- Delete: `src/assets/react.svg`
- Delete: `src/assets/vite.svg`

**Interfaces:**
- Consumes: every section from Tasks 10–17, `GoldCursor` (Task 5), `@/shared/i18n/i18n` (Task 2).
- Produces: default export `HomePage` at `@/modules/portfolio/pages/home`, rendered by `App`.

- [ ] **Step 1: Create `src/modules/portfolio/pages/home/index.tsx`**

```tsx
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

- [ ] **Step 2: Replace `src/App.tsx`**

```tsx
import HomePage from '@/modules/portfolio/pages/home'

export default function App() {
  return <HomePage />
}
```

- [ ] **Step 3: Replace `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/newsreader'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@/shared/i18n/i18n'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 4: Delete the old dark-theme sections, components, and unused assets**

```bash
git rm src/sections/HeroSection.tsx src/sections/MarqueeSection.tsx src/sections/AboutSection.tsx src/sections/ServicesSection.tsx src/sections/ProjectsSection.tsx
git rm src/components/AnimatedText.tsx src/components/ContactButton.tsx src/components/LiveProjectButton.tsx src/components/Magnet.tsx
git rm src/assets/hero.png src/assets/react.svg src/assets/vite.svg
rmdir src/sections src/components src/assets 2>/dev/null || true
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc -b`
Expected: no errors — this is the first point where the whole project (old dark-theme code removed, new fresco code fully wired) must be clean.

- [ ] **Step 6: Run the full test suite**

Run: `npx vitest run`
Expected: PASS — all tests from Tasks 2, 3, 7 (9 tests total)

- [ ] **Step 7: Production build**

Run: `yarn build`
Expected: builds successfully with no errors, producing a `dist/` directory.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: wire up fresco HomePage, remove old dark-theme portfolio"
```

---

### Task 19: Manual visual verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `yarn dev`
Expected: server starts, prints a local URL (typically `http://localhost:5173`)

- [ ] **Step 2: Open the site in a browser and check the Hero, Manifesto, Stack, Obras, Testimonials, Contact, and Footer sections**

Confirm: parchment/gold/sienna palette renders, Fraunces/Newsreader/JetBrains Mono fonts load (not falling back to system serif/mono), the hero title reveals word-by-word on load, the manifesto quote reveals on scroll, project cards show the placeholder "screenshot" wipe-in on scroll, the gold cursor follows the mouse on desktop.

- [ ] **Step 3: Check the language toggle**

Click the `EN`/`ES` toggle in the hero. Confirm every section's copy switches language, including the museum labels ("SALA II" ↔ "GALLERY II"). Reload the page — confirm the previously selected language persists (via `localStorage`).

- [ ] **Step 4: Check the Experience frieze at desktop width**

Resize the browser to ≥768px wide. Scroll through the Experience section. Confirm the job cards scroll horizontally while the section stays pinned (sticky), and the track reaches its final card before the section scrolls away.

- [ ] **Step 5: Check the Experience frieze at mobile width**

Resize the browser to <768px wide (or use device emulation). Confirm the Experience section now renders as a plain vertical stack of job cards with normal page scroll — no horizontal scroll-jacking.

- [ ] **Step 6: Check reduced-motion and touch behavior**

Enable "prefers reduced motion" in OS/browser settings and reload — confirm the gold cursor does not render. Using device emulation for a touch device, confirm the gold cursor does not render (`pointer: fine` check).

- [ ] **Step 7: Report results**

If everything above holds, the fresco portfolio replacement is complete. If any check fails, note which one and fix before considering this plan done — do not report success without having driven the actual page in a browser.
