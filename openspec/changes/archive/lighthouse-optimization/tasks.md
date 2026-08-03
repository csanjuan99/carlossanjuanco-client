# Tasks: Lighthouse Optimization

Strict TDD (vitest, `yarn test`, currently 35 green). Within each slice, write/extend
tests first, watch them fail, then implement. `tsconfig` has `noUnusedLocals` /
`noUnusedParameters` — remove any code made dead by a task (e.g. the CMS hero
branch dropped in Slice 2) in the same task, not later.

Slices 1-4 are independent of each other and may be delivered/reviewed as separate
PRs in parallel. Within a slice, tasks are sequential (test → implement → verify).
The measurement and final-verification tasks are sequential and depend on all four
slices being merged.

---

## Slice 1 — Content snapshot script + ContentProvider seeding

Satisfies: web-performance spec — "home page renders from build-time content
snapshot", "Build-time fetch failure" (soft-mode, amended), "tests stay green".

- [x] 1.1 (test) Add `scripts/snapshot-content.test.mjs` (or vitest-compatible
      equivalent) asserting: on successful fetch of all 12 endpoints × 2 locales,
      writes `src/shared/content/snapshot/{es,en}.json`; on network failure with an
      existing committed snapshot, logs a warning and exits 0 leaving the committed
      file untouched; on network failure with no committed snapshot present, exits
      non-zero. Run `yarn test` — confirm the new tests fail (script doesn't exist
      yet).
- [x] 1.2 (test) Add a unit test asserting `contentSnapshot` (from
      `src/shared/content/snapshot/index.ts`) satisfies the `SiteContent` shape for
      both `es` and `en` — will fail until 1.4/1.5 exist.
- [x] 1.3 (test) Extend `ContentProvider` tests: (a) hero content is present in the
      render tree synchronously on mount, before any fetch resolves, with
      `status: 'ready'` immediately; (b) a successful refetch replaces content
      (unconditional swap); (c) a failed refetch keeps the seeded/snapshot content
      and stays `ready` (no error screen) — only show the error screen when there
      is no snapshot for the locale and the fetch also fails. Run `yarn test` —
      confirm failures.
- [x] 1.4 Implement `scripts/snapshot-content.mjs` (Node global `fetch`, no new
      deps): fetch 12 endpoints × es/en, write
      `src/shared/content/snapshot/{es,en}.json`; soft-mode fallback per amended
      spec (warn + reuse committed snapshot on failure, non-zero exit only when no
      committed snapshot exists for that locale).
- [x] 1.5 Create `src/shared/content/snapshot/index.ts` exporting
      `contentSnapshot: Record<SupportedLocale, SiteContent>`, statically importing
      the committed JSON (no `public/` fetch). Generate/commit an initial
      `{es,en}.json` snapshot pair by running `yarn snapshot` once against the live
      Strapi instance (or hand-seed from current live content if Strapi isn't
      reachable in this environment) so 1.2 has real data to assert against.
- [x] 1.6 Modify `src/shared/content/ContentProvider.tsx`:
      - Seed initial state: `useState<SiteContent>(() =>
        contentSnapshot[getInitialLocale()])` and `useState<ContentStatus>('ready')`.
      - **GATE-003 fix**: the existing mount/locale-change effect currently calls
        `setStatus('loading')` unconditionally, which clobbers the seeded `'ready'`
        state and reintroduces a blank/loading render before the snapshot paints.
        Change the effect so it does **not** set `status` to `'loading'` when
        snapshot content is already seeded for that locale — only transition to
        `'loading'` when there is no snapshot for the locale being loaded (locale
        switch to a locale with no committed snapshot, or first-ever load without
        snapshot data). On successful fetch: `setContent(live)`, `status: 'ready'`.
        On failed fetch: keep existing content, stay `status: 'ready'` if snapshot
        content exists; only surface an error status when there is no snapshot to
        fall back on and the fetch failed.
      - Remove the `!content` null-return early-exit path for locales that have
        snapshot data (dead now that content is always seeded).
