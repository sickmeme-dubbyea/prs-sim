/* ── generate ── */
  function generate() {
    const mode      = document.querySelector('input[name="mode"]:checked').value;
    const globalMin = parseInt(document.getElementById('minDist').value);
    const globalMax = parseInt(document.getElementById('maxDist').value);

    if (globalMin >= globalMax) { alert('MIN distance must be less than MAX distance.'); return; }
    if (isNaN(globalMin) || isNaN(globalMax)) { alert('Please enter valid distance values.'); return; }

    document.getElementById('emptyState').style.display = 'none';
    let output = '';

    if (mode === 'single') {
      output = renderStage(buildStage(globalMin, globalMax));
    } else {
      const stageCount = parseInt(document.getElementById('stageCount').value);
      for (let i = 0; i < stageCount; i++) output += renderStage(buildStage(globalMin, globalMax), i);
    }

    document.getElementById('output').innerHTML = output;
    document.getElementById('outputToolbar').style.display = output.trim() ? 'flex' : 'none';
  }