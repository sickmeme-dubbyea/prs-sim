# PRS & NRL Hunter Stage Builder
### v1.4.1

A web application for designing randomized **Precision Rifle Series (PRS)** and **NRL Hunter** competition stages, match cards, and dry fire training sessions. No server, no framework, no build step — deploy as a single file or a modular multi-file project.

---

## ☕ Support the Project

If this tool saves you time on the range or at the match director's table, please consider buying the author a coffee.

**[☕ Buy Charles Witherspoon a Coffee → charleswitherspoon.me](https://charleswitherspoon.me)**

---

## Credits

| Role | Contributor |
|---|---|
| Logic, design direction, domain expertise | Charles Witherspoon ([@dubs_does](https://instagram.com/dubs_does)) |
| Code generation & implementation | [Claude Sonnet 4.6](https://claude.ai) (Anthropic AI) |

All stage generation logic, NRL Hunter animal tier system, equipment pool architecture, Dry Fire perspective model, and all feature decisions originated with the author. Claude Sonnet 4.6 implemented those decisions into working HTML, CSS, and JavaScript across an iterative development process.

---

## Changelog

### v1.4.1
- **Layout fixes** — sidebar now fills its grid cell correctly (`height: 100%; box-sizing: border-box`) with `overflow-y: auto`; panels given `flex-shrink: 0` so they are never compressed
- **Generate button** — wrapped in `.gen-btn-wrap` with `flex-shrink: 0` and `margin-top: auto`; the button is always fully visible and reachable by scrolling, never clipped
- **Equipment row scaling** — `eq-count` input given `width: 44px !important` to override the global `input[type="number"]` width rule; columns tightened to `22px 1fr 44px` so rows fit cleanly inside the sidebar without overflow
- **File rename** — `index.html` is now the modular refactored shell (references `css/` + `js/`); `index-mono.html` is the self-contained single-file version
- **Build integrity** — all module files rebuilt from the monolithic source of truth using `rfind('</body>')` to prevent body truncation; 39-point parity audit passes across both HTML files and all 16 modules

### v1.4.0
- Equipment position counts — optional `#` field per prop controls how many times it can appear in one stage
- Custom positions — add unlimited named positions via text input; removable with `×`
- Component refactoring — CSS and JS split into 12 JS modules and 4 CSS files
- Print / PDF export — `⎙ PRINT / PDF` button with clean `@media print` layout and author header

### v1.3.1
- Dry Fire mode — perspective hillside scene with MOA-scaled targets, sky-zone enforcement, drag and drop, stage import, custom image upload
- Builder ↔ Dry Fire workflow — import last generated stage directly into Dry Fire
- Help & Docs modal — full in-app reference including combined workflow guide

### v1.3.0
- NRL Hunter discipline — 18 animal silhouettes across 3 difficulty tiers
- Custom time limit override
- Mobile / desktop scroll architecture — device detection, independent panel scrolling on desktop, natural page scroll on mobile

---

## Features

### ◈ Builder Mode

**Stage Generation**
- Single Stage and Match Mode (up to 20 stages)
- PRS discipline — MOA / MIL angular plate sizes, focus-driven pool selection
- NRL Hunter discipline — 18 animal silhouettes across 3 difficulty tiers (Prairie Dog → Elk)
- Focus system — Balanced, Wind, Elevation, Small Target, Combined
- Round modes — Full (10–12 rds, 105s, 3 pos), Mid Compression (6–8 rds, 75–90s, 2 pos), Low Compression (4–6 rds, 45–60s, 1 pos)
- Custom time limit override
- Distance units — Yards or Meters with live conversion throughout

**Equipment & Positions**
- Six standard props: Barricade, Tripod, Tank Trap, Rooftop, Prone, Modified Prone
- Position count `#` — optional field per prop; sets how many times that prop can be drawn as a position in one stage (default: 1, max: 10)
- Custom positions — add any named position via text input; Enter key or `+ ADD` button; removed with `×`; treated identically to standard props in stage generation

**Custom Targets Table**
- Lock distance and/or plate size per target slot; AUTO for focus-driven size with a fixed distance

**Match Settings**
- Stage count (1–20), difficulty tier (Club / Regional / National)
- `⎙ PRINT / PDF` output toolbar button — triggers `@media print` layout for browser Save as PDF

### ◎ Dry Fire Mode

- Perspective hillside scene — min-distance targets near foreground, max-distance near horizon
- Sky zone — top ~38% of scene is sky; no target can be placed or dragged into it
- MOA-to-pixel scaling — apparent target size on screen mirrors real-world angular size at distance
- Import from last generated Builder stage — targets placed at correct distances and sizes
- Generate example targets — circle, square, IPSC, or mixed shapes at random distances
- Upload custom image target — placed and scaled at a specified distance
- Drag and drop repositioning — mouse and touch, sky-clamped
- Toggleable distance band rulers across the scene

### Other
- Three themes — Amber Tactical, NVG (night vision green with glow effects), Daytime
- Fully responsive — desktop sticky-panel scroll, tablet narrowed sidebar, mobile natural-flow scroll
- Device detection — UA string + viewport width → `body.is-mobile` / `body.is-desktop`
- Complete in-app Help & Docs modal — all features documented including Builder+Dry Fire combined workflow
- Theme persisted in `localStorage`

---

## Repository Structure

```
/
├── index.html              <- Refactored shell (links to css/ + js/ modules)
├── index-mono.html         <- Self-contained single file (all CSS + JS inline)
│
├── css/
│   ├── themes.css          <- CSS custom property definitions (Amber, NVG, Daytime)
│   ├── layout.css          <- Header, sidebar, grid, panels, stage cards, modal, responsive
│   ├── dryfire.css         <- Dry Fire scene, target shapes, toolbar, sky zone
│   └── print.css           <- @media print overrides + .print-header
│
├── js/
│   ├── data.js             <- Constants: MOA_OPTIONS, MIL_OPTIONS, NRL_ANIMALS, tier helpers
│   ├── theme.js            <- setTheme(), SVG reticle recolor, localStorage persistence
│   ├── units.js            <- YD_TO_M, toYards(), updateDistUnit(), updateCustomDist()
│   ├── targets.js          <- Custom targets table: rebuildDistTable(), getLockedTargets()
│   ├── stage.js            <- Core generation: pickPlate(), buildStage(), allocateRounds()
│   ├── render.js           <- renderStage() — HTML string builder for stage cards
│   ├── generate.js         <- generate() — entry point wiring sidebar → stage pipeline
│   ├── device.js           <- detectDevice() — UA + viewport → body class toggle
│   ├── dryfire.js          <- Full Dry Fire mode: scene, targets, drag, import, upload
│   ├── print.js            <- printStages(), clearOutput()
│   ├── equipment.js        <- makeEqRow(), getEquipmentPool(), addCustomEquipment()
│   └── init.js             <- Bootstrap sequence (runs all update*() on load)
│
└── README.md
```

**Two deployment targets from one codebase:**
- `index.html` — the modular shell; deploy alongside `css/` and `js/` to GitHub Pages or any static host
- `index-mono.html` — fully self-contained; works at `file://` with zero other files required

> **Note for GitHub Pages:** commit `index.html` + `css/` + `js/` to your repo root. GitHub Pages will serve `index.html` automatically. The `index-mono.html` can also be committed as a fallback or for distribution.

---

## How the Code Works

### Stage Generation Pipeline

```
generate()
  └── buildStage(min, max)
        ├── getEquipmentPool()           <- expands each checked prop by its count value
        ├── getLockedTargets()           <- reads Custom Targets table (dist + size per slot)
        ├── generateDistances()          <- fills unlocked slots with rand(min, max) in yards
        ├── pickPlate(focus, units)      <- MOA/MIL pool selection or NRL animal tier
        ├── getRoundProfile(mode)        <- rounds + time limit (custom time override applied here)
        ├── allocateRounds()             <- distributes total rounds across targets
        ├── buildEngagementSequence()    <- shuffles with consecutive-target prevention
        └── splitAcrossPositions()       <- divides shot sequence across position count
  └── renderStage(stage, index)          <- builds the HTML string for a stage card
```

### Equipment Pool Expansion

Each checked prop contributes its name N times to the pool, where N is its count input (default 1, max 10):

```javascript
// js/equipment.js
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

`buildStage()` shuffles this pool and slices to `posCount` (1–3 based on round mode). With Barricade at count 3 and Prone at count 1, the pool is `['Barricade','Barricade','Barricade','Prone']` — a Full-mode stage drawing 3 positions has a 75% chance of using Barricade more than once. Custom positions from the `+ ADD` row are `.eq-row.custom` elements read by the same selector with no special-casing.

### Sidebar Layout (v1.4.1 fix)

The sidebar is a CSS grid cell child. The correct pattern for a scrollable flex column inside a fixed-height grid cell is:

```css
/* css/layout.css */
.main-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  height: calc(100vh - 84px);
  overflow: hidden;
}

.sidebar {
  height: 100%;           /* fill grid cell exactly */
  box-sizing: border-box; /* padding included in height */
  overflow-y: auto;       /* scroll when content exceeds */
  display: flex;
  flex-direction: column;
}

.panel       { flex-shrink: 0; } /* panels never compress */

.gen-btn-wrap {
  flex-shrink: 0;    /* button never compresses */
  margin-top: auto;  /* pushes to bottom when content is short */
  padding-bottom: 32px; /* clears scroll container edge */
}
```

### Dry Fire — Distance to Vertical Position

```javascript
// js/dryfire.js  —  SKY_FRACTION = 0.38
// min dist → 92% from top (near ground)
// max dist → 42% from top (just below sky boundary)
const yMin = 0.92, yMax = SKY_FRACTION + 0.04;
const t = (dist - minDist) / (maxDist - minDist);
return yMin - t * (yMin - yMax);
```

Drag is clamped so target centers cannot enter the top 38% sky zone.

### Dry Fire — MOA to Pixel Size

```javascript
// js/dryfire.js
const refPx  = canvasWidth * 0.035;  // 1 MOA at 100yd ≈ 3.5% canvas width
const sizePx = refPx * moa * (100 / distYd);
// Clamped: min 6px, max 25% canvas width
```

### Unit Conversion

All internal distances stored in yards. Meters are a display layer applied at render time only.

```
YD_TO_M = 0.9144    M_TO_YD = 1.09361
```

### Theme System

`[data-theme]` attribute on `<html>` drives all CSS custom properties. `setTheme()` sets the attribute, updates the active button indicator, and rewrites SVG reticle stroke attributes directly — SVG `stroke` does not inherit CSS variables. Selected theme is persisted under `localStorage['prs-theme']` and restored on load.

### Device Detection

On page load and every `resize` event, `detectDevice()` checks `navigator.userAgent` for mobile keywords and tests `window.innerWidth <= 820`. It toggles `body.is-mobile` / `body.is-desktop`, which switch the CSS layout between:
- **Desktop** — `body: overflow: hidden`; sidebar and output area scroll independently as fixed-height panels
- **Mobile** — `body: overflow-y: auto`; full-page natural scroll; sidebar is static flow

---

## Deployment

### GitHub Pages (recommended)

```
1. Push index.html + css/ + js/ to your repo root
2. Settings → Pages → Source: main / (root)
3. Live at https://yourusername.github.io/repo-name/
```

### Single-File Deployment

Only `index-mono.html` (rename to `index.html`) is required. Works from a USB drive, email attachment, local file system, or any server — no directory structure needed.

### Cloudflare Pages / Any Static Host

Drag and drop the folder. No build step. Optionally add the Cloudflare Web Analytics snippet before `</body>` for free, GDPR-compliant page view tracking.

---

## Further Development

### Near-Term (low effort)

**Stage History / Save**
Stage objects are already structured JavaScript. Serializing the last N to `localStorage` and adding a collapsible Recent Stages panel with JSON export/import would let match directors save and share stage sets between sessions.

**Dry Fire Screenshot**
The scene is standard DOM. `html2canvas` would produce a downloadable PNG of the current target layout — useful for sharing stage briefs with squad members.

**Countdown Timer**
The stage time limit already exists in the generated stage object. A `START` button in the Dry Fire toolbar that counts down and flashes on expiry would turn it into a fully timed practice session.

**NRL Hunter SVG Silhouettes**
Dry Fire currently renders NRL Hunter targets as emoji. Replacing them with properly proportioned SVG outlines matching actual NRL Hunter steel dimensions would give competitors a realistic sight picture for field match prep.

**Range Photo Background in Dry Fire**
The original MOA Target Scaler that inspired this feature supported background image uploads. Re-adding this would let users photograph their actual range and overlay properly scaled targets on the real terrain.

### Medium-Term (moderate effort)

**Ballistic Holdover Integration**
Distances, plate sizes, and scope units are all present per target. A lightweight pure-JS flat-fire ballistic solver could append approximate elevation and wind holdover values (or DOPE card rows) to each stage card — useful for training with a specific rifle and load.

**Multi-Stage Dry Fire Navigator**
Dry Fire currently imports only the first stage. A `Stage 1 of 8 — Next →` navigator would let competitors walk through all stages in a generated match sequentially for full visual match prep.

**Scoring Tracker**
A hit/miss recorder overlay in Dry Fire. After running a sequence the user marks each shot. The app calculates a simplified PRS or NRL score (hits × points value, time penalty) and displays running match totals.

**jsPDF Export**
Replace `window.print()` with `jsPDF` + `html2canvas` for a fully formatted downloadable PDF that doesn't rely on the browser print dialog — better for sharing and archiving match cards.

### Longer-Term (architectural)

**Bundler + TypeScript**
The codebase is already modular (`css/` + `js/`). Adding Vite or esbuild would enable `import`/`export` syntax, TypeScript on the stage generation logic, hot module reload for development, and a single optimised build artifact for production.

**Auth + Monetization Stack**
- **Cloudflare Access** — gate the app at CDN layer, zero code changes to the app
- **Clerk** — SSO via Google, GitHub, or email magic link
- **Stripe** — one-time purchase or annual subscription tiers
- **Cloudflare Workers** — serverless webhook handler connecting Stripe events to Access grants
- **KV Store** — per-user saved stage libraries

**Community Stage Library**
A shared database where match directors publish, tag, and browse named stages. The client already produces structured stage objects — a `POST /stages` endpoint and gallery view is a natural extension via Cloudflare Workers KV or Supabase.

**Mobile App**
The app is already responsive. Wrapping in Capacitor produces a native iOS/Android binary from the existing HTML/JS with minimal changes. Push notifications could deliver daily dry fire session reminders.

---

## License

All rights reserved. Copyright © 2026 Charles Witherspoon.

This tool may not be redistributed, resold, or reused without explicit written permission from the author.

Contact: [charleswitherspoon.me](https://charleswitherspoon.me) · [@dubs_does](https://instagram.com/dubs_does)

---

*Built with logic from Charles Witherspoon and code from [Claude Sonnet 4.6](https://claude.ai) (Anthropic AI) — v1.4.1*
