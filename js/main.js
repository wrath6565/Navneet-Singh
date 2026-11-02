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

// ---------- Hero: role block, showreel ----------
// "Hi, I'm a" + a block that tumbles between roles. Four faces round the block,
// so the roles alternate and the next face always rolls up from below.
const cube = document.getElementById("role-cube");
if (cube) {
  const roles = SITE.roles && SITE.roles.length ? SITE.roles : [SITE.role];
  const name = document.getElementById("hero-name");
  name.setAttribute("aria-label", `Hi, I'm a ${roles.join(" and ")}`);
  [...name.children].forEach((c) => c.setAttribute("aria-hidden", "true"));
  const widest = roles.reduce((a, b) => (b.length > a.length ? b : a));
  cube.insertAdjacentHTML("beforebegin", `<span class="cube-sizer">${esc(widest)}</span>`);
  cube.innerHTML = [0, 1, 2, 3]
    .map((i) => `<span class="face" style="--f:${i}">${esc(roles[i % roles.length])}</span>`).join("");
  if (!reduceMotion && roles.length > 1) {
    let n = 0;
    setInterval(() => cube.style.setProperty("--turn", ++n), 2600);
  }
}

const heroMedia = document.getElementById("hero-media");
if (heroMedia) {
  const reel = SITE.showreel || {};
  if (reel.file) {
    heroMedia.insertAdjacentHTML(
      "afterbegin",
      `<video class="hero-video" src="${esc(reel.background || reel.file)}" ${reel.poster ? `poster="${esc(reel.poster)}"` : ""}
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
      <div class="game-art${g.portrait && !g.coverHasTitle ? " is-portrait" : ""}">${g.coverHasTitle ? art(g.cover, g.title) : g.portrait && g.screenshots.length ? art(g.screenshots[1] || g.screenshots[0], g.title) : cover(g)}</div>
      <div class="game-body">
        <h3>${esc(g.title)}</h3>
        <p class="game-meta">${esc(g.genre)} · ${g.team ? "Team dev" : "Solo dev"}</p>
      </div>
    </a>`
  ).join("");
}

// Small cards: 3D projects and explorations share one layout
function smallCards(el, list) {
  if (!el) return;
  el.innerHTML = list.map((e, i) => {
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
const projectsGrid = document.getElementById("projects-grid");
if (projectsGrid) {
  projectsGrid.innerHTML = PROJECTS_3D.map((p, i) => {
    // Projects with a page open it; placeholders are plain cards
    const tag = p.slug ? "a" : "div";
    const href = p.slug ? ` href="project.html?p=${encodeURIComponent(p.slug)}"` : "";
    return `
    <${tag} class="game-card reveal tilt accent-${esc(p.accent || "marigold")}${p.titleTop ? " title-top" : ""}${p.coverHasTitle ? " cover-titled" : ""}" style="--d:${i * 90}ms"${href}>
      <div class="game-art${p.fit === "contain" ? " is-contain" : ""}">${art(p.image, p.title, p.accent)}</div>
      <div class="game-body">
        <h3>${esc(p.title)}</h3>
        <p class="game-meta">${esc(p.type)}${p.image ? "" : " · Soon"}</p>
      </div>
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
          ${g.heroPoster
            ? `<button type="button" class="game-hero-art is-wide-poster shot reveal" data-full="${esc(g.heroPoster)}" aria-label="View the ${esc(g.title)} poster larger"><img src="${esc(g.heroPoster)}" alt="${esc(g.title)} poster"></button>`
            : g.poster
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

// ---------- 3D project page ----------
const PROJECT_SECTIONS = [
  ["overview", "Overview"],
  ["wireframe", "Wireframe"],
  ["shaders", "Shaders & materials"],
  ["renders", "Renders"],
];
const projectPage = document.getElementById("project-page");
if (projectPage) {
  const slug = new URLSearchParams(location.search).get("p");
  const p = PROJECTS_3D.find((x) => x.slug === slug);

  if (!p) {
    projectPage.innerHTML = `<section class="section"><h1 class="game-title">Not found</h1>
      <p class="prose">That project wasn't found. <a href="index.html#projects">Back to the 3D projects</a></p></section>`;
  } else {
    document.title = `${p.title} · ${SITE.name}`;
    // Sections listed in p.hide are left out; the rest are numbered in order
    const shown = PROJECT_SECTIONS.filter(([id]) => !(p.hide || []).includes(id));
    const num = (id) => String(shown.findIndex(([x]) => x === id) + 1).padStart(2, "0");
    const head = (id) => `<h2 class="sub-title gd-title reveal" id="${id}"><span class="gd-num">${num(id)}</span>${shown.find(([x]) => x === id)[1]}</h2>`;
    const part = (id, html) => (shown.some(([x]) => x === id) ? head(id) + html : "");
    const gallery = (imgs, label) => `<div class="shots natural">${imgs.map((src, i) =>
      `<button type="button" class="shot reveal" style="--d:${i * 80}ms" data-full="${esc(src)}" aria-label="View ${esc(label)} ${i + 1} larger">${art(src, label)}</button>`).join("")}</div>`;
    const specs = [["Category", p.category], ["Software", p.software], ["Year", p.year]].filter(([, v]) => v);
    const wire = p.wireframes || [], shaders = p.shaders || [], renders = p.renders || [];
    // The animation, if there is one, leads the page and loops. It starts muted (browsers
    // only autoplay silent video); the viewer can unmute it with the controls.
    const reel = p.youtube
      ? `<div class="video project-reel reveal"><iframe src="https://www.youtube.com/embed/${esc(p.youtube)}?autoplay=1&mute=1&loop=1&playlist=${esc(p.youtube)}&rel=0&enablejsapi=1" title="${esc(p.title)} animation" allow="autoplay; fullscreen" allowfullscreen></iframe></div>`
      : p.video ? `<div class="video project-reel reveal"><video src="${esc(p.video)}"${p.videoPoster ? ` poster="${esc(p.videoPoster)}"` : ""} autoplay muted loop controls playsinline preload="auto"></video></div>` : "";
    const poster = p.poster || p.image;

    document.body.classList.add(`accent-${p.accent || "marigold"}`);
    projectPage.innerHTML = `
      <section class="game-hero accent-${esc(p.accent || "marigold")}">
        <a class="back" href="index.html#projects"><span class="arrow">←</span> All 3D projects</a>
        ${reel ? `${reel}
        <div class="project-info">
          <div class="reveal">
            ${p.status ? `<span class="tag">${esc(p.status)}</span>` : ""}
            <h1 class="game-title">${esc(p.title)}</h1>
            ${p.pitch ? `<p class="game-pitch big">${esc(p.pitch)}</p>` : ""}
          </div>
          ${specs.length ? `<dl class="specs reveal" style="--d:120ms">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
        </div>` : `
        <div class="game-hero-grid">
          ${poster
            ? `<button type="button" class="game-hero-art is-poster shot reveal" data-full="${esc(poster)}" aria-label="View ${esc(p.title)} larger"><img src="${esc(poster)}" alt="${esc(p.title)}"></button>`
            : `<div class="game-hero-art reveal">${art("", p.title, p.accent)}</div>`}
          <div class="reveal" style="--d:120ms">
            ${p.status ? `<span class="tag">${esc(p.status)}</span>` : ""}
            <h1 class="game-title">${esc(p.title)}</h1>
            ${p.pitch ? `<p class="game-pitch big">${esc(p.pitch)}</p>` : ""}
            ${specs.length ? `<dl class="specs">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
          </div>
        </div>`}
      </section>

      <nav class="gd-nav" aria-label="On this page">
        ${shown.map(([id, label]) => `<a href="#${id}"><span>${num(id)}</span>${label}</a>`).join("")}
      </nav>

      <section class="section accent-${esc(p.accent || "marigold")}">
        ${part("overview", `
        ${p.overview ? `<p class="prose reveal">${esc(p.overview)}</p>` : soon()}
        ${p.role ? `<div class="role-box reveal"><b>My role</b><p>${esc(p.role)}</p></div>` : ""}`)}

        ${part("wireframe", wire.length ? gallery(wire, "wireframe") : soon())}

        ${part("shaders", shaders.length
          ? shaders.every((m) => !m.name && !m.text) ? gallery(shaders.map((m) => m.image), "shader")
          : `<div class="shader-list">${shaders.map((m) => `<div class="shader reveal">
              ${m.image ? `<button type="button" class="shot" data-full="${esc(m.image)}" aria-label="View ${esc(m.name)} larger">${art(m.image, m.name)}</button>` : ""}
              <div><b>${esc(m.name)}</b>${m.text ? `<p>${esc(m.text)}</p>` : ""}</div></div>`).join("")}</div>`
          : soon())}

        ${part("renders", renders.length ? gallery(renders, "render") : soon())}
      </section>`;

    // Pause the animation once it scrolls out of view (or the tab is hidden), so its
    // audio never plays where you can't see it; carry on when it comes back
    const el = projectPage.querySelector(".project-reel video, .project-reel iframe");
    if (el) {
      const yt = (cmd) => el.contentWindow.postMessage(JSON.stringify({ event: "command", func: cmd, args: [] }), "*");
      const play = () => (el.tagName === "VIDEO" ? el.play().catch(() => {}) : yt("playVideo"));
      const pause = () => (el.tagName === "VIDEO" ? el.pause() : yt("pauseVideo"));
      let visible = true;
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        visible && !document.hidden ? play() : pause();
      }, { threshold: 0.25 }).observe(el);
      document.addEventListener("visibilitychange", () => (document.hidden || !visible ? pause() : play()));
    }
  }
}

// ---------- Screenshot lightbox ----------
// Click any image to open it; step through every image on the page with the arrows,
// the arrow keys or a swipe
const modal = document.getElementById("reel-modal");
if (modal) {
  const body = document.getElementById("reel-body");
  modal.insertAdjacentHTML("beforeend", `
    <button class="lb-nav lb-prev" type="button" aria-label="Previous image" hidden>‹</button>
    <button class="lb-nav lb-next" type="button" aria-label="Next image" hidden>›</button>
    <p class="lb-count" hidden></p>`);
  const prev = modal.querySelector(".lb-prev"), next = modal.querySelector(".lb-next"), count = modal.querySelector(".lb-count");
  let list = [], at = 0;

  const show = (i) => {
    at = (i + list.length) % list.length;
    body.innerHTML = `<img src="${esc(list[at])}" alt="">`;
    count.textContent = `${at + 1} / ${list.length}`;
  };
  const setNav = (on) => { prev.hidden = next.hidden = count.hidden = !on; };
  const close = () => { modal.hidden = true; body.innerHTML = ""; modal.classList.remove("image"); setNav(false); };

  document.addEventListener("click", (e) => {
    const shot = e.target.closest(".shot[data-full]");
    if (!shot) return;
    // Every image on the page, in order, with repeats removed
    list = [...new Set([...document.querySelectorAll(".shot[data-full]")].map((el) => el.dataset.full))];
    modal.classList.add("image");
    modal.hidden = false;
    setNav(list.length > 1);
    show(list.indexOf(shot.dataset.full));
  });
  prev.addEventListener("click", () => show(at - 1));
  next.addEventListener("click", () => show(at + 1));
  document.getElementById("reel-close").addEventListener("click", close);
  modal.addEventListener("click", (e) => e.target === modal && close());
  addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") close();
    if (!modal.classList.contains("image") || list.length < 2) return;
    if (e.key === "ArrowLeft") show(at - 1);
    if (e.key === "ArrowRight") show(at + 1);
  });
  let x0 = null;
  modal.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  modal.addEventListener("touchend", (e) => {
    if (x0 === null || !modal.classList.contains("image") || list.length < 2) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1));
    x0 = null;
  });
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
