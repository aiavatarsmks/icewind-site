# Selected page translations

English remains in the HTML and is the source language. `messages.json` contains
Russian (`ru`), Spanish (`es`) and Ukrainian (`uk`) text, keyed by the normalized
English text node or attribute value. Edit translations there, then run:

```sh
python3 scripts/build_i18n.py
```

The build script uses Python's `lxml` package for the HTML inventory. The
generated JSON files are committed and require no Python at runtime.

The command checks that every string on the selected pages has all three
translations and writes the static dictionaries in `assets/i18n/`. If an English
source string changes, add its new key to `messages.json`. The inventory comes
from `scripts/i18n_inventory.py`; it includes the seven selected main pages,
every published `/work/*/index.html` case study and shared interface strings.

`assets/i18n-init.js` selects a saved manual choice first, then the browser's
preferred languages. `assets/i18n.js` translates the current page and saves a
manual change in local storage. The visible Ukrainian option is `ua`, while its
language code and `<html lang>` value are `uk`. Other pages retain their English
HTML. The English canonical URLs, metadata and sitemap structure stay in place.

The audit page's English source promises a **plain-English** findings list.
Translations state that the findings are written in English; changing the
delivery language would require a separate service decision.
