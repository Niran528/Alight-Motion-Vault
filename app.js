// ----- CONFIG -----
// Point this at your own Google Sheet (published as JSON) once you're ready.
// For now it reads the local presets.json file sitting next to this app.
const DATA_SOURCE = "presets.json";

// ----- STATE -----
let ALL_PRESETS = [];
let currentCategory = "video";
let currentSearch = "";
let favorites = JSON.parse(localStorage.getItem("mv_favorites") || "[]");

// ----- DOM -----
const listView = document.getElementById("listView");
const detailView = document.getElementById("detailView");
const statusMsg = document.getElementById("statusMsg");
const tabs = document.querySelectorAll(".tab");
const backBtn = document.getElementById("backBtn");
const brandLogo = document.getElementById("brandLogo");
const searchBtn = document.getElementById("searchBtn");
const searchWrap = document.getElementById("searchWrap");
const searchInput = document.getElementById("searchInput");
const tabsNav = document.getElementById("tabs");

// ----- INIT -----
init();

async function init() {
  showStatus("Loading presets…");
  try {
    const res = await fetch(DATA_SOURCE);
    ALL_PRESETS = await res.json();
    hideStatus();
    renderList();
  } catch (err) {
    showStatus("Couldn't load presets. Check presets.json exists and is valid JSON.");
    console.error(err);
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

// ----- TABS -----
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.cat;
    renderList();
  });
});

// ----- SEARCH -----
searchBtn.addEventListener("click", () => {
  searchWrap.hidden = !searchWrap.hidden;
  if (!searchWrap.hidden) searchInput.focus();
  else { searchInput.value = ""; currentSearch = ""; renderList(); }
});
searchInput.addEventListener("input", e => {
  currentSearch = e.target.value.trim().toLowerCase();
  renderList();
});

// ----- BACK -----
backBtn.addEventListener("click", showList);
brandLogo.addEventListener("click", showList);

// ----- RENDER: LIST -----
function renderList() {
  detailView.hidden = true;
  listView.hidden = false;
  tabsNav.hidden = false;
  backBtn.hidden = true;

  let items = ALL_PRESETS.filter(p => p.category === currentCategory);
  if (currentSearch) {
    items = items.filter(p =>
      p.title.toLowerCase().includes(currentSearch) ||
      p.author.toLowerCase().includes(currentSearch)
    );
  }

  if (items.length === 0) {
    listView.innerHTML = "";
    showStatus("No presets here yet. Add some to presets.json.");
    return;
  }
  hideStatus();

  listView.innerHTML = items.map(p => `
    <button class="preset-card" data-id="${p.id}">
      <div class="thumb">${p.thumbnail ? `<img src="${p.thumbnail}" alt="${escapeHtml(p.title)}" loading="lazy"/>` : "No preview"}</div>
      <div class="card-info">
        <p class="card-title">${escapeHtml(p.title)}</p>
        <p class="card-author">Author&nbsp;| <span>${escapeHtml(p.author)}</span></p>
      </div>
    </button>
  `).join("");

  listView.querySelectorAll(".preset-card").forEach(card => {
    card.addEventListener("click", () => showDetail(card.dataset.id));
  });
}

// ----- RENDER: DETAIL -----
function showDetail(id) {
  const p = ALL_PRESETS.find(x => x.id === id);
  if (!p) return;

  listView.hidden = true;
  tabsNav.hidden = true;
  searchWrap.hidden = true;
  backBtn.hidden = false;
  detailView.hidden = false;

  const isFav = favorites.includes(p.id);

  detailView.innerHTML = `
    <div class="detail-header">
      <div>
        <h1 class="detail-title">${escapeHtml(p.title)}</h1>
        <p class="detail-author">${escapeHtml(p.author)}</p>
      </div>
      <button class="save-btn ${isFav ? "saved" : ""}" id="favBtn" aria-label="Save">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="${isFav ? "currentColor" : "none"}"><path d="M6 4h12v16l-6-4-6 4V4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <div class="detail-preview">
      ${p.thumbnail ? `<img src="${p.thumbnail}" alt="${escapeHtml(p.title)}"/>` : "No preview"}
    </div>

    <div class="action-list">
      ${actionRow("download", "Download XML", p.xmlUrl)}
      ${actionRow("link", "Direct link for AM", p.directLink)}
      ${actionRow("share", "Share this", null, true)}
    </div>
  `;

  document.getElementById("favBtn").addEventListener("click", () => toggleFavorite(p.id));

  const shareItem = document.getElementById("action-share");
  if (shareItem) shareItem.addEventListener("click", () => sharePreset(p));

  window.scrollTo(0, 0);
}

function actionRow(type, label, url, isShare = false) {
  const icons = {
    download: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    link: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    share: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" stroke="currentColor" stroke-width="2"/></svg>`
  };
  const disabled = !isShare && !url;
  const tag = isShare ? "button" : "a";
  const attrs = isShare
    ? `id="action-share"`
    : (disabled ? `` : `href="${url}" target="_blank" rel="noopener"`);

  return `<${tag} class="action-item ${disabled ? "disabled" : ""}" ${attrs}>
      <span class="action-icon">${icons[type]}</span>
      ${label}
    </${tag}>`;
}

// ----- FAVORITES -----
function toggleFavorite(id) {
  if (favorites.includes(id)) favorites = favorites.filter(f => f !== id);
  else favorites.push(id);
  localStorage.setItem("mv_favorites", JSON.stringify(favorites));
  showDetail(id);
}

// ----- SHARE -----
async function sharePreset(p) {
  const shareData = {
    title: p.title,
    text: `Check out this Alight Motion preset: ${p.title}`,
    url: p.directLink || p.xmlUrl || location.href
  };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch (e) {}
  } else {
    await navigator.clipboard.writeText(shareData.url);
    toast("Link copied to clipboard");
  }
}

// ----- HELPERS -----
function showList() { renderList(); }

function showStatus(msg) { statusMsg.hidden = false; statusMsg.textContent = msg; }
function hideStatus() { statusMsg.hidden = true; }

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

let toastTimer;
function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2000);
}
