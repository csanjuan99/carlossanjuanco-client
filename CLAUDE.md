# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn dev` — start Vite dev server with HMR
- `yarn build` — typecheck (`tsc -b`) then production build
- `yarn lint` — run ESLint over the repo
- `yarn preview` — preview production build locally

No test runner is configured. Package manager is yarn (`yarn.lock` present).

## Architecture

Single-page portfolio site. React 19 + TypeScript + Vite, no router, no state library.

- `src/App.tsx` — composes the page as a flat list of section components, top to bottom. Adding a new page section means creating a component in `src/sections/` and adding one line here.
- `src/sections/` — one component per page section (Hero, Marquee, About, Services, Projects). Sections own their own content/copy and layout; not reused elsewhere.
- `src/components/` — shared, reusable primitives used across sections (`FadeIn`, `Magnet`, `AnimatedText`, `ContactButton`, `LiveProjectButton`).
- Styling is Tailwind utility classes inline in JSX (`tailwind.config.js`, `src/index.css`). Only a couple of global rules live in `index.css` (e.g. `.hero-heading` gradient text clip) — prefer Tailwind classes over new global CSS.

### Animation conventions

- `FadeIn` (`src/components/FadeIn.tsx`) wraps children in a `framer-motion` component with a scroll-triggered fade/slide-in (`whileInView`, `viewport={{ once: true }}`). Wrap any new section content that should animate in on scroll with it, using `delay`/`y` props to stagger.
- `FadeIn` caches created `motion.create(as)` components in a module-level `Map` keyed by element type — reuse this pattern rather than calling `motion.create` inline in a component body, since that would create a new component identity every render and reset animation state.
- `Magnet` (`src/components/Magnet.tsx`) implements a cursor-following magnetic hover effect via raw `mousemove` listeners + `translate3d`; used for interactive elements like the hero portrait.
- The React Compiler (babel plugin, wired in `vite.config.ts` via `@rolldown/plugin-babel` + `reactCompilerPreset()`) is enabled — avoid manual `useMemo`/`useCallback` unless there's a specific reason the compiler can't cover.

### TypeScript config

- `tsconfig.json` is a solution file referencing `tsconfig.app.json` (app code, DOM lib) and `tsconfig.node.json` (Vite config).
- `noUnusedLocals`/`noUnusedParameters`/`erasableSyntaxOnly` are enabled — unused code and TS-only runtime syntax will fail the build.
