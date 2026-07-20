# Design: Lighthouse Optimization

## Technical Approach

Four independent slices on the existing React 19 + Vite 8 SPA, no framework migration, component tree and animations unchanged. The LCP lever is a build-time content snapshot that seeds `ContentProvider` so the hero paints at JS parse time instead of after 12 Strapi round-trips; the hero PNG is replaced by a preloaded, dimensioned WebP. SEO/a11y are mechanical edits to `index.html`, `robots.txt`, and the home wrapper. All work stays inside strict TDD (vitest, 35 green + new specs).

## Architecture Decisions

### Decision: Snapshot mechanism — standalone prebuild Node script (not a Vite plugin)

| Option | Tradeoff | Decision |
|---|---|---|
| Vite plugin writes JSON in build hook | Couples to Vite internals; harder to unit-test; runs inside every build | Rejected |
| `scripts/snapshot-content.mjs` (Node global `fetch`) writing committed JSON | Decoupled, testable, reusable as-is after remote-Strapi migration (swap `STRAPI_URL` env) | **Chosen** |

Wired as `prebuild` in package.json in **soft mode**: it attempts to refresh both locales; on any network failure it logs a loud warning and keeps the committed snapshot, hard-failing only if no committed snapshot exists at all.

### Decision: Snapshot output shape — statically-imported JSON module (not `public/` fetch)

| Option | Tradeoff | Decision |
|---|---|---|
| `public/content-{locale}.json` fetched at runtime | Adds a network round-trip before first paint — defeats the LCP goal | Rejected |
| `src/shared/content/snapshot/{es,en}.json` imported by `index.ts` | Inlined/tree-shaken into the JS bundle, available at parse time, zero extra request | **Chosen** |

### Decision: Build-time-Strapi-unreachable fallback — reuse committed last snapshot

`build` itself never contacts Strapi. The snapshot is committed data refreshed by `yarn snapshot` (manual, deploy hook, or Strapi webhook). Rejected: fail-loud-on-build (brittle once Strapi is remote) and skip-to-runtime-fetch (reintroduces the blank render). Runtime refetch still hydrates live data, so staleness self-heals on load.

### Decision: ContentProvider seeding + swap policy

Seed `content` state with `contentSnapshot[getInitialLocale()]` and start `status: 'ready'`. Keep the existing effect: refetch live on mount and locale change, `setContent(live)` on success (unconditional replace — visually identical). On refetch **error**, keep snapshot content and stay `ready`; only show the error screen when there is no snapshot AND the fetch fails (net resilience gain). The `!content` null-return path is removed for the snapshotted locale.

### Decision: Hero pipeline — one-off scripted optimization to `public/`, stable URL

Resize to ≈1520×680, emit `public/hero-creacion.webp` + compressed `public/hero-creacion.png` fallback via committed `scripts/optimize-hero.mjs` (sharp devDep). `public/` gives an unhashed, stable path so the `index.html` preload and the `<picture>` reference the same discoverable URL. Rejected: `vite-imagetools` (hashed URLs can't be preloaded from static HTML) and Strapi `srcset` (out of scope, other repo).

### Decision: SEO — static tags in `index.html`

Single page, no router: hardcode `<title>`, `<meta name="description">`, canonical, and OG tags directly. Rejected `react-helmet-async` — disproportionate for one static head.

## Data Flow

    build:  scripts/snapshot-content.mjs ─(fetch x12, es+en)→ snapshot/*.json ─commit→ bundle
    load:   snapshot/index.ts ─seed→ ContentProvider(status=ready) ─paint→ Hero (LCP)
                                          │
                                          └─ effect: fetchSiteContent(locale) ─→ setContent(live)
    LCP img: index.html preload ─→ /hero-creacion.webp (fetchpriority=high, <picture>)

## File Changes

| File | Action | Description |
|---|---|---|
| `scripts/snapshot-content.mjs` | Create | Fetch 12 endpoints x2 locales; soft-fallback to committed JSON |
| `scripts/optimize-hero.mjs` | Create | Resize/convert hero to WebP + PNG fallback |
| `scripts/measure.sh` | Create | build + preview + lighthouse; assert thresholds |
| `src/shared/content/snapshot/{es,en}.json` | Create | Committed snapshot data (generated) |
| `src/shared/content/snapshot/index.ts` | Create | Typed `contentSnapshot: Record<SupportedLocale, SiteContent>` |
| `src/shared/content/ContentProvider.tsx` | Modify | Seed initial state; keep snapshot on refetch error |
| `src/modules/portfolio/pages/home/sections/hero/HeroSection.tsx` | Modify | `<picture>`, width/height, `fetchpriority`, stable path |
| `src/modules/portfolio/pages/home/index.tsx` | Modify | Wrap sections in `<main>` (decorative canvas stays sibling) |
| `index.html` | Modify | Title, description, canonical/OG, hero preload |
| `public/robots.txt` | Create | `User-agent: * / Allow: /` + `Sitemap:` |
| `public/hero-creacion.{webp,png}` | Create | Optimized LCP asset pair |
| `src/assets/hero-creacion.png` | Delete | Superseded by `public/` optimized pair |
| `package.json` | Modify | `prebuild`+`snapshot`+`measure` scripts; `sharp` devDep |

## Interfaces / Contracts

```ts
// src/shared/content/snapshot/index.ts
export const contentSnapshot: Record<SupportedLocale, SiteContent>
// ContentProvider
const [content, setContent] = useState<SiteContent>(() => contentSnapshot[getInitialLocale()])
const [status, setStatus] = useState<ContentStatus>('ready')
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Snapshot module matches `SiteContent` shape both locales | vitest import assertion |
| Unit | ContentProvider paints hero immediately (no await), status `ready` | RTL render, assert hero text present pre-fetch |
| Unit | Refetch success swaps content; refetch error keeps snapshot (no error screen) | mock `fetchSiteContent` reject |
| Unit | HeroSection emits `<picture>` + width/height + `fetchpriority` | RTL query |
| E2E/metric | Lighthouse thresholds (Perf ≥95, A11y/SEO/BP 100, LCP <2.5s) | `scripts/measure.sh` in verify |

## Migration / Rollout

No data migration. Each slice independently revertable per proposal rollback. `yarn snapshot` refresh is idempotent; committed JSON is the durable source until next refresh.

## Open Questions

- [ ] Canonical/OG production URL to hardcode (assume `https://carlossanjuan.co`) — confirm domain.
- [ ] Snapshot refresh trigger for prod (deploy hook vs Strapi webhook) — operational, not blocking for apply.
