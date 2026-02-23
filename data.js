const MOA_OPTIONS = [0.5, 1, 1.5, 2, 3, 4];
  const MIL_OPTIONS_CONST = [0.2, 0.3, 0.5, 0.7, 1.0, 1.2];

  // NRL Hunter animal silhouettes organized by difficulty tier (smallest/hardest → largest/easiest)
  // Tier 1 = smallest/hardest, Tier 3 = largest/easiest
  const NRL_ANIMALS = [
    // Tier 1 — Small / Hardest
    { name: 'Prairie Dog', label: 'Prairie Dog', tier: 1 },
    { name: 'Crow',        label: 'Crow',        tier: 1 },
    { name: 'Chicken',     label: 'Chicken',     tier: 1 },
    { name: 'Rabbit',      label: 'Rabbit',      tier: 1 },
    { name: 'Squirrel',    label: 'Squirrel',    tier: 1 },
    // Tier 2 — Medium
    { name: 'Fox',         label: 'Fox',         tier: 2 },
    { name: 'Coyote',      label: 'Coyote',      tier: 2 },
    { name: 'Turkey',      label: 'Turkey',      tier: 2 },
    { name: 'Pig',         label: 'Pig',         tier: 2 },
    { name: 'Javelina',    label: 'Javelina',    tier: 2 },
    { name: 'Otter',       label: 'Otter',       tier: 2 },
    { name: 'Bobcat',      label: 'Bobcat',      tier: 2 },
    // Tier 3 — Large / Easiest
    { name: 'Ram',         label: 'Ram',         tier: 3 },
    { name: 'Deer',        label: 'Deer',        tier: 3 },
    { name: 'Wolf',        label: 'Wolf',        tier: 3 },
    { name: 'Cougar',      label: 'Cougar',      tier: 3 },
    { name: 'Bear',        label: 'Bear',        tier: 3 },
    { name: 'Elk',         label: 'Elk',         tier: 3 },
  ];

  // Helper: get animals by tier(s)
  function animalsByTier(...tiers) {
    return NRL_ANIMALS.filter(a => tiers.includes(a.tier)).map(a => a.name);
  }

  function getDiscipline() {
    const el = document.querySelector('input[name="discipline"]:checked');
    return el ? el.value : 'prs';
  }

  function updateDiscipline() {
    const isNRL = getDiscipline() === 'nrl';
    // Hide/show scope units row (not needed for NRL animal targets)
    const unitsRow = document.getElementById('prsUnitsRow');
    if (unitsRow) unitsRow.style.display = isNRL ? 'none' : '';
    // Update size column header
    const hdr = document.getElementById('sizeColHeader');
    if (hdr) hdr.textContent = isNRL ? 'ANIMAL' : 'SIZE';
    // Rebuild table so dropdowns reflect discipline
    rebuildDistTable();
  }