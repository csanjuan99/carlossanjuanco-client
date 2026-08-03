# Proposal: Lighthouse Optimization (top scores in all four categories)

## Intent

Production Lighthouse (prod build via `yarn preview`, mobile) scores Performance **71** / A11y **98** / Best-Practices **100** / SEO **83**. Only **LCP is broken (11.0s)** — FCP 2.6s, TBT 80ms, CLS 0.022 are all healthy. Two root causes gate LCP: (1) `ContentProvider` returns `null` until a `Promise.all` of 12 Strapi endpoints resolves, so the hero cannot paint; (2) the hero PNG is 1.6 MB, not discoverable in initial HTML, with no preload or explicit dimensions. A11y/SEO each fail on one cheap, mechanical audit. Goal: top scores in all four categories.

## Scope

### In Scope
- Optimize hero LCP image: compress/resize + WebP (`<picture>` fallback), explicit `width`/`height`, `fetchpriority="high"`, `<link rel="preload" as="image">` in `index.html`.
- SEO: `<meta name="description">`, canonical + basic OG tags, real `<title>`; add valid `public/robots.txt`.
- A11y: add `<main>` landmark to the home page tree.
- Build-time content snapshot (SSG-lite): fetch the 12 Strapi endpoints at build for **both `es` and `en` locales**, ship as initial `ContentProvider` state (paint immediately), keep the existing runtime refetch to hydrate live data.
- Re-baseline and validate exclusively against `yarn build` + `yarn preview` (never dev server).

### Out of Scope
- SSR/SSG framework migration (Next/Astro/Vike).
- Strapi responsive `srcset` formats (lives in `carlossanjuanco-content` repo).
- Rendering CMS `project.image` in `ObrasSection` (currently static placeholder; optional, deferred).
- `FrescoDome` canvas main-thread tuning (not a first-paint blocker).

## Capabilities

### New Capabilities
- `web-performance`: hero LCP image optimization + build-time content snapshot for instant first paint.
- `seo-metadata`: meta description, canonical/OG tags, valid robots.txt.
- `accessibility-landmarks`: `<main>` landmark on the home page.

### Modified Capabilities
- None (no existing specs).

## Approach

Ship exploration recommendations A1 + C + D (all low-effort, mechanical, zero-architecture-risk) alongside B1 (build-time snapshot) as the LCP lever. B1 uses a Vite build step that writes a static JSON module per locale; `ContentProvider` seeds initial state from it, eliminating the `null` render, while the existing background fetch preserves freshness. Preserves the component tree, tests, and animations. Strict TDD stays active (vitest, `yarn test`, 35 green).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `index.html` | Modified | Title, meta description, OG/canonical, hero preload |
| `public/robots.txt` | New | Valid robots + sitemap directive |
| `src/modules/portfolio/pages/home/index.tsx` | Modified | `<main>` landmark |
| `src/modules/portfolio/pages/home/sections/hero/HeroSection.tsx` | Modified | `<picture>`, dimensions, fetchpriority |
| `src/assets/hero-creacion.png` | Modified | Compressed/resized + WebP |
| `src/shared/content/ContentProvider.tsx` | Modified | Seed initial state from build snapshot |
| `vite.config.ts` + build step | New/Modified | Build-time Strapi snapshot (both locales) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Strapi unreachable at build time | Med | Documented fallback: keep runtime fetch; build fails loud or uses last snapshot |
| Snapshot content stale between rebuilds | Med | Background refetch swaps live data; rebuild via deploy/webhook |
| Only one locale snapshotted | Med | Snapshot both `es`/`en`; the other must not block |
| Image WebP fallback breaks older browsers | Low | `<picture>` with PNG/JPEG fallback |

## Rollback Plan

Each slice is independently revertable. Revert per file: restore original hero asset/`HeroSection`, drop snapshot build step (runtime fetch still works), remove meta/robots, revert `<main>` to `<div>`. No data migration; no persistent state changes.

## Dependencies

- Strapi reachable at build time (CI + local) for the snapshot step.
- `yarn build` + `yarn preview` + Lighthouse 13.x for validation.

## Success Criteria

- [ ] Prod preview Lighthouse (mobile): Performance ≥ 95, A11y = 100, SEO = 100, Best-Practices = 100.
- [ ] LCP < 2.5s on prod preview (from 11.0s); FCP/TBT/CLS stay within current healthy ranges.
- [ ] `landmark-one-main`, `meta-description`, `robots-txt` audits pass.
- [ ] Hero image payload reduced from ~1.5 MB (image-delivery savings ~0).
- [ ] Both `es`/`en` locales paint immediately from snapshot.
- [ ] `yarn test` green (35+), `yarn build` succeeds.
