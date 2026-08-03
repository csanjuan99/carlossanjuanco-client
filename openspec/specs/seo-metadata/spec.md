# seo-metadata

## ADDED Requirements

### Requirement: Production Lighthouse SEO score
The production build, measured with Lighthouse against `yarn preview`, SHALL score SEO 100.

#### Scenario: Lighthouse SEO audit passes fully
- **GIVEN** the production preview is running
- **WHEN** Lighthouse (mobile) audits the home page
- **THEN** the reported SEO category score is 100

### Requirement: Meta description present
`index.html` SHALL declare a non-empty `<meta name="description">` tag describing the site.

#### Scenario: Meta description audit passes
- **GIVEN** the production `index.html`
- **WHEN** the Lighthouse `meta-description` audit runs
- **THEN** the audit passes because a non-empty `<meta name="description">` tag is present

### Requirement: Canonical and Open Graph tags present
`index.html` SHALL declare a canonical `<link>` tag and basic Open Graph (`og:*`) meta tags describing the page, along with a real, non-placeholder `<title>`.

#### Scenario: Canonical and OG tags are present in production HTML
- **GIVEN** the production `index.html`
- **WHEN** the document head is inspected
- **THEN** a `<link rel="canonical">` tag pointing to the site's URL is present, along with `og:title`, `og:description`, and `og:type` (or equivalent minimum OG set), and the `<title>` element contains real site content (not the placeholder "Portfolio")

### Requirement: Valid robots.txt
The production build SHALL serve a valid `robots.txt` at `/robots.txt`, distinct from the SPA's `index.html` fallback.

#### Scenario: robots.txt audit passes
- **GIVEN** the production preview server
- **WHEN** `/robots.txt` is requested
- **THEN** the response is a valid robots.txt document (not the `index.html` SPA fallback) containing at minimum a `User-agent: *` directive and a `Sitemap:` directive, and the Lighthouse `robots-txt` audit passes with zero errors

### Requirement: Automated tests stay green
The existing automated test suite SHALL continue to pass after all SEO metadata changes are applied.

#### Scenario: Test suite passes after changes
- **GIVEN** all seo-metadata changes have been implemented
- **WHEN** `yarn test` is run
- **THEN** all tests pass and `yarn build` completes successfully
