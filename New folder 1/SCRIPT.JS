/* ═══════════ DATA ═══════════ */
let db = JSON.parse(localStorage.getItem('anistream_v2') || '[]');
let currentId = null, currentEp = 0, prevPage = 'home';
const epFiles = {};
let thumbFile = null, epRowCount = 0;

const GENRES = [
  {name:'Action',icon:'ti-sword'},{name:'Adventure',icon:'ti-map'},{name:'Comedy',icon:'ti-mood-happy'},
  {name:'Drama',icon:'ti-masks-theater'},{name:'Fantasy',icon:'ti-wand'},{name:'Horror',icon:'ti-ghost'},
  {name:'Mecha',icon:'ti-robot'},{name:'Mystery',icon:'ti-question-mark'},{name:'Romance',icon:'ti-heart'},
  {name:'Sci-Fi',icon:'ti-rocket'},{name:'Slice of Life',icon:'ti-leaf'},{name:'Sports',icon:'ti-trophy'},
  {name:'Supernatural',icon:'ti-sparkles'},{name:'Thriller',icon:'ti-eye'}
];

const FAQS = [
  {q:'Is ANI ONE IN INDIA really free?', a:'Yes, 100% free. No subscriptions, no hidden fees, no ads. We believe great software should be accessible to everyone.'},
  {q:'Where are my uploaded videos stored?', a:'All your anime files are stored locally in your browser. Nothing is uploaded to any server. Your data never leaves your device.'},
  {q:'Can I watch on multiple devices?', a:'Currently your library is tied to the browser you use. Export/import features are on our roadmap for cross-device sync.'},
  {q:'What video formats are supported?', a:'ANI ONE IN INDIA supports all formats your browser supports: MP4, WebM, OGG, and MKV (in some browsers). MP4 with H.264 encoding is recommended for the best compatibility.'},
  {q:'How do I report a bug?', a:'Use the contact form above and select "Bug Report". Please include your browser name, OS, and steps to reproduce the issue.'},
];

/* ═══════════ SAVE / LOAD ═══════════ */
function saveDB() {
  localStorage.setItem('anistream_v2', JSON.stringify(db));
}

/* ═══════════ NAVIGATION ═══════════ */
function navTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('nl-' + page);
  if (el) el.classList.add('active');
  document.getElementById('page-' + page).classList.add('active');
  window.scrollTo(0, 0);
  if (page === 'home')    { renderHome(); renderStats(); }
  if (page === 'library')   renderLibrary();
  if (page === 'genres')    renderGenres();
  if (page === 'contact')   renderFaq();
  prevPage = page;
}

function goBack() {
  navTo(prevPage === 'player' ? 'home' : prevPage);
}

function toggleMobile() {
  document.getElementById('mobile-menu').classList.toggle('open');
}

function closeMobile() {
  document.getElementById('mobile-menu').classList.remove('open');
}

/* ═══════════ STATS ═══════════ */
function renderStats() {
  document.getElementById('stat-count').innerHTML = `<span>${db.length}</span>`;
  const eps = db.reduce((s, a) => s + a.episodes.length, 0);
  document.getElementById('stat-eps').innerHTML = `<span>${eps}</span>`;
}

/* ═══════════ CARD HTML ═══════════ */
function animeCard(a) {
  const thumb = a.thumbnail
    ? `<img src="${a.thumbnail}" alt="${a.title}" loading="lazy"/>`
    : `<div class="card-thumb-placeholder"><i class="ti ti-player-play"></i><span>${a.title}</span></div>`;
  return `<div class="anime-card" onclick="openPlayer('${a.id}')">
    <div class="card-thumb">
      ${thumb}
      <div class="play-over"><div class="play-ring"><i class="ti ti-player-play"></i></div></div>
      <div class="card-badges">
        <span class="cbadge cbadge-hd">HD</span>
        ${a.episodes.length ? `<span class="cbadge cbadge-ep">${a.episodes.length} EP</span>` : ''}
      </div>
      <button class="card-del" onclick="event.stopPropagation();deleteAnime('${a.id}')">
        <i class="ti ti-trash"></i>
      </button>
    </div>
    <div class="card-info">
      <div class="card-title">${a.title}</div>
      <div class="card-meta">
        <span>${a.genre}</span>
        <span class="dot"></span>
        <span>${a.status || 'Ongoing'}</span>
      </div>
    </div>
  </div>`;
}

/* ═══════════ HOME ═══════════ */
function renderHome() {
  const g = document.getElementById('recent-grid');
  const e = document.getElementById('recent-empty');
  const recent = [...db].reverse().slice(0, 8);
  if (!db.length) {
    g.innerHTML = '';
    e.style.display = 'block';
  } else {
    e.style.display = 'none';
    g.innerHTML = recent.map(animeCard).join('');
  }
  // Genre quick-pick strip (first 8 genres)
  const gg = document.getElementById('home-genre-grid');
  gg.innerHTML = GENRES.slice(0, 8).map(g =>
    `<div class="genre-card" onclick="navTo('genres')">
      <i class="ti ${g.icon}" style="display:block"></i><p>${g.name}</p>
    </div>`
  ).join('');
}

