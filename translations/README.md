# Site translations (ru, es, uk)

English HTML in the repository root is the only source. Every published page also
exists as static, indexable HTML under `/ru/`, `/es/` and `/uk/` (Ukrainian uses the
ISO code `uk`; the switcher shows it as `ua`). Each language version has its own
canonical URL, `og:url`, `og:locale`, `<html lang>` and translated title, meta
description, social tags and JSON-LD text. All four versions carry the same
`hreflang` block (en, ru, es, uk, x-default → English), and `sitemap.xml` lists all
of them with `xhtml:link` alternates.

**Do not edit anything under `/ru/`, `/es/` or `/uk/` by hand.** Those folders are
generated. Edit the English page, add or change the strings in `messages.json`, then run:

```sh
python3 scripts/build_i18n.py
```

The build:

1. collects every translatable string from all published English pages
   (`scripts/i18n_site.py`: text between tags, `alt`/`aria-label`/`title`/`placeholder`,
   title and description meta tags, JSON-LD text except the Organization block) and
   stops if any string lacks a ru, es or uk translation, or a translation contains "—";
2. writes the translated pages, rewriting internal links to the same language;
3. inserts the `ICEWIND:HREFLANG` block into English and translated pages;
4. writes `assets/i18n/{ru,es,uk}.json`, a small runtime dictionary for text that
   scripts insert later (form messages, cookie banner, menu labels);
5. regenerates `sitemap.xml`.

Then run both validators (`node scripts/validate-domain-migration.mjs`,
`node scripts/validate-structured-data.mjs`).

`messages.json` is keyed by the whitespace-normalised English string. Text split by a
link or bold is translated per fragment, so fragments around a link must read correctly
together in each language. Translations must never use the em dash.

Behaviour in the browser (`assets/i18n-init.js`, `assets/i18n.js`): the page language
comes from the URL. On an English page, a visitor whose saved choice or browser language
is ru, es or uk is sent once to the same page in that language; choosing a language in
the switcher saves it. Visiting a translated page remembers that language if none is
saved yet. Retired stubs (`/project/`, `/book-online/`, `/websites-for-small-shops/`)
are never translated.

Forms on translated pages post with the English `_next` return URL, because the enquiry
Worker validates English paths; the English thank-you URL then sends the visitor back to
their language. The Zoho CRM copy records the form's English page and a `Language:` line.
`proxy/worker.js` already understands `/ru/`, `/es/`, `/uk/` paths (tested in
`proxy/tests/enquiry.mjs`), so return URLs can be localised once that Worker version is deployed.

Russian and Ukrainian headings use Manrope's Cyrillic glyphs under the Space Grotesk
family name (see `assets/i18n.css`), because Space Grotesk has no Cyrillic.
