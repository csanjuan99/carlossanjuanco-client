# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three primary audiences, all evaluating Carlos Sanjuan as a senior fullstack engineer:

- **Hiring managers and CTOs** — assessing depth, judgment, and fit for a senior role. Success is a direct email or a booked conversation.
- **Agencies and prospective clients** — scoping contract or project work. Success is a project inquiry.
- **Recruiters screening fast** — skimming in under a minute for stack, seniority, and availability. Success is that they leave with the right facts and pass the profile on.

All three arrive cold, usually from a link (LinkedIn, GitHub, a job application), on desktop or mobile, and decide quickly.

## Product Purpose

A single-page personal portfolio for Carlos Sanjuan that converts a cold visitor into a conversation. It presents ten years of fullstack work — projects, stack, experience, testimonials — and routes every audience to one action: contacting him at hello@carlossanjuan.co.

## Positioning

The site itself is the work sample. The claim is craft: architecture through interface detail, evidenced by the site's own build quality (measured Lighthouse scores, bilingual content pipeline, hand-built motion) rather than asserted in copy.

## Operating Context

- Single-page site, no router. Visitors scroll top to bottom through a fixed section sequence: hero → manifesto → stack → obras (projects) → frieze (experience timeline) → testimonials → contact → footer.
- Content is authored in Strapi (two locales) and pulled into a committed build-time snapshot (`src/shared/content/snapshot/{es,en}.json`) so first paint does not wait on the CMS.
- Visitors reach the site from external profiles and applications; there is no onboarding, no auth, no return-visit flow.

## Capabilities and Constraints

- React 19 + TypeScript + Vite 8 + Tailwind 3, React Compiler enabled. Motion via framer-motion and GSAP. Vitest for tests.
- Bilingual Spanish/English, both first-class, switched client-side (`LanguageToggle`). Default document language is `es`.
- Content model is fixed by Strapi types (`src/shared/api/content.types.ts`): hero, manifesto, section headings, contact, site settings, plus collections for projects, experiences, testimonials, and stack groups. New content shapes require a CMS change, not just a component change.
- Build-time snapshot (`yarn snapshot` / `prebuild`) is the content source at runtime; when Strapi is unreachable the build reuses the last committed snapshot.
- Undecided: whether the site keeps a single page or gains project detail pages.

## Brand Commitments

- Name and contact are fixed: Carlos Sanjuan, hello@carlossanjuan.co, carlossanjuan.co.
- Positioning line "Senior FullStack Engineer" is established across title, meta, and hero eyebrow.
- The incumbent Renaissance-fresco / museum concept (vault, *salas*, *obras*, roman numerals, `hero-creacion.webp`) is the current visual world but was **not** declared binding — it is evidence, open to being preserved or replaced by a future visual decision.

## Evidence on Hand

- Real: the codebase, the measured Lighthouse work (`scripts/measure.sh`, `scripts/assert-lighthouse-thresholds.mjs`), the hero illustration (`public/hero-creacion.webp` / `.png`), domain and email.
- **Pending, must not be fabricated:** all portfolio content is still placeholder in the CMS snapshot — name fields read "TU NOMBRE", GitHub and LinkedIn URLs are `your-username`, the manifesto bio is a stub, and projects, experiences, and testimonials are samples. Real projects, real experience, and real testimonials exist to be authored but have not been loaded into Strapi yet. No claim, client name, metric, or quote may be invented to fill them.

## Product Principles

1. **Route to contact.** Every section ends up serving one action; nothing competes with the email.
2. **Fast facts first.** A recruiter with 60 seconds must leave with stack, seniority, and availability without scrolling to the end.
3. **The build is the proof.** Craft claims are backed by the site's own measured quality, never by adjectives.
4. **Never invent evidence.** Placeholder content stays visibly placeholder until real content arrives.
5. **Both languages, equal weight.** Spanish and English are the same product, not a translation afterthought.

## Accessibility & Inclusion

Top Lighthouse scores across performance, accessibility, best practices, and SEO are a standing requirement, enforced by `scripts/assert-lighthouse-thresholds.mjs`. Motion respects `prefers-reduced-motion` (`use-prefers-reduced-motion`).
