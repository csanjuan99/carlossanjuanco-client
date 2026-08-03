# Exploration: Lighthouse optimization (performance/a11y/SEO)

## Current State
SPA: React 19.2 + Vite 8 + TS + Tailwind, no router, no SSR/prerender (`vite.config.ts` only has `@vitejs/plugin-react` + React Compiler babel plugin — no image/compression plugin).

`src/main.tsx` -> `src/App.tsx` wraps the whole tree in `ContentProvider` (`src/shared/content/ContentProvider.tsx`). `ContentProvider` fires a `Promise.all` of 12 Strapi REST calls (`fetchSiteContent`, lines 38-81) on mount and **returns `null` until all 12 resolve** (line 125: `if (!content) return null`). This means the entire page — including the hero `<h1>` and hero image, the actual LCP element — cannot paint until every one of the 12 endpoints returns, which is architecturally the dominant cause of the 7.8s LCP/TTI seen in the baseline report (in addition to the dev-server caveat).

`src/shared/api/strapi.ts` is a thin `fetch` wrapper (`request`, `fetchOne`, `fetchMany`) with no caching, no retries, no timeout — a straight network round-trip per call, run in parallel via `Promise.all`.

Hero LCP image: `src/modules/portfolio/pages/home/sections/hero/HeroSection.tsx` line 34: `const heroImageSrc = mediaUrl(hero.image) ?? heroCreacion` — falls back to a **local static asset** `src/assets/hero-creacion.png` (imported directly, line 7) when Strapi has no image set for the hero singleton. Visually inspected the file: it's a full painterly illustration (Sistine-Chapel-style), clearly captured/exported at much higher resolution than its rendered size (`h-[min(38vh,340px)] w-full`, container capped at `min(760px,88vw)` — so real display width tops out around 760px). This oversized/uncompressed PNG matches the baseline's 1,488 KiB "image-delivery savings" audit. It is also unversioned/unoptimized — no responsive `srcset`, no `width`/`height` attributes (CLS risk), no `fetchpriority="high"`, no `<link rel="preload">`.

`ObrasSection.tsx` (`src/modules/portfolio/pages/home/sections/obras/ObrasSection.tsx` lines 52-61) does **not** render `project.image` from the CMS at all — it shows a static placeholder (`BrushWipeImage` + `obrasSection.imagePlaceholder` text). So the CMS project images the user mentioned are dead weight in the content payload today, not a rendered-image perf cost.

a11y: `src/modules/portfolio/pages/home/index.tsx` wraps all sections in a plain `<div className="relative bg-sky-gradient ...">` (line 14) — there is no `<main>` landmark anywhere in the tree, matching the baseline's missing-landmark finding.

SEO: `index.html` has `<title>Portfolio</title>` and zero `<meta name="description">`, no OG/canonical tags (lines 1-13). There is no `public/robots.txt` — `Glob` on `public/**/*` only returns `favicon.svg` and `icons.svg`; the dev server was serving `index.html` as a fallback for `/robots.txt`, which Lighthouse flagged as invalid.

No `dist/` exists yet (project has not been built in this workspace) — could not inspect real production bundle/asset sizes directly (no Bash tool available in this exploration context: `yarn build` was not run). All bundle-size claims below are inferred from `package.json` dependencies (react, react-dom, framer-motion, gsap, @gsap/react — no heavy 3D/chart libs) and from source reading, not measured. This must be corrected by an actual `yarn build && yarn preview` + Lighthouse-against-preview run before/after any fix (see Measurement section).

## Affected Areas
- `index.html` — bare title, no meta description/OG/canonical (SEO)
- `public/robots.txt` — missing entirely, needs creation (SEO)
- `src/shared/content/ContentProvider.tsx` — `Promise.all` of 12 endpoints, renders `null` until all resolve; root cause of render-blocking LCP/FCP delay
- `src/shared/api/strapi.ts` — fetch layer with no caching/prioritization; `mediaUrl` helper used for CMS image URLs
- `src/modules/portfolio/pages/home/index.tsx` — missing `<main>` landmark (a11y)
- `src/modules/portfolio/pages/home/sections/hero/HeroSection.tsx` — LCP element; oversized local PNG fallback, no responsive image/preload/fetchpriority/explicit dimensions
- `src/assets/hero-creacion.png` — oversized/uncompressed source asset, single largest known payload contributor
- `src/modules/portfolio/pages/home/sections/obras/ObrasSection.tsx` — CMS `project.image` fetched but unused (dead payload, not a render cost)
- `vite.config.ts` — no image-optimization/compression plugin configured
- `src/shared/components/fresco-dome/FrescoDome.tsx` — full-viewport `<canvas>` animated via `gsap.ticker` every frame + a `ScrollTrigger` on `document.body`; not a first-paint blocker (mounted after content is ready, `aria-hidden`) but worth noting as a continuous main-thread cost for TBT/CPU on lower-end devices — out of scope for this pass unless it shows up in a real trace.

## Approaches

