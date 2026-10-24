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

// ---------- Why 65? ----------
const whyBtn = document.getElementById("why65-btn");
if (whyBtn) {
  const m = document.getElementById("why65");
  document.getElementById("why65-body").innerHTML = SITE.why65
    .map((line, i) => `<p class="why-line" style="--i:${i}">${esc(line)}</p>`).join("");
  whyBtn.addEventListener("click", () => (m.hidden = false));
  const close = () => (m.hidden = true);
  m.querySelector(".modal-close").addEventListener("click", close);
  m.addEventListener("click", (e) => e.target === m && close());
  addEventListener("keydown", (e) => e.key === "Escape" && close());
}

// ---------- Player profile ----------
const profile = document.getElementById("profile");
if (profile) {
  const p = SITE.profile;
  profile.innerHTML = `
    <div class="profile-head">
      <div class="avatar" aria-hidden="true">N</div>
      <div>
        <p class="profile-name">${esc(SITE.handle)} <span>Lv. 65</span></p>
        <p class="profile-class">${esc(p.class)} · ${esc(p.origin)}</p>
      </div>
    </div>
    <ul class="bars">${p.stats.map((st, i) => `
      <li style="--v:${st.value * 10}%; --i:${i}" class="${st.value <= 2 ? "low" : ""}">
        <span class="bar-name">${esc(st.name)}</span>
        <span class="bar-label">${esc(st.label)}${st.note ? ` <em>${esc(st.note)}</em>` : ""}</span>
        <span class="bar"><span></span></span>
      </li>`).join("")}
    </ul>
    <p class="traits-title">Passive traits</p>
    <ul class="traits">${p.traits.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
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

// The page's ambient glow takes the colour of whichever game is in view
const ambient = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const a = [...e.target.classList].find((c) => c.startsWith("accent-"));
    document.body.style.setProperty("--ambient", `var(--${a ? a.slice(7) : "marigold"})`);
  }),
  { threshold: 0.6 }
);
document.querySelectorAll(".game-card").forEach((el) => ambient.observe(el));

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
