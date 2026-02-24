"""
build_template.py
-----------------
Regenerates prs-azure/templates/app.html from the canonical
index-mono.html source file.

Run this whenever index-mono.html is updated, then redeploy the
prs-azure/ folder to Azure App Service.

Usage:
    python3 build_template.py

    # Or specify custom paths:
    python3 build_template.py --src path/to/index-mono.html --out prs-azure/templates/app.html
"""

import re
import sys
import os
import argparse

DEFAULT_SRC = os.path.join(os.path.dirname(__file__), "..", "index-mono.html")
DEFAULT_OUT = os.path.join(os.path.dirname(__file__), "prs-azure", "templates", "app.html")


def build(src_path: str, out_path: str) -> None:
    print(f"Reading source : {src_path}")
    with open(src_path, encoding="utf-8") as f:
        mono = f.read()

    # ── Extract CSS ──────────────────────────────────────────────────────────
    style_start = mono.find("<style>") + 7
    style_end   = mono.find("</style>")
    if style_start < 7 or style_end < 0:
        raise ValueError("Could not find <style>...</style> block in source file.")
    css = mono[style_start:style_end]

    # ── Extract JS ───────────────────────────────────────────────────────────
    js_start = mono.rfind("<script>") + 8
    js_end   = mono.rfind("</script>")
    if js_start < 8 or js_end < 0:
        raise ValueError("Could not find <script>...</script> block in source file.")
    js = mono[js_start:js_end]

    # ── Extract body ─────────────────────────────────────────────────────────
    body_start = mono.find("<body>") + 6
    body_end   = mono.rfind("</body>")
    if body_start < 6 or body_end < 0:
        raise ValueError("Could not find <body>...</body> block in source file.")
    raw_body = mono[body_start:body_end]

    # Strip any inline <script> block that leaked into the body
    body = re.sub(
        r"\n<script>\n  const MOA_OPTIONS.*?</script>\n",
        "",
        raw_body,
        count=1,
        flags=re.DOTALL,
    )

    # ── Build template ───────────────────────────────────────────────────────
    lines = [
        "<!DOCTYPE html>",
        '<html lang="en" data-theme="amber">',
        "<head>",
        '<meta charset="UTF-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '<meta name="robots" content="noindex, nofollow, noarchive">',
        "<title>PRS Stage &amp; Match Builder</title>",
        '<link rel="preconnect" href="https://fonts.googleapis.com">',
        '<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono'
        '&family=Barlow+Condensed:wght@400;600;700;900&display=swap" rel="stylesheet">',
        "<style>",
        css,
        "</style>",
        "</head>",
        body,
        "<script>",
        js,
        "</script>",
        "</body>",
        "</html>",
        "",
    ]
    template = "\n".join(lines)

    # ── Validate ─────────────────────────────────────────────────────────────
    required = [
        "speedDropPanel",
        "getSpeedDrop",
        "renderStage",
        "hold-cell",
        "eqList",
        "dryFireView",
        "gen-btn-wrap",
        "flex-wrap: wrap",   # mobile header fix
    ]
    missing = [r for r in required if r not in template]
    if missing:
        raise RuntimeError(f"Template validation failed — missing: {missing}")

    if 'src="js/' in template or 'href="css/' in template:
        raise RuntimeError("Template contains external static asset references — check source file.")

    # ── Write ─────────────────────────────────────────────────────────────────
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(template)

    size_kb = len(template) / 1024
    lines_n = template.count("\n")
    print(f"Written        : {out_path}")
    print(f"Size           : {size_kb:.1f} KB  ({lines_n:,} lines)")
    print(f"Validation     : {len(required)}/{len(required)} checks passed")
    print("Done.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build Azure template from index-mono.html")
    parser.add_argument("--src", default=DEFAULT_SRC, help="Path to index-mono.html")
    parser.add_argument("--out", default=DEFAULT_OUT, help="Output path for app.html")
    args = parser.parse_args()

    if not os.path.exists(args.src):
        print(f"Error: source file not found: {args.src}", file=sys.stderr)
        sys.exit(1)

    build(args.src, args.out)
