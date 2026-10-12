#!/usr/bin/env python3
"""Static multilingual build for the ICE WIND site.

English HTML in the repository root is the source. For every published page this
module writes translated copies to /ru/, /es/ and /uk/ (Ukrainian, ISO code uk),
so search engines see real, indexable pages with their own canonical URLs and
hreflang alternates. Translations live in translations/messages.json, keyed by
the normalised English text node, attribute value or JSON-LD string.

The rewriter works on the original bytes: only text between tags, selected
attribute values and non-organisation JSON-LD blocks are changed, so markup,
inline CSS and scripts stay exactly as authored.
"""
import html
import json
import re
from collections import OrderedDict, defaultdict
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://icewind.uk'
LANGUAGES = ('ru', 'es', 'uk')
OG_LOCALE = {'en': 'en_GB', 'ru': 'ru_RU', 'es': 'es_ES', 'uk': 'uk_UA'}
# Retired URLs are redirect stubs (AGENTS.md rule 6); they are never translated.
STUBS = {'/book-online/', '/project/', '/websites-for-small-shops/'}
SKIP_DIRS = {'.git', 'assets', 'node_modules', 'schema', 'scripts', 'translations', *LANGUAGES}

TEXT_ATTRS = ('alt', 'aria-label', 'title', 'placeholder')
META_TEXT = {'description', 'og:title', 'og:description', 'og:image:alt',
             'twitter:title', 'twitter:description', 'twitter:image:alt'}
JSONLD_TEXT = {'name', 'headline', 'alternativeHeadline', 'description', 'text',
               'serviceType', 'caption', 'articleSection', 'abstract'}
# Strings that scripts insert at runtime; they are translated by assets/i18n.js.
SCRIPT_STRINGS = [
    'Get in touch:', 'Email hello@icewind.uk', 'Call ICE WIND at +44 7782 222054',
    'Open menu', 'Close menu', 'Company', 'Trust & Compliance',
    'Web Design', 'Website Redesign', 'SEO', 'AI Search Optimisation',
    'Web App Development', 'Game Development', 'AI Automation',
    'Request an audit', 'Contact', 'London, England',
    'Thank you — your request has been sent. We will reply within one business day.',
    'Thank you — your enquiry has been sent. We will reply within one business day.',
    'Thank you, your enquiry has been sent. We will reply within one business day.',
    'Please enter your name.', 'Please enter your preferred contact details.',
    'Please choose the type of project you would like to build.',
    'Please describe your project.', 'Please choose which kind of audit you need.',
    'Please tell us what you would like to understand.',
    'Please enter the address of the site you would like us to audit.',
    'Please tell us how to reply.', 'Please tell us what your enquiry is about.',
    'Please review the highlighted fields and try again.', 'Sending request…', 'Sending…',
    'Cookie consent', 'We value your privacy',
    'We’d like to use analytics cookies (Google Analytics and Microsoft Clarity) to understand how visitors use the site and improve it. These are optional. See our',
    'Cookie Policy', 'Accept analytics', 'Reject', 'Website language',
    'Appearance', 'Switch to dark theme', 'Switch to light theme',
]

TOKEN = re.compile(
    r'<!--.*?-->'
    r'|<(script|style|noscript|svg|code|pre|textarea)\b[^>]*>.*?</\1\s*>'
    r'|<[^>]+>', re.S | re.I)
ATTR = re.compile(r'(\s)([A-Za-z_:][-\w:.]*)(\s*=\s*)("([^"]*)"|\'([^\']*)\')')
ORG = re.compile(r'<!-- ICEWIND:ORGANIZATION-SCHEMA:START -->.*?<!-- ICEWIND:ORGANIZATION-SCHEMA:END -->', re.S)
HREFLANG = re.compile(r'\n?[ \t]*<!-- ICEWIND:HREFLANG:START -->.*?<!-- ICEWIND:HREFLANG:END -->', re.S)
JSONLD = re.compile(r'(<script\s+type=["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)', re.S | re.I)


def normalise(value):
    return ' '.join(str(value).split())


def has_letters(value):
    return any(char.isalpha() for char in value)


def page_urls():
    """URL paths of every English source page that gets translated."""
    found = []
    for file in sorted(ROOT.rglob('index.html')):
        parts = file.relative_to(ROOT).parts
        if parts[0] in SKIP_DIRS:
            continue
        url = '/' + '/'.join(parts[:-1]) + ('/' if len(parts) > 1 else '')
        if url not in STUBS:
            found.append(url)
    return found


def source_file(url):
    return ROOT / url.strip('/') / 'index.html' if url != '/' else ROOT / 'index.html'


def target_file(url, lang):
    return ROOT / lang / url.strip('/') / 'index.html' if url != '/' else ROOT / lang / 'index.html'


def localised(url, lang):
    return url if lang == 'en' else f'/{lang}{url}'


def is_noindex(source):
    match = re.search(r'<meta[^>]+name=["\']robots["\'][^>]*content=["\']([^"\']*)', source, re.I)
    return bool(match and 'noindex' in match.group(1).lower())


