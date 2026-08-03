# accessibility-landmarks

## ADDED Requirements

### Requirement: Production Lighthouse accessibility score
The production build, measured with Lighthouse against `yarn preview`, SHALL score Accessibility 100.

#### Scenario: Lighthouse accessibility audit passes fully
- **GIVEN** the production preview is running
- **WHEN** Lighthouse (mobile) audits the home page
- **THEN** the reported Accessibility category score is 100

### Requirement: Home page exposes a single main landmark
The home page's top-level content container SHALL be (or contain) exactly one `<main>` landmark wrapping the primary page content.

#### Scenario: landmark-one-main audit passes
- **GIVEN** the rendered home page (production build)
- **WHEN** the DOM is inspected
- **THEN** exactly one `<main>` element is present wrapping the page's primary sections, and the Lighthouse `landmark-one-main` audit passes

#### Scenario: Existing layout and styling are preserved
- **GIVEN** the home page currently wraps its sections in a styled `<div>`
- **WHEN** the `<main>` landmark is introduced
- **THEN** existing visual layout, background styling, and section order remain unchanged (the landmark change is structural/semantic only)

### Requirement: Automated tests stay green
The existing automated test suite SHALL continue to pass after the accessibility landmark change is applied.

#### Scenario: Test suite passes after changes
- **GIVEN** the accessibility-landmarks change has been implemented
- **WHEN** `yarn test` is run
- **THEN** all tests pass and `yarn build` completes successfully
