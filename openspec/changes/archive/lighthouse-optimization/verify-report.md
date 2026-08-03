# Verify Report: Lighthouse Optimization

**Status**: ARCHIVED — Closed with accepted exception on Performance/LCP thresholds (CSR architectural ceiling)

**Verdict**: FAIL on 2 CRITICAL spec thresholds (Performance 85 < 95, LCP 3.8s > 2.5s), PASS on all other capabilities (A11y 100, BP 100, SEO 100, 19/21 scenarios, 65 tests green).

**User decision** (2026-08-03): Accept the exception and PARK Amendment 1 (build-time prerendering). Archive as closed-with-accepted-exception, not as full pass. Follow-up change to address Performance/LCP filed as recommended action, not part of this change's scope.

---

```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:bae89f1fce74958e20f59b8e92c5ded58623c97e
verdict: fail
blockers: 2
critical_findings: 3
requirements: 11/13
scenarios: 19/21
test_command: yarn test
test_exit_code: 0
test_output_hash: sha256:98c04ef300c8647ad48f9853f4b36643d791aec7460241bb463992a4bb64e1ae
build_command: yarn build
build_exit_code: 0
build_output_hash: sha256:00a21567b4cc48f5f6b27f1f775f37fd386b97413b392b6dcaf816217f2070bb
```

## Verification Report

**Change**: lighthouse-optimization
**Version**: N/A (no spec version header)
**Mode**: Strict TDD
**Branch verified**: `lighthouse/slice-5-measurement` (contains all 5 stacked slices, base `dev`), HEAD `bae89f1`
**Strapi**: reachable at `localhost:1337` during verification

### Completeness
| Metric | Value |
|--------|-------|
| Tasks total | 24 |
| Tasks complete | 24 |
| Tasks incomplete | 0 |

All 24 tasks across Slices 1-5 are checked `[x]` in `tasks.md` and match code state (verified by direct inspection, not just trusting the checkboxes).

### Build & Tests Execution

**Build**: PASSED
```text
$ yarn build
node scripts/snapshot-content.mjs   # prebuild hook, wrote es.json/en.json live
tsc -b && vite build
✓ 455 modules transformed, built in 1.29s
dist/assets/index-_CQHNSG0.js   489.72 kB │ gzip: 162.78 kB
```
Zero `noUnusedLocals`/`noUnusedParameters` errors — confirms Slice 2's dead CMS-hero-branch removal (GATE-002) held.

**Tests**: 46 passed / 0 failed / 0 skipped (12 files)
```text
$ yarn test
Test Files  12 passed (12)
     Tests  46 passed (46)
  Duration  1.60s
```
Matches apply-progress's reported 46/46 exactly — reproduced independently, not trusted blindly.

**Coverage**: not available (no coverage tool configured in this repo — vitest run without `--coverage`; `package.json`/`vitest.config` do not wire a coverage provider). Reported per skill rule as skipped, not a failure.

**Lighthouse measurement** (reproduced live, not trusted from apply-progress alone):
```text
$ yarn measure
[measure] scores: performance=85 accessibility=100 best-practices=100 seo=100 lcp=3817ms
[measure] FAILED thresholds:
  - performance: 85 < required 95
  - lcp: 3817ms, required < 2500ms
Command failed with exit code 1.
```
This run: Performance 85 (apply-progress range was 68-84 — this run is 1 point outside that band, consistent with the "run-to-run variance" already documented; still a clear fail against the ≥95 threshold). A11y/BP/SEO all 100, matching apply-progress exactly. LCP 3817ms this run vs. reported 3.9-4.1s — same conclusion, fails <2.5s threshold. Root cause independently confirmed by source inspection (see Correctness table, Hero image row): the `<picture>` is wrapped in a `framer-motion` `motion.div` with `initial={{opacity:0, scale:0.9}}`, gating paint on JS bootstrap + animation start — this is a code fact, not a guess.

### Spec Compliance Matrix

**web-performance** (5 requirements, 12 scenarios)