class Rewriter:
    """Translate one English page. With dictionary=None it only collects keys."""

    def __init__(self, url, lang, dictionary, pages):
        self.url, self.lang, self.dictionary, self.pages = url, lang, dictionary, pages
        self.missing = set()
        self.keys = OrderedDict()

    # ----- strings -------------------------------------------------------
    def tr(self, value, where='text'):
        key = normalise(value)
        if not key or not has_letters(key):
            return None
        self.keys.setdefault(key, where)
        if self.dictionary is None:
            return None
        result = self.dictionary.get(key)
        if result is None:
            self.missing.add(key)
        return result

    def text(self, raw):
        plain = html.unescape(raw)
        result = self.tr(plain)
        if result is None:
            return raw
        prefix = re.match(r'\s*', raw).group()
        suffix = re.search(r'\s*$', raw).group() if raw.strip() else ''
        return prefix + html.escape(result, quote=False) + suffix

    # ----- urls ----------------------------------------------------------
    def link(self, value):
        if self.lang == 'en':
            return value
        stripped = value.strip()
        if not stripped or stripped.startswith(('#', 'mailto:', 'tel:', 'data:', 'javascript:', '//')):
            return value
        if '#organization' in stripped:
            return value
        absolute = stripped.startswith(ORIGIN + '/') or stripped == ORIGIN
        if re.match(r'^[a-z][a-z0-9+.-]*:', stripped, re.I) and not absolute:
            return value
        path_part = (stripped[len(ORIGIN):] or '/') if absolute else stripped
        if not path_part.startswith('/'):
            path_part = urljoin(self.url, path_part)
        match = re.match(r'^([^?#]*)(.*)$', path_part)
        path, rest = match.group(1), match.group(2)
        if path in self.pages:
            path = localised(path, self.lang)
        return (ORIGIN if absolute else '') + path + rest

    # ----- tags ----------------------------------------------------------
    def tag(self, raw):
        if raw.startswith('</') or raw.startswith('<!'):
            return raw
        name = re.match(r'<\s*([A-Za-z0-9-]+)', raw)
        name = name.group(1).lower() if name else ''
        attrs = {m.group(2).lower(): (m.group(5) if m.group(5) is not None else m.group(6))
                 for m in ATTR.finditer(raw)}
        meta_key = (attrs.get('name') or attrs.get('property') or '').lower() if name == 'meta' else ''

        def replace(match):
            attr = match.group(2).lower()
            quote = '"' if match.group(5) is not None else "'"
            value = match.group(5) if match.group(5) is not None else match.group(6)
            new = value
            if name == 'html' and attr == 'lang':
                new = self.lang
            elif attr in TEXT_ATTRS and name not in ('link', 'meta', 'script'):
                result = self.tr(html.unescape(value), 'attribute')
                if result is not None:
                    new = html.escape(result)
            elif name == 'meta' and attr == 'content' and meta_key in META_TEXT:
                result = self.tr(html.unescape(value), 'meta')
                if result is not None:
                    new = html.escape(result)
            elif name == 'meta' and attr == 'content' and meta_key == 'og:locale':
                new = OG_LOCALE[self.lang]
            elif attr in ('href', 'src', 'action', 'content'):
                # Form return URLs (value=) stay English: the enquiry Worker only accepts
                # English paths, and the English page sends the visitor back to their language.
                if attr == 'content' and not value.startswith(ORIGIN):
                    return match.group(0)
                if attr == 'href' and name == 'link' and attrs.get('rel', '').lower() == 'alternate':
                    return match.group(0)
                new = self.link(value)
            if new == value:
                return match.group(0)
            return f'{match.group(1)}{match.group(2)}{match.group(3)}{quote}{new}{quote}'

        return ATTR.sub(replace, raw)

    # ----- structured data ----------------------------------------------
    def jsonld(self, data):
        if isinstance(data, list):
            return [self.jsonld(item) for item in data]
        if not isinstance(data, dict):
            return data
        out = {}
        for key, value in data.items():
            if key == 'inLanguage' and isinstance(value, str):
                out[key] = self.lang if self.lang != 'en' else value
            elif isinstance(value, str) and key in JSONLD_TEXT:
                result = self.tr(value, 'jsonld')
                out[key] = result if result is not None else value
            elif isinstance(value, str) and (value.startswith(ORIGIN) or (key in ('url', 'item', '@id') and value.startswith('/'))):
                out[key] = self.link(value)
            elif isinstance(value, (dict, list)):
                out[key] = self.jsonld(value)
            else:
                out[key] = value
        return out

    def structured(self, match):
        body = match.group(2)
        try:
            data = json.loads(body)
        except ValueError:
            return match.group(0)
        if isinstance(data, dict) and data.get('@type') == 'Organization':
            return match.group(0)
        translated = self.jsonld(data)
        if self.dictionary is None:
            return match.group(0)
        if translated == data:
            return match.group(0)
        text = json.dumps(translated, ensure_ascii=False, indent=2).replace('</', '<\\/')
        indent = re.match(r'\s*', body).group()
        return match.group(1) + indent + text + '\n  ' + match.group(3)

    # ----- page ----------------------------------------------------------
    def segment(self, chunk):
        """Rewrite a stretch of HTML that contains no organisation schema."""
        out, position = [], 0
        for token in TOKEN.finditer(chunk):
            out.append(self.text(chunk[position:token.start()]))
            raw = token.group(0)
            if raw.startswith('<!--'):
                out.append(raw)
            elif token.group(1):  # script, style, svg ...
                tag_name = token.group(1).lower()
                if tag_name == 'script' and re.match(r'<script\s+type=["\']application/ld\+json', raw, re.I):
                    out.append(JSONLD.sub(self.structured, raw))
                elif tag_name in ('script', 'textarea'):
                    opening = re.match(r'<[^>]+>', raw).group(0)
                    out.append(self.tag(opening) + raw[len(opening):])
                else:
                    out.append(raw)
            else:
                out.append(self.tag(raw))
            position = token.end()
        out.append(self.text(chunk[position:]))
        return ''.join(out)

    def run(self, source):
        source = HREFLANG.sub('', source)
        out, position = [], 0
        for block in ORG.finditer(source):
            out.append(self.segment(source[position:block.start()]))
            out.append(block.group(0))
            position = block.end()
        out.append(self.segment(source[position:]))
        return ''.join(out)


