# Instructions for AI agents working on this repository

This is a **static HTML site deployed straight to production** by GitHub Pages from `main`.
There is no build step, no framework and no staging environment. A commit is a deploy.

## Before you change anything

Read the actual file. Do not infer structure from a screenshot or from another page — the
homepage and `/start-a-project/` carry inline CSS, while service pages and blog posts use
`/assets/service.css`. Read `README.md` for the layout and the conventions.

Strategy, positioning, verified company facts and SEO history live in `../docs/` (the Master
Context document), outside this repository. Consult it before touching copy, claims, service
descriptions or anything trust-related.

## Rules

1. **Preserve the visual system.** Dark icy palette, Space Grotesk headings, Inter body, the
   falling-snow hero canvas. Do not redesign unless redesign is the task.
2. **One Organization entity.** The block between `<!-- ICEWIND:ORGANIZATION-SCHEMA:START -->`
   and `:END` is identical on every page. Edit it everywhere at once, never in one place.
3. **Do not change verified facts** — company number 15925349, ICO ZB838524, the Kensington
   address, insurer, cover amount or period, external profile URLs — without an explicit
   instruction from the owner.
4. **Never mark a commercial page `noindex`.** If a page is in `sitemap.xml` it must be
   indexable, canonical to itself, and reachable by internal links.
5. **A URL change is never one edit.** It requires the redirect stub, canonical, `sitemap.xml`,
   internal links, `og:url` and JSON-LD `url` in the same commit.
6. **New page checklist:** unique title and description, one `<h1>`, canonical, full
   `og:`/`twitter:` set, appropriate JSON-LD, footer and internal links, `sitemap.xml` entry
   with `lastmod`, mobile and keyboard check.
7. **No unverifiable claims.** No awards, certifications, client names or review counts that
   cannot be checked on a public register or a live profile.
8. **Report precisely.** List the exact files changed and what changed in each.

## Content voice

British English. Direct, concrete, no marketing inflation. Answer the client's question first,
then explain. Prices and timelines only where they are real. Articles carry a named author
(`Maksim Ilin, Technical Lead`) and `Article` + `FAQPage` JSON-LD.
