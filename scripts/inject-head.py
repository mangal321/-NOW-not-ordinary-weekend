#!/usr/bin/env python3
"""Inject brand metadata (title, description, OG/Twitter previews, PWA manifest,
theme color) into the exported web shell. Idempotent — safe to run after every
`expo export`. Wired into `npm run export:web`."""

import pathlib
import re

DIST = pathlib.Path(__file__).resolve().parent.parent / "dist" / "index.html"

BLOCK = """    <title>NOW — Not Ordinary Weekend</title>
    <meta name="description" content="Turn a free weekend into a story worth retelling. AI-planned itineraries, effortless budgeting, and safety built in." />
    <meta name="theme-color" content="#FAF7F1" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="NOW" />
    <meta property="og:title" content="NOW — Not Ordinary Weekend" />
    <meta property="og:description" content="AI-planned weekend escapes with budgeting and safety built in. Tell NOW your vibe — get a 48-hour plan in seconds." />
    <meta property="og:image" content="/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="NOW — Not Ordinary Weekend" />
    <meta name="twitter:description" content="AI-planned weekend escapes with budgeting and safety built in." />
    <meta name="twitter:image" content="/og.png" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
    <link rel="manifest" href="/manifest.webmanifest" />"""


def main() -> None:
    if not DIST.exists():
        raise SystemExit("dist/index.html not found — run `expo export --platform web` first.")
    html = DIST.read_text()
    if "og:title" in html:
        print("Head metadata already present — skipping injection.")
        return
    if "</title>" in html:
        html = re.sub(r"<title>.*?</title>", BLOCK, html, count=1, flags=re.DOTALL)
    else:
        html = html.replace("<head>", "<head>\n" + BLOCK, 1)
    DIST.write_text(html)
    print("Injected brand metadata into dist/index.html.")


if __name__ == "__main__":
    main()
