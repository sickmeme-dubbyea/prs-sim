/* ── equipment & custom positions ── */

  const STANDARD_EQUIPMENT = [
    { name: 'Barricade',      defaultChecked: true },
    { name: 'Tripod',         defaultChecked: false },
    { name: 'Tank Trap',      defaultChecked: false },
    { name: 'Rooftop',        defaultChecked: false },
    { name: 'Prone',          defaultChecked: false },
    { name: 'Modified Prone', defaultChecked: false },
  ];

  // Builds the full expanded position pool for stage generation.
  // Each checked item is repeated N times (its count input value).
  function getEquipmentPool() {
    const pool = [];
    document.querySelectorAll('.eq-row').forEach(row => {
      const cb  = row.querySelector('.eq-checkbox');
      const cnt = row.querySelector('.eq-count');
      if (!cb || !cb.checked) return;
      const n = Math.max(1, Math.min(10, parseInt(cnt.value) || 1));
      for (let i = 0; i < n; i++) pool.push(cb.value);
    });
    return pool;
  }

  // Creates a single equipment row element
  function makeEqRow({ name, checked = false, count = '', isCustom = false }) {
    const row = document.createElement('div');
    row.className = 'eq-row' + (checked ? ' checked' : '') + (isCustom ? ' custom' : '');

    // Checkbox (hidden)
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'eq-checkbox';
    cb.value = name;
    cb.checked = checked;

    // Visual checkbox box
    const box = document.createElement('span');
    box.className = 'eq-box';

    // Wrap for click area
    const checkWrap = document.createElement('div');
    checkWrap.className = 'eq-check-wrap';
    checkWrap.appendChild(cb);
    checkWrap.appendChild(box);

    // Label
    const label = document.createElement('span');
    label.className = 'eq-name';
    label.textContent = name;
    label.title = name;

    // Count input
    const countInput = document.createElement('input');
    countInput.type = 'number';
    countInput.className = 'eq-count';
    countInput.min = 1;
    countInput.max = 10;
    countInput.placeholder = '1';
    countInput.value = count || '';

    // Toggle checked state on click (whole row or box or label)
    function toggleRow() {
      cb.checked = !cb.checked;
      row.classList.toggle('checked', cb.checked);
    }

    checkWrap.addEventListener('click', toggleRow);
    label.addEventListener('click', toggleRow);

    row.appendChild(checkWrap);
    row.appendChild(label);
    row.appendChild(countInput);

    // Remove button for custom rows
    if (isCustom) {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'eq-remove-btn';
      removeBtn.textContent = '×';
      removeBtn.title = 'Remove';
      removeBtn.onclick = () => row.remove();
      row.appendChild(removeBtn);
    }

    return row;
  }

  // Add a custom equipment entry from the text input
  function addCustomEquipment() {
    const input = document.getElementById('eqCustomInput');
    const name  = (input.value || '').trim();
    if (!name) { input.focus(); return; }

    const list = document.getElementById('eqList');
    list.appendChild(makeEqRow({ name, checked: true, isCustom: true }));
    input.value = '';
    input.focus();
  }

  // Allow Enter key in custom input to add
  document.addEventListener('DOMContentLoaded', () => {
    const inp = document.getElementById('eqCustomInput');
    if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addCustomEquipment(); } });
  });

  // Initialize equipment list from standard items
  function initEquipment() {
    const list = document.getElementById('eqList');
    if (!list) return;
    list.innerHTML = '';
    STANDARD_EQUIPMENT.forEach(eq => {
      list.appendChild(makeEqRow({ name: eq.name, checked: eq.defaultChecked }));
    });
  }