| Requirement | Scenario | Test | Result |
|---|---|---|---|
| Production Lighthouse performance score | Lighthouse run against production preview | `yarn measure` (Lighthouse CLI, not vitest) | ❌ FAILING — 85 < 95 |
| Production Lighthouse performance score | Dev server never used as target | `scripts/measure.sh` builds+previews, never `yarn dev` | ✅ COMPLIANT |
| LCP budget | LCP measured on production preview | `yarn measure` | ❌ FAILING — 3817ms ≥ 2500ms |
| Home page renders from build-time snapshot | Initial paint uses snapshot, no blank render | `ContentProvider.test.tsx > paints seeded hero content synchronously...` | ✅ COMPLIANT |
| Home page renders from build-time snapshot | Both locales snapshot independently | `snapshot/index.test.ts` (shape assertion both locales) | ✅ COMPLIANT |
| Home page renders from build-time snapshot | Background refetch keeps content fresh | `ContentProvider.test.tsx > replaces seeded content with live data...` | ✅ COMPLIANT |
| Home page renders from build-time snapshot | Refresh failure does not ship stale/broken content silently | `snapshot-content.test.mjs > warns and reuses committed snapshot...` + `> exits non-zero when no committed snapshot exists` | ✅ COMPLIANT |
| Hero image is optimized for LCP | WebP with fallback, substantially smaller | `HeroSection.test.tsx` (picture/source/img assertions) + build output inspection | ✅ COMPLIANT |
| Hero image is optimized for LCP | Explicit width/height | `HeroSection.test.tsx` | ✅ COMPLIANT |
| Hero image is optimized for LCP | Preload + fetchpriority in initial HTML | source inspection `index.html:7`, `HeroSection.tsx:125` | ✅ COMPLIANT |
| Hero image is optimized for LCP | Payload reduction measurable (near-zero image-delivery finding) | not independently isolated — only aggregate category scores captured by `measure.sh`, no per-audit JSON retained | ⚠️ PARTIAL — plausible given WebP+preload are in place and LCP resource-load numbers are fast (per apply-progress breakdown), but not directly re-verified at the audit level in this pass |
| Automated tests stay green | Test suite passes after changes | `yarn test` full run | ✅ COMPLIANT |

**accessibility-landmarks** (3 requirements, 4 scenarios)

| Requirement | Scenario | Test | Result |
|---|---|---|---|
| Production Lighthouse accessibility score | Accessibility audit passes fully | `yarn measure` → accessibility=100 | ✅ COMPLIANT |
| Single main landmark | `landmark-one-main` audit passes | source inspection `home/index.tsx:17-26` (single `<main>`) + `home/index.test.tsx` + Lighthouse a11y=100 | ✅ COMPLIANT |
| Single main landmark | Existing layout/styling preserved | diff is wrap-only per task 4.2, no styling changed | ✅ COMPLIANT |
| Automated tests stay green | Test suite passes | `yarn test` | ✅ COMPLIANT |

**seo-metadata** (5 requirements, 5 scenarios)

| Requirement | Scenario | Test | Result |
|---|---|---|---|
| Production Lighthouse SEO score | SEO audit passes fully | `yarn measure` → seo=100 | ✅ COMPLIANT |
| Meta description present | Meta description audit passes | source inspection `index.html:10-12` non-empty, SEO=100 | ✅ COMPLIANT |
| Canonical and OG tags present | Canonical/OG/title present, real title | source inspection `index.html:8,13-21`; title is real (not "Portfolio" placeholder) | ✅ COMPLIANT |
| Valid robots.txt | robots.txt audit passes | `public/robots.txt` content inspected (User-agent, Allow, Sitemap present), SEO=100 confirms Lighthouse `robots-txt` audit passed | ✅ COMPLIANT |
| Automated tests stay green | Test suite passes | `yarn test` | ✅ COMPLIANT |

