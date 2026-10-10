#!/usr/bin/env python3
"""List English UI strings on the selected client-facing pages."""
import json
from collections import defaultdict
from pathlib import Path
from lxml import html

ROOT = Path(__file__).resolve().parents[1]
PAGES = [
    'index.html', 'start-a-project/index.html', 'request-an-audit/index.html',
    'work/index.html', 'contact/index.html', 'trust/index.html',
    'small-business-web-design/index.html',
] + [str(p.relative_to(ROOT)) for p in sorted((ROOT / 'work').glob('*/index.html'))]
ATTRS = ('alt', 'aria-label', 'title', 'placeholder')
SCRIPT_STRINGS = [
    'Get in touch:', 'Email hello@icewind.uk', 'Call ICE WIND at +44 7782 222054',
    'Open menu', 'Close menu', 'Company', 'Trust & Compliance',
    'Web Design', 'Website Redesign', 'SEO', 'AI Search Optimisation',
    'Web App Development', 'Game Development', 'AI Automation',
    'Request an audit', 'Contact', 'London, England',
    'Thank you — your request has been sent. We will reply within one business day.',
    'Thank you — your enquiry has been sent. We will reply within one business day.',
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


def normalise(value):
    return ' '.join(value.split())


def inventory():
    items = defaultdict(set)
    for value in SCRIPT_STRINGS:
        items[value].add('assets/*.js or form script')
    for page in PAGES:
        doc = html.parse(str(ROOT / page))
        title = normalise(doc.xpath('string(//title)'))
        if title:
            items[title].add(page)
        for node in doc.xpath('//body//*[not(ancestor-or-self::script or ancestor-or-self::style or ancestor-or-self::svg or ancestor-or-self::noscript)]/text()'):
            value = normalise(node)
            if value and any(char.isalpha() for char in value):
                items[value].add(page)
        for element in doc.xpath('//body//*[@alt or @aria-label or @title or @placeholder]'):
            if element.tag in ('svg', 'path') or element.getparent() is not None and any(parent.tag == 'svg' for parent in element.iterancestors()):
                continue
            for attr in ATTRS:
                value = normalise(element.get(attr) or '')
                if value and any(char.isalpha() for char in value):
                    items[value].add(page)
    return {key: sorted(value) for key, value in items.items()}


if __name__ == '__main__':
    print(json.dumps(inventory(), ensure_ascii=False, indent=2))
