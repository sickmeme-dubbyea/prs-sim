/* ── speed drop ── */
  function updateSpeedDrop() {
    const isOn = document.querySelector('input[name="speedDrop"]:checked').value === 'on';
    document.getElementById('sdBody').classList.toggle('active', isOn);
  }

  function getSpeedDrop() {
    const isOn = document.querySelector('input[name="speedDrop"]:checked')?.value === 'on';
    if (!isOn) return { active: false, sdf: 0 };
    const sdf = parseFloat(document.getElementById('sdFactor').value);
    return { active: true, sdf: isNaN(sdf) ? 0 : sdf };
  }