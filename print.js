/* ── print / export ── */
  function printStages() {
    const output = document.getElementById('output');
    if (!output || !output.querySelector('.stage-card')) {
      alert('No stages generated yet. Generate a stage or match first.');
      return;
    }

    // Remove any previous print header
    const prev = document.getElementById('printHeaderBlock');
    if (prev) prev.remove();

    const discipline = getDiscipline();
    const mode       = document.querySelector('input[name="mode"]:checked').value;
    const unit       = getDistUnit();
    const minD       = document.getElementById('minDist').value;
    const maxD       = document.getElementById('maxDist').value;
    const now        = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const cards      = document.querySelectorAll('.stage-card').length;
    const modeLabel  = mode === 'match' ? `${cards}-Stage Match` : 'Single Stage';
    const discLabel  = discipline === 'nrl' ? 'NRL Hunter' : 'PRS';

    const hdr = document.createElement('div');
    hdr.id = 'printHeaderBlock';
    hdr.className = 'print-header';
    hdr.innerHTML = `
      <h2>PRS &amp; NRL Hunter Stage Builder — ${discLabel} // ${modeLabel}</h2>
      <p>Generated ${now} &nbsp;|&nbsp; Range: ${minD}–${maxD} ${unit} &nbsp;|&nbsp; v1.3.1 &nbsp;|&nbsp; C. Witherspoon / @dubs_does</p>
    `;
    output.insertBefore(hdr, output.firstChild);
    window.print();

    setTimeout(() => {
      const h = document.getElementById('printHeaderBlock');
      if (h) h.remove();
    }, 1500);
  }

  function clearOutput() {
    document.getElementById('output').innerHTML = '';
    document.getElementById('emptyState').style.display = '';
    document.getElementById('outputToolbar').style.display = 'none';
  }