- [x] 1.7 Wire `prebuild`/`snapshot` scripts into `package.json`
      (`"prebuild": "node scripts/snapshot-content.mjs"`,
      `"snapshot": "node scripts/snapshot-content.mjs"`).
- [x] 1.8 Run `yarn test` — confirm all Slice 1 tests (1.1-1.3) and the full
      pre-existing suite are green (35 + new). Run `yarn build` to confirm
      `noUnusedLocals`/`noUnusedParameters` pass with the `ContentProvider` changes.

## Slice 2 — Hero image optimization + preload

Satisfies: web-performance spec — "hero image optimized", "tests stay green".

- [x] 2.1 (test) Extend/add `HeroSection` test asserting the rendered markup is a
      `<picture>` with a `<source type="image/webp" srcSet="/hero-creacion.webp">`
      and an `<img src="/hero-creacion.png">` fallback carrying explicit `width`
      and `height` attributes matching the optimized asset dimensions
      (≈1520×680) and no `fetchpriority`/CMS-sourced `src` branch. Run `yarn
      test` — confirm failure.
- [x] 2.2 Implement `scripts/optimize-hero.mjs` (sharp devDep) that resizes the
      source hero asset to ≈1520×680 and emits `public/hero-creacion.webp` +
      compressed `public/hero-creacion.png`. Run it once to produce the committed
      output files.
- [x] 2.3 Modify `HeroSection.tsx`:
      - Replace the existing hero `<img>` with a `<picture>` (`webp` source +
        `png` fallback), stable unhashed `/hero-creacion.{webp,png}` paths,
        explicit `width`/`height`.
      - **GATE-002 resolution**: drop the CMS-sourced hero image branch/prop
        entirely — the design commits to the stable `public/` unhashed URL as the
        single source, so any conditional branch that renders a Strapi-provided
        hero URL is now dead code and must be removed (not left unreachable),
        satisfying `noUnusedLocals`/`noUnusedParameters`. If a consumer or test
        still passes a CMS hero prop, delete that prop from the component's
        interface in the same task, not just its usage.
      - Add `fetchpriority="high"` to the fallback `<img>`.
- [x] 2.4 Delete `src/assets/hero-creacion.png` (superseded by the `public/`
      optimized pair) and remove now-unused imports/references.
- [x] 2.5 Modify `index.html`: add
      `<link rel="preload" as="image" href="/hero-creacion.webp"
      type="image/webp" fetchpriority="high">` (explicit `type="image/webp"` per
      GATE-002 so the browser can match it against the `<picture>` `<source>`
      correctly).
- [x] 2.6 Run `yarn test` — confirm 2.1 and full suite green. Run `yarn build` —
      confirm no unused-code build failures from the removed CMS branch.

## Slice 3 — SEO meta + robots.txt

Satisfies: seo-metadata spec — meta description, canonical/OG/title, robots.txt,
"tests stay green".

- [x] 3.1 Modify `index.html`: set a real `<title>`, add
      `<meta name="description">`, `<link rel="canonical" href="https://carlossanjuan.co">`,
      and OG tags (`og:title`, `og:description`, `og:url`, `og:type`, `og:image`
      pointing at the optimized hero asset from Slice 2 if merged, otherwise the
      existing hero path — reconcile the `og:image` path when both slices land).
- [x] 3.2 Create `public/robots.txt` with `User-agent: *`, `Allow: /`, and a
      `Sitemap:` directive, distinct from the SPA's catch-all HTML fallback (verify
      it is served as `text/plain` at `/robots.txt`, not the `index.html` shell).
- [x] 3.3 No component-level test surface exists for static HTML/robots content;
      if the repo has an existing lint/test hook asserting `index.html` contents,
      extend it — otherwise this slice is verified structurally in the final
      Lighthouse measurement, not via `yarn test`. Run `yarn test` to confirm the
      pre-existing suite is unaffected (still 35 green).

## Slice 4 — `<main>` landmark

Satisfies: accessibility-landmarks spec — single `<main>` landmark,
structural-only change, "tests stay green".

