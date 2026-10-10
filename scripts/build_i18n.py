#!/usr/bin/env python3
"""Validate the translation source and write static dictionaries for the site."""
import json
from pathlib import Path

from i18n_inventory import inventory

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'translations' / 'messages.json'
OUTPUT = ROOT / 'assets' / 'i18n'
LANGUAGES = ('ru', 'es', 'uk')


def main():
    messages = json.loads(SOURCE.read_text())
    needed = inventory()
    missing = sorted(set(needed) - set(messages))
    if missing:
        raise SystemExit('Missing translations: ' + repr(missing))
    invalid = [key for key, value in messages.items()
               if not isinstance(value, dict) or
               any(not isinstance(value.get(lang), str) or not value[lang].strip()
                   for lang in LANGUAGES)]
    if invalid:
        raise SystemExit('Incomplete translation entries: ' + repr(invalid))
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for lang in LANGUAGES:
        values = {key: value[lang] for key, value in messages.items()}
        (OUTPUT / f'{lang}.json').write_text(json.dumps(values, ensure_ascii=False, separators=(',', ':')) + '\n')
        print(f'{lang}: {len(values)} strings')


if __name__ == '__main__':
    main()
