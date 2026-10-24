// Renders the site from js/content.js. You shouldn't need to edit this file.

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Shared bits on every page
document.querySelectorAll("[data-site]").forEach((el) => {
  const key = el.dataset.site;
  if (SITE[key]) el.textContent = key === "handle" ? SITE[key].toUpperCase() : SITE[key];
});
document.querySelectorAll("#year").forEach((el) => (el.textContent = new Date().getFullYear()));

// Placeholder art: an image if one is set, otherwise a pixel "no signal" panel
function art(src, label, accent) {
  if (src) return `<img src="${esc(src)}" alt="${esc(label)}" loading="lazy">`;
  return `<div class="placeholder accent-${esc(accent || "saffron")}"><span>${esc(label)}</span></div>`;
}

// ---------- Home page ----------
const stats = document.getElementById("stats");
if (stats) {
  stats.innerHTML = SITE.stats
    .map((s) => `<div class="stat"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`)
    .join("");
}

const gamesGrid = document.getElementById("games-grid");
if (gamesGrid) {
  gamesGrid.innerHTML = GAMES.map(
    (g, i) => `
    <a class="game-card accent-${esc(g.accent)}" href="game.html?g=${encodeURIComponent(g.slug)}">
      <div class="game-art">${art(g.cover, g.title, g.accent)}</div>
      <div class="game-body">
        <p class="game-num">STAGE ${String(i + 1).padStart(2, "0")}</p>
        <h3>${esc(g.title)}</h3>
        <p class="game-meta">${esc(g.genre)} · ${esc(g.platform)}</p>
        <p class="game-pitch">${esc(g.pitch)}</p>
        <span class="tag">${esc(g.status)}</span>
      </div>
    </a>`
  ).join("");
}

const exploreGrid = document.getElementById("explore-grid");
if (exploreGrid) {
  exploreGrid.innerHTML = EXPLORATIONS.map((e) => {
    const tag = e.url ? "a" : "div";
    const href = e.url ? ` href="${esc(e.url)}" target="_blank" rel="noopener"` : "";
    return `
    <${tag} class="explore-card"${href}>
      <div class="explore-art">${art(e.image, e.type, "teal")}</div>
      <p class="explore-type">${esc(e.type)}</p>
      <h3>${esc(e.title)}</h3>
      <p>${esc(e.summary)}</p>
    </${tag}>`;
  }).join("");
}

const contactLinks = document.getElementById("contact-links");
if (contactLinks) {
  const labels = { email: "Email", itch: "itch.io", github: "GitHub", linkedin: "LinkedIn", youtube: "YouTube", twitter: "X / Twitter", instagram: "Instagram" };
  contactLinks.innerHTML = Object.entries(SITE.contact)
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const href = k === "email" ? `mailto:${v}` : v;
      const shown = k === "email" ? v : v.replace(/^https?:\/\//, "").replace(/\/$/, "");
      return `<a class="contact-link" href="${esc(href)}" target="_blank" rel="noopener">
        <span class="contact-key">${esc(labels[k] || k)}</span><span class="contact-val">${esc(shown)}</span></a>`;
    })
    .join("");
}

// ---------- Game page ----------
const gamePage = document.getElementById("game-page");
if (gamePage) {
  const slug = new URLSearchParams(location.search).get("g");
  const g = GAMES.find((x) => x.slug === slug);

  if (!g) {
    gamePage.innerHTML = `<section class="section"><h1 class="hero-name">GAME OVER</h1>
      <p>That game wasn't found. <a href="index.html#games">Back to the games</a></p></section>`;
  } else {
    document.title = `${g.title} · ${SITE.name}`;
    const list = (items) => items.map((x) => `<li>${esc(x)}</li>`).join("");

    const shots = g.screenshots.length
      ? g.screenshots.map((s) => `<div class="shot">${art(s, g.title)}</div>`).join("")
      : [1, 2, 3].map((n) => `<div class="shot">${art("", `Screenshot ${n}`, g.accent)}</div>`).join("");

    const docs = g.docs.length
      ? g.docs.map((d) => `<a class="doc-card" href="${esc(d.url)}" target="_blank" rel="noopener">
          <b>${esc(d.title)}</b><span>${esc(d.note || "")}</span></a>`).join("")
      : `<div class="doc-card empty"><b>Documentation loading…</b><span>Design docs are on the way.</span></div>`;

    const links = g.links.length
      ? g.links.map((l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")
      : `<span class="btn btn-disabled">Coming soon</span>`;

    gamePage.innerHTML = `
      <section class="game-hero accent-${esc(g.accent)}">
        <a class="back" href="index.html#games">◀ All games</a>
        <div class="game-hero-grid">
          <div class="game-hero-art">${art(g.cover, g.title, g.accent)}</div>
          <div>
            <span class="tag">${esc(g.status)}</span>
            <h1 class="game-title">${esc(g.title)}</h1>
            <p class="game-pitch big">${esc(g.pitch)}</p>
            <dl class="specs">
              <div><dt>Genre</dt><dd>${esc(g.genre)}</dd></div>
              <div><dt>Platform</dt><dd>${esc(g.platform)}</dd></div>
              <div><dt>Style</dt><dd>${esc(g.style)}</dd></div>
            </dl>
            <div class="game-links">${links}</div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title small">Story</h2>
        <p class="prose">${esc(g.story)}</p>
        ${g.role ? `<h2 class="section-title small">My role</h2><p class="prose">${esc(g.role)}</p>` : ""}
        <h2 class="section-title small">Features</h2>
        <ul class="features">${list(g.features)}</ul>
      </section>

      ${g.trailer ? `<section class="section"><h2 class="section-title small">Trailer</h2>
        <div class="video"><iframe src="${esc(g.trailer)}" title="${esc(g.title)} trailer" allowfullscreen></iframe></div></section>` : ""}

      <section class="section">
        <h2 class="section-title small">Screenshots</h2>
        <div class="shots">${shots}</div>
      </section>

      <section class="section">
        <h2 class="section-title small">Documentation</h2>
        <div class="docs">${docs}</div>
      </section>`;
  }
}
