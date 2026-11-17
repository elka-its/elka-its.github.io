/* Laboratory website — renders every page from the JSON files in /content.
   Edit content in /content/*.json; this file only needs changing for layout/behaviour. */

document.documentElement.classList.add("js");

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const isPh = (v) => !v || /^\s*\[[^\]]*\]\s*$/.test(String(v));          // empty or "[PLACEHOLDER]"
const txt = (v, fallback = "") => (isPh(v) ? `<span class="ph">${esc(v || fallback)}</span>` : esc(v));
const paras = (v) => isPh(v) ? `<p class="ph">${esc(v)}</p>` : String(v).split(/\n\s*\n/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
const url = (u) => (isPh(u) || /^\s*javascript:/i.test(u) ? "" : String(u).trim());
const shown = (arr) => (arr || []).filter((x) => x && !x.hidden);         // "hidden": true = unpublished
const params = new URLSearchParams(location.search);
const setParam = (k, v) => { v ? params.set(k, v) : params.delete(k); const qs = params.toString(); history.replaceState(null, "", qs ? "?" + qs : location.pathname); };
const load = (name) => fetch(`content/${name}.json`, { cache: "no-cache" }).then((r) => { if (!r.ok) throw new Error(name); return r.json(); });
const fmtDate = (d) => {
  if (isPh(d)) return txt(d);
  if (/^\d{4}-\d{2}(-\d{2})?$/.test(d)) {
    const dt = new Date(d.length === 7 ? d + "-01" : d);
    return esc(dt.toLocaleDateString("en-GB", d.length === 7 ? { month: "long", year: "numeric" } : { day: "numeric", month: "long", year: "numeric" }));
  }
  return esc(d);
};
const sortKey = (d) => (/^\d{4}/.test(d || "") ? String(d) : "0");
const byDateDesc = (field) => (a, b) => sortKey(b[field]).localeCompare(sortKey(a[field]));

const ICON = {
  menu: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  prev: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m15 6-6 6 6 6"/></svg>',
  next: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg>',
  up: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 15 6-6 6 6"/></svg>',
  arrow: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  ext: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  ig: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  li: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/></svg>',
  flask: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/></svg>',
  people: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/></svg>',
  trophy: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M9 17h6"/></svg>',
  building: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 21V5l8-2 8 2v16M9 21v-4h6v4M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01"/></svg>',
  image: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>',
  pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  eye: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  target: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  book: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5"/></svg>',
  cal: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  chip: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>',
  info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/></svg>',
  person: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#DCEFFC"/><circle cx="32" cy="25" r="11" fill="#8FBEDF"/><path d="M12 58c2-12 10-18 20-18s18 6 20 18z" fill="#8FBEDF"/></svg>',
  plus: '<svg class="plus" viewBox="0 0 48 48" fill="none" stroke="#2D6E9F" stroke-width="2"><circle cx="24" cy="24" r="21"/><path d="M24 13v22M13 24h22"/></svg>',
};

/* neutral image placeholder (no stock photos) */
const ph = (label, cls = "ratio") =>
  `<div class="imgph ${cls}" role="img" aria-label="${esc(label)} (placeholder)"><svg class="x" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0 100 100M100 0 0 100" stroke="#B5D6EE" stroke-width=".5" vector-effect="non-scaling-stroke"/><circle cx="50" cy="50" r="24" fill="none" stroke="#B5D6EE" vector-effect="non-scaling-stroke"/></svg><span class="lbl">${esc(label)}</span></div>`;
const pic = (src, alt, label, cls = "ratio") =>
  url(src) ? `<img class="media-img ${cls}" src="${esc(url(src))}" alt="${esc(alt || "")}" loading="lazy" decoding="async">` : ph(label || alt || "Photo", cls);
const avatar = (src, alt) => `<div class="avatar">${url(src) ? `<img src="${esc(url(src))}" alt="${esc(alt)}" loading="lazy">` : ICON.person}</div>`;
const extLink = (l) => (url(l.url) ? `<a class="chip out" href="${esc(url(l.url))}" target="_blank" rel="noopener">${esc(l.label || "Link")} ${ICON.ext}</a>` : "");
const statusChip = (s) => {
  if (isPh(s)) return "";
  const k = s.toLowerCase().replace(/\s+/g, "");
  const map = { done: "Completed", completed: "Completed", upcoming: "Upcoming", planned: "Planned", ongoing: "Ongoing", postponed: "Postponed", cancelled: "Cancelled" };
  const cls = { done: "done", completed: "done", upcoming: "upcoming", planned: "upcoming", ongoing: "upcoming", postponed: "postponed", cancelled: "cancelled" }[k] || "";
  return `<span class="chip st-${cls}">${esc(map[k] || s)}</span>`;
};
const crumbs = (...items) =>
  `<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>${items.map((i) => `<span aria-hidden="true">/</span>${i}`).join("")}</nav>`;

/* ---------- global header / footer ---------- */
const NAV = [
  ["profile", "Lab Profile", "profile.html"],
  ["assistants", "Assistants", "assistants.html"],
  ["practicum", "Practicum", "practicum.html"],
  ["home", "Home", "index.html"],
  ["training", "Achievement & Training", "achievement-training.html"],
  ["media", "Media", "media.html"],
];
const page = document.body.dataset.page;
const cur = (id) => (id === page ? ' aria-current="page"' : "");
const logoSlot = (site) => `<span class="logo-slot">${url(site.logo) ? `<img src="${esc(url(site.logo))}" alt="">` : ""}</span>`;

function renderHeader(site) {
  const link = ([id, label, href]) => `<a class="nav-link" href="${href}"${cur(id)}>${esc(label)}</a>`;
  $("#site-header").innerHTML = `
    <div class="container nav-desktop">
      <nav class="nav-group" aria-label="Main navigation, left">${NAV.slice(0, 3).map(link).join("")}</nav>
      <a class="nav-home" href="index.html"${cur("home")}>${logoSlot(site)}<span>Home</span></a>
      <nav class="nav-group" aria-label="Main navigation, right">${NAV.slice(4).map(link).join("")}</nav>
    </div>
    <div class="container nav-mobile">
      <a class="brand" href="index.html">${logoSlot(site)}<span class="brand-name">${isPh(site.shortName) ? "Lab" : esc(site.shortName)}</span></a>
      <button class="menu-btn" aria-expanded="false" aria-controls="drawer" aria-label="Open menu">${ICON.menu}</button>
    </div>
    <nav class="drawer" id="drawer" aria-label="Mobile navigation"><div class="container">
      <a class="drawer-home" href="index.html"${cur("home")}>Home ${ICON.arrow}</a>
      ${NAV.filter((n) => n[0] !== "home").map(([id, l, h]) => `<a href="${h}"${cur(id)}>${esc(l)} ${ICON.arrow}</a>`).join("")}
    </div></nav>`;
  const btn = $(".menu-btn"), drawer = $("#drawer");
  const toggle = (open) => {
    drawer.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open);
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    btn.innerHTML = open ? ICON.close : ICON.menu;
  };
  btn.addEventListener("click", () => toggle(!drawer.classList.contains("open")));
  document.addEventListener("keydown", (e) => e.key === "Escape" && drawer.classList.contains("open") && (toggle(false), btn.focus()));
}