/* ═══════════ LIBRARY ═══════════ */
function renderLibrary() {
  const q  = (document.getElementById('lib-search')?.value || '').toLowerCase();
  const lg = document.getElementById('library-grid');
  const le = document.getElementById('library-empty');
  const list = [...db].reverse().filter(a => a.title.toLowerCase().includes(q));
  if (!list.length) {
    lg.innerHTML = '';
    le.style.display = 'block';
  } else {
    le.style.display = 'none';
    lg.innerHTML = list.map(animeCard).join('');
  }
}

/* ═══════════ GENRES ═══════════ */
let activeGenre = null;

function renderGenres() {
  document.getElementById('all-genre-grid').innerHTML = GENRES.map(g =>
    `<div class="genre-card" onclick="filterGenre('${g.name}')">
      <i class="ti ${g.icon}" style="display:block"></i><p>${g.name}</p>
    </div>`
  ).join('');
}

function filterGenre(genre) {
  activeGenre = genre;
  const res = db.filter(a => a.genre === genre);
  const sec = document.getElementById('genre-results');
  document.getElementById('genre-res-title').innerHTML =
    `<i class="ti ti-filter"></i> ${genre} <span style="color:var(--muted);font-weight:400;font-size:14px">(${res.length})</span>`;
  document.getElementById('genre-res-grid').innerHTML = res.length
    ? res.map(animeCard).join('')
    : `<div class="empty-state"><i class="ti ti-search-off"></i><h3>No anime found</h3><p>Upload some ${genre} anime to see them here.</p></div>`;
  sec.style.display = 'block';
  sec.scrollIntoView({ behavior: 'smooth' });
}

function clearGenreFilter() {
  document.getElementById('genre-results').style.display = 'none';
  activeGenre = null;
}

/* ═══════════ DELETE ═══════════ */
function deleteAnime(id) {
  if (!confirm('Delete this anime from your library?')) return;
  db = db.filter(a => a.id !== id);
  saveDB();
  renderHome();
  renderLibrary();
  renderStats();
  showToast('Anime deleted', 'error');
}

/* ═══════════ PLAYER ═══════════ */
function openPlayer(id) {
  const a = db.find(x => x.id === id);
  if (!a) return;
  prevPage = document.querySelector('.nav-link.active')?.id?.replace('nl-', '') || 'home';
  currentId = id;
  currentEp = 0;
  document.getElementById('player-nav-title').textContent = a.title;
  document.getElementById('player-title').textContent = a.title;
  document.getElementById('player-desc').textContent = a.description || 'No description provided.';
  document.getElementById('player-tags').innerHTML =
    `<span class="ptag">${a.genre}</span>
     <span class="ptag">${a.status || 'Ongoing'}</span>
     <span class="ptag">${a.episodes.length} Episodes</span>`;
  renderEpList(a);
  navTo('player');
  if (a.episodes.length) playEp(id, 0, true);
}

function renderEpList(a) {
  const eg = document.getElementById('ep-grid');
  if (!a.episodes.length) {
    eg.innerHTML = `<p style="font-size:13px;color:var(--muted);grid-column:1/-1">No episodes yet. Add one above.</p>`;
    return;
  }
  eg.innerHTML = a.episodes.map((ep, i) =>
    `<button class="ep-btn${i === currentEp ? ' active' : ''}" onclick="playEp('${a.id}',${i})">${i + 1}</button>`
  ).join('');
}

function playEp(animeId, idx, silent) {
  const a = db.find(x => x.id === animeId);
  if (!a || !a.episodes[idx]) return;
  currentEp = idx;
  document.querySelectorAll('.ep-btn').forEach((b, i) => b.classList.toggle('active', i === idx));
  const vw = document.getElementById('video-wrap');
  vw.innerHTML = `<video controls autoplay src="${a.episodes[idx].url}"
    style="width:100%;height:100%;display:block" onended="nextEp()"></video>`;
}

function nextEp() {
  const a = db.find(x => x.id === currentId);
  if (a && currentEp + 1 < a.episodes.length) playEp(currentId, currentEp + 1);
}

function addEpToPlaying() {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'video/*';
  inp.onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    const a = db.find(x => x.id === currentId);
    if (!a) return;
    a.episodes.push({ name: `Episode ${a.episodes.length + 1}`, url: URL.createObjectURL(f), fileName: f.name });
    saveDB();
    renderEpList(a);
    renderStats();
    showToast('Episode added!', 'success');
  };
  inp.click();
}

