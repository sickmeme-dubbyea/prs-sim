# PRS & NRL Hunter Stage Builder
### v1.5.0

A web application for designing randomized **Precision Rifle Series (PRS)** and **NRL Hunter** competition stages, match cards, and dry fire training sessions.

Available in two deployment formats:
- **HTML version** — single self-contained file, zero dependencies, works anywhere
- **Python/Flask version** — Azure App Service deployment with source code protection

---

## ☕ Support the Project

**[☕ Buy Charles Witherspoon a Coffee → charleswitherspoon.me](https://charleswitherspoon.me)**

---

## Credits

| Role | Contributor |
|---|---|
| Logic, design direction, domain expertise | Charles Witherspoon ([@dubs_does](https://instagram.com/dubs_does)) |
| Code generation & implementation | [Claude Sonnet 4.6](https://claude.ai) (Anthropic AI) |

---

## Changelog

### v1.5.0
- **Python/Flask deployment** — Azure App Service version; all CSS and JS inlined server-side into a single rendered response with no static asset endpoints, `no-store` cache headers, `noindex` robots meta, `X-Frame-Options: DENY`, and optional HTTP Basic Auth via environment variables
- **`build_template.py`** — regeneration script that extracts CSS/JS/HTML from `index-mono.html` and produces `prs-azure/templates/app.html`; validates 8 structural markers before writing
- **`/health` endpoint** — Azure App Service health check at `/health`

### v1.4.1
- **Layout fixes** — sidebar `height: 100%; box-sizing: border-box`; panels `flex-shrink: 0`; generate button wrapped in `.gen-btn-wrap` with `margin-top: auto`; never clipped
- **Equipment row scaling** — `eq-count` given `width: 44px !important` to override global `input[type="number"]` rule; columns `22px 1fr 44px`
- **File rename** — `index.html` is now the modular refactored shell; `index-mono.html` is the self-contained single file
- **Mobile header** — two-row wrap layout; row 1: reticle + title + view-tabs; row 2: status (SYSTEM READY, version, author, Instagram) on left, theme + help on right; nothing hidden or clipped at any phone width

### v1.4.0
- **Speed Drop** — optional training panel (Single Stage mode only); enter your Speed Drop Factor and every generated stage card shows a HOLD column with `(yards ÷ 100) − SDF` in MIL; MIL-only by mathematical design; negative results display as `—`; hidden and forced off in Match Mode
- **Equipment position counts** — optional `#` field per prop; sets how many times that prop can appear in one stage
- **Custom positions** — add unlimited named positions; removable with `×`
- **Print / PDF export** — `⎙ PRINT / PDF` button; clean `@media print` layout

### v1.3.1
- Dry Fire mode — perspective hillside scene, MOA-scaled targets, sky-zone enforcement, drag and drop, stage import, custom image upload
- Help & Docs modal — full in-app reference

### v1.3.0
- NRL Hunter discipline — 18 animal silhouettes, 3 difficulty tiers
- Mobile / desktop responsive scroll architecture

---

## Features

### ◈ Builder Mode

**Stage Generation**
- Single Stage and Match Mode (up to 20 stages)
- PRS — MOA / MIL angular plate sizes, focus-driven pool selection
- NRL Hunter — 18 animal silhouettes across 3 difficulty tiers (Prairie Dog → Elk)
- Focus system — Balanced, Wind, Elevation, Small Target, Combined
- Round modes — Full (10–12 rds, 105s, 3 pos), Mid Compression (6–8 rds, 75–90s, 2 pos), Low Compression (4–6 rds, 45–60s, 1 pos)
- Custom time limit override

**Speed Drop (Single Stage / Training only)**
Speed Drop is a rapid ballistic estimation method for determining MIL elevation holds. Formula: `(yards ÷ 100) − Speed Drop Factor = elevation hold in MIL`. Example: 528 yd target with SDF 2.8 → `5.28 − 2.8 = 2.48 MIL`.

The method is **MIL-only by design** — the math depends on the 1/100 yd relationship inherent to milliradians and has no MOA equivalent.

When enabled, a HOLD column appears on every stage card. Negative results (very short distances or high SDF) display as `—`. The panel is hidden and forced off when Match Mode is selected.

**Equipment & Positions**
- Six standard props: Barricade, Tripod, Tank Trap, Rooftop, Prone, Modified Prone
- Position count `#` — how many times a prop can be drawn in one stage (default: 1, max: 10)
- Custom positions — unlimited, Enter or `+ ADD` to add, `×` to remove

**Custom Targets Table**
- Lock distance and/or plate size per target slot; AUTO for focus-driven size with fixed distance

**Match Settings**
- Stage count (1–20), difficulty tier (Club / Regional / National)

### ◎ Dry Fire Mode
- Perspective hillside scene with MOA-scaled targets
- Sky zone enforcement — top ~38% is sky; targets cannot enter it
- Import from last generated stage; generate examples; upload custom image
- Drag and drop (mouse + touch); distance band rulers

### Other
- Three themes — Amber Tactical, NVG, Daytime; localStorage persistence
- Fully responsive — desktop, tablet, mobile (two-row header, natural scroll)
- In-app Help & Docs modal

---

## Repository Structure

```
/
├── index.html              ← Refactored shell (links to css/ + js/)
├── index-mono.html         ← Self-contained single file (canonical source)
├── build_template.py       ← Regenerates prs-azure/templates/app.html from index-mono.html
│
├── css/
│   ├── themes.css
│   ├── layout.css
│   ├── dryfire.css
│   └── print.css
│
├── js/
│   ├── data.js
│   ├── theme.js
│   ├── units.js
│   ├── targets.js
│   ├── stage.js
│   ├── render.js
│   ├── generate.js
│   ├── device.js
│   ├── dryfire.js
│   ├── print.js
│   ├── equipment.js
│   ├── speeddrop.js
│   └── init.js
│
├── prs-azure/              ← Azure App Service deployment package
│   ├── app.py              ← Flask application
│   ├── requirements.txt    ← Flask + Gunicorn
│   ├── startup.txt         ← Gunicorn startup command
│   ├── web.config          ← IIS config (Windows App Service, optional)
│   ├── build_template.py   ← Template regeneration script
│   ├── deploy.sh           ← Kudu deployment script
│   ├── .deployment         ← Tells Kudu to run deploy.sh
│   ├── README_AZURE.md     ← Full Azure deployment guide
│   └── templates/
│       └── app.html        ← Generated template (do not edit directly)
│
└── README.md               ← This file
```

---

## HTML Version — Deployment

### GitHub Pages

```
1. Push index.html + css/ + js/ to repo root
2. Settings → Pages → Source: main / (root)
3. Live at https://yourusername.github.io/repo-name/
```

### Single-File

Only `index-mono.html` (rename to `index.html`) is required. Works at `file://`, from a USB drive, or on any static host. No other files needed.

### Cloudflare Pages

Drag and drop the folder. No build step.

---

## Python Version — Azure App Service Deployment (Summary)

Full instructions with troubleshooting are in `prs-azure/README_AZURE.md`.

```bash
# 1. Create resource group + Linux App Service plan
az group create --name prs-builder-rg --location eastus
az appservice plan create --name prs-builder-plan \
  --resource-group prs-builder-rg --sku B1 --is-linux

# 2. Create web app (Python 3.12 runtime)
az webapp create --name <YOUR-APP-NAME> \
  --resource-group prs-builder-rg \
  --plan prs-builder-plan \
  --runtime "PYTHON:3.12"

# 3. Set startup command
az webapp config set --name <YOUR-APP-NAME> \
  --resource-group prs-builder-rg \
  --startup-file "gunicorn --bind=0.0.0.0:8000 --timeout=120 --workers=2 --threads=4 --worker-class=gthread app:app"

# 4. (Optional) Enable Basic Auth
az webapp config appsettings set --name <YOUR-APP-NAME> \
  --resource-group prs-builder-rg \
  --settings BASIC_AUTH_USER="admin" BASIC_AUTH_PASSWORD="your-password"

# 5. ZIP deploy
cd prs-azure
zip -r deploy.zip . -x "*.git*" -x "__pycache__/*" -x "*.pyc"
az webapp deployment source config-zip \
  --name <YOUR-APP-NAME> \
  --resource-group prs-builder-rg --src deploy.zip

# 6. Verify
curl https://<YOUR-APP-NAME>.azurewebsites.net/health
```

**Updating after source changes:**
```bash
python3 build_template.py   # regenerate templates/app.html
# then redeploy via zip or git push
```

---

## How the Code Works

### Stage Generation Pipeline

```
generate()
  └── buildStage(min, max)
        ├── getEquipmentPool()        ← expands props by count
        ├── getLockedTargets()        ← custom targets table
        ├── generateDistances()       ← rand(min, max) in yards
        ├── pickPlate(focus, units)   ← MOA/MIL pool or NRL tier
        ├── getRoundProfile(mode)     ← rounds + time
        ├── allocateRounds()          ← distribute across targets
        ├── buildEngagementSequence() ← shuffle, no consecutive repeat
        ├── splitAcrossPositions()    ← divide sequence across positions
        └── getSpeedDrop()            ← SDF value if active
  └── renderStage(stage, index)
        └── if speedDrop.active → add HOLD column
              hold = max(0, distYd / 100 − sdf)  [MIL]
```

### Speed Drop Formula

```javascript
// js/render.js
const distYd = stage.distUnit === 'm'
  ? Math.round(t.distance * 1.09361)   // convert meters → yards
  : t.distance;
const raw  = (distYd / 100) - sd.sdf;
const hold = Math.max(0, raw);          // clamp; can't hold negative elevation
const holdStr = raw <= 0 ? '—' : hold.toFixed(2) + ' MIL';
```

### Python Security Model

```
Browser request
    ↓
Azure App Service (Linux, Python 3.12)
    ↓
Gunicorn (2 workers × 4 threads)
    ↓
Flask app.py
    ├── before_request: Basic Auth check (if configured)
    ├── GET / → render_template("app.html")
    │          → 130KB single HTML response
    │          → CSS inlined in <style>
    │          → JS inlined in <script>
    │          → no /static/ endpoints
    ├── GET /health → {"status":"ok"}
    └── GET /* → 404
    ↓
after_request: security headers applied to every response
    - Cache-Control: no-store
    - X-Frame-Options: DENY
    - X-Robots-Tag: noindex
    - X-Content-Type-Options: nosniff
```

### Equipment Pool Expansion

```javascript
function getEquipmentPool() {
  const pool = [];
  document.querySelectorAll('.eq-row').forEach(row => {
    const cb  = row.querySelector('.eq-checkbox');
    const cnt = row.querySelector('.eq-count');
    if (!cb || !cb.checked) return;
    const n = Math.max(1, Math.min(10, parseInt(cnt.value) || 1));
    for (let i = 0; i < n; i++) pool.push(cb.value);
  });
  return pool;
}
```

---

## Further Development

### Near-Term
- **Stage History / Save** — serialize last N stage objects to localStorage; JSON export/import
- **Dry Fire Screenshot** — `html2canvas` PNG download of current target scene
- **Countdown Timer** — `START` button in Dry Fire that counts down the stage time limit
- **NRL Hunter SVG Silhouettes** — replace emoji with proportioned SVG outlines
- **Range Photo Background** — upload a range photo as the Dry Fire scene background

### Medium-Term
- **Ballistic Holdover** — lightweight pure-JS flat-fire solver; DOPE cards appended to stage cards
- **Multi-Stage Dry Fire Navigator** — step through all stages in a generated match
- **Scoring Tracker** — hit/miss recorder, simplified PRS/NRL score display
- **jsPDF Export** — replace `window.print()` with a proper downloadable PDF

### Longer-Term
- **Bundler / TypeScript** — Vite or esbuild; `import`/`export`; TypeScript on generation logic
- **Auth + Monetization** — Cloudflare Access / Clerk + Stripe + Workers KV
- **Community Stage Library** — shared stage database, browse/publish
- **Mobile App** — Capacitor wrapper for iOS/Android

---

## License

All rights reserved. Copyright © 2026 Charles Witherspoon.

This tool may not be redistributed, resold, or reused without explicit written permission from the author.

Contact: [charleswitherspoon.me](https://charleswitherspoon.me) · [@dubs_does](https://instagram.com/dubs_does)

---

*Built with logic from Charles Witherspoon and code from [Claude Sonnet 4.6](https://claude.ai) (Anthropic AI) — v1.5.0*
