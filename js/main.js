// Renders the site from js/content.js. You shouldn't need to edit this file.

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Shared ----------
document.querySelectorAll("[data-site]").forEach((el) => {
  if (SITE[el.dataset.site]) el.textContent = SITE[el.dataset.site];
});
document.querySelectorAll("#year").forEach((el) => (el.textContent = new Date().getFullYear()));

// Image if set, otherwise an atmospheric placeholder
function art(src, label, accent) {
  if (src) return `<img src="${esc(src)}" alt="${esc(label)}" loading="lazy">`;
  return `<div class="placeholder accent-${esc(accent || "marigold")}"><span>${esc(label)}</span></div>`;
}

// Cover for a game: mobile games show their screens as phones, others use the cover image
function cover(g) {
  if (g.portrait && g.screenshots.length) {
    return `<div class="phones accent-${esc(g.accent)}">${g.screenshots.slice(0, 3)
      .map((s, i) => `<div class="phone" style="--n:${i}"><img src="${esc(s)}" alt="${esc(g.title)} screen ${i + 1}" loading="lazy"></div>`)
      .join("")}</div>`;
  }
  return art(g.cover, g.genre, g.accent);
}

// Which game a screenshot belongs to (for captions)
const gameFor = (src) => GAMES.find((g) => g.screenshots.includes(src) || g.cover === src);

// Nav gets a backdrop once you scroll
const nav = document.querySelector(".nav");
const onScroll = () => nav.classList.toggle("scrolled", scrollY > 40);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- Hero: name reveal, showreel, embers ----------
document.querySelectorAll("[data-split]").forEach((el) => {
  const text = el.textContent;
  el.setAttribute("aria-label", text);
  el.innerHTML = [...text]
    .map((ch, i) => `<span class="ch" aria-hidden="true" style="--i:${i}">${ch === " " ? "&nbsp;" : esc(ch)}</span>`)
    .join("");
});

const heroMedia = document.getElementById("hero-media");
if (heroMedia) {
  const reel = SITE.showreel || {};
  if (reel.file) {
    heroMedia.insertAdjacentHTML(
      "afterbegin",
      `<video class="hero-video" src="${esc(reel.file)}" ${reel.poster ? `poster="${esc(reel.poster)}"` : ""}
        autoplay muted loop playsinline preload="auto"></video>`
    );
  } else if (reel.slides && reel.slides.length) {
    // No video yet: crossfade through gameplay stills with a slow pan
    heroMedia.insertAdjacentHTML(
      "afterbegin",
      `<div class="slides">${reel.slides.map((src, i) => `<img class="slide${i ? "" : " on"}" src="${esc(src)}" alt="">`).join("")}</div>`
    );
    const slides = heroMedia.querySelectorAll(".slide");
    const caption = document.getElementById("hero-caption");
    let cur = 0;
    const label = () => {
      const g = gameFor(reel.slides[cur]);
      caption.innerHTML = g ? `<span>Now showing</span> ${esc(g.title)}` : "";
    };
    label();
    if (slides.length > 1 && !reduceMotion) {
      setInterval(() => {
        slides[cur].classList.remove("on");
        cur = (cur + 1) % slides.length;
        slides[cur].classList.add("on");
        label();
      }, 5000);
    }
  }

  // Full showreel modal (YouTube if set, else the local file with sound)
  const modal = document.getElementById("reel-modal");
  const body = document.getElementById("reel-body");
  const btn = document.getElementById("reel-btn");
  if (!reel.file && !reel.youtube) btn.hidden = true;
  btn.addEventListener("click", () => {
    body.innerHTML = reel.youtube
      ? `<iframe src="https://www.youtube.com/embed/${esc(reel.youtube)}?autoplay=1&rel=0" allow="autoplay; fullscreen" allowfullscreen title="Showreel"></iframe>`
      : `<video src="${esc(reel.file)}" controls autoplay playsinline></video>`;
    modal.hidden = false;
  });
  const close = () => { modal.hidden = true; body.innerHTML = ""; };
  document.getElementById("reel-close").addEventListener("click", close);
  modal.addEventListener("click", (e) => e.target === modal && close());
  addEventListener("keydown", (e) => e.key === "Escape" && close());

  // Drifting embers
  const cv = document.getElementById("embers");
  const ctx = cv.getContext("2d");
  let w, h, parts;
  const resize = () => {
    w = cv.width = cv.offsetWidth * devicePixelRatio;
    h = cv.height = cv.offsetHeight * devicePixelRatio;
    parts = Array.from({ length: Math.min(50, Math.round(w / 30)) }, () => spawn(true));
  };
  const spawn = (anywhere) => ({
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : h + 10,
    r: (Math.random() * 1.8 + 0.6) * devicePixelRatio,
    vy: (Math.random() * 0.5 + 0.2) * devicePixelRatio,
    vx: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
    a: Math.random() * 0.6 + 0.2,
    t: Math.random() * Math.PI * 2,
  });
  const tick = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.t += 0.02; p.y -= p.vy; p.x += p.vx + Math.sin(p.t) * 0.3;
      if (p.y < -10) Object.assign(p, spawn(false));
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, `rgba(255, 205, 90, ${p.a * 0.8})`);
      g.addColorStop(1, "rgba(242, 181, 42, 0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(tick);
  };
  resize();
  addEventListener("resize", resize);
  if (!reduceMotion) tick();
}

