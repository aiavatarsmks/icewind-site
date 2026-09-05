# ICE WIND — website

Public brand **ICE WIND**. Legal entity **ICEWIND DALE CONSULTING LTD**, England & Wales, company no. 15925349.
Live site: <https://icewind.uk/>

Static HTML site, no build step. Every page is a hand-written `index.html`.

## How it is deployed

Railway serves the static files through Caddy using `Dockerfile`, `Caddyfile` and
`railway.json`. Railway builds from the CLI, not from a GitHub connection, so a commit or push
does not deploy production. Production changes require an explicit, approved deployment and a
post-deploy health check. The live domain is `icewind.uk`; path-preserving redirects from the
legacy domains are a separate Netlify project maintained in `../legacy-domain-redirect/`.

Once a change is committed and approved, `scripts/deploy.sh` performs the whole sequence:
it refuses to run on a dirty tree, runs both validators, pushes the branch, calls `railway up`,
waits for `SUCCESS`, checks that `/`, `/sitemap.xml` and `/robots.txt` return 200, and notifies
IndexNow about the pages that changed since the previous deploy. If `HEAD` is already the deployed
commit it runs the health checks and stops rather than rebuilding the same thing. Pass `--all` to
resubmit every canonical URL, `--no-push` to deploy without pushing, `--force` to rebuild an
unchanged commit.

Retired in-site URLs remain instant `meta refresh` stubs
carrying `noindex,follow` and a canonical to their replacement. There are three, and none of them
belongs in `sitemap.xml` or in an internal link:

| Stub | Redirects to |
|---|---|
| `/project/` | `/start-a-project/` |
| `/book-online/` | `/start-a-project/` |
| `/websites-for-small-shops/` | `/small-business-web-design/` |

Do not "fix" any of them into a normal page.

## Layout

32 URLs in `sitemap.xml`. Every page loads `assets/theme.css` and `assets/theme-init.js` (the
persistent light/dark theme) plus `assets/nav.css` and `assets/nav.js`.

```
/                             homepage — inline CSS + falling-snow hero canvas
/start-a-project/             main commercial page: enquiry form (formsubmit.co), trust strip
                              inline CSS

  fourteen service landing pages — one intent each, ~900-1200 words, FAQ block,
  Service + BreadcrumbList + FAQPage JSON-LD, shared /assets/service.css + service.js

/web-design/                  /web-development/         /web-app-development/
/mobile-app-development/      /game-development/        /ai-automation/
/ai-consulting/               /ai-search-optimisation/  /website-redesign/
/seo/                         /local-seo/               /small-business-web-design/
/websites-for-barbershops/    /websites-for-beauty-salons/

/work/                        case index — CollectionPage + ItemList
/work/barsion/                ┐ case studies — CreativeWork + BreadcrumbList JSON-LD,
/work/gamefoundry/            │ shared /assets/case.css on top of service.css,
/work/lamar-academy/          │ "Next case" ring component at the foot of each
/work/canacore/               ┘
/blog/                        index
/blog/<slug>/                 four SEO/GEO guides — Article + FAQPage, Person author
/request-an-audit/            audit funnel entry, inline CSS
/trust/                       company registration, ICO, insurance, Clutch — inline CSS
/privacy/ /cookies/ /terms/   legal pages
/demo/order-quiz/             AI enquiry-quiz demo, noindex,nofollow — calls the Cloudflare
                              Worker in ../proxy/ (quiz-widget.css/js, quiz-config.js)
/project/ /book-online/ /websites-for-small-shops/    redirect stubs, see above

/assets/                      service.css, service.js, nav.css, nav.js, theme.css, theme.js,
                              theme-init.js, case.css, quiz-widget.css, quiz-widget.js,
                              quiz-config.js, analytics.js, clutch-fallback.js,
                              og-cover.jpg (1200x630 social card), ice-wind-logo.png (256x256)
/schema/organization.json     canonical copy of the Organization entity
/scripts/                     inject-organization-schema.mjs, validate-structured-data.mjs,
                              validate-domain-migration.mjs, submit-indexnow.mjs, deploy.sh
robots.txt  sitemap.xml  llms.txt  favicon.svg  logo.svg  404.html
<indexnow key>.txt            IndexNow key, served from the root; public by protocol design
```

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
5. Deploy with `scripts/deploy.sh`, which notifies IndexNow for you. Request indexing in
   Google Search Console by hand — Google has no IndexNow equivalent.

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
