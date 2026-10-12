#!/usr/bin/env python3
"""Validate translations, write /ru/ /es/ /uk/ pages, runtime dictionaries and sitemap.xml.

Run from anywhere:  python3 scripts/build_i18n.py
"""
import json

from i18n_site import LANGUAGES, ROOT, SCRIPT_STRINGS, build, inventory, sitemap

SOURCE = ROOT / 'translations' / 'messages.json'
OUTPUT = ROOT / 'assets' / 'i18n'
RUNTIME_MAX_WORDS = 12  # runtime only translates text inserted by scripts


def main():
    messages = json.loads(SOURCE.read_text(encoding='utf-8'))
    needed = inventory()
    missing = sorted(set(needed) - set(messages))
    if missing:
        raise SystemExit(f'Missing translations ({len(missing)}): ' + repr(missing[:20]))
    invalid = [key for key in needed
               if any(not isinstance(messages[key].get(lang), str) or not messages[key][lang].strip()
                      for lang in LANGUAGES)]
    if invalid:
        raise SystemExit('Incomplete translation entries: ' + repr(invalid[:20]))
    dashes = [key for key in needed if any('—' in messages[key][lang] for lang in LANGUAGES)]
    if dashes:
        raise SystemExit('Translations must not contain em dashes: ' + repr(dashes[:20]))

    OUTPUT.mkdir(parents=True, exist_ok=True)
    runtime = [key for key in needed if key in SCRIPT_STRINGS or len(key.split()) <= RUNTIME_MAX_WORDS]
    for lang in LANGUAGES:
        values = {key: messages[key][lang] for key in runtime}
        (OUTPUT / f'{lang}.json').write_text(
            json.dumps(values, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
        print(f'{lang}: {len(values)} runtime strings')

    written, report = build(messages)
    if report:
        raise SystemExit('Untranslated strings while building: ' + repr(sorted(report)[:20]))
    print(f'{written} translated pages written')
    print(f'sitemap.xml: {sitemap()} URLs')


if __name__ == '__main__':
    main()