// ---------- Home sections ----------
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
    <a class="game-card reveal tilt accent-${esc(g.accent)}" href="game.html?g=${encodeURIComponent(g.slug)}" style="--d:${i * 90}ms">
      <div class="game-art">${cover(g)}</div>
      <div class="game-body">
        <div class="game-top">
          <span class="game-num">${String(i + 1).padStart(2, "0")}</span>
          <span class="tag">${esc(g.status)}</span>
        </div>
        <h3>${esc(g.title)}</h3>
        ${g.subtitle ? `<p class="game-subtitle">${esc(g.subtitle)}</p>` : ""}
        <p class="game-meta">${esc(g.genre)} · ${esc(g.platform)}</p>
        <p class="game-pitch">${esc(g.pitch)}</p>
        <span class="more">Discover <span class="arrow">→</span></span>
      </div>
    </a>`
  ).join("");
}

const exploreGrid = document.getElementById("explore-grid");
if (exploreGrid) {
  exploreGrid.innerHTML = EXPLORATIONS.map((e, i) => {
    const tag = e.url ? "a" : "div";
    const href = e.url ? ` href="${esc(e.url)}" target="_blank" rel="noopener"` : "";
    return `
    <${tag} class="explore-card reveal tilt" style="--d:${i * 80}ms"${href}>
      <div class="explore-art">${art(e.image, e.type, ["marigold", "teal", "rose", "cyan"][i % 4])}</div>
      <p class="explore-type">${esc(e.type)}</p>
      <h3>${esc(e.title)}</h3>
      <p class="explore-sum">${esc(e.summary)}</p>
    </${tag}>`;
  }).join("");
}

const contactLinks = document.getElementById("contact-links");
if (contactLinks) {
  const labels = { email: "Email", itch: "itch.io", github: "GitHub", linkedin: "LinkedIn", youtube: "YouTube", twitter: "X", instagram: "Instagram", artstation: "ArtStation" };
  contactLinks.innerHTML = Object.entries(SITE.contact)
    .filter(([, v]) => v)
    .map(([k, v], i) => {
      const href = k === "email" ? `mailto:${v}` : v;
      const shown = k === "email" ? v : v.replace(/^https?:\/\//, "").replace(/\/$/, "");
      return `<a class="contact-link reveal" style="--d:${i * 80}ms" href="${esc(href)}" target="_blank" rel="noopener">
        <span class="contact-key">${esc(labels[k] || k)}</span>
        <span class="contact-val">${esc(shown)}</span>
        <span class="arrow">→</span></a>`;
    })
    .join("");
}

// ---------- Game page ----------
const gamePage = document.getElementById("game-page");
if (gamePage) {
  const slug = new URLSearchParams(location.search).get("g");
  const g = GAMES.find((x) => x.slug === slug);

  if (!g) {
    gamePage.innerHTML = `<section class="section"><h1 class="game-title">You Died</h1>
      <p class="prose">That game wasn't found. <a href="index.html#games">Return to the games</a></p></section>`;
  } else {
    document.title = `${g.title} · ${SITE.name}`;
    const list = (items) => items.map((x, i) => `<li class="reveal" style="--d:${i * 60}ms">${esc(x)}</li>`).join("");

    const shots = g.screenshots.length
      ? g.screenshots.map((s, i) => `<button type="button" class="shot reveal${g.portrait ? " tall" : ""}" style="--d:${i * 80}ms" data-full="${esc(s)}" aria-label="View screenshot ${i + 1} larger">${art(s, g.title)}</button>`).join("")
      : [1, 2, 3].map((n, i) => `<div class="shot reveal" style="--d:${i * 80}ms">${art("", `Screenshot ${n}`, g.accent)}</div>`).join("");

    const docs = g.docs.length
      ? g.docs.map((d) => `<a class="doc-card reveal" href="${esc(d.url)}" target="_blank" rel="noopener">
          <b>${esc(d.title)}</b><span>${esc(d.note || "")}</span></a>`).join("")
      : `<div class="doc-card empty reveal"><b>Documentation in progress</b><span>Design docs will appear here soon.</span></div>`;

    const links = g.links.length
      ? g.links.map((l) => `<a class="btn btn-primary" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} <span class="arrow">→</span></a>`).join("")
      : `<span class="btn btn-ghost is-disabled">Playable build coming soon</span>`;

    document.body.classList.add(`accent-${g.accent}`);
    gamePage.innerHTML = `
      <section class="game-hero accent-${esc(g.accent)}">
        <a class="back" href="index.html#games"><span class="arrow">←</span> All games</a>
        <div class="game-hero-grid">
          <div class="game-hero-art reveal${g.portrait ? " is-phones" : ""}">${cover(g)}</div>
          <div class="reveal" style="--d:120ms">
            <span class="tag">${esc(g.status)}</span>
            <h1 class="game-title">${esc(g.title)}</h1>
            ${g.subtitle ? `<p class="game-subtitle big">${esc(g.subtitle)}</p>` : ""}
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

      <section class="section accent-${esc(g.accent)}">
        <h2 class="sub-title reveal">The Story</h2>
        <p class="prose reveal">${esc(g.story)}</p>
        ${g.role ? `<h2 class="sub-title reveal">My Role</h2><p class="prose reveal">${esc(g.role)}</p>` : ""}
        <h2 class="sub-title reveal">Features</h2>
        <ul class="features">${list(g.features)}</ul>

        ${g.trailer ? `<h2 class="sub-title reveal">Trailer</h2>
          <div class="video reveal"><iframe src="${esc(g.trailer)}" title="${esc(g.title)} trailer" allowfullscreen></iframe></div>` : ""}

        <h2 class="sub-title reveal">Screenshots</h2>
        <div class="shots${g.portrait ? " portrait" : ""}">${shots}</div>

        <h2 class="sub-title reveal">Documentation</h2>
        <div class="docs">${docs}</div>
      </section>`;
  }
}

// ---------- Screenshot lightbox ----------
const modal = document.getElementById("reel-modal");
if (modal && gamePage) {
  const body = document.getElementById("reel-body");
  const close = () => { modal.hidden = true; body.innerHTML = ""; modal.classList.remove("image"); };
  gamePage.addEventListener("click", (e) => {
    const shot = e.target.closest(".shot[data-full]");
    if (!shot) return;
    body.innerHTML = `<img src="${esc(shot.dataset.full)}" alt="">`;
    modal.classList.add("image");
    modal.hidden = false;
  });
  document.getElementById("reel-close").addEventListener("click", close);
  modal.addEventListener("click", (e) => e.target === modal && close());
  addEventListener("keydown", (e) => e.key === "Escape" && close());
}

// ---------- Micro animations ----------
// Fade/slide in as things scroll into view
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
requestAnimationFrame(() => document.body.classList.add("loaded"));

// Cards gently tilt toward the cursor and a light follows it
if (!reduceMotion && matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
      card.style.setProperty("--rx", `${(0.5 - y) * 6}deg`);
      card.style.setProperty("--ry", `${(x - 0.5) * 6}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}
