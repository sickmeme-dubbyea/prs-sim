/* ── render ── */
  function renderStage(stage, index = null) {
    const title = index !== null ? `STAGE ${String(index + 1).padStart(2, '0')}` : 'SINGLE STAGE';
    const delay = (index || 0) * 70;

    let h = `<div class="stage-card" style="animation-delay:${delay}ms">`;

    h += `<div class="stage-header">
      <div class="stage-num">${title}</div>
      <div class="stage-meta">
        <div class="meta-item">TIME LIMIT<br><span>${stage.time}s</span></div>
        <div class="meta-item">TOTAL RDS<br><span>${stage.totalRounds}</span></div>
        <div class="meta-item">POSITIONS<br><span>${stage.positions.length}</span></div>
      </div>
    </div>`;

    h += `<div class="stage-body"><div>`;
    const sizeHdr = stage.discipline === 'nrl' ? 'ANIMAL' : 'SIZE';
    h += `<table class="target-table"><thead><tr><th>TGT</th><th>DIST</th><th>${sizeHdr}</th><th>RDS</th></tr></thead><tbody>`;
    stage.targets.forEach(t => {
      const sizeDisplay = stage.discipline === 'nrl'
        ? t.size
        : `${t.size} ${stage.units}`;
      h += `<tr><td>${t.id}</td><td>${t.distance}${stage.distUnit}</td><td>${sizeDisplay}</td><td>${t.rounds}</td></tr>`;
    });
    h += `</tbody></table></div>`;

    h += `<div class="cof-section"><div class="cof-label">Course of Fire</div>`;
    stage.positions.forEach((pos, i) => {
      const shots = stage.split[i];
      h += `<div class="position-block"><div class="position-name">◆ ${pos}</div><div class="shot-sequence">`;
      shots.forEach((s, j) => {
        h += `<div class="shot-chip">${s}</div>`;
        if (j < shots.length - 1) h += `<span class="shot-arrow">›</span>`;
      });
      h += `</div></div>`;
    });
    h += `</div></div></div>`;
    return h;
  }