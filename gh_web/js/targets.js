function getSizeOptions(units) {
    return units === 'MOA' ? MOA_OPTIONS : MIL_OPTIONS;
  }

  function buildSizeSelect(units, selectedVal) {
    const isNRL = getDiscipline() === 'nrl';
    let html = `<select>`;
    html += `<option value="auto"${selectedVal === 'auto' ? ' selected' : ''}>AUTO</option>`;
    if (isNRL) {
      const tierLabels = { 1: 'Small', 2: 'Medium', 3: 'Large' };
      let lastTier = null;
      NRL_ANIMALS.forEach(a => {
        if (a.tier !== lastTier) {
          html += `<optgroup label="── ${tierLabels[a.tier]} ──">`;
          lastTier = a.tier;
        }
        html += `<option value="${a.name}"${selectedVal === a.name ? ' selected' : ''}>${a.label}</option>`;
      });
    } else {
      getSizeOptions(units).forEach(o => {
        html += `<option value="${o}"${String(selectedVal) === String(o) ? ' selected' : ''}>${o} ${units}</option>`;
      });
    }
    html += `</select>`;
    return html;
  }

  function rebuildDistTable() {
    const count = Math.max(1, Math.min(10, parseInt(document.getElementById('targetCount').value) || 4));
    const units = document.getElementById('units').value;
    const tbody = document.getElementById('distTableBody');

    // Preserve existing row values
    const prev = Array.from(tbody.querySelectorAll('tr')).map(tr => {
      const inp = tr.querySelector('input');
      const sel = tr.querySelector('select');
      const tog = tr.querySelector('.dist-toggle');
      return {
        val:    inp  ? inp.value  : '',
        size:   sel  ? sel.value  : 'auto',
        active: tog  ? tog.classList.contains('active') : false
      };
    });

    tbody.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const p = prev[i] || { val: '', size: 'auto', active: false };
      const tr = document.createElement('tr');
      tr.innerHTML =
        `<td class="dist-id">T${i + 1}</td>` +
        `<td><input type="number" min="1" max="5000" placeholder="rnd" value="${p.val}"></td>` +
        `<td>${buildSizeSelect(units, p.size)}</td>` +
        `<td class="dist-use"><div class="dist-toggle${p.active ? ' active' : ''}" onclick="toggleDist(this)">${p.active ? '✓' : ''}</div></td>`;
      tbody.appendChild(tr);
    }
  }

  // Rebuild table when units change so size options update
  document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'units') rebuildDistTable();
  });

  function toggleDist(el) {
    el.classList.toggle('active');
    el.textContent = el.classList.contains('active') ? '✓' : '';
  }

  function getLockedTargets() {
    // Returns array of {dist, size} — dist in yards internally, size null if AUTO
    return Array.from(document.querySelectorAll('#distTableBody tr')).map(tr => {
      const active  = tr.querySelector('.dist-toggle').classList.contains('active');
      const distVal = parseInt(tr.querySelector('input').value);
      const sizeEl  = tr.querySelector('select');
      const sizeVal = sizeEl ? sizeEl.value : 'auto';
      return {
        dist: (active && distVal > 0) ? toYards(distVal) : null,
        size: (active && sizeVal !== 'auto') ? parseFloat(sizeVal) : null
      };
    });
  }

  // Keep backward-compatible alias used by generateDistances
  function getLockedDistances() {
    return getLockedTargets().map(t => t.dist);
  }