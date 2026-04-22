const petEl        = document.getElementById('pet');
const counterEl    = document.getElementById('counter');
const progressBar  = document.getElementById('progress-bar');
const callBtn      = document.getElementById('call-btn');
const goalInput    = document.getElementById('goal-input');
const goalBtn      = document.getElementById('goal-btn');
const statsToggle  = document.getElementById('stats-toggle');
const statsPanel   = document.getElementById('stats-panel');
const resetBtn     = document.getElementById('reset-btn');
const closeBtn     = document.getElementById('close-btn');

const COMPACT_HEIGHT  = 360;
const EXPANDED_HEIGHT = 600;

let data       = { quota: 20, history: [] };
let statsOpen  = false;

// ── Date helpers ──────────────────────────────────────────────────────────────

function localDateStr(d = new Date()) {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function today() {
  return localDateStr();
}

// ── Data helpers ──────────────────────────────────────────────────────────────

function getTodayEntry() {
  const t = today();
  let entry = data.history.find(h => h.date === t);
  if (!entry) {
    entry = { date: t, calls: 0 };
    data.history.push(entry);
  }
  return entry;
}

function getLast7Days() {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = localDateStr(d);
    const entry = data.history.find(h => h.date === dateStr);
    result.push({ date: dateStr, calls: entry ? entry.calls : 0 });
  }
  return result;
}

function calcStreak() {
  const t = today();
  const todayEntry = data.history.find(h => h.date === t);
  const hasTodayCalls = todayEntry && todayEntry.calls > 0;

  let streak = 0;
  // If today has calls, start counting from today; otherwise start from yesterday
  const startOffset = hasTodayCalls ? 0 : 1;

  for (let i = startOffset; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = localDateStr(d);
    const entry = data.history.find(h => h.date === dateStr);
    if (entry && entry.calls > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

async function save() {
  await window.api.saveData(data);
}

// ── UI update ─────────────────────────────────────────────────────────────────

function updateUI() {
  const entry = getTodayEntry();
  const calls = entry.calls;
  const quota = data.quota;
  const pct   = Math.min(100, Math.round((calls / quota) * 100));

  // Counter
  counterEl.innerHTML = `${calls} <span class="denom">/ ${quota} calls</span>`;

  // Progress bar
  progressBar.style.width = pct + '%';
  progressBar.className = '';
  if (calls >= quota) {
    progressBar.classList.add('done');
    callBtn.classList.add('done');
    callBtn.textContent = '+ Call ✓';
  } else {
    callBtn.classList.remove('done');
    callBtn.textContent = '+ Call';
    if (pct >= 80) progressBar.classList.add('warning');
  }

  // Goal input placeholder
  goalInput.placeholder = `Goal: ${quota}`;

  if (statsOpen) updateStats();
}

function updateStats() {
  const t       = today();
  const last7   = getLast7Days();
  const maxCalls = Math.max(...last7.map(d => d.calls), 1);

  // Bar chart
  const barsWrap = document.getElementById('bars-wrap');
  barsWrap.innerHTML = '';
  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  last7.forEach(({ date, calls }) => {
    const isToday   = date === t;
    const isGoalHit = calls >= data.quota;
    const barH      = calls > 0 ? Math.max(4, Math.round((calls / maxCalls) * 52)) : 2;

    const col = document.createElement('div');
    col.className = 'bar-col';

    const valEl = document.createElement('div');
    valEl.className = 'bar-val';
    valEl.textContent = calls > 0 ? calls : '';

    const bar = document.createElement('div');
    bar.className = 'bar' + (isToday ? ' today' : isGoalHit ? ' goal-hit' : '');
    bar.style.height = barH + 'px';

    const lbl = document.createElement('div');
    lbl.className = 'bar-label' + (isToday ? ' today' : '');
    const dateObj = new Date(date + 'T12:00:00');
    lbl.textContent = dayLabels[dateObj.getDay()];

    col.appendChild(valEl);
    col.appendChild(bar);
    col.appendChild(lbl);
    barsWrap.appendChild(col);
  });

  // Week total (last 7 days)
  const weekTotal = last7.reduce((s, d) => s + d.calls, 0);
  document.getElementById('stat-week').textContent = weekTotal;

  // Month total
  const thisMonth = t.slice(0, 7);
  const monthTotal = data.history
    .filter(h => h.date.startsWith(thisMonth))
    .reduce((s, h) => s + h.calls, 0);
  document.getElementById('stat-month').textContent = monthTotal;

  // Best day ever
  const best = data.history.length > 0
    ? Math.max(...data.history.map(h => h.calls))
    : 0;
  document.getElementById('stat-best').textContent = best;

  // Streak
  document.getElementById('stat-streak').textContent = calcStreak();
}

// ── Animations ────────────────────────────────────────────────────────────────

function animatePet(type) {
  petEl.src = 'assets/click.png';
  petEl.classList.remove('bounce', 'celebrate');
  void petEl.offsetWidth; // force reflow to restart animation
  petEl.classList.add(type);

  const duration = type === 'celebrate' ? 700 : 350;
  setTimeout(() => {
    petEl.src = 'assets/idle.png';
    petEl.classList.remove('bounce', 'celebrate');
  }, duration);
}

// ── Event listeners ───────────────────────────────────────────────────────────

callBtn.addEventListener('click', async () => {
  const entry      = getTodayEntry();
  const wasAtGoal  = entry.calls >= data.quota;

  entry.calls++;

  const justHit = !wasAtGoal && entry.calls >= data.quota;

  if (justHit) {
    animatePet('celebrate');
    await window.api.notify(
      'Goal reached! 🎉',
      `You made ${entry.calls} calls today. Great work!`
    );
  } else {
    animatePet('bounce');
  }

  updateUI();
  await save();
});

goalBtn.addEventListener('click', async () => {
  const val = parseInt(goalInput.value);
  if (!isNaN(val) && val > 0) {
    data.quota = val;
    goalInput.value = '';
    updateUI();
    await save();
  }
});

goalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') goalBtn.click();
});

statsToggle.addEventListener('click', async () => {
  statsOpen = !statsOpen;
  await window.api.setHeight(statsOpen ? EXPANDED_HEIGHT : COMPACT_HEIGHT);
  statsPanel.classList.toggle('open', statsOpen);
  statsToggle.textContent = statsOpen ? '▴ Stats' : '▾ Stats';
  if (statsOpen) updateStats();
});

resetBtn.addEventListener('click', async () => {
  const entry = getTodayEntry();
  entry.calls = 0;
  updateUI();
  await save();
});

closeBtn.addEventListener('click', () => window.close());

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  data = await window.api.loadData();
  getTodayEntry(); // ensure today's entry exists
  updateUI();
}

init();