**A. Image optimization (hero + future CMS images)**
1. **Resize/compress + convert to WebP/AVIF, serve at real display size** — resize `hero-creacion.png` to ~2x the max rendered box (≈1520×680), export WebP (+PNG/JPEG fallback via `<picture>`), add explicit `width`/`height`, `fetchpriority="high"` on the `<img>`, and a `<link rel="preload" as="image">` in `index.html` for the LCP path.
   - Pros: directly removes the ~1.4 MB payload id'd in the baseline; highest-leverage single fix for LCP; no architecture change.
   - Cons: static asset, so if hero image is later set via CMS this optimization doesn't cover that path.
   - Effort: Low
2. **Configure Strapi responsive image formats + `srcset` via `mediaUrl`** — extend `mediaUrl`/`HeroSection` to consume Strapi's `formats.thumbnail/small/medium/large` and build a `srcset`, so CMS-supplied images are auto-optimized too.
   - Pros: fixes both the current fallback asset and any future CMS-driven hero/project images; consistent solution.
   - Cons: needs corresponding config in the Strapi repo (`carlossanjuanco-content`, out of this repo's control); more moving parts; only matters once ObrasSection actually renders `project.image`.
   - Effort: Medium

**B. Content-fetch strategy for fast LCP**
1. **Build-time content snapshot (SSG-lite) as first paint, client refetch for freshness** — add a Vite build step/plugin that fetches the 12 Strapi endpoints at build time, writes a static JSON module, and `ContentProvider` uses that as `content`'s initial state (paint immediately) while still kicking off the same runtime fetch in the background to hydrate with live data if it differs.
   - Pros: eliminates the blank/null render entirely for the common case (rebuild triggers content refresh); no framework migration; keeps existing component tree untouched; biggest LCP/FCP win available without adopting SSR.
   - Cons: content can be stale between rebuilds until the background refetch swaps it in (needs a redeploy or scheduled rebuild trigger from Strapi webhook for near-real-time content); adds a build-time network dependency (Strapi must be reachable during CI build).
   - Effort: Medium
2. **Full SSR/SSG framework migration (Next.js, Astro, vite-plugin-ssr/vike)** — rebuild the app on a framework with server rendering or prerendering.
   - Pros: best achievable LCP/FCP/SEO ceiling; solves render-blocking entirely and natively.
   - Cons: full app migration, no router today, real risk of regressing app.tsx/animations/tests; disproportionate for a single-page portfolio; large effort/timeline that doesn't fit an incremental optimization change.
   - Effort: High
3. **Keep SPA, but decouple hero fetch from the rest + render an immediate shell/skeleton** — split `fetchSiteContent`'s single `Promise.all` so the hero (and above-the-fold) data fetches and paints first; render layout/skeleton instead of `null` while other 11 endpoints are still in flight.
   - Pros: no build-time coupling to Strapi; smaller change than (B1); still removes the "blank white page" LCP delay for the hero.
   - Cons: LCP still gated on at least one network round trip after JS parses (no build-time head start); more component-level plumbing (staggered loading states) than a single snapshot.
   - Effort: Medium
4. **Stale-while-revalidate cache (localStorage/sessionStorage of last successful fetch)** — paint instantly from cached content on repeat visits, refetch in background.
   - Pros: low effort, helps only repeat visitors (not the first Lighthouse run, which is always a cold cache) — limited value for the actual Lighthouse score since Lighthouse runs cold.
   - Cons: does nothing for first-visit LCP, which is what Lighthouse measures; not a fix for the reported baseline problem.
   - Effort: Low

**C. SEO fixes**
- Add `<meta name="description">`, canonical link, basic OG tags to `index.html`; fix `<title>`. Add `public/robots.txt` with `Sitemap:`/`User-agent: * / Allow: /` directives. Given the app has no router and one real page, hardcoding meta tags directly in `index.html` is simpler and lower-risk than introducing `react-helmet-async` for a single static head.
  - Effort: Low

**D. Accessibility — missing `<main>` landmark**
- Change the wrapping `<div>` in `src/modules/portfolio/pages/home/index.tsx` to `<main>` (or wrap children in a `<main>` inside the existing div, keeping the div for background styling if needed).
  - Effort: Low (mechanical, one file)

**E. Measurement method**
- Never measure against `yarn dev` (Vite dev server ships unminified, unbundled, unsplit modules — the baseline report explicitly ran against `localhost:5173` dev). Correct flow: `yarn build && yarn preview`, then run Lighthouse (CLI or Chrome DevTools) against the `yarn preview` URL (default `http://localhost:4173`). This is required both to get an honest current baseline and to validate any fix.

## Recommendation
Do the cheap, mechanical, zero-architecture-risk fixes first (all Low effort, deliverable in one PR each): **A1** (compress/resize/convert hero image + preload/fetchpriority/explicit dimensions), **C** (meta description + robots.txt), **D** (`<main>` landmark). These alone should meaningfully move accessibility (100), SEO (likely 95+), and take a real bite out of LCP/image-delivery once measured against an actual production build.

For the LCP/FCP/TTI-critical fix, recommend **B1 (build-time content snapshot)** over B3 or B2: it removes the render-blocking `null` return entirely without a framework migration, fits the existing Vite toolchain, and is proportionate to a single-page portfolio site. B3 is an acceptable fallback if a build-time Strapi dependency in CI is judged too risky/operationally heavy — it still meaningfully improves LCP by unblocking the hero from the other 11 endpoints. B2 (SSR framework migration) is not recommended for this change; it's disproportionate effort/risk for the current scope and could be revisited separately if B1 proves insufficient.

Before any of the above is scored as "fixed," re-baseline with **Approach E** — the 57 performance score is not trustworthy as a target/regression signal until measured against a production build.

## Risks
- No Bash tool was available in this exploration context — `yarn build`/bundle-size numbers, actual `hero-creacion.png` byte size, and a fresh Lighthouse-against-preview baseline were NOT captured. All performance-fix effort/impact estimates above are inferred from source reading, not measured. sdd-propose/sdd-apply should run a real production build + Lighthouse pass as its first step.
- B1 (build-time snapshot) introduces a build-time dependency on Strapi being reachable (`http://localhost:1337` in dev, presumably a hosted URL in CI/prod) — if the build environment can't reach Strapi, the build fails; needs a documented fallback or retry.
- Strapi media formats (for Approach A2) live in the `carlossanjuanco-content` repo, outside this repo's control — coordinating that change is a separate workstream.
- Locale toggle (`ContentProvider`'s `locale` state) currently drives a full refetch on language switch — any build-time snapshot approach needs to account for both locales (`es`/`en`) or the initial snapshot only covers one locale and the other still blocks on live fetch.
- `openspec/changes/lighthouse-optimization/explore.md` could not be written to the filesystem — no Write tool was available in this execution context (only Read/Grep/Glob/WebFetch/WebSearch/mem_save were provided). This exploration was persisted to Engram only. The orchestrator or a subsequent phase with file-write access should write this content to that path to satisfy the "hybrid" artifact-store requirement.

## Ready for Proposal
Yes — with the caveat above (missing filesystem write + missing real build/Lighthouse measurement). Recommend sdd-propose scope the change as: (1) re-baseline against production build, (2) image fix, (3) SEO/a11y mechanical fixes, (4) build-time content snapshot for LCP, as separately reviewable slices given the review-workload budget.

## Production Baseline (measured)

Measured 2026-07-20 with Lighthouse 13.4.1 (headless Chrome, mobile emulation defaults) against `yarn build` + `vite preview` on `http://localhost:4173`, with Strapi running on `:1337`. Raw report: scratchpad `lh-prod-baseline.json`.

### Category scores
| Category | Score |
|---|---|
| Performance | 71 |
| Accessibility | 98 |
| Best Practices | 100 |
| SEO | 83 |

### Core metrics
| Metric | Value |
|---|---|
| First Contentful Paint | 2.6 s |
| Largest Contentful Paint | **11.0 s** |
| Total Blocking Time | 80 ms |
| Cumulative Layout Shift | 0.022 |
| Speed Index | 2.6 s |
| Time to Interactive | 11.0 s |

### Bundle sizes (dist/, production build)
- Total `dist/`: 2.4 MB
- `assets/index-*.js`: 467.94 kB (157.46 kB gzip)
- `assets/index-*.css`: 40.34 kB (18.85 kB gzip)
- `assets/hero-creacion-*.png`: **1,565.96 kB** — dominant asset; source file `src/assets/hero-creacion.png` is 1.6 MB
- Fonts (JetBrains Mono / Fraunces / Newsreader woff/woff2): ~370 kB combined

### Top failing audits
| Audit | Finding / est. savings |
|---|---|
| image-delivery-insight | **1,456 KiB** savings (hero PNG oversized/uncompressed) |
| render-blocking-insight | 1,050 ms savings |
| largest-contentful-paint | 11.0 s (score 0) — LCP gated on 12 Strapi fetches + 1.5 MB hero PNG |
| interactive | 11.0 s (score 0.21) |
| unused-javascript | 75 KiB / 450 ms savings |
| landmark-one-main | fail — no `<main>` landmark (a11y 98) |
| meta-description | fail (SEO 83) |
| robots-txt | fail — 14 errors (index.html served as fallback) |
| forced-reflow-insight | fail |
| lcp-breakdown / lcp-discovery insights | fail — LCP image not discoverable in initial HTML, no preload/fetchpriority |
| unused-css-rules | 13 KiB savings |

### Interpretation vs the dev-server baseline
The production build is much healthier than the dev-server-based 57 performance score (FCP/SI 2.6 s, TBT 80 ms, CLS 0.022), but the exploration's core diagnosis holds: LCP is 11 s because the hero cannot paint until all 12 Strapi calls resolve and the 1.5 MB hero PNG downloads. The image fix (A1) and content-fetch fix (B1/B3) remain the two levers for Performance; `<main>` landmark closes a11y to 100; meta description + valid robots.txt close SEO.