**Compliance summary**: 19/21 scenarios compliant, 1 partial (unverified at audit-item granularity), 2 failing (performance score, LCP budget — same root cause).

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|---|---|---|
| ContentProvider seeding (GATE-003) | ✅ Implemented | `useState(() => snapshotFor(locale) ?? null)` + `useState(() => snapshotFor(locale) ? 'ready' : 'loading')`; mount effect only calls `setStatus('loading')` in the `else` (no-snapshot) branch — never clobbers seeded `ready` state |
| `!content` null-return path | ⚠️ Not removed | Task 1.6 said "Remove the `!content` null-return early-exit path for locales that have snapshot data (dead now that content is always seeded)." `ContentProvider.tsx:139` (`if (!content) return null`) still exists. Currently unreachable in practice since both supported locales (es/en) are always seeded, so it is not a spec violation, but it is a literal deviation from the task's own instruction — flagged as WARNING, not CRITICAL, since it doesn't reintroduce a blank-render regression under current locale set. |
| Hero image `<picture>`/WebP/PNG fallback (GATE-002) | ✅ Implemented | `HeroSection.tsx:118-130`; CMS-sourced hero branch fully removed (no unused-code build errors) |
| Hero preload | ✅ Implemented | `index.html:7`, explicit `type="image/webp"` per GATE-002 |
| `<main>` landmark | ✅ Implemented | `home/index.tsx:17,26`, canvas remains sibling |
| SEO tags | ✅ Implemented | `index.html:8-21` |
| `robots.txt` | ✅ Implemented | `public/robots.txt` |
| Snapshot soft-mode fallback | ✅ Implemented | `scripts/snapshot-content.mjs:59-66` — warns + reuses committed snapshot on fetch failure if one exists, exits non-zero only when none exists |
| **Root cause of Performance/LCP failure** | ✅ Confirmed by source inspection | `HeroSection.tsx:112-116`: the `<picture>` is wrapped in `<motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} transition={{duration:1.4, delay:0.8}}>` — this is exactly the animation-gated-paint mechanism apply-progress attributed the ~2.3s `elementRenderDelay` to. Independently verified, not taken on faith. |

### Coherence (Design)

| Decision | Followed? | Notes |
|---|---|---|
| Standalone prebuild Node script (not Vite plugin) | ✅ Yes | `scripts/snapshot-content.mjs`, wired as `prebuild` |
| Statically-imported JSON snapshot module | ✅ Yes | `src/shared/content/snapshot/index.ts` |
| Build-time-unreachable fallback = reuse committed snapshot | ✅ Yes | soft-mode confirmed |
| ContentProvider seeding + swap policy | ✅ Yes (with the minor `!content` leftover noted above) | |
| Hero pipeline: scripted one-off to `public/`, stable URL | ✅ Yes | `scripts/optimize-hero.mjs`, `public/hero-creacion.{webp,png}` |
| SEO: static tags in `index.html`, no `react-helmet-async` | ✅ Yes | |
| "No framework migration, component tree and animations unchanged" | ✅ Yes (this is exactly why Performance/LCP still fail) | The design explicitly scoped animations as unchanged; the measured Performance/LCP miss is the direct, documented consequence of that scope boundary, not an implementation bug within scope. |

### TDD Compliance

| Check | Result | Details |
|-------|--------|---------|
| TDD Evidence reported | ⚠️ Partial | Current `apply-progress` (topic-keyed, single upserted observation) narrates full TDD-cycle detail only for Slice 5 (task 5.1: RED confirmed via failing import, GREEN 2/2, triangulation 2 cases). Slices 1-4's per-task RED/GREEN/TRIANGULATE/SAFETY-NET evidence from earlier sessions was not retained in the current artifact (topic_key upsert semantics overwrite rather than append) — only a one-line summary ("Slices 1-4 were already committed/pushed from a prior session"). No formal "TDD Cycle Evidence" table exists for any slice. |
| All tasks have tests | ✅ | `tasks.md` shows an explicit `(test)`-tagged task before every implementation task in Slices 1, 2, 4, and the cross-slice measurement task — test-first structure is evident from the task list itself, independent of the missing evidence table |
| RED confirmed (tests exist) | ✅ | All referenced test files exist and were located: `snapshot-content.test.mjs`, `snapshot/index.test.ts`, `ContentProvider.test.tsx`, `HeroSection.test.tsx`, `home/index.test.tsx`, `assert-lighthouse-thresholds.test.mjs` |
| GREEN confirmed (tests pass) | ✅ | 46/46 pass on independent re-run this session |
| Triangulation adequate | ✅ | ContentProvider has 5 distinct test cases covering seed/swap/keep-on-error/error-screen/retry; snapshot-content has 3 cases (success, soft-fail-with-snapshot, hard-fail-no-snapshot); assert-lighthouse-thresholds has 2 (pass, multi-category fail) |
| Safety Net for modified files | ➖ Not independently verifiable this session | Apply-progress reports "44/44 pass before starting" for Slice 5 only; no per-slice safety-net record exists for Slices 1-4 in the current artifact |

