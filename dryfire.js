/* ══════════════════════════════════════════════════════
     VIEW SWITCHING
  ══════════════════════════════════════════════════════ */
  function switchView(view) {
    const builderView = document.getElementById('builderView');
    const dfView      = document.getElementById('dryFireView');
    const tabB        = document.getElementById('tabBuilder');
    const tabD        = document.getElementById('tabDryFire');

    if (view === 'dryfire') {
      builderView.style.display = 'none';
      dfView.classList.add('active');
      tabB.classList.remove('active');
      tabD.classList.add('active');
      // Sync units from builder
      syncDfUnitsFromBuilder();
      renderDfRulers();
    } else {
      builderView.style.display = '';
      dfView.classList.remove('active');
      tabB.classList.add('active');
      tabD.classList.remove('active');
    }
  }

  /* ══════════════════════════════════════════════════════
     DRY FIRE STATE
  ══════════════════════════════════════════════════════ */
  let dfTargetList = []; // { id, dist, moa, shape, x, y, label, el, imgSrc }
  let dfIdCounter  = 0;
  let customImgSrc = null; // last uploaded custom image

  // Sky zone = top 38% of canvas — no target centers above this
  const SKY_FRACTION = 0.38;

  /* ══════════════════════════════════════════════════════
     UNIT SYNC
  ══════════════════════════════════════════════════════ */
  function syncDfUnitsFromBuilder() {
    const builderUnit = getDistUnit(); // 'yd' or 'm'
    document.getElementById('dfUnit').value = builderUnit;
    updateDfUnit();

    // Pre-fill min/max from builder if reasonable
    const bMin = parseInt(document.getElementById('minDist').value) || 100;
    const bMax = parseInt(document.getElementById('maxDist').value) || 600;
    document.getElementById('dfMin').value = bMin;
    document.getElementById('dfMax').value = bMax;
  }

  function updateDfUnit() {
    const u = document.getElementById('dfUnit').value.toUpperCase();
    ['dfMinLabel','dfMaxLabel','dfCustomDistLabel'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = u;
    });
  }

  /* ══════════════════════════════════════════════════════
     DISTANCE → VERTICAL POSITION MAPPING
     Closer (min dist) → bottom of valid zone (near ground)
     Farther (max dist) → top of valid zone (just below horizon)
  ══════════════════════════════════════════════════════ */
  function distToYPercent(dist) {
    const minD = parseFloat(document.getElementById('dfMin').value) || 100;
    const maxD = parseFloat(document.getElementById('dfMax').value) || 600;
    // Clamp dist
    const d = Math.max(minD, Math.min(maxD, dist));
    // Normalize 0=min, 1=max
    const t = (d - minD) / Math.max(1, maxD - minD);
    // Map: min dist → 92% (near ground), max dist → 42% (just below horizon)
    const yMin = 0.92; // bottom of valid placement area
    const yMax = SKY_FRACTION + 0.04; // just below sky boundary
    return yMin - t * (yMin - yMax);
  }

  /* ══════════════════════════════════════════════════════
     SIZE CALCULATION
     MOA to pixel size based on distance and canvas width
     1 MOA ≈ 1.047" per 100yd  → scale relative to canvas
  ══════════════════════════════════════════════════════ */
  function moaToPx(moa, distYd) {
    const wrap  = document.getElementById('dfCanvasWrap');
    const w     = wrap ? wrap.offsetWidth : 800;
    // Reference: at 100yd, 1MOA ≈ 1.047". Canvas represents ~50ft (600in) horizontal span
    // We scale so that a 4 MOA target at 100yd is clearly visible (~3% of canvas width)
    const refPx = w * 0.035; // reference size in px for 1 MOA at 100yd
    const sizePx = refPx * moa * (100 / Math.max(50, distYd));
    return Math.max(6, Math.min(w * 0.25, sizePx)); // clamp: never tiny, never huge
  }

  /* ══════════════════════════════════════════════════════
     SKY ZONE & RULER BANDS
  ══════════════════════════════════════════════════════ */
  function toggleSkyZone() {
    const on  = document.querySelector('input[name="dfSkyZone"]:checked').value === 'yes';
    const el  = document.getElementById('dfSkyZone');
    if (el) el.classList.toggle('show-zone', on);
  }

  function toggleBands() {
    renderDfRulers();
  }

  function renderDfRulers() {
    const container = document.getElementById('dfRulers');
    if (!container) return;
    container.innerHTML = '';

    const on = document.querySelector('input[name="dfBands"]:checked').value === 'yes';
    if (!on) return;

    const minD = parseFloat(document.getElementById('dfMin').value) || 100;
    const maxD = parseFloat(document.getElementById('dfMax').value) || 600;
    const unit = document.getElementById('dfUnit').value;
    const steps = 5;
    const stepDist = (maxD - minD) / steps;

    for (let i = 0; i <= steps; i++) {
      const dist = Math.round(minD + stepDist * i);
      const yPct = distToYPercent(dist) * 100;

      const line = document.createElement('div');
      line.className = 'df-ruler-band';
      line.style.top = yPct + '%';
      container.appendChild(line);

      const lbl = document.createElement('div');
      lbl.className = 'df-ruler-label';
      lbl.style.top = yPct + '%';
      lbl.textContent = dist + unit;
      container.appendChild(lbl);
    }
  }

  /* ══════════════════════════════════════════════════════
     TARGET CREATION
  ══════════════════════════════════════════════════════ */
  const ANIMAL_EMOJIS = {
    'Prairie Dog': '🐿', 'Crow': '🐦', 'Chicken': '🐔', 'Rabbit': '🐇',
    'Squirrel': '🐿', 'Fox': '🦊', 'Coyote': '🐺', 'Turkey': '🦃',
    'Pig': '🐷', 'Javelina': '🐗', 'Otter': '🦦', 'Bobcat': '🐱',
    'Ram': '🐏', 'Deer': '🦌', 'Wolf': '🐺', 'Cougar': '🐆',
    'Bear': '🐻', 'Elk': '🦌'
  };

  function createDfTarget({ dist, moa, shape, label, imgSrc, xPct }) {
    const wrap = document.getElementById('dfTargets');
    if (!wrap) return;

    const id     = ++dfIdCounter;
    const yPct   = distToYPercent(dist);
    const sizePx = moaToPx(moa || 2, dist);

    // Default xPct to random horizontal if not provided
    const xFinal = (xPct !== undefined) ? xPct : 0.1 + Math.random() * 0.8;

    const el = document.createElement('div');
    el.className = 'df-target';
    el.id = 'dft-' + id;
    el.dataset.id = id;
    el.style.left  = (xFinal * 100) + '%';
    el.style.top   = (yPct * 100) + '%';
    el.style.width  = sizePx + 'px';
    el.style.height = sizePx + 'px';
    el.style.zIndex = Math.round(yPct * 100); // closer = higher z

    // Shape rendering
    if (imgSrc) {
      el.classList.add('df-shape-custom');
      el.style.backgroundImage = `url(${imgSrc})`;
    } else if (shape === 'circle') {
      el.classList.add('df-shape-circle');
    } else if (shape === 'square') {
      el.classList.add('df-shape-square');
    } else if (shape === 'ipsc') {
      el.classList.add('df-shape-ipsc');
      el.style.height = (sizePx * 1.5) + 'px';
    } else if (shape && shape.startsWith('animal:')) {
      const animal = shape.replace('animal:', '');
      el.classList.add('df-shape-animal');
      el.style.fontSize = sizePx + 'px';
      el.style.width  = 'auto';
      el.style.height = 'auto';
      el.textContent = ANIMAL_EMOJIS[animal] || '🎯';
    }

    // Label
    if (label) {
      const lbl = document.createElement('div');
      lbl.className = 'df-target-label';
      lbl.textContent = label;
      lbl.style.top = (sizePx + 4) + 'px';
      el.appendChild(lbl);
    }

    // Click to select/delete
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (el.classList.contains('selected')) {
        if (confirm('Remove this target?')) removeDfTarget(id);
      } else {
        document.querySelectorAll('.df-target.selected').forEach(t => t.classList.remove('selected'));
        el.classList.add('selected');
      }
    });

    // Drag
    makeDraggable(el, id);

    wrap.appendChild(el);
    dfTargetList.push({ id, dist, moa, shape, xPct: xFinal, yPct, label, el, imgSrc });

    // Hide hint
    const hint = document.getElementById('dfHint');
    if (hint) hint.style.display = 'none';

    return id;
  }

  function removeDfTarget(id) {
    const item = dfTargetList.find(t => t.id === id);
    if (item && item.el) item.el.remove();
    dfTargetList = dfTargetList.filter(t => t.id !== id);
    if (dfTargetList.length === 0) {
      const hint = document.getElementById('dfHint');
      if (hint) hint.style.display = '';
    }
  }

  function clearDfTargets() {
    document.getElementById('dfTargets').innerHTML = '';
    dfTargetList = [];
    const hint = document.getElementById('dfHint');
    if (hint) hint.style.display = '';
  }

  /* ══════════════════════════════════════════════════════
     DRAG & DROP
  ══════════════════════════════════════════════════════ */
  function makeDraggable(el, id) {
    let startX, startY, startLeft, startTop;

    function getPos(e) {
      return e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
                       : { x: e.clientX, y: e.clientY };
    }

    function onStart(e) {
      e.preventDefault();
      el.classList.add('dragging');
      const p = getPos(e);
      startX = p.x; startY = p.y;
      startLeft = parseFloat(el.style.left);
      startTop  = parseFloat(el.style.top);

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend',  onEnd);
    }

    function onMove(e) {
      e.preventDefault();
      const wrap = document.getElementById('dfScene');
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const p    = getPos(e);

      const dx = ((p.x - startX) / rect.width)  * 100;
      const dy = ((p.y - startY) / rect.height) * 100;

      let newLeft = startLeft + dx;
      let newTop  = startTop  + dy;

      // Clamp horizontal 0-100%
      newLeft = Math.max(1, Math.min(99, newLeft));
      // Clamp vertical: cannot go into sky zone (top 38%) — use center
      const minTop = SKY_FRACTION * 100 + 2;
      const maxTop = 96;
      newTop = Math.max(minTop, Math.min(maxTop, newTop));

      el.style.left = newLeft + '%';
      el.style.top  = newTop  + '%';

      // Update stored position
      const item = dfTargetList.find(t => t.id === id);
      if (item) {
        item.xPct = newLeft / 100;
        item.yPct = newTop  / 100;
      }
    }

    function onEnd() {
      el.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend',  onEnd);
    }

    el.addEventListener('mousedown',  onStart);
    el.addEventListener('touchstart', onStart, { passive: false });
  }

  /* ══════════════════════════════════════════════════════
     GENERATE EXAMPLE TARGETS
  ══════════════════════════════════════════════════════ */
  function generateExampleTargets() {
    const count  = Math.max(1, parseInt(document.getElementById('dfExCount').value) || 4);
    const type   = document.getElementById('dfExType').value;
    const moa    = parseFloat(document.getElementById('dfExMoa').value) || 2;
    const minD   = parseFloat(document.getElementById('dfMin').value) || 100;
    const maxD   = parseFloat(document.getElementById('dfMax').value) || 600;
    const unit   = document.getElementById('dfUnit').value;
    const shapes = ['circle', 'square', 'ipsc'];

    for (let i = 0; i < count; i++) {
      const dist  = Math.round(minD + Math.random() * (maxD - minD));
      const shape = type === 'mixed' ? shapes[i % shapes.length] : type;
      const label = dist + unit;
      createDfTarget({ dist, moa, shape, label });
    }

    renderDfRulers();
  }

  /* ══════════════════════════════════════════════════════
     IMPORT FROM LAST GENERATED STAGE
  ══════════════════════════════════════════════════════ */
  function importFromStage() {
    // Read from last generated stage output
    const stageCards = document.querySelectorAll('.stage-card');
    if (!stageCards.length) {
      alert('No stage has been generated yet. Generate a stage in the Builder first, then import.');
      return;
    }

    clearDfTargets();

    // Sync distance settings
    const bMin = parseFloat(document.getElementById('minDist').value) || 100;
    const bMax = parseFloat(document.getElementById('maxDist').value) || 600;
    document.getElementById('dfMin').value = bMin;
    document.getElementById('dfMax').value = bMax;
    syncDfUnitsFromBuilder();

    // Use the first stage card only
    const card = stageCards[0];
    const rows = card.querySelectorAll('.target-table tbody tr');
    const discipline = getDiscipline();
    const unit = document.getElementById('dfUnit').value;
    const units = document.getElementById('units').value; // MOA or MIL

    rows.forEach((row, i) => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 3) return;
      const tgtId   = cells[0].textContent.trim();
      const distTxt = cells[1].textContent.trim();
      const sizeTxt = cells[2].textContent.trim();

      // Parse distance (strip unit suffix)
      const distNum = parseFloat(distTxt) || 300;
      // Convert to yards if in meters
      const distYd = (unit === 'm') ? Math.round(distNum * M_TO_YD) : distNum;

      // Parse size
      let moa = 2;
      let shape = 'circle';

      if (discipline === 'nrl') {
        // It's an animal name
        shape = 'animal:' + sizeTxt;
        moa   = 2; // animals render by emoji size
      } else {
        // MOA or MIL value
        const sizeNum = parseFloat(sizeTxt) || 2;
        moa = (units === 'MIL') ? sizeNum * 3.438 : sizeNum; // convert MIL to approx MOA for sizing
        shape = (i % 2 === 0) ? 'circle' : 'square';
      }

      const xPct = 0.08 + (i / Math.max(1, rows.length - 1)) * 0.84;
      createDfTarget({ dist: distYd, moa, shape, label: tgtId + ' ' + distTxt, xPct });
    });

    renderDfRulers();
  }

  /* ══════════════════════════════════════════════════════
     CUSTOM IMAGE UPLOAD
  ══════════════════════════════════════════════════════ */
  function addCustomTarget(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const src  = e.target.result;
      const dist = parseFloat(document.getElementById('dfCustomDist').value) || 300;
      const unit = document.getElementById('dfUnit').value;
      const moa  = 3; // default visual size for custom images
      createDfTarget({ dist, moa, shape: 'custom', label: dist + unit, imgSrc: src });
      renderDfRulers();
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // reset so same file can be re-uploaded
  }

  /* Deselect targets when clicking canvas bg */
  document.addEventListener('DOMContentLoaded', () => {
    const scene = document.getElementById('dfScene');
    if (scene) {
      scene.addEventListener('click', (e) => {
        if (e.target === scene || e.target.id === 'dfTargets' || e.target.id === 'dfRulers') {
          document.querySelectorAll('.df-target.selected').forEach(t => t.classList.remove('selected'));
        }
      });
    }
  });