/* ═══════════ UPLOAD MODAL ═══════════ */
function openModal() {
  epRowCount = 0;
  thumbFile = null;
  for (const k in epFiles) delete epFiles[k];
  ['inp-title', 'inp-desc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('inp-genre').selectedIndex = 0;
  document.getElementById('inp-status').selectedIndex = 0;
  document.getElementById('ep-rows').innerHTML = '';
  document.getElementById('thumb-pill').style.display = 'none';
  document.getElementById('modal-overlay').classList.add('open');
  addEpRow();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function addEpRow() {
  const idx = epRowCount++;
  const div = document.createElement('div');
  div.className = 'ep-row';
  div.id = 'ep-row-' + idx;
  div.innerHTML = `
    <span class="ep-row-label">Ep ${idx + 1}</span>
    <span class="ep-row-name" id="ep-fn-${idx}">No file chosen</span>
    <button class="ep-pick" onclick="pickEp(${idx})"><i class="ti ti-upload"></i> Browse</button>
    ${idx > 0 ? `<button class="ep-del-btn" onclick="removeEpRow(${idx})"><i class="ti ti-x"></i></button>` : ''}
  `;
  document.getElementById('ep-rows').appendChild(div);
}

function removeEpRow(idx) {
  const el = document.getElementById('ep-row-' + idx);
  if (el) el.remove();
  delete epFiles[idx];
}

function pickEp(idx) {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'video/*';
  inp.onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    epFiles[idx] = f;
    const s = document.getElementById('ep-fn-' + idx);
    if (s) s.textContent = f.name;
  };
  inp.click();
}

function handleThumb(inp) {
  const f = inp.files[0];
  if (!f) return;
  thumbFile = f;
  document.getElementById('thumb-name').textContent = f.name;
  document.getElementById('thumb-pill').style.display = 'flex';
}

function saveAnime() {
  const title = document.getElementById('inp-title').value.trim();
  if (!title) { showToast('Please enter a title', 'error'); return; }
  const genre  = document.getElementById('inp-genre').value;
  const status = document.getElementById('inp-status').value;
  const desc   = document.getElementById('inp-desc').value.trim();
  const episodes = Object.entries(epFiles)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([i, f], n) => ({ name: `Episode ${n + 1}`, url: URL.createObjectURL(f), fileName: f.name }));
  const thumbnail = thumbFile ? URL.createObjectURL(thumbFile) : '';
  const anime = {
    id: 'a' + Date.now() + Math.random().toString(36).slice(2),
    title, genre, status, description: desc,
    thumbnail, episodes, createdAt: Date.now()
  };
  db.unshift(anime);
  saveDB();
  closeModal();
  renderHome();
  renderLibrary();
  renderStats();
  showToast(`"${title}" uploaded!`, 'success');
}

/* ═══════════ CONTACT FORM ═══════════ */
function submitContact() {
  const fname   = document.getElementById('cf-fname').value.trim();
  const email   = document.getElementById('cf-email').value.trim();
  const subject = document.getElementById('cf-subject').value;
  const msg     = document.getElementById('cf-msg').value.trim();
  if (!fname || !email || !subject || !msg) {
    showToast('Please fill all required fields', 'error');
    return;
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    showToast('Please enter a valid email', 'error');
    return;
  }
  document.getElementById('contact-form').style.display = 'none';
  document.getElementById('contact-success').style.display = 'block';
}

function resetContact() {
  document.getElementById('contact-form').style.display = 'block';
  document.getElementById('contact-success').style.display = 'none';
  ['cf-fname', 'cf-lname', 'cf-email', 'cf-msg'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('cf-subject').selectedIndex = 0;
}

/* ═══════════ FAQ ═══════════ */
function renderFaq() {
  const fl = document.getElementById('faq-list');
  if (fl.innerHTML) return; // already rendered
  fl.innerHTML = FAQS.map((f, i) => `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
      <button onclick="toggleFaq(${i})"
        style="width:100%;background:none;border:none;color:var(--text);padding:16px 20px;
               text-align:left;cursor:pointer;font-size:15px;font-weight:500;
               display:flex;justify-content:space-between;align-items:center;gap:12px;font-family:var(--font)">
        <span>${f.q}</span>
        <i class="ti ti-chevron-down" id="faq-icon-${i}"
           style="font-size:18px;color:var(--muted);flex-shrink:0;transition:transform .2s"></i>
      </button>
      <div id="faq-body-${i}"
           style="display:none;padding:0 20px 16px;color:var(--muted);font-size:14px;line-height:1.7">
        ${f.a}
      </div>
    </div>
  `).join('');
}

function toggleFaq(i) {
  const body = document.getElementById('faq-body-' + i);
  const icon = document.getElementById('faq-icon-' + i);
  const open = body.style.display === 'block';
  body.style.display = open ? 'none' : 'block';
  icon.style.transform = open ? '' : 'rotate(180deg)';
}

/* ═══════════ TOAST NOTIFICATION ═══════════ */
function showToast(msg, type = 'info') {
  const t  = document.getElementById('toast');
  const ic = document.getElementById('toast-icon');
  const ms = document.getElementById('toast-msg');
  t.className = 'toast ' + type;
  ic.className = 'ti ' + (
    type === 'success' ? 'ti-circle-check' :
    type === 'error'   ? 'ti-alert-circle'  :
                         'ti-info-circle'
  );
  ms.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

/* ═══════════ INIT ═══════════ */
renderHome();
renderStats();
renderGenres();