**TDD Compliance**: 4/6 checks fully pass, 1 partial, 1 not verifiable — the missing formal evidence table for Slices 1-4 is a process/documentation gap, not evidence that TDD was skipped (task decomposition and current green suite are strong corroborating signals), but per protocol this is flagged rather than waved through.

### Test Layer Distribution
| Layer | Tests | Files | Tools |
|-------|-------|-------|-------|
| Unit | 44 | 10 | vitest |
| Integration (RTL render + behavior assertions) | 46 (subset: `ContentProvider.test.tsx` 8, `HeroSection.test.tsx`, `home/index.test.tsx`) | included above | @testing-library/react |
| E2E | 0 | 0 | none (Lighthouse via `scripts/measure.sh` covers the E2E/metric layer per design's testing strategy table, run separately from `yarn test`) |
| **Total** | **46** | **12** | |

### Changed File Coverage
Coverage analysis skipped — no coverage tool detected/configured in this repo (`vitest` invoked without `--coverage`, no coverage provider in config).

### Assertion Quality
✅ All assertions verify real behavior. Scanned `ContentProvider.test.tsx`, `snapshot-content.test.mjs`, `HeroSection.test.tsx`, `home/index.test.tsx`, `assert-lighthouse-thresholds.test.mjs`, `snapshot/index.test.ts`. No tautologies, no assertion-free renders, no ghost loops over possibly-empty collections, no ratio of mocks > 2x assertions found. Tests assert distinct expected values per case (e.g. `'es-hero-eyebrow'` vs `'live-hero-eyebrow'`), not repeated trivial checks.

### Quality Metrics
**Linter**: ➖ Not run this session (not in scope of declared verify commands; `yarn lint` exists per `CLAUDE.md` but was not part of the requested verification scope)
**Type Checker**: ✅ No errors (`tsc -b` runs as part of `yarn build`, passed cleanly, `noUnusedLocals`/`noUnusedParameters` enforced)

### Issues Found

**CRITICAL**:
1. **web-performance / "Production Lighthouse performance score"** — measured Performance 85, required ≥95. Reproduced independently this session (`yarn measure`), not merely trusted from apply-progress.
2. **web-performance / "Largest Contentful Paint budget"** — measured LCP 3817ms, required <2.5s. Same reproduction. Root cause confirmed by direct source inspection: the hero `<picture>` is inside a `framer-motion` `motion.div` mount animation (`HeroSection.tsx:112-116`), gating paint behind JS bootstrap + animation start, compounded by a 489.72 KB (162.78 KB gzip) single JS bundle.
3. **TDD Evidence gap for Slices 1-4** — the current `apply-progress` artifact (topic-keyed, upserted) no longer carries a per-task RED/GREEN/TRIANGULATE/SAFETY-NET table for Slices 1-4, only a one-line summary. Per strict-tdd-verify protocol this is flagged CRITICAL as a documentation/process gap — it does not mean TDD was skipped (task-list structure and current 46/46 green strongly corroborate it was followed), but the auditable evidence artifact itself is incomplete for those slices.

**WARNING**:
1. `ContentProvider.tsx:139` still contains the `if (!content) return null` early-exit path that task 1.6 explicitly instructed be removed for snapshot-covered locales. It is currently dead code for the two supported locales (both always seeded) and does not cause a regression, but it is a literal task-instruction deviation left unresolved.
2. Hero image "payload reduction is measurable" scenario (web-performance) was not independently re-verified at the individual Lighthouse-audit-item level this session — only category-level scores were captured by `scripts/measure.sh`. Reasonably inferred as passing (WebP+preload in place, fast resource-load timings reported by apply-progress), but not directly proven in this pass.
3. Lighthouse Performance score is measurably noisy run-to-run in this environment (68-85 observed across sessions) — all runs fail the ≥95 threshold consistently, but exact numbers should not be treated as stable/reproducible to the point.

**SUGGESTION**: None beyond the recommendation below.

### Recommendation for the Performance/LCP gap

The gap is real, reproducible, and root-caused (not speculative): `elementRenderDelay` from the hero's `framer-motion` mount animation, compounded by a 489 KB single-chunk bundle, dominates LCP timing. Per `design.md`'s explicit scope boundary ("no framework migration, component tree and animations unchanged"), fixing this is out of scope for `lighthouse-optimization` as currently designed. Options, with tradeoffs:

1. **Defer/skip the hero's mount animation only** (render hero visible immediately, keep `FadeIn`/motion for everything else below the fold) — smallest, most targeted fix; directly attacks the measured `elementRenderDelay` root cause without touching bundle size. Risk: minor visual behavior change to the hero's first-load feel (loses the fade-in on the hero specifically); low code risk since it's a single component's animation props.
2. **Code-split the 489 KB bundle** (route/vendor-split `framer-motion`/`gsap` out of the initial chunk) — reduces `unused-javascript` (~73 KB) and shortens JS parse/bootstrap time site-wide, benefiting more than just the hero. Higher effort (touches build config, may affect other pages/sections), and does not fully eliminate the animation-gating mechanism by itself — likely needs to be paired with option 1 for LCP to actually clear 2.5s.
3. **Relax the target to a desktop Lighthouse preset** — changes the spec's stated threshold rather than the implementation; the original spec explicitly calls for *mobile* emulation (`design.md` and both web-performance scenarios), so this would be a spec change, not a fix, and reduces the honesty of the score relative to real mobile users. Not recommended unless the business decides mobile Lighthouse parity isn't a priority.
4. **Accept current scores and file a follow-up change** — matches what `tasks.md` 5.4 already did (filed as a follow-up recommendation, not a new task in this change). Keeps `lighthouse-optimization` shippable for its actual scope (a11y/SEO/BP all hit 100, snapshot+hero+SEO+landmark work is solid) while treating Performance/LCP as a distinct, correctly-scoped follow-up change.

**Recommended path**: option 4 (accept + follow-up) combined with option 1 as the first task of that follow-up change, since it is the smallest, most direct fix for the diagnosed root cause and doesn't require reopening this change's design scope. Option 2 can be a second task in the same follow-up if option 1 alone doesn't clear the 2.5s/95 thresholds.

### Verdict
**FAIL**

19/21 scenarios compliant (a11y=100, BP=100, SEO=100, snapshot seeding, hero optimization, SEO metadata, and `<main>` landmark all independently reproduced and verified), but 2 of the 5 web-performance requirement scenarios fail against explicit numeric thresholds in the spec (Performance ≥95, actual 85; LCP <2.5s, actual 3.8s) — these are CRITICAL by the skill's own decision gate ("Spec scenario has no passing covering test → CRITICAL FAILING"), and the design explicitly scoped their root cause (animation-gated hero paint) out of this change. Recommend **do not archive as fully complete**; either (a) accept as `PASS WITH WARNINGS` for a scope-narrowed version of this change (a11y+SEO+snapshot+hero-delivery, explicitly excluding the Performance/LCP category from this change's success criteria) with a mandatory follow-up change for Performance/LCP, or (b) route back to `sdd-apply` to implement fix option 1 (defer hero mount animation) before archiving. The TDD evidence gap for Slices 1-4 (CRITICAL #3) is a documentation completeness issue for the orchestrator to resolve — re-running full verification is not needed for it, but the gap should not be silently archived over.
