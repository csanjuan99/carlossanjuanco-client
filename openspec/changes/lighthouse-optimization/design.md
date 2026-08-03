# Design: Lighthouse Optimization

## Technical Approach

Four independent slices on the existing React 19 + Vite 8 SPA, no framework migration, component tree and animations unchanged. The LCP lever is a build-time content snapshot that seeds `ContentProvider` so the hero paints at JS parse time instead of after 12 Strapi round-trips; the hero PNG is replaced by a preloaded, dimensioned WebP. SEO/a11y are mechanical edits to `index.html`, `robots.txt`, and the home wrapper. All work stays inside strict TDD (vitest, 35 green + new specs).

> **SUPERSEDED IN PART — Amendment 1 (2026-08-03).** The scope boundary above ("no framework migration, component tree and animations unchanged", and by extension no server-rendered HTML) is kept verbatim as the record of Slices 1-6 and their measurements. It is *not* rewritten. Slice 6 proved that boundary is exactly what caps Performance at 77-86 and LCP at ~3.5-3.9s: `elementRenderDelay` is already fixed (2309ms → 110ms) and the main chunk is already split (490 KB → 219 KB), yet under Lighthouse's simulated mobile throttling nothing paints until React executes, because the document ships an empty `<div id="root">`. Amendment 1 below narrows that boundary in one place only — the build now emits real HTML — and leaves "no framework migration" intact. See "Amendment 1 — Build-time prerendering (Slice 7)".

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

---

# Amendment 1 — Build-time prerendering (Slice 7)

Status: approved by the user after Slice 6, then parked before implementation (work stopped by user decision on 2026-08-03; no Slice 7 code exists). Supersedes only the "no prerendered HTML" part of the original scope note; everything above stands as written.

## Amended Technical Approach

At build time, render the app's above-the-fold shell to static HTML with `react-dom/server` and inject it into `dist/index.html`, so the hero (and its preloaded WebP) paints from the document itself. The client entry hydrates that markup instead of mounting into an empty root. Same React 19 + Vite 8 app, same component tree, same animations — the only new capability is a second build output. No Next/Remix/Astro; no runtime server (the artifact is still a static `dist/`).

## Architecture Decisions

### Decision: Prerender via Vite SSG (`renderToString`), not a headless-browser snapshot

| Option | Tradeoff | Decision |
|---|---|---|
| A — `src/entry-server.tsx` + `vite build --ssr` + injection script | Zero new deps (`react-dom/server` already present), ~1s build cost, deterministic output, but forces SSR-safety on the render path | **Chosen** |
| B — puppeteer/playwright snapshot of `yarn preview` | No SSR-compat work, but adds a ~300 MB browser devDep, tens of seconds per build, non-deterministic timing, and captures post-animation DOM (framer-motion inline styles frozen mid-flight) | Rejected |

B's decisive flaw is not weight: it snapshots the DOM *after* animations have started, baking transient `opacity`/`transform` values into the HTML and guaranteeing hydration mismatch on the exact elements we are trying to paint early.

### Decision: Prerender the above-the-fold shell only — lazy sections stay unresolved

`renderToString` renders a Suspense fallback for any boundary that suspends, and `home/index.tsx` already wraps every below-the-fold section (plus `FrescoDome`/`GoldCursor`) in `lazy()` + `Suspense fallback={null}`. That gives shell-only prerendering for free: `HeroSection` is eager and lands in the HTML; everything else emits nothing and is client-rendered on hydration.

Rejected: `prerenderToNodeStream` from `react-dom/static`, which waits for lazy modules to settle. It would inline the whole page into HTML, and on hydration those boundaries would suspend again (chunks not yet fetched), so React would replace visible content with `null` — a content flash and a worse LCP than today.

**Constraint this creates**: `FrescoDome` and `GoldCursor` read `window.matchMedia` during render and MUST stay `lazy()`. Un-lazying them breaks the prerender.

### Decision: Prerender locale is `es`; the stored locale is applied after hydration