- [x] 4.1 (test) Add/extend a test on
      `src/modules/portfolio/pages/home/index.tsx` asserting the page renders
      exactly one `<main>` element wrapping the section content, with the
      decorative canvas remaining a sibling outside `<main>` (per design). Run
      `yarn test` — confirm failure.
- [x] 4.2 Wrap the home page's section content in a single `<main>` landmark in
      `index.tsx`, keeping the decorative canvas as a sibling. No layout/styling
      changes.
- [x] 4.3 Run `yarn test` — confirm 4.1 and full suite green (no visual/layout
      regression expected since this is structural-only).

## Cross-slice — measurement + final verification

Depends on Slices 1-4 being merged.

- [x] 5.1 Create `scripts/measure.sh`: runs `yarn build && yarn preview`,
      launches Lighthouse (CLI or `lighthouse` npm devDep) against the preview
      URL, and asserts thresholds — Performance ≥95, Accessibility 100,
      Best-Practices 100, SEO 100, LCP <2.5s — failing (non-zero exit) if any
      threshold is missed. Wire it as an npm script (`"measure": "bash
      scripts/measure.sh"`).
- [x] 5.2 Run `yarn test` once more with all four slices merged — confirm full
      green suite (35 + new Slice 1/2/4 tests).
- [x] 5.3 Run `yarn build` — confirm typecheck + build pass with zero unused
      code (validates the Slice 2 GATE-002 dead-branch removal held after all
      merges).
