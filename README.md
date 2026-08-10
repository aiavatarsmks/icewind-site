# ICE WIND — website

Public brand **ICE WIND**. Legal entity **ICEWIND DALE CONSULTING LTD**, England & Wales, company no. 15925349.
Live site: <https://www.icewinddaleconsulting.com/>

Static HTML site, no build step. Every page is a hand-written `index.html`.

## How it is deployed

GitHub Pages serves `main` from the repository root. A push to `main` triggers the
"pages build and deployment" action and is live in roughly one minute. `CNAME` holds the
custom domain; HTTPS is enforced in repository settings. There is **no** staging environment —
commits to `main` are production.

Because Pages cannot issue server-side redirects, the retired `/project/` URL is an instant
`meta refresh` stub with `noindex,follow` and a canonical to `/start-a-project/`. Do not
"fix" it into a normal page.

## Layout

```
/                         homepage (index.html) — full inline CSS + falling-snow canvas
/start-a-project/         main commercial page: enquiry form (formsubmit.co), trust strip
/web-design/              ┐
/web-development/         │ five service landing pages, one intent each,
/web-app-development/     │ ~900-1200 words, FAQ block, Service + BreadcrumbList
/game-development/        │ + FAQPage JSON-LD
/ai-automation/           ┘
/blog/<slug>/             SEO/GEO guides (Article + FAQPage JSON-LD, Person author)
/trust/                   company registration, ICO, insurance, Clutch
/privacy/ /cookies/ /terms/   legal pages
/project/                 retired URL, redirect stub only
/assets/                  service.css, service.js, analytics.js, clutch-fallback.js,
                          og-cover.jpg (1200x630 social card), ice-wind-logo.png (256x256)
/schema/organization.json canonical copy of the Organization entity
robots.txt  sitemap.xml  CNAME  favicon.svg  logo.svg
```

Homepage and `/start-a-project/` carry their CSS inline. Service pages and blog posts share
`/assets/service.css` and `/assets/service.js`.

## Conventions that must not drift

**One Organization entity.** Every page carries the identical block between
`<!-- ICEWIND:ORGANIZATION-SCHEMA:START -->` and `:END` markers, `@id` =
`https://www.icewinddaleconsulting.com/#organization`. Change it in one page and copy it to all
of them, or the entity graph splits. `schema/organization.json` mirrors it.

**Every indexable page needs:** unique `<title>` and `<meta name="description">`, one `<h1>`,
`<link rel="canonical">`, the full `og:`/`twitter:` set pointing at `/assets/og-cover.jpg`,
and an entry in `sitemap.xml` with `lastmod`.

**Facts are verifiable or absent.** Company number, ICO number, insurance cover and period,
review counts — all must match Companies House, the ICO register, the policy document and the
live Clutch profile. No invented awards, certifications, clients or ratings. No "certified"
language for what is only a registration.

**Never add** a second Organization entity, a `noindex` on a commercial page, review markup for
reviews that do not exist, or hidden text written for crawlers.

## After any change

1. Confirm the page returns 200 and the canonical points at itself.
2. Update `sitemap.xml` `lastmod` in the same commit as the page.
3. Validate JSON-LD (Rich Results Test / validator.schema.org).
4. Check mobile layout, keyboard focus and the cookie banner.
5. Submit the URL in Google Search Console and Bing Webmaster Tools.

## Where the documentation lives

This repository holds the **code**. Strategy, SEO history and source material live one level up
in the project folder, outside git:

| What | Where |
|---|---|
| Master Context — single source of truth for positioning, SEO, trust, AI-search | `../docs/` |
| Article drafts and the universal article prompt | `../docs/articles/` |
| Price lists and generators | `../docs/pricing/` |
| Logos, Instagram assets | `../brand/` |
| Insurance, ICO and registry PDFs | `../legal/` |
| Competitor analysis, SEO audits | `../research/` |

Read `../docs/` before changing copy, claims or SEO structure. Read `AGENTS.md` in this
repository before changing code.
