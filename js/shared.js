// ── VideoKit Shared JS ──────────────────────────────────────

// Plan limits
const PLAN_LIMITS = {
  free:     { scripts:3,  edits:8,   uploads:3,  merge:false, maxSecs:30  },
  starter:  { scripts:8,  edits:15,  uploads:3,  merge:true,  maxSecs:60  },
  pro:      { scripts:25, edits:50,  uploads:15, merge:true,  maxSecs:300 },
  business: { scripts:60, edits:999, uploads:30, merge:true,  maxSecs:600 }
};

// User
function getUser() {
  try { return JSON.parse(localStorage.getItem('vk_user'))||null; } catch(e) { return null; }
}
function saveUser(u) { localStorage.setItem('vk_user', JSON.stringify(u)); }

// Plan
function getPlan() {
  try { return localStorage.getItem('vk_plan')||'free'; } catch(e) { return 'free'; }
}

// Usage (weekly reset)
function getUsage() {
  const week = Math.floor(Date.now()/(7*24*60*60*1000));
  const key  = 'vk_usage_'+week;
  try { return JSON.parse(localStorage.getItem(key))||{scripts:0,edits:0,uploads:0}; }
  catch(e) { return {scripts:0,edits:0,uploads:0}; }
}
function saveUsage(u) {
  const week = Math.floor(Date.now()/(7*24*60*60*1000));
  localStorage.setItem('vk_usage_'+week, JSON.stringify(u));
}
function trackUsage(action) {
  const u = getUsage();
  if (u[action] !== undefined) u[action]++;
  saveUsage(u);
}
function canDo(action) {
  const lim = PLAN_LIMITS[getPlan()]||PLAN_LIMITS.free;
  const u   = getUsage();
  if (action==='merge')  return lim.merge;
  if (action==='script') return u.scripts < lim.scripts;
  if (action==='edit')   return u.edits   < lim.edits;
  if (action==='upload') return u.uploads < lim.uploads;
  return true;
}

// History
function getHistory() {
  try { return JSON.parse(localStorage.getItem('vk_history'))||[]; } catch(e) { return []; }
}
function saveToHistory(entry) {
  const h = getHistory();
  h.unshift({...entry, id:Date.now().toString(36), date:Date.now()});
  localStorage.setItem('vk_history', JSON.stringify(h.slice(0,50)));
}
function deleteFromHistory(id) {
  const h = getHistory().filter(s=>s.id!==id);
  localStorage.setItem('vk_history', JSON.stringify(h));
}

// Navigation - highlight current page
function initNav() {
  const page = window.location.pathname.split('/').pop().replace('.html','') || 'index';
  const map  = { 'index':'home', 'create':'create', 'history':'history', 'menu':'menu' };
  const active = map[page] || 'home';
  const el = document.getElementById('nav-'+active);
  if (el) el.classList.add('active');
}

// Onboarding check
function checkOnboard() {
  if (!getUser()) {
    const modal = document.getElementById('onboardModal');
    if (modal) modal.style.display = 'flex';
  }
}
function saveOnboard() {
  const name = (document.getElementById('onboardName')||{}).value||'';
  if (!name.trim()) return;
  saveUser({ name: name.trim(), joined: Date.now() });
  const modal = document.getElementById('onboardModal');
  if (modal) modal.style.display = 'none';
}

// Shared nav HTML - call this to inject nav into any page
function renderNav() {
  const nav = document.getElementById('bottomNav');
  if (!nav) return;
  nav.innerHTML = `
    <a href="index.html" id="nav-home">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>Home
    </a>
    <a href="create.html" id="nav-create">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>Create
    </a>
    <a href="history.html" id="nav-history">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
      </svg>History
    </a>
    <a href="menu.html" id="nav-menu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="8" r="4"/>
        <path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
      </svg>Menu
    </a>
  `;
  initNav();
}

window.addEventListener('DOMContentLoaded', () => {
  renderNav();
  checkOnboard();
});