- [x] 5.4 Run `yarn measure` (`scripts/measure.sh`) against the production build
      and record actual scores/LCP against the baseline (Performance 71→?,
      A11y 98→?, Best-Practices 100→?, SEO 83→?, LCP 11.0s→?s). If any threshold
      is missed, file a follow-up task per missed category rather than expanding
      this change's scope.

      **Result** (local measurement, Strapi live, default Lighthouse mobile
      throttling — 4x CPU slowdown, ~1.5 Mbps/150ms RTT simulated network):
      Accessibility 100, Best-Practices 100, SEO 100 — all pass. Performance
      68-84 (run-to-run variance) and LCP ~3.9-4.1s — both miss threshold.

      Root cause (measured via Lighthouse's LCP-breakdown insight): the LCP
      element (hero `<picture><img>`) itself loads fast — TTFB 7ms, resource
      load delay 50ms, resource load duration 16ms (preload + WebP working as
      designed) — but `elementRenderDelay` is ~2.3s. The hero image is wrapped
      in a `framer-motion` `motion.div`/`motion.img` (FadeIn-style
      scroll/mount animation), so paint is gated on JS bootup + animation
      start under simulated CPU throttle, compounded by a single 489 KiB
      (162 KiB gzip) JS bundle with ~73 KiB of estimated unused JS
      (`unused-javascript` audit) that must download/parse/execute first.

      This is an animation and bundling architecture concern, not covered by
      this change's design (`design.md`: "no framework migration, component
      tree and animations unchanged"). Fixing it would mean either
      code-splitting the bundle or changing the hero's initial animation
      state — both out of scope here per the "file a follow-up task ... rather
      than expanding this change's scope" instruction above.

      **Follow-up (new change, not this one)**: investigate (a) excluding the
      hero image from its mount-in animation (render it visible immediately,
      keep motion for surrounding content) and (b) route/vendor code-splitting
      (gsap/framer-motion) to cut initial bundle weight, then re-measure
      Performance/LCP.

## Slice 6 — Hero paint gating + code-split + dead-code cleanup (follow-up on verify-report CRITICALs)

Follow-up to close the verify-report CRITICALs: Performance 85→≥95, LCP 3.8s→<2.5s.
Depends on Slice 5 (measurement tooling) being merged. Hero mount animation
deferred per user-approved deviation from the strict "animations unchanged"
scope in `design.md`.

- [x] 6.1 (test) Extend `HeroSection.test.tsx`: assert the hero `<picture>`'s
      animated wrapper is not gated behind an initial-hidden (`opacity: 0`)
      mount state. Run `yarn test` — confirm failure (RED).
- [x] 6.2 Change the hero image's `motion.div` wrapper in `HeroSection.tsx`
      from `initial={{ opacity: 0, scale: 0.9 }}` to `initial={false}` so the
      LCP element paints immediately instead of being gated behind JS
      bootstrap + animation start. All other Hero/page animations left
      untouched per user approval. Run `yarn test` — confirm 6.1 + full suite
      green.
- [x] 6.3 Investigated removing the `if (!content) return null` path in
      `ContentProvider.tsx` (task 1.6 leftover, flagged WARNING in
      verify-report). Kept it: it is not actually dead — `content` is
      genuinely `null` while `status` is `'loading'` for a locale with no
      committed snapshot before the first fetch resolves, and checking
      `content` directly (rather than `status`) lets TypeScript narrow
      `content` to non-null for the `ContentContext.Provider` below without
      an unsafe cast. Added a comment documenting why it is reachable and
      required, since the repo's automated pre-commit review correctly
      flagged an earlier `status`-based + `as SiteContent` cast attempt as
      fighting the type system. Covered by existing `ContentProvider.test.tsx`
      suite (8/8 still green, no behavior change).
- [x] 6.4 Add Vite `build.rollupOptions.output.manualChunks` in
      `vite.config.ts` splitting `framer-motion`/`gsap` into a separate
      `vendor-animation` chunk, shrinking the single 489.72 KB initial chunk.
- [x] 6.5 (test) Add `home/index.lazy.test.tsx`: assert that below-the-fold
      content (`Footer`, standing in for the whole deferred group) is
      genuinely withheld from the render until its module resolves, using a
      manually-controlled dynamic-import promise (a plain synchronous mock,
      as first attempted in `home/index.test.tsx`, resolves within the same
      `act()` flush in this test environment and cannot prove deferral — see
      the note left in `home/index.test.tsx`). Run `yarn test` — confirm
      failure (RED): the hero renders, but the assertion that `Footer` is
      absent before resolution fails against the pre-6.6 synchronous
      implementation.
- [x] 6.6 Convert `FrescoDome`, `GoldCursor`, and all below-the-fold sections
      (`ManifestoSection`, `StackSection`, `ObrasSection`, `FriezeSection`,
      `TestimonialsSection`, `ContactSection`, `Footer`) in
      `home/index.tsx` to `React.lazy` + `Suspense fallback={null}`, keeping
      `HeroSection` eager (it owns the LCP element). Run `yarn test` — confirm
      6.5 + full suite green (48/48; note: React defers invoking a
      below-the-fold `lazy()` loader until after the initial commit rather
      than synchronously inside `render()`, so the deterministic test must
      `waitFor` the module to be requested before resolving it — documented
      in `index.lazy.test.tsx`). Run `yarn build` — confirm chunk split (main
      chunk 489.72 KB → 218.88 KB gzip 68.35 KB; below-fold sections split
      into per-section chunks 1-5 KB each; `vendor-animation` chunk
      251.73 KB gzip 89.60 KB, loaded in parallel via `modulepreload`).
- [x] 6.7 Run `yarn measure` (Strapi live) and record results against
      verify-report's baseline (Performance 85→?, LCP 3817ms→?). Checkbox
      marks the measurement task as executed and its result honestly
      documented, not that the ≥95/<2.5s thresholds were hit — see Verdict
      below: they were not, and the gap is filed as a follow-up per this
      task's own instruction rather than expanding this change's scope.

      **Result** (local measurement, Strapi live, default Lighthouse mobile
      throttling): Performance 77-86 across multiple runs post-fix (vs. 85
      pre-fix — no material net change, within the pre-existing run-to-run
      noise band of 68-86 documented since Slice 5). LCP 3514-3961ms across
      runs (vs. 3817ms pre-fix — no material net change). Accessibility 100,
      Best-Practices 100, SEO 100 — unaffected, still pass.

      **Root cause re-diagnosis after the fix**: the targeted fix worked at
      the mechanism level — Lighthouse's `lcp-breakdown-insight` (real-trace,
      unthrottled) now shows `elementRenderDelay` dropped from ~2309ms to
      ~110ms, confirming the mount-animation gate is closed. However, the
      Lantern-simulated (throttled) LCP metric used for scoring is dominated
      by a different, deeper mechanism: this is a pure client-side-rendered
      (CSR) React SPA with no SSR/prerendering, so under simulated mobile
      throttling (4x CPU, ~1.5 Mbps/150ms RTT) the browser cannot paint
      *any* content — including the preloaded, no-longer-motion-gated hero
      image — until React + the JS module graph needed to mount `HeroSection`
      (which still directly imports `framer-motion` for its other,
      intentionally-untouched animations: clouds, text reveals, glow blobs)
      is fetched and executed. Splitting `framer-motion`/`gsap` into a
      parallel-loaded `vendor-animation` chunk (task 6.4) and deferring
      below-the-fold sections (task 6.6) reduced total main-thread/bundle
      work materially (main chunk 489.72 KB → 218.86 KB gzip 68.32 KB) but
      did not reduce the *critical-path* bytes needed before first paint,
      because `HeroSection` — and therefore the hero image nested inside it
      — still cannot render before `framer-motion` (89.60 KB gzip) loads,
      since the user-approved scope explicitly keeps Hero's other animations
      (clouds, text reveals) intact and framer-motion-driven.

      **Verdict**: CRITICALs not closed. Performance and LCP remain below
      threshold. This is now conclusively a CSR-architecture limitation, not
      an animation-timing bug — the design's explicit scope boundary ("no
      framework migration") is the actual blocker. Closing this gap fully
      would require either (a) removing framer-motion from Hero's critical
      render path entirely (contradicts the user's explicit "keep the rest
      of the page's animations untouched" instruction for this batch), or
      (b) SSR/static prerendering of the initial HTML (a framework
      migration, explicitly out of scope per `design.md`). Filed as a
      follow-up recommendation, not expanded into this change's scope.

---

## Review Workload Forecast

| Slice | Files touched | Est. changed lines |
|---|---|---|
| 1 — snapshot + ContentProvider | `scripts/snapshot-content.mjs` (new), `src/shared/content/snapshot/{index.ts,es.json,en.json}` (new), `ContentProvider.tsx` (modify), `package.json` (modify), + tests | ~250-350 (bulk is generated JSON snapshot data, low review risk; logic diff in `ContentProvider.tsx` is small, ~20-30 lines) |
| 2 — hero image | `scripts/optimize-hero.mjs` (new), `HeroSection.tsx` (modify), `index.html` (modify), binary assets (new/delete), + tests | ~80-120 |
| 3 — SEO meta | `index.html` (modify), `public/robots.txt` (new) | ~20-30 |
| 4 — `<main>` landmark | `home/index.tsx` (modify), + test | ~15-25 |
| Cross-slice — measurement | `scripts/measure.sh` (new), `package.json` (modify) | ~40-60 |

**Total estimated: ~400-585 changed lines across 5 PRs**, but no single PR is
expected to individually cross the 400-line budget — Slice 1 is the largest and
is dominated by generated/committed JSON snapshot data (low-risk, not
hand-authored logic), which should be reviewed separately from the
`ContentProvider.tsx` logic diff if line count becomes a concern.

**Recommendation**: chained PRs, one per slice (5 total: Slices 1-4 + the
cross-slice measurement/verification PR), each independently revertable per the
design's rollout notes. This keeps every individual PR comfortably under the
400-line budget and lets Slice 1's snapshot data commit be reviewed separately
from its logic change.

**400-line budget risk**: low per-PR, contingent on keeping generated snapshot
JSON and the `ContentProvider.tsx` logic edit in the same PR (acceptable — data
file, not hand-reviewed) but not bundling multiple slices into one PR.

**Decision needed**: none blocking — GATE-002 and GATE-003 are resolved above as
concrete task steps (1.6 for GATE-003, 2.3 for GATE-002). Confirm before Slice 3
merges: production canonical/OG domain (`https://carlossanjuan.co`, per design's
open question) — operator confirmation, not a design blocker.
