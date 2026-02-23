/* ── stage logic ── */
  function generateDistances(min, max, count, locked) {
    // min/max are in the user's chosen unit; convert to yards for internal use
    const minYd = toYards(min);
    const maxYd = toYards(max);
    return locked.map(l => l !== null ? l : Math.round(rand(minYd, maxYd)));
  }

  function pickPlate(focus, units) {
    if (getDiscipline() === 'nrl') {
      // NRL Hunter: focus maps to animal difficulty tiers
      // small   = Tier 1 only (smallest/hardest)
      // wind    = Tier 1 + 2 (small to medium)
      // elevation = Tier 2 + 3 (medium to large — varied vertical angles suit larger steel)
      // balanced  = all tiers
      // combined  = all tiers (max variety)
      let pool;
      if (focus === 'small')          pool = animalsByTier(1);
      else if (focus === 'wind')      pool = animalsByTier(1, 2);
      else if (focus === 'elevation') pool = animalsByTier(2, 3);
      else                            pool = animalsByTier(1, 2, 3);
      return pool[randInt(0, pool.length)];
    }
    const options = units === 'MOA' ? MOA_OPTIONS : MIL_OPTIONS;
    let pool = [...options];
    if (focus === 'small')     pool = options.slice(0, 2);
    if (focus === 'elevation') pool = options.slice(1, 4);
    if (focus === 'wind')      pool = options.slice(1, 3);
    return pool[randInt(0, pool.length)];
  }

  function getRoundProfile(mode) {
    const customTime = parseInt(document.getElementById('customTime').value);
    const hasCustom  = !isNaN(customTime) && customTime >= 10;
    if (mode === 'full') return { rounds: randInt(10, 13), time: hasCustom ? customTime : 105 };
    if (mode === 'mid')  return { rounds: randInt(6, 9),   time: hasCustom ? customTime : randInt(75, 91) };
    return                      { rounds: randInt(4, 7),   time: hasCustom ? customTime : randInt(45, 61) };
  }

  function allocateRounds(targets, total) {
    const alloc = targets.map(t => ({ ...t, rounds: 0 }));
    let rem = total;
    for (let i = 0; i < alloc.length && rem > 0; i++, rem--) alloc[i].rounds++;
    while (rem > 0) { alloc[randInt(0, alloc.length)].rounds++; rem--; }
    return alloc;
  }

  function buildEngagementSequence(targets) {
    let pool = [];
    targets.forEach(t => { for (let i = 0; i < t.rounds; i++) pool.push(t.id); });
    pool = shuffle(pool);
    for (let i = 1; i < pool.length; i++) {
      if (pool[i] === pool[i - 1]) {
        const swap = pool.findIndex((v, j) => j > i && v !== pool[i]);
        if (swap > i) [pool[i], pool[swap]] = [pool[swap], pool[i]];
      }
    }
    return pool;
  }

  function splitAcrossPositions(seq, positions) {
    const perPos = Math.floor(seq.length / positions.length);
    const rem    = seq.length % positions.length;
    let idx = 0;
    return positions.map((_, i) => {
      const count = perPos + (i === positions.length - 1 ? rem : 0);
      const slice = seq.slice(idx, idx + count);
      idx += count;
      return slice;
    });
  }

  function buildStage(globalMin, globalMax) {
    const targetCount  = parseInt(document.getElementById('targetCount').value);
    const focus        = document.getElementById('focus').value;
    const roundMode    = document.getElementById('roundMode').value;
    const units        = document.getElementById('units').value;
    const distUnit     = getDistUnit();
    const discipline   = getDiscipline();
    let equipment      = Array.from(document.querySelectorAll('input[type=checkbox]:checked')).map(e => e.value);
    if (!equipment.length) equipment = ['Barricade', 'Prone'];

    // Build locked target array padded to targetCount
    const lockedTargets = getLockedTargets().slice(0, targetCount);
    while (lockedTargets.length < targetCount) lockedTargets.push({ dist: null, size: null });

    const lockedDists = lockedTargets.map(t => t.dist);

    // generateDistances returns yards; convert for display
    const distancesYd      = generateDistances(globalMin, globalMax, targetCount, lockedDists);
    const distancesDisplay = distancesYd.map(d => distUnit === 'm' ? Math.round(d * YD_TO_M) : d);

    // For NRL, size is animal name; for PRS, size is numeric MOA/MIL value
    let targets = distancesDisplay.map((d, i) => ({
      id: 'T' + (i + 1),
      distance: d,
      size: lockedTargets[i].size !== null ? lockedTargets[i].size : pickPlate(focus, units)
    }));
    targets = shuffle(targets);

    const roundProfile    = getRoundProfile(roundMode);
    const allocated       = allocateRounds(targets, roundProfile.rounds);
    const engagementOrder = buildEngagementSequence(allocated);

    const posCount  = roundMode === 'full' ? 3 : (roundMode === 'mid' ? 2 : 1);
    const positions = shuffle(equipment).slice(0, Math.min(posCount, equipment.length));
    const split     = splitAcrossPositions(engagementOrder, positions);

    // Display label for size column header
    const sizeLabel = discipline === 'nrl' ? 'ANIMAL' : units;

    return { targets: allocated, split, positions, totalRounds: roundProfile.rounds, time: roundProfile.time, units, distUnit, discipline, sizeLabel };
  }