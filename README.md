# PRS & NRL Hunter Stage Builder
### v1.3.1

A fully self-contained, single-file web application for designing randomized **Precision Rifle Series (PRS)** and **NRL Hunter** competition stages, match cards, and dry fire training sessions. No server, no framework, no dependencies beyond two Google Fonts — drop `index.html` anywhere and it runs.

---

## ☕ Support the Project

If this tool saves you time on the range or at the match director's table, consider buying the author a coffee.

**[☕ Buy Charles Witherspoon a Coffee → charleswitherspoon.me](https://charleswitherspoon.me)**

---

## Credits

This project was built through a collaborative process:

- **Logic, design direction, and domain expertise** — Charles Witherspoon ([@dubs_does](https://instagram.com/dubs_does))
- **Code generation and implementation** — [Claude Sonnet 4.6](https://claude.ai) (Anthropic AI)

The architecture, stage generation logic, NRL Hunter animal tier system, Dry Fire perspective model, and all feature decisions originated with the author. Claude Sonnet 4.6 was used to implement those decisions into working HTML, CSS, and JavaScript across an iterative development process.

---

## Features

### ◈ Builder Mode
- **Single Stage** and **Match Mode** generation
- **PRS discipline** — MOA and MIL plate sizes, angular size pools, focus-driven selection
- **NRL Hunter discipline** — 18 animal silhouettes across 3 difficulty tiers (Tier 1: Prairie Dog through Squirrel; Tier 2: Fox through Bobcat; Tier 3: Ram through Elk)
- **Focus system** — Balanced, Wind, Elevation, Small Target, Combined; maps to plate size or animal tier pools
- **Round modes** — Full (10–12 rds, 105s, 3 positions), Mid Compression (6–8 rds, 75–90s, 2 positions), Low Compression (4–6 rds, 45–60s, 1 position)
- **Custom time limit** — Override auto-calculated time per round mode
- **Distance units** — Yards or Meters with live conversion throughout
- **Custom Targets table** — Lock specific distances and/or sizes per target slot; AUTO for focus-driven size selection
- **Engagement sequence logic** — Randomized course of fire with consecutive-target shuffle to prevent back-to-back repeats
- **Match difficulty tiers** — Club, Regional, National with design guidelines
- **Match Settings** — Stage count up to 20, difficulty selector

### ◎ Dry Fire Mode
- **Perspective hillside scene** — min-distance targets near foreground, max-distance near horizon
- **Sky zone enforcement** — targets cannot be placed or dragged into the sky (top ~38% of scene)
- **MOA-to-pixel scaling** — target size reflects real-world apparent size at distance
- **Three target sources** — Import from last generated stage, generate random examples, upload custom image
- **Drag and drop** — mouse and touch, sky-clamped, z-ordered by distance
- **Distance band rulers** — toggleable yardage lines across the scene
- **NRL Hunter emoji rendering** — animal silhouettes per imported target type
- **Custom image targets** — upload any PNG/JPG and place it at a specific distance

### Themes
- **Amber Tactical** (default) — dark olive/amber
- **NVG** — night vision green with phosphor glow effects
- **Daytime** — high contrast white/black

### Other
- **Fully responsive** — desktop (sticky scrolling panels), tablet (narrowed sidebar), mobile (stacked natural flow)
- **Device detection** — JS reads UA string and viewport to apply appropriate layout class
- **Help & Docs modal** — complete in-app reference covering all features, combined workflows, and field guidelines
- **Author attribution** — C. Witherspoon / @dubs_does in header and modal footer
- **LocalStorage theme persistence** — remembers your last theme across sessions

---

## How It Works

### Architecture

The entire application is a single HTML file (~2,700 lines as of v1.3.1). There are no build steps, no npm packages, no backend. Structure:

```
index.html
├── <style>          CSS — theme variables, layout, component styles, dry fire scene
├── Help Modal       Full documentation rendered as a fixed overlay
├── Header           View tabs, theme switcher, status block
├── Builder View     Sidebar (panels) + Output area (stage cards)
│   ├── Sidebar      Mode, Range, Stage Config, Custom Targets, Equipment, Match Settings
│   └── Output       Rendered stage cards with target tables and course-of-fire
├── Dry Fire View    Sidebar (controls) + Canvas (hillside scene)
│   ├── Sidebar      Scene setup, target sources, instructions
│   └── Canvas       dfScene div with positioned target elements and ruler overlays
└── <script>         All application logic (~900 lines of vanilla JS)
```

### Key JavaScript Systems

#### Stage Generation Pipeline
```
generate()
  └── buildStage(min, max)
        ├── getLockedTargets()          — reads Custom Targets table
        ├── generateDistances()         — fills unlocked slots with rand(min, max)
        ├── pickPlate(focus, units)     — MOA/MIL pool selection or NRL animal tier
        ├── getRoundProfile(mode)       — rounds + time limit (respects custom time)
        ├── allocateRounds()            — distributes rounds across targets
        ├── buildEngagementSequence()   — shuffles with consecutive-target prevention
        └── splitAcrossPositions()      — divides sequence across position count
  └── renderStage(stage, index)         — builds HTML string for stage card
```

#### Distance → Vertical Position (Dry Fire)
```
distToYPercent(dist)
  - Normalizes dist between dfMin and dfMax
  - Maps linearly: min dist → 92% (near ground), max dist → 42% (just below horizon)
  - Sky zone = top 38% — target centers cannot go above this
```

#### MOA → Pixel Size (Dry Fire)
```
moaToPx(moa, distYd)
  - Reference: 1 MOA at 100yd = ~3.5% of canvas width
  - Scale: sizePx = refPx × moa × (100 / dist)
  - Clamped: never smaller than 6px, never larger than 25% of canvas width
```

#### Unit Conversion
```
YD_TO_M = 0.9144
M_TO_YD = 1.09361

All internal distances stored in yards.
Display conversion applied at render time only.
Switching units converts: range inputs, custom target table, distance labels.
```

#### Theme System
```
CSS:  data-theme attribute on <html> drives all CSS custom property overrides
JS:   setTheme(theme) — sets attribute, updates active button, recolors reticle SVG strokes
      localStorage key 'prs-theme' persists selection
```

#### Device Detection
```
detectDevice()
  - Reads navigator.userAgent for mobile keywords
  - Also checks window.innerWidth ≤ 820
  - Toggles body.is-mobile / body.is-desktop
  - Mobile: page scrolls naturally; sidebar is static flow
  - Desktop: overflow:hidden on body; panels scroll independently
```

---

## Project Structure (for GitHub)

```
/
├── index.html      ← entire application
└── README.md       ← this file
```

That's it. GitHub Pages will serve `index.html` automatically if Pages is enabled on the repo root or `main` branch.

---

## Deployment

**GitHub Pages (current setup):**
1. Push `index.html` to your repo
2. Go to Settings → Pages → Source: Deploy from branch → `main` / `(root)`
3. Done — accessible at `https://yourusername.github.io/repo-name/`

**Cloudflare (DNS + Analytics):**
- Point your domain to GitHub Pages via a CNAME record in Cloudflare
- Enable **Cloudflare Web Analytics** (free, no-cookie, GDPR compliant) for page view tracking — just paste their snippet before `</body>`
- Cloudflare Access can be used to add an authentication/paywall layer without changing the app code

---

## How to Further Develop

The single-file architecture is intentional for portability, but it makes the project easy to extend. Here are the most natural development paths:

### Near-Term Improvements (low effort)

**Print / PDF Export**
The stage cards are clean HTML. Adding `window.print()` with a `@media print` stylesheet that hides the sidebar and sets white backgrounds would enable one-click PDF export of match cards. A library like `html2canvas` + `jsPDF` could produce a more polished export.

**Stage Card Saving**
Currently stages are lost on page refresh. Adding `localStorage` serialization of the last generated stage object would let users reload and still see their stage. A JSON export/import button would let match directors save and share stage files.

**Dry Fire Screenshot**
The Dry Fire scene is a DOM-based canvas. Adding `html2canvas` (already used in the original MOA Target Scaler this feature was inspired by) would let users download a PNG of the current scene to share with squad members or print for a stage brief.

**Timer Integration**
The stage already calculates a time limit. A countdown timer button in the Dry Fire toolbar — triggered by a "START" button — would turn it into an interactive dry fire timer session.

**NRL Hunter Animal Images**
Currently NRL Hunter mode uses emoji rendering in Dry Fire. Replacing these with proper SVG silhouettes (matching the actual NRL Hunter steel dimensions) would make the Dry Fire scene much more realistic for those competitors.

### Medium-Term Improvements (moderate effort)

**Stage History / Favorites**
A session history panel that stores the last N generated stages using `localStorage` or `IndexedDB`. Let users star or name favorites. A simple JSON schema would suffice:
```json
{ "id": "uuid", "created": "timestamp", "discipline": "prs", "targets": [...], "stage": {...} }
```

**Ballistic Integration**
The distances and plate sizes are already present. Integrating a simple ballistic solver (elevation and wind holdover based on common calibers and ballistic coefficients) would let the stage output show approximate dial values per target. A lightweight library like `ballisticcalc` (Python, but logic is portable to JS) or a custom simplified solver would work well here.

**Multi-Stage Dry Fire**
Currently Dry Fire imports only the first stage card. Extending it to page through stages — "Stage 1 of 8, Next →" — would make it useful for full match walkthroughs.

**Scoring Tracker**
A hit/miss recorder in Dry Fire mode. After dry firing a sequence, the user marks each shot as H/M. The app calculates stage score using a simplified PRS or NRL scoring model (hits × points, time penalty, etc.).

**Custom Background Images for Dry Fire**
The original MOA Target Scaler this feature was derived from supported background image uploads. Re-adding this to Dry Fire would let users upload a photo of their actual range and position targets on the real terrain.

### Longer-Term / Architectural Improvements (significant effort)

**Component Refactoring**
The single HTML file is approaching 2,700 lines. Splitting into `builder.js`, `dryfire.js`, `themes.js`, `stage-logic.js`, and `ui.js` modules with a simple Vite or esbuild bundler would dramatically improve maintainability without changing the zero-dependency deployment model (bundle step produces a single output file).

**Backend + Authentication**
If monetization is a goal: a lightweight Node.js or Python backend with:
- **Stripe** for one-time purchase or subscription
- **Cloudflare Access** or **Clerk** for SSO (Google, GitHub, email)
- **Cloudflare Workers** as the serverless glue between Stripe webhooks and Access
- Stage generation logic moved server-side to protect IP

**Community Stage Library**
A shared database (Supabase, Firebase, or a simple JSON API on Cloudflare Workers KV) where match directors can publish and browse named stages. The client already produces structured stage data — adding a `POST /stages` endpoint and a gallery view is a straightforward extension.

**Mobile App**
The tool is already mobile-responsive. Wrapping it in a **Capacitor** or **Tauri** container would produce a native iOS/Android app from the existing HTML/JS with minimal code changes. Push notifications could remind users of upcoming dry fire sessions.

---

## License

All rights reserved. Copyright © 2026 Charles Witherspoon.

This tool may not be redistributed, resold, or reused without explicit written permission from the author. See [instagram.com/dubs_does](https://instagram.com/dubs_does) or [charleswitherspoon.me](https://charleswitherspoon.me) to get in touch.

---

*Built with logic from Charles Witherspoon and code from [Claude Sonnet 4.6](https://claude.ai) (Anthropic AI) — v1.3.1*