`getInitialLocale()` reads `localStorage`, which does not exist in Node. Options:

| Option | Tradeoff | Decision |
|---|---|---|
| Guard `getInitialLocale` with `typeof window` and keep reading it in the state initializer | Server picks `es`, client picks `en` for `en` users → text hydration mismatch → React 19 discards the prerendered DOM and re-renders the root client-side, erasing the LCP win for those users | Rejected |
| Move the read out of render: initialize `locale` to `PRERENDER_LOCALE = 'es'`, apply the stored locale in the existing mount effect | First client render is byte-identical to the prerender for every user; `en` users get a content swap one commit after hydration (user-accepted) | **Chosen** |

Because the read moves into an effect, no `typeof window` guard is needed anywhere — the render path simply never touches `localStorage`. That is strictly better than guarding it. `suppressHydrationWarning` is used nowhere: with this decision there is no mismatch to suppress.

`<html lang="es">` stays static in `index.html`. The hydration root is `#root`, so `<html>` is outside React's control and cannot mismatch; the existing effect already corrects `document.documentElement.lang` on locale change. Crawlers see `lang="es"` on `es` markup — consistent.

### Decision: framer-motion initial states are left exactly as they are

`renderToString` emits each `motion` element's `initial` styles, and the client's first render emits the same — no mismatch. Concretely: the hero image wrapper (`initial={false}`, Slice 6) prerenders **visible**, which is the entire point; the eyebrow, subtitle and `RevealText` words prerender at `opacity: 0` and fade in after hydration. That is acceptable — the measured LCP element is the hero `<img>`, the hidden text still occupies layout (no CLS, no reflow), and it is present in the HTML for crawlers. Rejected: rewriting `RevealText`/hero text animations to be SSR-visible — out of the user's approved scope and not required to move LCP.

### Decision: injection is soft-failing and atomic

