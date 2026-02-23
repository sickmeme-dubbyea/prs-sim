/* ── init ── */
  updateMode();
  updateDiscipline();
  updateCustomDist();
  rebuildDistTable();
  // Restore saved theme
  try {
    const saved = localStorage.getItem('prs-theme');
    if (saved && saved !== 'amber') setTheme(saved);
  } catch(e) {}