def hreflang_block(url):
    lines = ['<!-- ICEWIND:HREFLANG:START -->']
    for lang in ('en',) + LANGUAGES:
        lines.append(f'  <link rel="alternate" hreflang="{lang}" href="{ORIGIN}{localised(url, lang)}">')
    lines.append(f'  <link rel="alternate" hreflang="x-default" href="{ORIGIN}{url}">')
    lines.append('  <!-- ICEWIND:HREFLANG:END -->')
    return '\n'.join(lines)


def with_hreflang(document, url, noindex):
    document = HREFLANG.sub('', document)
    if noindex:
        return document
    return document.replace('</head>', '  ' + hreflang_block(url) + '\n</head>', 1)


def inventory():
    """Every translatable string on every published page, with where it appears."""
    pages = set(page_urls())
    items = defaultdict(set)
    for value in SCRIPT_STRINGS:
        items[value].add('assets/*.js or form script')
    for url in sorted(pages):
        rewriter = Rewriter(url, 'ru', None, pages)
        rewriter.run(source_file(url).read_text(encoding='utf-8'))
        for key in rewriter.keys:
            items[key].add(url)
    return {key: sorted(value) for key, value in items.items()}


def ordered_keys(url):
    pages = set(page_urls())
    rewriter = Rewriter(url, 'ru', None, pages)
    rewriter.run(source_file(url).read_text(encoding='utf-8'))
    return list(rewriter.keys.items())


def build(messages):
    pages = page_urls()
    page_set = set(pages)
    report = defaultdict(set)
    written = 0
    for url in pages:
        source = source_file(url).read_text(encoding='utf-8')
        noindex = is_noindex(source)
        english = with_hreflang(source, url, noindex)
        if english != source:
            source_file(url).write_text(english, encoding='utf-8')
        for lang in LANGUAGES:
            dictionary = {key: value[lang] for key, value in messages.items() if value.get(lang)}
            rewriter = Rewriter(url, lang, dictionary, page_set)
            document = with_hreflang(rewriter.run(english), url, noindex)
            for key in rewriter.missing:
                report[key].add(f'{lang}:{url}')
            target = target_file(url, lang)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(document, encoding='utf-8')
            written += 1
    return written, report


def sitemap():
    """Regenerate sitemap.xml: every indexable page in all four languages."""
    path = ROOT / 'sitemap.xml'
    current = path.read_text(encoding='utf-8')
    lastmod = {m.group(1): m.group(2) for m in re.finditer(
        r'<loc>https://icewind\.uk(/[^<]*)</loc>\s*(?:<lastmod>([^<]+)</lastmod>)?', current)}
    english_order = [m.group(1) for m in re.finditer(r'<loc>https://icewind\.uk(/[^<]*)</loc>', current)
                     if not re.match(r'^/(ru|es|uk)/', m.group(1))]
    pages = page_urls()
    indexable = [url for url in pages if not is_noindex(source_file(url).read_text(encoding='utf-8'))]
    order = [url for url in english_order if url in indexable] + [url for url in indexable if url not in english_order]
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for url in order:
        for lang in ('en',) + LANGUAGES:
            lines.append('  <url>')
            lines.append(f'    <loc>{ORIGIN}{localised(url, lang)}</loc>')
            if lastmod.get(url):
                lines.append(f'    <lastmod>{lastmod[url]}</lastmod>')
            for alt in ('en',) + LANGUAGES:
                lines.append(f'    <xhtml:link rel="alternate" hreflang="{alt}" href="{ORIGIN}{localised(url, alt)}"/>')
            lines.append(f'    <xhtml:link rel="alternate" hreflang="x-default" href="{ORIGIN}{url}"/>')
            lines.append('  </url>')
    lines.append('</urlset>')
    path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    return len(order) * 4