`scripts/prerender.mjs` owns the whole step (it calls Vite's JS build API in-process, then injects), so there is a single failure boundary. On any throw — SSR build failure, render throw, empty/implausible markup — it logs a loud warning, leaves `dist/index.html` untouched, and exits 0. `dist/` then ships as today's CSR build. This mirrors the snapshot script's soft mode already established in this change. The rewritten `index.html` is written to a temp file and `rename`d over the original, so a crash cannot leave a half-written document.

Two concrete gotchas the implementation must handle: (1) injection MUST use a replacer *function*, since rendered markup containing `$&`/`$'` would otherwise be mangled by `String.replace` substitution patterns; (2) the programmatic SSR build must pass `rollupOptions.output.manualChunks: undefined` at the call site, because the repo's `vendor-animation` chunking conflicts with the single-file SSR output — `vite.config.ts` itself stays unchanged.

## Data Flow

    build:  vite build ──→ dist/index.html (empty #root) + assets
            prerender.mjs ─┬→ vite build --ssr ─→ dist-ssr/entry-server.js
                           ├→ render() = renderToString(<StrictMode><App/></StrictMode>)
                           │     └─ ContentProvider seeds snapshot['es'] (sync, no effects)
                           │     └─ HeroSection eager → HTML;  lazy sections suspend → nothing
                           └→ atomic inject into <div id="root">…</div>
    load:   HTML + CSS ─paint→ hero <img> (preloaded WebP)      ← LCP, no JS required
            main.tsx: #root has children ? hydrateRoot : createRoot
            after hydrate: stored locale applied → content swap (en only); lazy chunks mount

## File Changes

| File | Action | Description |
|---|---|---|
| `src/entry-server.tsx` | Create | `export function render(): string` — `renderToString(<StrictMode><App /></StrictMode>)`; the `StrictMode` wrapper must match `main.tsx` exactly or hydration diverges |
| `scripts/prerender.mjs` | Create | Programmatic SSR build + `render()` + atomic soft injection; exports the pure `injectAppHtml(documentHtml, appHtml)` helper for unit tests |
| `scripts/prerender.test.mjs` | Create | Injection unit tests (see below) |
| `src/main.tsx` | Modify | `shouldHydrate(container)` → `hydrateRoot` when the root has child nodes, else `createRoot` |
| `src/shared/content/ContentProvider.tsx` | Modify | `useState<SupportedLocale>(PRERENDER_LOCALE)`; apply `getInitialLocale()` inside the existing mount effect |
| `src/entry-server.test.tsx` | Create | Prerender output + hydration smoke tests |
| `src/shared/content/ContentProvider.test.tsx` | Modify | Locale-initialization cases move from render-time to post-effect |
| `package.json` | Modify | `"build": "tsc -b && vite build && node scripts/prerender.mjs"`, `"prerender": "node scripts/prerender.mjs"` |
| `.gitignore` | Modify | Ignore `dist-ssr/` |

`vite.config.ts`, `index.html`, `HeroSection.tsx` and `home/index.tsx` are unchanged.

## Interfaces / Contracts

```ts
// src/entry-server.tsx
export function render(): string
// src/main.tsx
export function shouldHydrate(container: Element): boolean
// src/shared/content/ContentProvider.tsx
export const PRERENDER_LOCALE: SupportedLocale = 'es'
```

```js
// scripts/prerender.mjs — pure, unit-tested
export function injectAppHtml(documentHtml, appHtml) // -> string | null when placeholder missing
```

## Testing Strategy (strict TDD — RED before each implementation task)

| Layer | What to Test | Approach |
|---|---|---|
| Unit | `injectAppHtml` places markup inside `<div id="root">` | `prerender.test.mjs` on a fixture document |
| Unit | markup containing `$&` / `$'` is inserted **literally** | regression guard for the `String.replace` substitution gotcha |
| Unit | missing `#root` placeholder → returns `null`, original document untouched | soft-fail path |
| Unit | `shouldHydrate` true for a populated container, false for an empty one | direct call, no DOM mount |
| Integration | `render()` output contains the hero `<img src="/hero-creacion.png">`, its `alt` from the `es` snapshot, and `<source ... hero-creacion.webp>` | `renderToString` in vitest/happy-dom |
| Integration | `render()` output does NOT contain below-the-fold content (e.g. footer copy) | proves shell-only prerender |
| Integration | **Hydration smoke**: `container.innerHTML = render()`, then `hydrateRoot`; no hydration `console.error`, hero `<img>` still in the DOM afterwards | spy on `console.error`, assert no call matching `/hydrat|did not match/i` |
| Integration | with `en` stored, first render shows `es` content, then swaps to `en` after the effect | extends `ContentProvider.test.tsx` |
| E2E/metric | Acceptance unchanged: Performance ≥95, A11y/BP/SEO 100, LCP <2.5s | `yarn measure` (thresholds NOT relaxed) |

## Threat Matrix

N/A — the amendment adds a Node build script that spawns no shell, parses no untrusted input, and touches no git/PR/repository-selection surface. All five rows of `references/threat-matrix.md` (documentation-like paths, git repository selection, commit state, push state, PR commands) are N/A for this reason. The only file-write boundary is `dist/index.html`, covered by the atomic-rename decision and its unit tests.

## Migration / Rollout

No data migration. Rollback is layered and cheap:
1. **Automatic** — any prerender failure leaves `dist/index.html` as the CSR document and `main.tsx` falls back to `createRoot`; the site ships exactly as it does today.
2. **Manual** — drop `node scripts/prerender.mjs` from the `build` script; nothing else needs reverting.
3. **Full** — revert the slice; `entry-server.tsx` and `prerender.mjs` are additive and `ContentProvider`/`main.tsx` diffs are a few lines each.

## Open Questions

- [ ] If `yarn measure` still misses ≥95 after prerendering, the next lever is removing `framer-motion` from the hero's critical path — that would touch the user's "keep the other animations" boundary and needs a separate approval. Not assumed here.
