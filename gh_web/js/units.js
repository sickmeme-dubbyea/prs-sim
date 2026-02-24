/* ── distance table & unit helpers ── */
  const YD_TO_M = 0.9144;
  const M_TO_YD = 1.09361;

  function getDistUnit() {
    return document.getElementById('distUnit') ? document.getElementById('distUnit').value : 'yd';
  }

  function toYards(val) {
    return getDistUnit() === 'm' ? Math.round(val * M_TO_YD) : val;
  }

  function fromYards(val) {
    return getDistUnit() === 'm' ? Math.round(val * YD_TO_M) : val;
  }

  function updateDistUnit() {
    const unit = getDistUnit();
    const unitUpper = unit.toUpperCase();
    // Update all unit labels
    ['rangeUnitLabel','rangeUnitLabel2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = unitUpper;
    });
    const dpu = document.getElementById('distPanelUnit');
    if (dpu) dpu.textContent = unit;
    const dtu = document.getElementById('distTableUnit');
    if (dtu) dtu.textContent = unitUpper;
    // Convert range inputs
    const minEl = document.getElementById('minDist');
    const maxEl = document.getElementById('maxDist');
    if (unit === 'm') {
      minEl.value = Math.round(parseInt(minEl.value) * YD_TO_M);
      maxEl.value = Math.round(parseInt(maxEl.value) * YD_TO_M);
    } else {
      minEl.value = Math.round(parseInt(minEl.value) * M_TO_YD);
      maxEl.value = Math.round(parseInt(maxEl.value) * M_TO_YD);
    }
    // Convert any locked distances in the table
    const rows = document.querySelectorAll('#distTableBody tr');
    rows.forEach(tr => {
      const inp = tr.querySelector('input');
      const val = parseInt(inp.value);
      if (val > 0) {
        inp.value = unit === 'm' ? Math.round(val * YD_TO_M) : Math.round(val * M_TO_YD);
      }
    });
  }

  function updateCustomDist() {
    const on = document.querySelector('input[name="customDist"]:checked').value === 'yes';
    const panel = document.getElementById('distPanel');
    if (panel) panel.style.display = on ? 'block' : 'none';
  }

  function toggleDistPanel() {
    const body = document.getElementById('distPanelBody');
    const btn  = document.getElementById('distPanelToggle');
    body.classList.toggle('collapsed');
    btn.textContent = body.classList.contains('collapsed') ? '▼ SHOW' : '▲ HIDE';
  }