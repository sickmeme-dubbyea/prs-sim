/* ── theme ── */
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    // Update reticle SVG colors per theme
    const reticleParts = document.querySelectorAll('.reticle svg circle, .reticle svg line');
    if (theme === 'nvg') {
      reticleParts.forEach(el => {
        if (el.getAttribute('stroke') === '#e8a832' || el.getAttribute('stroke') === '#000000') el.setAttribute('stroke', '#39ff39');
        else el.setAttribute('stroke', '#00c800');
      });
    } else if (theme === 'day') {
      reticleParts.forEach(el => {
        el.setAttribute('stroke', el.getAttribute('stroke-width') === '1.5' ? '#000000' : '#333333');
      });
    } else {
      reticleParts.forEach(el => {
        if (el.getAttribute('stroke') === '#39ff39' || el.getAttribute('stroke') === '#000000' || el.getAttribute('stroke') === '#333333') {
          el.setAttribute('stroke', el.getAttribute('stroke-width') === '1.5' ? '#e8a832' : '#c8922a');
        } else {
          el.setAttribute('stroke', '#c8922a');
        }
      });
    }
    try { localStorage.setItem('prs-theme', theme); } catch(e) {}
  }
  const MIL_OPTIONS = [0.2, 0.3, 0.5, 0.7, 1.0, 1.2];

  /* ── utils ── */
  const rand    = (mn, mx) => Math.random() * (mx - mn) + mn;
  const randInt = (mn, mx) => Math.floor(rand(mn, mx));
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  /* ── help modal ── */
  function openHelp()  { document.getElementById('helpModal').classList.add('open'); }
  function closeHelp() { document.getElementById('helpModal').classList.remove('open'); }
  function closeHelpOnBg(e) { if (e.target === document.getElementById('helpModal')) closeHelp(); }

  /* ── mode ── */
  function updateMode() {
    const isMatch = document.querySelector('input[name="mode"]:checked').value === 'match';
    document.getElementById('matchPanel').classList.toggle('hidden', !isMatch);
  }