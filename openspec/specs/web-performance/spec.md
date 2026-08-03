# web-performance

**Status**: ACCEPTED EXCEPTION — CSR architectural ceiling prevents meeting the Performance ≥95 and LCP <2.5s scenarios. The remaining scenarios (build-time snapshot, hero image optimization, tests) are fully met. See the section "Accepted Exception Details" below.

## ADDED Requirements

### Requirement: Production Lighthouse performance score
The production build, measured with Lighthouse (mobile emulation) against `yarn build && yarn preview` (never `yarn dev`), SHALL score Performance ≥ 95.

#### Scenario: Lighthouse run against production preview
- **GIVEN** the project has been built with `yarn build` and served with `yarn preview`
- **WHEN** Lighthouse (mobile) is run against the preview URL
- **THEN** the reported Performance category score is ≥ 95

**Note (Accepted Exception)**: Measured Performance score is 85, below the 95 threshold. Root cause: the hero image `<picture>` element is wrapped in a `framer-motion` mount animation (`motion.div` with `initial={{opacity:0, scale:0.9}}`), which gates rendering behind JavaScript bootstrap and animation sequencing. This is a consequence of the design's explicit scope boundary ("no framework migration, component tree and animations unchanged"). See "Accepted Exception Details" section.

#### Scenario: Dev server is never used as the measurement target
- **GIVEN** a Lighthouse audit is being prepared
- **WHEN** the target URL is selected
- **THEN** the target MUST be the `yarn preview` server output, and the `yarn dev` server MUST NOT be used to produce or validate a score

### Requirement: Largest Contentful Paint budget
The home page's Largest Contentful Paint (LCP), measured against the production preview, SHALL be well under 2.5s (down from the measured 11.0s baseline).

#### Scenario: LCP measured on production preview
- **GIVEN** the production preview is running and Strapi is reachable
- **WHEN** Lighthouse measures the home page
- **THEN** LCP is reported as less than 2.5s

**Note (Accepted Exception)**: Measured LCP is ~3.8s, above the 2.5s threshold. This is the same animation-gated-paint mechanism noted in the Performance scenario above. See "Accepted Exception Details" section.

### Requirement: Home page renders from a build-time content snapshot
The home page SHALL paint immediately from a build-time snapshot of site content instead of waiting for a client-side `Promise.all` across all CMS endpoints to resolve, for both the `es` and `en` locales.

#### Scenario: Initial paint uses build-time snapshot, no blank render
- **GIVEN** a production build has been produced with the content snapshot step
- **WHEN** the home page is loaded (either locale) against the production preview
- **THEN** the hero section and page content are visible in the initial render, with no intermediate blank/`null` page state while content is fetched

#### Scenario: Both locales snapshot independently
- **GIVEN** the build-time snapshot step has run
- **WHEN** the site is loaded with `es` selected and separately with `en` selected
- **THEN** each locale paints from its own pre-fetched snapshot; neither locale blocks on or falls back to the other's data

#### Scenario: Background refetch keeps content fresh
- **GIVEN** the home page has painted from the build-time snapshot
- **WHEN** the client-side content fetch completes in the background
- **THEN** the page content is updated (hydrated) with the live fetched data if it differs from the snapshot, without a full-page reload or visible flash of missing content

#### Scenario: Snapshot refresh failure does not silently ship stale/broken content
- **GIVEN** the Strapi backend is unreachable when the snapshot refresh step (`yarn snapshot`) runs
- **WHEN** the refresh attempts to fetch content for a locale
- **THEN** the step logs a loud warning and the build reuses the last committed snapshot unchanged; it exits non-zero only when no committed snapshot exists, so an empty or corrupt snapshot is never shipped silently

### Requirement: Hero image is optimized for LCP
The hero image SHALL be delivered as a compressed, correctly-sized asset with a modern format, discoverable in the initial HTML, and sized to avoid layout shift.

#### Scenario: Hero image is compressed and served in WebP with fallback
- **GIVEN** the production build
- **WHEN** the hero image is requested by the browser
- **THEN** a WebP variant is served to browsers that support it, with a PNG/JPEG `<picture>` fallback for browsers that do not, and the delivered payload is substantially smaller than the original 1.6 MB source

#### Scenario: Hero image has explicit dimensions
- **GIVEN** the rendered home page
- **WHEN** the hero `<img>` element is inspected
- **THEN** it declares explicit `width` and `height` attributes matching its intrinsic aspect ratio

#### Scenario: Hero image is prioritized for early discovery and paint
- **GIVEN** the production `index.html`
- **WHEN** the document is parsed by the browser
- **THEN** a `<link rel="preload" as="image">` for the hero image is present in the initial HTML, and the hero `<img>` uses `fetchpriority="high"`

#### Scenario: Hero image payload reduction is measurable
- **GIVEN** the Lighthouse image-delivery audit run against the production preview
- **WHEN** the audit evaluates the hero image
- **THEN** the reported potential savings for hero image delivery is near zero (down from the ~1,456 KiB baseline finding)

### Requirement: Automated tests stay green
The existing automated test suite SHALL continue to pass after all performance changes are applied.

#### Scenario: Test suite passes after changes
- **GIVEN** all web-performance changes have been implemented
- **WHEN** `yarn test` is run
- **THEN** all tests pass (no fewer than the pre-change count) and `yarn build` completes successfully

## Accepted Exception Details

### Two Scenarios Not Met
1. **Lighthouse Performance Score**: measured 85 (required ≥95)
2. **LCP Budget**: measured ~3.8s (required <2.5s)

### Root Cause
The hero image `<picture>` element is wrapped in a `framer-motion` mount animation that gates rendering behind JavaScript parsing, compilation, and animation sequencing. This is the `elementRenderDelay` mechanism identified in the design phase and explicitly preserved in scope ("no framework migration, component tree and animations unchanged").

### Why Accepted
The user approved this exception after observing the measurement results. The architecture ceiling for CSR (Client-Side Rendering) without framework migration or animation deferral prevents reaching these thresholds within the current design scope. The remaining capabilities (snapshot seeding, hero delivery, SEO metadata, accessibility landmark, all supporting tests) are fully met and provide measurable value.

### Parked Follow-up
Amendment 1 (build-time prerendering via `react-dom/server` SSR) was approved in the design phase but not shipped in this change, as prerendering alone does not overcome the animation-gating mechanism. The follow-up change should consider:
- Deferring the hero mount animation (smallest fix, most targeted)
- Code-splitting the JS bundle to reduce `elementRenderDelay`
- Combination of both for greater impact

See the verify-report's "Recommendation for the Performance/LCP gap" section for detailed options and tradeoffs.
