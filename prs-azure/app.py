"""
PRS & NRL Hunter Stage Builder — Azure App Service entry point
Flask application that serves the entire frontend as a single
server-rendered response. No static asset endpoints are exposed,
so the CSS and JavaScript source cannot be fetched as standalone files.

Author : Charles Witherspoon / @dubs_does
Version: v1.5.0
"""

import os
import secrets
from flask import Flask, render_template, abort, request, make_response

app = Flask(__name__)

# ── Security ─────────────────────────────────────────────────────────────────
# Optional: set BASIC_AUTH_PASSWORD in Azure App Service → Configuration →
# Application Settings to enable password protection.
BASIC_AUTH_USER     = os.environ.get("BASIC_AUTH_USER",     "")
BASIC_AUTH_PASSWORD = os.environ.get("BASIC_AUTH_PASSWORD", "")
REQUIRE_AUTH        = bool(BASIC_AUTH_PASSWORD)

def _check_auth(auth) -> bool:
    if not auth:
        return False
    return (
        secrets.compare_digest(auth.username, BASIC_AUTH_USER) and
        secrets.compare_digest(auth.password, BASIC_AUTH_PASSWORD)
    )

def _auth_required():
    response = make_response(
        "Authentication required.", 401
    )
    response.headers["WWW-Authenticate"] = 'Basic realm="PRS Stage Builder"'
    return response


@app.before_request
def enforce_auth():
    """Gate every request behind HTTP Basic Auth when configured."""
    if REQUIRE_AUTH and not _check_auth(request.authorization):
        return _auth_required()


@app.after_request
def add_security_headers(response):
    """
    Attach security headers to every response.
    - noindex/nofollow  : search engines won't index or cache the app
    - X-Frame-Options   : prevents the page being embedded in iframes
    - nosniff           : stops MIME-type sniffing
    - no-referrer       : suppresses referrer header on outbound links
    - no-store cache    : prevents the browser caching the page source
    """
    response.headers["X-Robots-Tag"]          = "noindex, nofollow, noarchive, nosnippet"
    response.headers["X-Frame-Options"]        = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"]        = "no-referrer"
    response.headers["Cache-Control"]          = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"]                 = "no-cache"
    return response


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    """
    Render the complete application HTML.
    All CSS and JavaScript are inlined — no separate /static/ endpoints exist.
    """
    return render_template("app.html")


@app.route("/health")
def health():
    """Azure App Service health-check endpoint."""
    return {"status": "ok", "version": "1.5.0"}, 200


@app.route("/<path:unknown>")
def catch_all(unknown):
    """Return 404 for every unrecognised path — no directory listing."""
    abort(404)


# ── Local development ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)
