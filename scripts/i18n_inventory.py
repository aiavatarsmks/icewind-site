#!/usr/bin/env python3
"""List every translatable English string on the published pages (JSON to stdout)."""
import json

from i18n_site import inventory

if __name__ == '__main__':
    print(json.dumps(inventory(), ensure_ascii=False, indent=2))
