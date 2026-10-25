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

// ---------- Hero: name reveal, showreel, tractor ----------
document.querySelectorAll("[data-split]").forEach((el) => {
  const text = el.textContent;
  el.setAttribute("aria-label", text);
  // Letters animate one by one, but each word stays on one line
  let i = 0;
  el.innerHTML = text.split(" ")
    .map((word) => `<span class="word" aria-hidden="true">${[...word]
      .map((ch) => `<span class="ch" style="--i:${i++}">${esc(ch)}</span>`).join("")}</span>`)
    .join(" ");
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

  // Drivable tractor: it follows your cursor and the trolley swings behind on a delay,
  // the same mechanic as Horn OK Please
  const cv = document.getElementById("drive");
  const ctx = cv.getContext("2d");
  const COLORS = { k: "#17151f", g: "#43a047", G: "#2e7d32", y: "#f2b52a", r: "#d4507a", s: "#5b3a24", m: "#9aa0a6", T: "#0f6d5c", t: "#19a88e" };
  const TRACTOR = [
    "....yyy....", "...GgggG...", "kk.GgygG.kk", "kk.GgggG.kk", "kk.GgygG.kk", "...GgggG...",
    "...GgggG...", "..GGgggGG..", "kkkGsssGkkk", "kkkGsssGkkk", "kkkGgggGkkk", "kkkGgrgGkkk",
    "kkkGgggGkkk", "kkk.GGG.kkk", ".....m.....", ".....m.....",
  ];
  const TROLLEY = [
    "......m......", "......m......", ".TTTTTTTTTTT.", ".TtttttttttT.", ".TtyttrttytT.", ".TtttttttttT.",
    "kTtttttttttTk", "kTtttttttttTk", "kTtttttttttTk", ".TtttttttttT.", ".TtyttrttytT.", ".TtttttttttT.",
    ".TTTTTTTTTTT.",
  ];
  let W, H, P, dpr;
  const car = { x: 0, y: 0, vx: 0, vy: 0, a: -Math.PI / 2 };
  const trolley = { x: 0, y: 0 };
  const dust = [];
  let target = null, lastMove = 0, t0 = performance.now();

  const sprite = (rows, x, y, angle) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    const ox = (-rows[0].length * P) / 2, oy = (-rows.length * P) / 2;
    // soft shadow, then a dark outline so it reads on any background
    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.fillRect(ox + P, oy + P * 1.5, rows[0].length * P, rows.length * P);
    ctx.fillStyle = "#0d0b1f";
    rows.forEach((row, j) => [...row].forEach((c, i) => {
      if (c !== ".") ctx.fillRect(ox + i * P - P / 2, oy + j * P - P / 2, P * 2, P * 2);
    }));
    rows.forEach((row, j) => [...row].forEach((c, i) => {
      if (c === ".") return;
      ctx.fillStyle = COLORS[c];
      ctx.fillRect(Math.round(ox + i * P), Math.round(oy + j * P), Math.ceil(P), Math.ceil(P));
    }));
    ctx.restore();
  };

  const resize = () => {
    dpr = devicePixelRatio || 1;
    W = cv.width = cv.offsetWidth * dpr;
    H = cv.height = cv.offsetHeight * dpr;
    P = (innerWidth < 700 ? 4 : 6) * dpr;
    if (!car.x) { car.x = W * 0.75; car.y = H * 0.6; trolley.x = car.x; trolley.y = car.y + 15 * P; }
  };

  const hero = document.querySelector(".hero");
  const hint = document.getElementById("drive-hint");
  hero.addEventListener("pointermove", (e) => {
    const r = cv.getBoundingClientRect();
    target = { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
    lastMove = performance.now();
    hint.classList.add("gone");
  });
  hero.addEventListener("pointerleave", () => (target = null));

  const step = (now) => {
    // With no cursor, it cruises a lazy loop on its own
    let tx, ty;
    if (target && now - lastMove < 4000) ({ x: tx, y: ty } = target);
    else {
      const t = (now - t0) / 1000;
      tx = W * (0.72 + 0.18 * Math.sin(t * 0.5));
      ty = H * (0.55 + 0.22 * Math.sin(t * 0.8));
    }
    const dx = tx - car.x, dy = ty - car.y;
    car.vx = (car.vx + dx * 0.004) * 0.9;
    car.vy = (car.vy + dy * 0.004) * 0.9;
    car.x += car.vx; car.y += car.vy;
    const speed = Math.hypot(car.vx, car.vy);
    if (speed > 0.4 * dpr) {
      let want = Math.atan2(car.vy, car.vx), diff = want - car.a;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      car.a += diff * 0.12;
    }
    // Hitch at the tractor's rear; trolley is dragged on a fixed-length bar, so it swings late
    const hx = car.x - Math.cos(car.a) * 8 * P, hy = car.y - Math.sin(car.a) * 8 * P;
    const L = 7.5 * P;
    let ddx = trolley.x - hx, ddy = trolley.y - hy, d = Math.hypot(ddx, ddy) || 1;
    trolley.x = hx + (ddx / d) * L; trolley.y = hy + (ddy / d) * L;
    const ta = Math.atan2(hy - trolley.y, hx - trolley.x);

    if (speed > 1 * dpr && Math.random() < 0.6) {
      dust.push({ x: trolley.x - Math.cos(ta) * 7 * P + (Math.random() - 0.5) * 8 * P, y: trolley.y - Math.sin(ta) * 7 * P + (Math.random() - 0.5) * 8 * P, life: 1 });
    }
    ctx.clearRect(0, 0, W, H);
    for (let i = dust.length - 1; i >= 0; i--) {
      const p = dust[i];
      p.life -= 0.025;
      if (p.life <= 0) { dust.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(242, 181, 42, ${p.life * 0.35})`;
      const sz = P * (1 + (1 - p.life) * 1.5);
      ctx.fillRect(p.x, p.y, sz, sz);
    }
    sprite(TROLLEY, trolley.x, trolley.y, ta);
    sprite(TRACTOR, car.x, car.y, car.a);
    requestAnimationFrame(step);
  };
  resize();
  addEventListener("resize", resize);
  if (!reduceMotion) requestAnimationFrame(step);
  else { hint.hidden = true; sprite(TROLLEY, trolley.x, trolley.y, -Math.PI / 2); sprite(TRACTOR, car.x, car.y, -Math.PI / 2); }
}

// ---------- Game page sections ----------
const GD_SECTIONS = [
  ["overview", "Overview"],
  ["mechanics", "Mechanics"],
  ["core-loop", "Core loop"],
  ["art-ui", "Art & UI"],
  ["curves", "Intensity, novelty & tension"],
];
const gdHead = (id, i) =>
  `<h2 class="sub-title gd-title reveal" id="${id}"><span class="gd-num">${String(i + 1).padStart(2, "0")}</span>${GD_SECTIONS[i][1]}</h2>`;
const soon = () => `<p class="soon reveal">Coming soon.</p>`;

// Line chart of intensity, novelty and tension (values 0 to 10)
function curveChart(c) {
  const W = 760, H = 300, L = 34, R = 14, T = c.groups && c.groups.length ? 30 : 14, B = 34;
  const n = c.labels.length;
  const x = (i) => L + ((W - L - R) * i) / (n - 1);
  const y = (v) => T + (H - T - B) * (1 - v / 10);
  const series = [
    ["intensity", "Intensity", "var(--marigold)"],
    ["novelty", "Novelty", "var(--teal)"],
    ["tension", "Tension", "var(--rose)"],
  ];
  const bands = (c.groups || []).map((g, k) => {
    const x0 = g.from === 0 ? L : (x(g.from - 1) + x(g.from)) / 2;
    const x1 = g.to === n - 1 ? W - R : (x(g.to) + x(g.to + 1)) / 2;
    return `${k % 2 ? "" : `<rect class="band" x="${x0}" y="${T}" width="${x1 - x0}" height="${H - T - B}"/>`}
      <text class="group" x="${(x0 + x1) / 2}" y="${T - 10}" text-anchor="middle">${esc(g.label)}</text>`;
  }).join("");
  const grid = [0, 5, 10].map((v) => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join("");
  const labels = c.labels.map((t, i) => `<text class="axis" x="${x(i)}" y="${H - 12}" text-anchor="middle">${esc(t)}</text>`).join("");
  const lines = series.map(([k, , col]) => {
    const pts = c[k].map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    return `<polyline class="curve-line" style="stroke:${col}" points="${pts.join(" ")}"/>` +
      c[k].map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.5" style="fill:${col}"/>`).join("");
  }).join("");
  return `<div class="curve reveal">
    <div class="curve-legend">${series.map(([, label, col]) => `<span><i style="background:${col}"></i>${label}</span>`).join("")}</div>
    <div class="curve-scroll"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Intensity, novelty and tension over a run">${bands}${grid}${labels}${lines}</svg></div>
    ${c.note ? `<p class="curve-note">${esc(c.note)}</p>` : ""}
  </div>`;
}

// ---------- Home sections ----------
const gamesGrid = document.getElementById("games-grid");
if (gamesGrid) {
  gamesGrid.innerHTML = GAMES.map(
    (g, i) => `
    <a class="game-card reveal tilt accent-${esc(g.accent)}${g.coverHasTitle ? " cover-titled" : ""}" href="game.html?g=${encodeURIComponent(g.slug)}" style="--d:${i * 90}ms">
      <div class="game-art${g.portrait ? " is-portrait" : ""}">${g.portrait && g.screenshots.length ? art(g.screenshots[1] || g.screenshots[0], g.title) : cover(g)}</div>
      <div class="game-body">
        <h3>${esc(g.title)}</h3>
        <p class="game-meta">${esc(g.genre)} · ${g.team ? "Team dev" : "Solo dev"}</p>
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

    const docLink = g.docs[0]
      ? `<a class="btn${g.links.length ? "" : " btn-primary"}" href="${esc(g.docs[0].url)}" target="_blank" rel="noopener">Read the ${esc(g.docs[0].title.toLowerCase())} <span class="arrow">↗</span></a>`
      : "";
    const links = (g.links.length
      ? g.links.map((l) => `<a class="btn btn-primary" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} <span class="arrow">→</span></a>`).join("")
      : docLink ? "" : `<span class="btn btn-ghost is-disabled">Playable build coming soon</span>`) + docLink;

    document.body.classList.add(`accent-${g.accent}`);
    gamePage.innerHTML = `
      <section class="game-hero accent-${esc(g.accent)}">
        <a class="back" href="index.html#games"><span class="arrow">←</span> All games</a>
        <div class="game-hero-grid">
          ${g.poster
            ? `<button type="button" class="game-hero-art is-poster shot reveal" data-full="${esc(g.poster)}" aria-label="View the ${esc(g.title)} poster larger"><img src="${esc(g.poster)}" alt="${esc(g.title)} poster"></button>`
            : `<div class="game-hero-art reveal${g.portrait ? " is-phones" : ""}">${cover(g)}</div>`}
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

      <nav class="gd-nav" aria-label="On this page">
        ${GD_SECTIONS.map(([id, label], i) => `<a href="#${id}"><span>${String(i + 1).padStart(2, "0")}</span>${label}</a>`).join("")}
      </nav>

      <section class="section accent-${esc(g.accent)}">
        ${gdHead("overview", 0)}
        ${g.overview ? `<p class="prose reveal">${esc(g.overview)}</p>` : soon()}
        ${g.role ? `<div class="role-box reveal"><b>My role</b><p>${esc(g.role)}</p></div>` : ""}

        ${gdHead("mechanics", 1)}
        ${g.mechanics && g.mechanics.length
          ? `<div class="mech-grid">${g.mechanics.map((m, i) => `<div class="mech reveal" style="--d:${i * 60}ms"><b>${esc(m.name)}</b>${m.text ? `<p>${esc(m.text)}</p>` : ""}</div>`).join("")}</div>`
          : soon()}

        ${gdHead("core-loop", 2)}
        ${g.loop && g.loop.length
          ? `<ol class="loop">${g.loop.map((s, i) => `<li class="reveal" style="--d:${i * 80}ms"><b>${esc(s.name)}</b><span>${esc(s.text)}</span></li>`).join("")}</ol>
             <p class="loop-back reveal"><span aria-hidden="true">↻</span> ${esc(g.loopBack || "Then go again.")}</p>`
          : soon()}

        ${gdHead("art-ui", 3)}
        ${g.art && g.art.length ? `<ul class="features">${list(g.art)}</ul>` : ""}
        ${g.palette && g.palette.length
          ? `<div class="palette reveal">${g.palette.map((c) => `<div class="swatch"><i style="background:${esc(c.hex)}"></i><span>${esc(c.name)}</span></div>`).join("")}</div>`
          : ""}
        <div class="shots${g.portrait ? " portrait" : ""}">${shots}</div>

        ${gdHead("curves", 4)}
        ${g.curve ? curveChart(g.curve) : soon()}

        ${g.trailer ? `<h2 class="sub-title reveal">Trailer</h2>
          <div class="video reveal"><iframe src="${esc(g.trailer)}" title="${esc(g.title)} trailer" allowfullscreen></iframe></div>` : ""}

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