function contactList(c) {
  const items = [
    ["Email", ICON.mail, c.email, isPh(c.email) ? "" : `mailto:${c.email}`, c.email],
    ["Phone", ICON.phone, c.phone, isPh(c.phone) ? "" : `tel:${String(c.phone).replace(/[^\d+]/g, "")}`, c.phone],
    ["Instagram", ICON.ig, c.instagram, url(c.instagram), c.instagramLabel || c.instagram],
    ["LinkedIn", ICON.li, c.linkedin, url(c.linkedin), c.linkedinLabel || c.linkedin],
  ];
  return items.filter(([, , raw]) => raw).map(([label, icon, raw, href, shownText]) => ({ label, icon, href, text: isPh(raw) ? raw : shownText, external: /^https?:/.test(href) }));
}

function renderFooter(site) {
  const contacts = contactList(site.contact || {});
  $("#site-footer").innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div><h2>${txt(site.name)}</h2><div>${txt(site.institution)}</div>${site.footerNote && !isPh(site.footerNote) ? `<p style="margin-top:10px">${txt(site.footerNote)}</p>` : ""}</div>
        <div><h3>Pages</h3><ul>${[NAV[3], ...NAV.filter((n) => n[0] !== "home")].map(([, l, h]) => `<li><a href="${h}">${esc(l)}</a></li>`).join("")}</ul></div>
        ${contacts.length ? `<div><h3>Contact</h3><ul>${contacts.map((c) => `<li>${c.label}: ${c.href ? `<a href="${esc(c.href)}"${c.external ? ' target="_blank" rel="noopener"' : ""}>${esc(c.text)}</a>` : txt(c.text)}</li>`).join("")}</ul></div>` : ""}
      </div>
      <div class="foot-bottom">© ${new Date().getFullYear()} ${txt(site.name)}. All rights reserved.</div>
    </div>`;
  const top = document.createElement("button");
  top.className = "to-top"; top.setAttribute("aria-label", "Back to top"); top.innerHTML = ICON.up;
  top.addEventListener("click", () => { scrollTo({ top: 0 }); $("#main").focus({ preventScroll: true }); });
  document.body.append(top);
  addEventListener("scroll", () => top.classList.toggle("show", scrollY > 600), { passive: true });
}

/* reveal-on-scroll (disabled automatically by reduced-motion CSS) */
function reveal(root = document) {
  const els = $$(".reveal:not(.in)", root);
  if (!("IntersectionObserver" in window)) return els.forEach((e) => e.classList.add("in"));
  const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -40px 0px" });
  els.forEach((e) => io.observe(e));
}

/* one reusable modal dialog */
function openModal(html, onClose) {
  let d = $("#modal");
  if (!d) {
    d = document.createElement("dialog");
    d.id = "modal"; d.className = "modal";
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });   // click on backdrop
    document.body.append(d);
  }
  d.innerHTML = `<button class="modal-close" aria-label="Close">${ICON.close}</button><div class="modal-body">${html}</div>`;
  $(".modal-close", d).addEventListener("click", () => d.close());
  d.onclose = onClose || null;
  d.showModal();
  d.scrollTop = 0;
  return d;
}

/* lightbox: items = [{src, caption, alt}] */
function lightbox(items, start = 0) {
  let i = start;
  const d = document.createElement("dialog");
  d.className = "lightbox";
  d.setAttribute("aria-label", "Image viewer");
  d.innerHTML = `<div class="lb-stage"></div><div class="lb-cap" aria-live="polite"></div><div class="lb-count"></div>
    <button class="lb-btn lb-close" aria-label="Close viewer">${ICON.close}</button>
    <button class="lb-btn lb-prev" aria-label="Previous image">${ICON.prev}</button>
    <button class="lb-btn lb-next" aria-label="Next image">${ICON.next}</button>`;
  const show = () => {
    const it = items[i];
    $(".lb-stage", d).innerHTML = url(it.src) ? `<img src="${esc(url(it.src))}" alt="${esc(it.alt || it.caption || "")}">` : ph(it.caption || "Photo");
    $(".lb-cap", d).innerHTML = txt(it.caption || "");
    $(".lb-count", d).textContent = `${i + 1} / ${items.length}`;
  };
  const go = (n) => { i = (i + n + items.length) % items.length; show(); };
  $(".lb-prev", d).onclick = () => go(-1);
  $(".lb-next", d).onclick = () => go(1);
  $(".lb-close", d).onclick = () => d.close();
  if (items.length < 2) { $(".lb-prev", d).hidden = $(".lb-next", d).hidden = true; }
  d.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); });
  let x0 = null;
  d.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  d.addEventListener("touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1); x0 = null; });
  d.addEventListener("close", () => d.remove());
  document.body.append(d);
  show();
  d.showModal();
}

/* ======================= PAGES ======================= */

async function pageHome(site) {
  const [at, media] = await Promise.all([load("achievements-training"), load("media")]);
  const latestAch = shown(at.achievements).sort(byDateDesc("date"))[0];
  const trainings = shown(at.training).sort(byDateDesc("startDate"));
  const nextTraining = trainings.find((t) => /upcoming|planned/i.test(t.status || "")) || trainings[0];
  const latestAlbum = shown(media.albums).sort(byDateDesc("date"))[0];
  const c = site.cta || {};
  const featured = [
    latestAch && { icon: ICON.trophy, kind: "Latest achievement", title: latestAch.title, meta: latestAch.date, href: "achievement-training.html?category=achievements" },
    nextTraining && { icon: ICON.cal, kind: /upcoming|planned/i.test(nextTraining.status || "") ? "Upcoming training" : "Recent training", title: nextTraining.title, meta: nextTraining.startDate, href: `achievement-training.html?category=${nextTraining.type === "external" ? "external" : "internal"}-training` },
    latestAlbum && { icon: ICON.image, kind: "Recent activity", title: latestAlbum.title, meta: latestAlbum.date, href: `media.html?album=${encodeURIComponent(latestAlbum.id)}` },
  ].filter(Boolean);

  const quick = [
    ["Lab Profile", "History, location, vision & mission, and the Head of Laboratory.", "profile.html", ICON.building, ""],
    ["Assistants", "Meet the assistants across all seven divisions.", "assistants.html", ICON.people, "lilac"],
    ["Practicum", "Rangkaian Listrik, Rangkaian Elektronika, and Sistem Digital.", "practicum.html", ICON.flask, ""],
    ["Achievement & Training", "Milestones, recognitions, and training activities.", "achievement-training.html", ICON.trophy, "green"],
    ["Media", "Photo documentation of laboratory activities.", "media.html", ICON.image, "lilac"],
  ];

  $("#main").innerHTML = `<div class="container page-in">
    <p class="hero-eyebrow">${txt(site.institution)}</p>
    <h1 class="hero-title">${esc(site.headline || "A laboratory built around learning, research & practice")}</h1>

    <section class="hero" aria-label="Laboratory identity">
      <div>
        <div class="hero-top">
          <div class="hero-logo">${url(site.logo) ? `<img src="${esc(url(site.logo))}" alt="${esc(site.name)} logo">` : "LOGO"}</div>
          ${site.badge ? `<span class="badge">${esc(site.badge)}</span>` : ""}
        </div>
        <h2>${txt(site.name)}</h2>
        ${site.tagline ? `<p class="tagline">${txt(site.tagline)}</p>` : ""}
        <div class="desc">${paras(site.description)}</div>
        <div class="hero-cta">
          ${c.primary ? `<a class="btn" href="${esc(c.primary.href)}">${esc(c.primary.label)}</a>` : ""}
          ${c.secondary ? `<a class="btn secondary" href="${esc(c.secondary.href)}">${esc(c.secondary.label)}</a>` : ""}
        </div>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <svg viewBox="0 0 400 250">
          <defs><pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#C3DDF1" stroke-width=".6"/></pattern>
          <clipPath id="scr"><rect x="110" y="70" width="120" height="80" rx="6"/></clipPath></defs>
          <rect width="400" height="250" fill="url(#g)"/>
          <rect x="95" y="55" width="220" height="140" rx="12" fill="#fff" stroke="#BBD8EE"/>
          <rect x="110" y="70" width="120" height="80" rx="6" fill="#102A43"/>
          <g clip-path="url(#scr)"><path class="wave" d="M110 112 q12.5 -26 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0" fill="none" stroke="#8CC8F2" stroke-width="2"/></g>
          <rect x="242" y="72" width="58" height="16" rx="5" fill="#DCEFFC"/>
          <rect x="242" y="96" width="58" height="16" rx="5" fill="#DCEFFC"/>
          <rect x="242" y="120" width="58" height="16" rx="5" fill="#DCEFFC"/>
          <rect x="110" y="162" width="190" height="4" rx="2" fill="#E6F1FA"/>
          <circle class="blink" cx="60" cy="40" r="5" fill="#2D6E9F"/><circle cx="345" cy="45" r="5" fill="#2D6E9F"/>
          <circle cx="55" cy="215" r="5" fill="#2D6E9F"/><circle class="blink" cx="350" cy="210" r="5" fill="#2D6E9F" style="animation-delay:1.6s"/>
        </svg>
      </div>
    </section>

    <section class="section grid g2 reveal" aria-labelledby="intro-h">
      <div class="card">
        <div class="card-head"><span class="icon-tile">${ICON.info}</span><h2 id="intro-h">${esc(site.intro?.title || "About the laboratory")}</h2></div>
        ${paras(site.intro?.text)}
        <p style="margin-top:14px"><a class="meta" href="profile.html">Read the full lab profile →</a></p>
      </div>
      <div class="card">
        <div class="card-head"><span class="icon-tile lilac">${ICON.chip}</span><h2>At a glance</h2></div>
        <div class="stats">${(site.intro?.highlights || []).map((h) => `<div class="stat"><b>${txt(h.value)}</b><span>${esc(h.label)}</span></div>`).join("")}</div>
      </div>
    </section>

    ${site.showFeatured && featured.length ? `<section class="section reveal" aria-labelledby="feat-h">
      <h2 class="section-title" id="feat-h">Latest from the lab</h2>
      <div class="grid g3">${featured.map((f) => `<a class="card qcard lift" href="${f.href}">
        <div class="card-head"><span class="icon-tile">${f.icon}</span><span class="meta">${esc(f.kind)}</span></div>
        <h3>${txt(f.title)}</h3><div class="small">${fmtDate(f.meta)}</div></a>`).join("")}</div>
    </section>` : ""}

    <section class="section reveal" aria-labelledby="quick-h">
      <h2 class="section-title" id="quick-h">Explore</h2>
      <div class="grid g-auto">${quick.map(([t, d, h, ic, tone]) => `<a class="card qcard lift" href="${h}">
        <div class="card-head"><span class="icon-tile ${tone}">${ic}</span><h3>${esc(t)}</h3></div>
        <div class="small">${esc(d)}</div><div class="go">Open ${ICON.arrow}</div></a>`).join("")}</div>
    </section>

    ${contactList(site.contact || {}).length ? `<section class="section reveal" aria-labelledby="contact-h">
      <div class="contact-band">
        <h2 id="contact-h">Contact the lab</h2>
        ${contactList(site.contact || {}).map((c) => {
          const inner = `<span class="ci">${c.icon}</span><span><small>${c.label}</small><span class="v${isPh(c.text) ? " ph" : ""}">${esc(c.text)}</span></span>`;
          return c.href ? `<a class="contact-item" href="${esc(c.href)}"${c.external ? ' target="_blank" rel="noopener"' : ""}>${inner}</a>` : `<div class="contact-item">${inner}</div>`;
        }).join("")}
      </div>
    </section>` : ""}
  </div>`;
}

async function pageProfile(site) {
  const p = await load("profile");
  const L = p.location || {}, H = p.head || {};
  const mapLink = url(L.mapUrl) ? `<a class="chip out" href="${esc(url(L.mapUrl))}" target="_blank" rel="noopener">Open in Maps ${ICON.ext}</a>` : "";
  const embed = url(L.mapEmbed) ? `<iframe class="map-embed" src="${esc(url(L.mapEmbed))}" title="Map of the laboratory location" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>` : "";

  $("#main").innerHTML = `<div class="container page-in">
    <header class="page-head">
      ${crumbs("<span>Lab Profile</span>")}
      <h1 class="page-title">About the Laboratory</h1>
      <p class="page-sub">${esc(p.intro)}</p>
    </header>
    <nav class="anchor-nav" aria-label="On this page">
      <a href="#overview">Overview</a><a href="#history">History</a><a href="#location">Location</a><a href="#vision">Vision &amp; Mission</a><a href="#head">Head of Laboratory</a>
    </nav>

    <section class="section card reveal" id="overview" aria-labelledby="ov-h">
      <div class="card-head"><span class="icon-tile">${ICON.info}</span><h2 id="ov-h">${txt(site.name)}</h2></div>
      <div class="chips" style="margin-bottom:12px"><span class="chip">${txt(p.overview?.field)}</span><span class="chip out">${txt(p.overview?.role)}</span></div>
      ${paras(p.overview?.text)}
    </section>

    <div class="section profile-top reveal">
      ${pic(p.photo?.src, p.photo?.alt, "Lab / facility photo", "")}
      <div class="stack">
        <section class="card" id="location" aria-labelledby="loc-h">
          <div class="card-head"><span class="icon-tile">${ICON.pin}</span><h2 id="loc-h">Location</h2></div>
          <address style="font-style:normal">
            <div><strong>${txt(L.building)}</strong> · ${txt(L.room)}</div>
            <div>${txt(L.campus)}</div>
            <div class="small">${txt(L.address)}</div>
          </address>
          ${L.directions ? `<p class="small" style="margin-top:8px">${txt(L.directions)}</p>` : ""}
          ${mapLink ? `<div class="links">${mapLink}</div>` : ""}${embed}
          ${url(L.photo) ? `<div style="margin-top:12px">${pic(L.photo, "Laboratory location", "Location photo")}</div>` : ""}
        </section>
        <section class="card" id="history" aria-labelledby="hist-h">
          <div class="card-head"><span class="icon-tile lilac">${ICON.cal}</span><h2 id="hist-h">Laboratory history</h2></div>
          <ol class="timeline">${shown(p.history).map((h) => `<li><div class="yr">${txt(h.year)}</div><div class="tt">${txt(h.title)}</div>${h.text ? `<div class="tx">${txt(h.text)}</div>` : ""}</li>`).join("")}</ol>
        </section>
      </div>
    </div>

    <div class="section grid g2 reveal" id="vision">
      <section class="card" aria-labelledby="vis-h">
        <div class="card-head"><span class="icon-tile">${ICON.eye}</span><h2 id="vis-h">Vision</h2></div>
        <div class="statement">${paras(p.vision)}</div>
      </section>
      <section class="card" aria-labelledby="mis-h">
        <div class="card-head"><span class="icon-tile lilac">${ICON.target}</span><h2 id="mis-h">Mission</h2></div>
        <ol class="mission">${(p.mission || []).map((m) => `<li><span>${txt(m)}</span></li>`).join("")}</ol>
      </section>
    </div>

    <section class="section card reveal" id="head" aria-labelledby="head-h">
      <div class="head-card">
        ${pic(H.photo, H.name, "Portrait", "portrait")}
        <div>
          <div class="meta" style="text-transform:uppercase;letter-spacing:.06em">${esc(H.position || "Head of Laboratory")}</div>
          <h2 id="head-h" style="font-size:1.3rem;margin:6px 0 12px">${txt(H.name)}</h2>
          ${paras(H.bio)}
        </div>
        <div>
          <h3 class="section-title" style="font-size:.74rem">Expertise &amp; research interests</h3>
          <div class="chips">${(H.expertise || []).map((e) => `<span class="chip">${txt(e)}</span>`).join("")}</div>
          <div class="links">${(H.links || []).map(extLink).join("")}</div>
        </div>
      </div>
    </section>
  </div>`;
}

async function pageAssistants() {
  const data = await load("assistants");
  const divisions = data.divisions;
  const people = shown(data.assistants);
  const ROLES = [["head", "Head of Division"], ["expert", "Expert Staff"], ["staff", "Staff"]];
  let div = divisions.some((d) => d.id === params.get("division")) ? params.get("division") : "all";
  let q = "";

  $("#main").innerHTML = `<div class="container page-in">
    <header class="page-head">
      ${crumbs("<span>Assistants</span>")}
      <h1 class="page-title">Meet the people behind the laboratory</h1>
      <p class="page-sub">${esc(data.intro)}</p>
    </header>
    <div class="toolbar">
      <div class="filters" role="group" aria-label="Filter by division">
        <button class="filter" data-div="all">All Divisions</button>
        ${divisions.map((d) => `<button class="filter" data-div="${esc(d.id)}">${esc(d.name)}</button>`).join("")}
      </div>
      <label class="sr-only" for="q">Search assistants by name</label>
      <input class="search" id="q" type="search" placeholder="Search by name…" autocomplete="off">
    </div>
    <div id="roster" aria-live="polite"></div>
  </div>`;

  const card = (a) => `<button class="card person lift" data-i="${people.indexOf(a)}" aria-label="View profile of ${esc(a.name)}">
      ${avatar(a.photo, a.name)}
      <span>
        <span class="nm">${txt(a.name)}</span>
        <span class="qt" style="display:block">“${txt(a.quote)}”</span>
        <span class="meta">${txt(a.short)}<span class="dot">•</span>Cohort ${txt(a.cohort)}</span>
        <span class="ach" style="display:block"><span class="chip out">Achievements${a.achievements?.length ? ` (${a.achievements.length})` : ""}</span></span>
      </span>
    </button>`;

  const divisionBlock = (d, showHead) => {
    const members = people.filter((a) => a.division === d.id && (!q || `${a.name} ${a.short}`.toLowerCase().includes(q)));
    if (q && !members.length) return "";
    return `${showHead ? `<div class="division-head"><h2>${esc(d.name)}</h2></div>` : ""}
      ${d.description ? `<p class="small" style="margin:${showHead ? "4px" : "18px"} 0 0">${txt(d.description)}</p>` : ""}
      ${ROLES.map(([r, label]) => {
        const list = members.filter((a) => a.role === r).sort((x, y) => (x.order ?? 99) - (y.order ?? 99));
        return `<section class="section"><h3 class="section-title">${label}</h3>
          ${list.length ? `<div class="grid g3">${list.map(card).join("")}</div>` : `<p class="empty">No assistants listed yet.</p>`}</section>`;
      }).join("")}`;
  };

  const render = () => {
    $$(".filter").forEach((b) => b.setAttribute("aria-pressed", b.dataset.div === div));
    const html = div === "all" ? divisions.map((d) => divisionBlock(d, true)).join("") : divisionBlock(divisions.find((d) => d.id === div), false);
    const roster = $("#roster");
    roster.innerHTML = html.trim() ? html : `<p class="empty" style="margin-top:20px">No assistant matches “${esc(q)}”.</p>`;
    roster.classList.remove("fade-swap"); void roster.offsetWidth; roster.classList.add("fade-swap");
  };

  $$(".filter").forEach((b) => b.addEventListener("click", () => { div = b.dataset.div; setParam("division", div === "all" ? "" : div); render(); }));
  $("#q").addEventListener("input", (e) => { q = e.target.value.trim().toLowerCase(); render(); });
  $("#roster").addEventListener("click", (e) => {
    const b = e.target.closest(".person"); if (!b) return;
    const a = people[+b.dataset.i];
    const d = divisions.find((x) => x.id === a.division);
    const role = (ROLES.find((r) => r[0] === a.role) || [, a.role])[1];
    openModal(`<div class="profile-modal">
        ${avatar(a.photo, a.name)}
        <div>
          <div class="meta" style="text-transform:uppercase;letter-spacing:.06em">${esc(d?.name || "")} · ${esc(role)}</div>
          <h2 style="font-size:1.4rem;margin:4px 0 2px">${txt(a.name)}</h2>
          <div class="small">“${txt(a.quote)}”</div>
          <dl class="kv"><dt>Short name</dt><dd>${txt(a.short)}</dd><dt>College year</dt><dd>Cohort ${txt(a.cohort)}</dd>
            <dt>Division</dt><dd>${esc(d?.name || "")}</dd><dt>Role</dt><dd>${esc(role)}</dd>
            ${a.tags?.length ? `<dt>Also</dt><dd><div class="chips">${a.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div></dd>` : ""}</dl>
        </div>
      </div>
      <h3 class="section-title" style="margin-top:24px">Achievements &amp; certifications</h3>
      ${a.achievements?.length ? `<ul class="ach-list">${a.achievements.map((x) => `<li><strong>${txt(x.title)}</strong><div class="small">${txt(x.issuer)}${x.year ? ` · ${txt(x.year)}` : ""}</div></li>`).join("")}</ul>` : `<p class="empty">No achievements listed yet.</p>`}`);
  });
  render();
}

async function pagePracticum() {
  const data = await load("practicum");
  const subs = data.subjects;
  let id = subs.some((s) => s.id === params.get("subject")) ? params.get("subject") : subs[0].id;

  $("#main").innerHTML = `<div class="container page-in">
    <header class="page-head">
      <div id="crumb"></div>
      <h1 class="page-title">Practicum learning and experiment overview</h1>
      <p class="page-sub">${esc(data.intro)}</p>
    </header>
    <div class="select-card"><label for="subject">Select practicum</label>
      <select id="subject">${subs.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("")}</select></div>
    <div id="pr"></div>
  </div>`;

  const render = () => {
    const s = subs.find((x) => x.id === id);
    $("#subject").value = id;
    $("#crumb").innerHTML = crumbs('<a href="practicum.html">Practicum</a>', `<span>${esc(s.name)}</span>`);
    document.title = `${s.name} — Practicum — ${isPh(window.SITE?.name) ? "Laboratory" : window.SITE.name}`;
    const weeks = Array.from({ length: 16 }, (_, k) => (s.agenda || []).find((w) => +w.week === k + 1) || { week: k + 1 });
    const info = s.info || {};
    const pr = $("#pr");
    pr.innerHTML = `
      <section class="section grid g2" aria-label="Overview">
        <div class="card">
          <div class="card-head"><span class="icon-tile">${ICON.flask}</span><div><h2>${esc(s.name)}</h2>${s.nameEn ? `<div class="meta">${esc(s.nameEn)}</div>` : ""}</div></div>
          <div class="statement">${paras(s.description)}</div>
          <dl class="kv"><dt>Scope</dt><dd>${txt(s.scope)}</dd><dt>Course role</dt><dd>${txt(s.courseRole)}</dd></dl>
        </div>
        <div class="card">
          <div class="card-head"><span class="icon-tile green">${ICON.target}</span><h2>Learning objectives</h2></div>
          <ol class="mission">${(s.objectives || []).map((o) => `<li><span>${txt(o)}</span></li>`).join("")}</ol>
        </div>
      </section>

      <section class="section grid g2">
        <div class="card">
          <div class="card-head"><span class="icon-tile">${ICON.search}</span><h2>What we investigate</h2></div>
          <ul>${(s.investigates || []).map((x) => `<li>${txt(x)}</li>`).join("")}</ul>
        </div>
        <div class="card">
          <div class="card-head"><span class="icon-tile lilac">${ICON.book}</span><h2>Theory foundation</h2></div>
          ${(s.theory || []).map((t) => `<div class="theory-item"><strong>${txt(t.title)}</strong>${paras(t.text)}${t.formula ? `<div class="formula">${esc(t.formula)}</div>` : ""}</div>`).join("")}
          ${s.resources?.length ? `<div class="links">${s.resources.map(extLink).join("")}</div>` : ""}
        </div>
      </section>

      <section class="section card">
        <div class="card-head"><span class="icon-tile">${ICON.chip}</span><h2>Experiment modules</h2></div>
        ${(s.modules || []).map((m, k) => `<div class="module"><div class="meta">Module ${k + 1}</div><strong>${txt(m.title)}</strong>${paras(m.description)}
          ${m.equipment?.length ? `<div class="chips" style="margin-top:8px">${m.equipment.map((e) => `<span class="chip out">${txt(e)}</span>`).join("")}</div>` : ""}</div>`).join("")}
        ${s.safety?.length ? `<h3 class="section-title" style="margin-top:18px">Safety notes</h3><ul>${s.safety.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      </section>

      <section class="section" aria-label="Photos">
        <div class="grid g3">${(s.photos || []).map((ph_, k) => `<figure class="photo-fig">${url(ph_.src) ? `<button class="thumb" data-k="${k}" aria-label="Enlarge photo: ${esc(ph_.caption)}">${pic(ph_.src, ph_.caption)}</button>` : ph(ph_.caption || "Photo")}${url(ph_.src) && ph_.caption ? `<figcaption>${esc(ph_.caption)}</figcaption>` : ""}</figure>`).join("")}</div>
      </section>

      <section class="section card" aria-labelledby="ag-h">
        <div class="card-head" style="justify-content:space-between"><h2 id="ag-h">16-week practicum agenda</h2><span class="meta">${esc(s.name)}</span></div>
        <ol class="agenda" style="list-style:none;padding:0">${weeks.map((w) => `<li class="week">
          <div class="wk">Week ${String(w.week).padStart(2, "0")}</div>
          <div class="tp">${txt(w.topic, "[Topic / activity]")}</div>
          <div class="dt">${w.date ? fmtDate(w.date) : '<span class="ph">[Date]</span>'}</div>
          ${w.notes ? `<div class="dt">${esc(w.notes)}</div>` : ""}${statusChip(w.status)}</li>`).join("")}</ol>
      </section>

      <section class="section card" aria-labelledby="inf-h">
        <div class="card-head"><span class="icon-tile">${ICON.info}</span><h2 id="inf-h">Additional information</h2></div>
        <dl class="info-grid">
          <div><dt>Period</dt><dd>${txt(info.period)}</dd></div><div><dt>Venue</dt><dd>${txt(info.venue)}</dd></div>
          <div><dt>Requirements</dt><dd>${txt(info.requirements)}</dd></div><div><dt>Contact</dt><dd>${txt(info.contact)}</dd></div>
        </dl>
        ${info.announcements?.length ? `<h3 class="section-title" style="margin-top:18px">Announcements</h3><ul>${info.announcements.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}
        ${info.downloads?.length ? `<h3 class="section-title" style="margin-top:18px">Downloads</h3><div class="links">${info.downloads.map(extLink).join("")}</div>` : ""}
      </section>`;
    pr.classList.remove("fade-swap"); void pr.offsetWidth; pr.classList.add("fade-swap");
    $$(".thumb", pr).forEach((b) => b.addEventListener("click", () => lightbox(s.photos.filter((p) => url(p.src)), s.photos.filter((p) => url(p.src)).indexOf(s.photos[+b.dataset.k]))));
  };
  $("#subject").addEventListener("change", (e) => { id = e.target.value; setParam("subject", id); render(); });
  render();
}

async function pageTraining() {
  const data = await load("achievements-training");
  const cats = data.categories;
  const keys = Object.keys(cats);
  let cat = keys.includes(params.get("category")) ? params.get("category") : keys[0];

  $("#main").innerHTML = `<div class="container page-in">
    <header class="page-head">
      <div id="crumb"></div>
      <h1 class="page-title">Achievements, recognition and capability development</h1>
      <p class="page-sub">${esc(data.intro)}</p>
    </header>
    <div class="at-top">
      <div class="select-card"><label for="cat">View category</label>
        <select id="cat">${keys.map((k) => `<option value="${k}">${esc(cats[k].label)}</option>`).join("")}</select></div>
      <div class="card" id="cat-intro"></div>
    </div>
    <div id="records" class="section"></div>
  </div>`;

  const tones = ["tone-1", "tone-2", "tone-3"];
  const recCard = (r, k, isAch) => `<button class="card record lift" data-k="${k}">
      ${url(r.image) ? pic(r.image, r.title) : `<div class="imgph ratio ${tones[k % 3]}" aria-hidden="true">${ICON.plus}</div>`}
      <span class="body">
        <span class="chips">${isAch ? `<span class="chip">${txt(r.category)}</span>` : `<span class="chip">${r.type === "external" ? "External" : "Internal"}</span>${statusChip(r.status)}`}</span>
        <span class="rt">${txt(r.title)}</span>
        <span class="meta">${fmtDate(isAch ? r.date : r.startDate)}<span class="dot">•</span>${txt(r.organizer)}</span>
        <span class="rd">${txt(isAch ? r.description : r.overview)}</span>
      </span>
    </button>`;

  const detail = (r, isAch) => openModal(`
      ${url(r.image) ? `<div style="margin-bottom:18px">${pic(r.image, r.title)}</div>` : ""}
      <div class="chips">${isAch ? `<span class="chip">${txt(r.category)}</span>` : `<span class="chip">${r.type === "external" ? "External training" : "Internal training"}</span>${statusChip(r.status)}`}</div>
      <h2 style="font-size:1.35rem;margin:10px 0 4px">${txt(r.title)}</h2>
      ${isAch
        ? `<dl class="kv"><dt>Date / year</dt><dd>${fmtDate(r.date)}</dd><dt>Recipient</dt><dd>${txt(r.recipient)}</dd><dt>Awarding body</dt><dd>${txt(r.organizer)}</dd><dt>Category</dt><dd>${txt(r.category)}</dd></dl>
           <h3 class="section-title" style="margin-top:20px">Description</h3>${paras(r.description)}
           ${r.evidence?.length ? `<h3 class="section-title" style="margin-top:20px">Evidence</h3><div class="links">${r.evidence.map(extLink).join("")}</div>` : ""}`
        : `<dl class="kv"><dt>Date</dt><dd>${fmtDate(r.startDate)}${r.endDate ? ` – ${fmtDate(r.endDate)}` : ""}</dd><dt>Duration</dt><dd>${txt(r.duration)}</dd><dt>Organizer / trainer</dt><dd>${txt(r.organizer)}</dd><dt>Audience</dt><dd>${txt(r.audience)}</dd></dl>
           <h3 class="section-title" style="margin-top:20px">Overview</h3>${paras(r.overview)}
           <h3 class="section-title" style="margin-top:20px">Outcomes</h3>${paras(r.outcomes)}
           ${r.photos?.length ? `<div class="thumbs">${r.photos.map((p) => pic(p.src, p.caption, p.caption || "Photo")).join("")}</div>` : ""}
           ${r.resources?.length ? `<h3 class="section-title" style="margin-top:20px">Resources</h3><div class="links">${r.resources.map(extLink).join("")}</div>` : ""}`}`);

  const render = () => {
    $("#cat").value = cat;
    $("#crumb").innerHTML = crumbs('<a href="achievement-training.html">Achievement &amp; Training</a>', `<span>${esc(cats[cat].label)}</span>`);
    $("#cat-intro").innerHTML = `<div class="card-head"><span class="icon-tile">${cat === "achievements" ? ICON.trophy : ICON.cal}</span><h2>${esc(cats[cat].label)}</h2></div><p class="small">${txt(cats[cat].intro)}</p>`;
    const isAch = cat === "achievements";
    const list = isAch ? shown(data.achievements).sort(byDateDesc("date"))
      : shown(data.training).filter((t) => (cat === "external-training" ? t.type === "external" : t.type !== "external")).sort(byDateDesc("startDate"));
    const box = $("#records");
    box.innerHTML = list.length ? `<div class="grid g3">${list.map((r, k) => recCard(r, k, isAch)).join("")}</div>` : `<p class="empty">No records published yet.</p>`;
    box.classList.remove("fade-swap"); void box.offsetWidth; box.classList.add("fade-swap");
    $$(".record", box).forEach((b) => b.addEventListener("click", () => detail(list[+b.dataset.k], isAch)));
  };
  $("#cat").addEventListener("change", (e) => { cat = e.target.value; setParam("category", cat); render(); });
  render();
}

async function pageMedia() {
  const data = await load("media");
  const albums = shown(data.albums).sort(byDateDesc("date"));
  const filters = [...new Set([...(data.filters || []), ...albums.map((a) => a.category).filter(Boolean)])];
  const PER_PAGE = 9;
  let f = filters.includes(params.get("category")) ? params.get("category") : "all";
  let limit = PER_PAGE;

  $("#main").innerHTML = `<div class="container page-in">
    <header class="page-head">
      ${crumbs("<span>Media</span>")}
      <h1 class="page-title">Moments, projects and activities from the laboratory</h1>
      <p class="page-sub">${esc(data.intro)}</p>
    </header>
    <div class="filters" role="group" aria-label="Filter albums">
      <button class="filter" data-f="all">All Media</button>
      ${filters.map((x) => `<button class="filter" data-f="${esc(x)}">${esc(x)}</button>`).join("")}
    </div>
    <div id="gallery" class="section"></div>
    <div class="more-wrap"><button class="btn secondary" id="more" hidden>Load more</button></div>
  </div>`;

  const items = (a) => shown(a.items).filter((i) => i.type !== "video");
  const openAlbum = (a) => {
    setParam("album", a.id);
    const photos = items(a);
    const videos = shown(a.items).filter((i) => i.type === "video" && url(i.url));
    const d = openModal(`
      <div class="meta" style="text-transform:uppercase;letter-spacing:.06em">${esc(a.category || "")} · ${fmtDate(a.date)}</div>
      <h2 style="font-size:1.4rem;margin:6px 0 10px">${txt(a.title)}</h2>
      ${paras(a.description)}
      ${a.credit ? `<p class="small">Photo credit: ${esc(a.credit)}</p>` : ""}
      ${photos.length ? `<div class="thumbs">${photos.map((p, k) => `<button class="thumb" data-k="${k}" aria-label="Open photo ${k + 1}${p.caption && !isPh(p.caption) ? `: ${esc(p.caption)}` : ""}">${pic(p.src, p.alt || p.caption, "Photo", "ratio-sq")}</button>`).join("")}</div>` : `<p class="empty" style="margin-top:14px">Photos for this album have not been uploaded yet.</p>`}
      ${videos.length ? `<h3 class="section-title" style="margin-top:20px">Videos</h3><div class="links">${videos.map((v) => extLink({ label: v.caption || "Watch video", url: v.url })).join("")}</div>` : ""}`,
      () => setParam("album", ""));
    $$(".thumb", d).forEach((b) => b.addEventListener("click", () => lightbox(photos, +b.dataset.k)));
  };

  const render = () => {
    $$(".filter").forEach((b) => b.setAttribute("aria-pressed", b.dataset.f === f));
    const list = albums.filter((a) => f === "all" || a.category === f || (a.tags || []).includes(f));
    const g = $("#gallery");
    g.innerHTML = list.length ? `<div class="grid g3">${list.slice(0, limit).map((a, k) => `<button class="card album lift" data-id="${esc(a.id)}">
        ${url(a.cover) ? pic(a.cover, a.title) : `<div class="imgph ratio tone-${(k % 6) + 1}" aria-hidden="true"><svg class="x" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><path d="M20 70 55 32l35 38z" fill="#8FBEDF"/><rect x="20" y="58" width="120" height="20" fill="#B3D3EA"/><rect x="92" y="45" width="34" height="33" fill="#fff" stroke="#9CC6E6"/></svg></div>`}
        <span class="row"><span class="at">${txt(a.title)}</span><span class="dt">${fmtDate(a.date)}</span></span>
      </button>`).join("")}</div>` : `<p class="empty">No albums in this category yet.</p>`;
    g.classList.remove("fade-swap"); void g.offsetWidth; g.classList.add("fade-swap");
    $("#more").hidden = list.length <= limit;
    $$(".album", g).forEach((b) => b.addEventListener("click", () => openAlbum(albums.find((a) => a.id === b.dataset.id))));
  };

  $$(".filter").forEach((b) => b.addEventListener("click", () => { f = b.dataset.f; limit = PER_PAGE; setParam("category", f === "all" ? "" : f); render(); }));
  $("#more").addEventListener("click", () => { limit += PER_PAGE; render(); });
  render();
  const deep = albums.find((a) => a.id === params.get("album"));
  if (deep) openAlbum(deep);
}

/* ---------- boot ---------- */
const PAGES = { home: pageHome, profile: pageProfile, assistants: pageAssistants, practicum: pagePracticum, training: pageTraining, media: pageMedia };

(async () => {
  try {
    const site = await load("site");
    window.SITE = site;
    renderHeader(site);
    renderFooter(site);
    const label = (NAV.find((n) => n[0] === page) || [])[1];
    const name = isPh(site.name) ? "Laboratory" : site.name;
    if (page !== "practicum") document.title = page === "home" ? name : `${label} — ${name}`;
    if (PAGES[page]) await PAGES[page](site);
    reveal();
  } catch (err) {
    console.error(err);
    $("#main").innerHTML = `<div class="container"><div class="card"><h1 class="page-title">Content could not be loaded</h1>
      <p class="page-sub">If you opened this file directly from your computer, run a local server instead (see README). Otherwise check that the files in /content are valid JSON.</p></div></div>`;
  }
})();
