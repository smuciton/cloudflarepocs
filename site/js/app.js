// ── Cloudflare PoC Hub · app ────────────────────────────────────────────────

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

const state = {
  theme: store.get("poc_theme", "dark"),
  flash: { product: "all", idx: 0, flipped: false },
  quiz: { idx: 0, score: 0, answered: false, picked: -1, done: false, results: [] },
  lastRun: 0
};

// ── Theme ────────────────────────────────────────────────────────────────────
function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  store.set("poc_theme", state.theme);
  const btn = $("#theme-btn");
  if (btn) btn.textContent = state.theme === "dark" ? "☀︎ Claro" : "☾ Oscuro";
}
function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
}

// ── Router ───────────────────────────────────────────────────────────────────
function route() {
  return (location.hash.replace(/^#\/?/, "") || "inicio").split("/");
}
function go(p) { location.hash = "#/" + p; }

window.addEventListener("hashchange", render);

// ── Sidebar ──────────────────────────────────────────────────────────────────
function renderSidebar() {
  const openSections = new Set(store.get("poc_open_sections", PRODUCTS.map(p => p.id)));
  const sb = $("#sidebar");
  sb.innerHTML = `
    <div class="brand">
      <div class="brand-title">Cloudflare Portafolio Guide</div>
      <div class="brand-sub">Training · Hands-on Labs</div>
    </div>
    <div class="searchbox" id="search-open">
      <span style="color:var(--text-faint)">⌕</span>
      <input type="text" placeholder="Buscar…" readonly />
      <span class="kbd">⌘K</span>
    </div>
    <div class="side-actions">
      <button class="side-btn" id="expand-all">Expandir todo</button>
      <button class="side-btn" id="collapse-all">Colapsar</button>
      <button class="side-btn" id="theme-btn"></button>
    </div>
    <div class="side-label">Accesos rápidos</div>
    <nav id="quick-nav">
      ${[...NAV_TOP, ...QUICK_LINKS, ...NAV_EXTRA].map(q => `
        <a class="nav-link" href="#/${q.id}" data-route="${q.id}">
          <span class="dot" style="background:${q.color};box-shadow:0 0 8px ${q.color}"></span>${q.label}
        </a>`).join("")}
    </nav>
    <div class="side-label">Application Security</div>
    <div id="sections">
      ${PRODUCTS.map(p => `
        <div class="section ${openSections.has(p.id) ? "open" : ""}" data-section="${p.id}">
          <button class="section-head">
            <span class="num" style="color:${p.accent}">${p.num}</span>
            <span>${p.name}</span>
            <span class="obj-count">${p.objectives.length} objetivos</span>
            <span class="chev">▶</span>
          </button>
          <div class="section-body">
            ${p.objectives.map((o, i) => `<a href="#/producto/${p.id}">${i + 1}. ${o}</a>`).join("")}
          </div>
        </div>`).join("")}
    </div>`;

  $("#search-open").addEventListener("click", openPalette);
  $("#theme-btn").addEventListener("click", toggleTheme);
  $("#expand-all").addEventListener("click", () => setAllSections(true));
  $("#collapse-all").addEventListener("click", () => setAllSections(false));
  $$(".section-head", sb).forEach(h => h.addEventListener("click", () => {
    const sec = h.parentElement;
    sec.classList.toggle("open");
    const open = $$(".section.open", sb).map(s => s.dataset.section);
    store.set("poc_open_sections", open);
  }));
  applyTheme();
}

function setAllSections(open) {
  $$("#sections .section").forEach(s => s.classList.toggle("open", open));
  store.set("poc_open_sections", open ? PRODUCTS.map(p => p.id) : []);
}

// ── Command palette (⌘K) ────────────────────────────────────────────────────
function paletteItems() {
  const items = [
    ...PRODUCTS.map(p => ({ label: `${p.num} ${p.name}`, hint: p.tagline, type: "producto", go: `producto/${p.id}` })),
    ...LABS.map(l => ({ label: l.title, hint: l.goal, type: "lab", go: `labs/${l.id}` })),
    ...FLASHCARDS.map(f => ({ label: f.q, hint: f.a.slice(0, 60) + "…", type: "flashcard", go: "flashcards" })),
    { label: "Practice Quiz", hint: "Preguntas estilo examen", type: "quiz", go: "quiz" },
    { label: "Pruebas de seguridad", hint: "Lanza pruebas controladas contra tus demos", type: "demo", go: "pruebas" },
    { label: "Mi Progreso", hint: "Racha, dominio y puntajes", type: "vista", go: "progreso" }
  ];
  return items;
}

function openPalette() {
  const ov = $("#palette");
  ov.hidden = false;
  const input = $("#palette-input");
  input.value = "";
  renderPaletteResults("");
  input.focus();
}
function closePalette() { $("#palette").hidden = true; }

function renderPaletteResults(q) {
  state.palIdx = 0;
  const res = paletteItems()
    .filter(i => (i.label + " " + i.hint).toLowerCase().includes(q.toLowerCase()))
    .slice(0, 10);
  $("#palette-results").innerHTML = res.map((i, idx) => `
    <div class="palette-item ${idx === 0 ? "sel" : ""}" data-go="${i.go}">
      <span>${i.label}</span><span class="type">${i.type}</span>
    </div>`).join("") || `<div class="palette-item muted">Sin resultados</div>`;
  $$("#palette-results .palette-item[data-go]").forEach(el =>
    el.addEventListener("click", () => { closePalette(); go(el.dataset.go); }));
}

function movePaletteSel(d) {
  const items = $$("#palette-results .palette-item[data-go]");
  if (!items.length) return;
  state.palIdx = (state.palIdx + d + items.length) % items.length;
  items.forEach((el, i) => el.classList.toggle("sel", i === state.palIdx));
  items[state.palIdx].scrollIntoView({ block: "nearest" });
}

document.addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); }
  const ov = $("#palette");
  if (e.key === "Escape") { closePalette(); closeDiagramModal(); return; }
  if (ov.hidden) return;
  if (e.key === "ArrowDown") { e.preventDefault(); movePaletteSel(1); }
  if (e.key === "ArrowUp") { e.preventDefault(); movePaletteSel(-1); }
  if (e.key === "Enter") {
    const sel = $(".palette-item.sel");
    if (sel?.dataset.go) { closePalette(); go(sel.dataset.go); }
  }
});
$("#palette")?.addEventListener("click", e => { if (e.target.id === "palette") closePalette(); });
document.addEventListener("input", e => {
  if (e.target.id === "palette-input") renderPaletteResults(e.target.value);
});

// ── Views ────────────────────────────────────────────────────────────────────
function viewInicio() {
  return `
    <h2 class="page-title">Bienvenido al hub 👋</h2>
    <p class="page-sub">Tu panel de Application Security para estudiar, practicar y demostrar Cloudflare en vivo.</p>
    <div class="grid grid-4">
      ${QUICK_LINKS.map(q => `
        <div class="card clickable framed" style="--accent:${q.color}" onclick="location.hash='#/${q.id}'">
          <span class="icon">${q.icon}</span>
          <div class="card-kicker" style="--accent:${q.color}">${q.label}</div>
          <p>${q.desc}</p>
        </div>`).join("")}
    </div>
    <div class="section-title">Dominios · Application Security</div>
    <div class="grid grid-2">
      ${PRODUCTS.map(p => `
        <div class="card clickable card-accent-top" style="--accent:${p.accent}" onclick="location.hash='#/producto/${p.id}'">
          <div class="card-kicker" style="--accent:${p.accent}">${p.num} · ${p.weight}% peso</div>
          <h3>${p.name}</h3>
          <p>${p.tagline}</p>
          <div class="meta-row"><span>${p.objectives.length} objetivos</span><span>·</span><span>${p.solves.split(",")[0]}</span></div>
        </div>`).join("")}
    </div>
    <div class="section-title">From the Blog</div>
    <div class="grid grid-3">
      ${BLOG.map(b => `
        <div class="card blog-card" style="--accent:${b.accent}">
          <span class="tag">${b.tag}</span>
          <h3>${b.title}</h3>
          <p>${b.desc}</p>
          <div class="date">${b.date}</div>
        </div>`).join("")}
    </div>`;
}

function viewPortafolio(focusId) {
  return `
    <h2 class="page-title">Portafolio · Application Security</h2>
    <p class="page-sub">Los siete dominios del portafolio, con objetivos, problemas que resuelven y pitch para cliente.</p>
    <div class="card" style="--accent:var(--orange);margin-bottom:26px">
      <div class="card-kicker">Mapa del portafolio</div>
      ${buildPfDiagram()}
      <div class="step-caption" id="pf-caption"><strong>Explora el mapa</strong><p>Cada capa del edge juega un rol: pasa el cursor sobre un producto para ver su pitch, o haz clic para abrir su página interactiva.</p></div>
    </div>
    ${PRODUCTS.map(p => `
      <div class="card product-card framed ${focusId === p.id ? "open" : ""}" id="p-${p.id}" style="--accent:${p.accent};margin-bottom:14px">
        <div class="product-head" data-toggle="${p.id}">
          <span class="product-num">${p.num}</span>
          <div style="flex:1">
            <h3>${p.name} <span class="weight-badge">${p.weight}%</span></h3>
            <p>${p.desc}</p>
          </div>
        </div>
        <div class="product-body">
          <div class="muted" style="margin-bottom:6px"><strong style="color:var(--text)">Resuelve:</strong> ${p.solves}</div>
          ${p.objectives.map(o => `<div class="objective">${o}</div>`).join("")}
          <div class="pitch">“${p.pitch}”</div>
          <a class="btn btn-sm" href="#/producto/${p.id}" style="margin-top:14px;display:inline-block">Explorar demo interactiva →</a>
        </div>
      </div>`).join("")}`;
}

function flashDeck() {
  return state.flash.product === "all"
    ? FLASHCARDS
    : FLASHCARDS.filter(f => f.product === state.flash.product);
}

function viewFlashcards() {
  const deck = flashDeck();
  const f = deck[state.flash.idx % deck.length];
  const prod = PRODUCTS.find(p => p.id === f.product);
  return `
    <h2 class="page-title">Flashcards</h2>
    <p class="page-sub">Voltea con clic o espacio · ← → para navegar.</p>
    <div class="field" style="max-width:280px;margin-bottom:22px">
      <label>Producto</label>
      <select id="flash-filter">
        <option value="all">Todos (${FLASHCARDS.length})</option>
        ${PRODUCTS.map(p => {
          const n = FLASHCARDS.filter(fc => fc.product === p.id).length;
          return n ? `<option value="${p.id}" ${state.flash.product === p.id ? "selected" : ""}>${p.name} (${n})</option>` : "";
        }).join("")}
      </select>
    </div>
    <div class="flash-stage">
      <div class="flashcard ${state.flash.flipped ? "flipped" : ""}" id="flashcard" style="--accent:${prod.accent}">
        <div class="flash-face front">
          <div class="card-kicker">${prod.name}</div>
          <div class="q">${f.q}</div>
          <div class="hint">clic para voltear</div>
        </div>
        <div class="flash-face back">
          <div class="card-kicker">Respuesta</div>
          <div class="a">${f.a}</div>
        </div>
      </div>
    </div>
    <div class="flash-nav">
      <button class="btn" id="flash-prev">←</button>
      <span class="flash-count">${(state.flash.idx % deck.length) + 1} / ${deck.length}</span>
      <button class="btn" id="flash-flip">Voltear</button>
      <button class="btn" id="flash-next">→</button>
    </div>`;
}

function viewQuiz() {
  const qz = state.quiz;
  if (qz.done) {
    const pct = Math.round((qz.score / QUIZ.length) * 100);
    const prev = store.get("poc_quiz_scores", []);
    return `
      <h2 class="page-title">Resultado del quiz</h2>
      <p class="page-sub">Repasa tu desempeño y vuelve a intentarlo cuando quieras.</p>
      <div class="grid grid-3" style="margin-bottom:24px">
        <div class="card stat-card" style="--accent:${pct >= 70 ? "var(--green)" : "var(--red)"}">
          <div class="stat-num">${qz.score}/${QUIZ.length}</div><div class="stat-label">Aciertos</div>
        </div>
        <div class="card stat-card"><div class="stat-num">${pct}%</div><div class="stat-label">Puntaje</div></div>
        <div class="card stat-card" style="--accent:var(--cyan)"><div class="stat-num">${prev.length}</div><div class="stat-label">Intentos totales</div></div>
      </div>
      ${QUIZ.map((q, i) => `
        <div class="card" style="margin-bottom:12px;--accent:${qz.results[i] ? "var(--green)" : "var(--red)"}">
          <div class="quiz-q">${i + 1}. ${q.q}</div>
          <p class="muted">Tu respuesta: <strong style="color:${qz.results[i] ? "var(--green)" : "var(--red)"}">${q.opts[qz.picks?.[i] ?? q.answer]}</strong></p>
          <p class="muted mt-2">✔ ${q.opts[q.answer]} — ${q.why}</p>
        </div>`).join("")}
      <button class="btn btn-primary mt-2" id="quiz-restart">Reintentar quiz</button>`;
  }
  const q = QUIZ[qz.idx];
  const prod = PRODUCTS.find(p => p.id === q.product);
  return `
    <h2 class="page-title">Practice Quiz</h2>
    <p class="page-sub">${QUIZ.length} preguntas estilo examen sobre Application Security.</p>
    <div class="progress-track"><div class="progress-fill" style="width:${(qz.idx / QUIZ.length) * 100}%"></div></div>
    <div class="card" style="--accent:${prod.accent}">
      <div class="card-kicker">${prod.name} · Pregunta ${qz.idx + 1}/${QUIZ.length}</div>
      <div class="quiz-q">${q.q}</div>
      ${q.opts.map((o, i) => `
        <button class="quiz-opt" data-opt="${i}" ${qz.answered ? "disabled" : ""}
          ${qz.answered && i === q.answer ? 'class="quiz-opt correct"' : qz.answered && i === qz.picked ? 'class="quiz-opt wrong"' : ""}>${o}</button>`).join("")}
      ${qz.answered ? `
        <div class="quiz-feedback ${qz.picked === q.answer ? "ok" : "bad"}">
          <strong>${qz.picked === q.answer ? "✔ Correcto." : "✘ Incorrecto."}</strong> ${q.why}
        </div>
        <button class="btn btn-primary mt-2" id="quiz-next">${qz.idx === QUIZ.length - 1 ? "Ver resultado" : "Siguiente →"}</button>` : ""}
    </div>`;
}

function labProgress(id, steps) {
  const all = store.get("poc_labs", {});
  return all[id] || steps.map(() => false);
}

function viewLabs(focusId) {
  return `
    <h2 class="page-title">Hands-on Labs</h2>
    <p class="page-sub">Demos guiadas paso a paso. El progreso se guarda en este navegador.</p>
    ${LABS.map(l => {
      const prog = labProgress(l.id, l.steps);
      const done = prog.filter(Boolean).length;
      const pct = Math.round((done / l.steps.length) * 100);
      return `
      <div class="card" id="${l.id}" style="--accent:${l.accent};margin-bottom:18px">
        <div class="card-kicker">${PRODUCTS.find(p => p.id === l.product)?.name || ""}</div>
        <h3>${l.title}</h3>
        <p><strong>Objetivo:</strong> ${l.goal}</p>
        <p class="muted" style="margin-top:4px"><strong>Requisitos:</strong> ${l.reqs}</p>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${l.accent}"></div></div>
        <p class="muted" style="margin-bottom:12px">${done}/${l.steps.length} pasos · ${pct}%</p>
        ${l.steps.map((s, i) => `
          <div class="lab-step ${prog[i] ? "done" : ""}">
            <input type="checkbox" data-lab="${l.id}" data-step="${i}" ${prog[i] ? "checked" : ""} />
            <div>
              <div class="step-title">${i + 1}. ${s.title}</div>
              <div class="step-desc">${s.desc}</div>
              <div class="step-note">🎤 ${s.note}</div>
            </div>
          </div>`).join("")}
        <button class="btn btn-sm" data-reset-lab="${l.id}">Reiniciar</button>
      </div>`;
    }).join("")}`;
}

function viewProgreso() {
  const labs = store.get("poc_labs", {});
  const scores = store.get("poc_quiz_scores", []);
  const totalSteps = LABS.reduce((a, l) => a + l.steps.length, 0);
  const doneSteps = LABS.reduce((a, l) => a + (labs[l.id] || []).filter(Boolean).length, 0);
  const best = scores.length ? Math.max(...scores) : 0;
  const mastery = PRODUCTS.map(p => {
    const lab = LABS.find(l => l.product === p.id);
    const labPct = lab ? ((labs[lab.id] || []).filter(Boolean).length / lab.steps.length) * 100 : 0;
    const cards = FLASHCARDS.filter(f => f.product === p.id).length;
    const base = cards ? Math.min(60, cards * 12) : 20;
    return { p, pct: Math.round(Math.min(100, base + labPct * 0.4)) };
  });
  return `
    <h2 class="page-title">Mi Progreso</h2>
    <p class="page-sub">Racha, dominio por producto y puntajes de quiz (datos locales de este navegador).</p>
    <div class="grid grid-4" style="margin-bottom:24px">
      <div class="card stat-card"><div class="stat-num">3</div><div class="stat-label">Días de racha</div></div>
      <div class="card stat-card" style="--accent:var(--cyan)"><div class="stat-num">${doneSteps}/${totalSteps}</div><div class="stat-label">Pasos de lab</div></div>
      <div class="card stat-card" style="--accent:var(--amber)"><div class="stat-num">${best}%</div><div class="stat-label">Mejor quiz</div></div>
      <div class="card stat-card" style="--accent:var(--blue)"><div class="stat-num">${scores.length}</div><div class="stat-label">Quizzes</div></div>
    </div>
    <div class="section-title">Dominio por producto</div>
    <div class="card">
      ${mastery.map(m => `
        <div class="mastery-row">
          <span class="name">${m.p.num} ${m.p.name}</span>
          <div class="progress-track"><div class="progress-fill" style="width:${m.pct}%;background:${m.p.accent}"></div></div>
          <span class="pct">${m.pct}%</span>
        </div>`).join("")}
    </div>`;
}

function viewPruebas() {
  const hist = store.get("poc_tests", []);
  return `
    <h2 class="page-title">Pruebas de seguridad</h2>
    <p class="page-sub">Lanza pruebas controladas contra tus propios sitios de demo ya protegidos por Cloudflare.</p>
    <div class="card" style="--accent:var(--orange)">
      <div class="form-row">
        <div class="field">
          <label>Destino (allowlist)</label>
          <select id="test-host">
            ${ALLOWLIST.map(h => `<option>${h}</option>`).join("")}
          </select>
          <div class="allowlist-note">🔒 Solo destinos de demostración propios — la allowlist está fijada en el código.</div>
        </div>
        <div class="field">
          <label>Prueba</label>
          <select id="test-kind">
            ${SECURITY_TESTS.map(t => `<option value="${t.id}">${t.name}</option>`).join("")}
          </select>
        </div>
      </div>
      <p class="test-desc" id="test-desc"></p>
      <div class="curl-box"><code id="curl-cmd"></code><button class="btn btn-sm" id="curl-copy">Copiar</button></div>
      <button class="btn btn-primary" id="test-run">Ejecutar prueba</button>
      <span class="muted" id="test-note" style="margin-left:12px"></span>
      <div id="test-result">${state.testResult || ""}</div>
    </div>
    <div class="section-title">Historial</div>
    <div class="card" style="padding:8px 16px">
      ${hist.length ? `<table>
        <thead><tr><th>Hora</th><th>Destino</th><th>Prueba</th><th>Estado</th><th>cf-ray</th><th>Veredicto</th></tr></thead>
        <tbody>${hist.slice(0, 15).map(h => `
          <tr>
            <td class="mono">${h.time}</td><td class="mono">${h.host}</td><td>${h.test}</td>
            <td class="mono">${h.status}</td><td class="mono">${h.ray || "—"}</td>
            <td><span class="pill ${h.blocked ? "ok" : "pass"}">${h.blocked ? "Bloqueado" : "Pasó"}</span></td>
          </tr>`).join("")}</tbody></table>`
      : `<p class="muted" style="padding:10px 0">Aún no hay ejecuciones.</p>`}
      ${hist.length ? `<button class="btn btn-sm" id="hist-clear" style="margin:10px 0">Limpiar historial</button>` : ""}
    </div>`;
}

// ── Diagramas interactivos (estilo Cloudflare) ───────────────────────────────
function cfCloud(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="9" cy="17" r="9" fill="#FBAD41"/>
    <rect x="4" y="17" width="15" height="12" rx="6" fill="#FBAD41"/>
    <circle cx="26" cy="13" r="12" fill="#F6821F"/>
    <circle cx="38" cy="18" r="8" fill="#F6821F"/>
    <rect x="15" y="18" width="30" height="11" rx="5.5" fill="#F6821F"/>
  </g>`;
}

function flowSpec(d) {
  const sy = d.sources.length === 1 ? [180] : [115, 265];
  const mods = [];
  if (d.premod) mods.push({ id: "premod", label: d.premod.label, sub: d.premod.sub });
  mods.push({ id: "mod", label: d.module, sub: d.moduleSub });
  const n = mods.length, bw = n === 2 ? 105 : 175, mx = n === 2 ? 340 : 375;
  mods.forEach((m, i) => Object.assign(m, { x: mx + i * (bw + 15), y: 140, w: bw, h: 80 }));
  const last = mods[n - 1];
  const modRight = last.x + last.w, modBX = last.x + last.w / 2;
  const nodes = d.sources.map((s, i) => ({ id: `s${i}`, x: 75, y: sy[i], icon: s.icon, label: s.label, sub: s.packet, cls: s.cls }));
  const edges = d.sources.map((s, i) => ({
    id: `e-in${i}`, x1: 103, y1: sy[i], x2: 268,
    y2: d.sources.length === 1 ? 180 : (i === 0 ? 175 : 205),
    cls: s.cls, label: s.packet
  }));
  edges.push({ id: "e-dc", x1: 332, y1: 180, x2: mods[0].x - 3, y2: 180, cls: "good" });
  if (n === 2) edges.push({ id: "e-mm", x1: mods[0].x + bw + 3, y1: 180, x2: mods[1].x - 3, y2: 180, cls: "good" });
  edges.push({ id: "e-out0", x1: modRight + 3, y1: 180, x2: 642, y2: 180, cls: "good" });
  edges.push({ id: "e-out1", x1: modBX, y1: 222, x2: modBX, y2: 280, cls: "bad" });
  return { d, mods, nodes, edges, modRight, modBX };
}

function iconBox(n) {
  return `<g data-did="${n.id}" class="d-node ${n.cls}">
    <rect x="${n.x - 26}" y="${n.y - 26}" width="52" height="52" rx="10"/>
    <text class="d-icon" x="${n.x}" y="${n.y + 8}" text-anchor="middle">${n.icon}</text>
    <text class="d-nlabel" x="${n.x}" y="${n.y + 44}" text-anchor="middle">${n.label}</text>
    ${n.sub ? `<text class="d-nlabel sm" x="${n.x}" y="${n.y + 57}" text-anchor="middle">${n.sub}</text>` : ""}
  </g>`;
}

function buildDiagram(spec) {
  const svg = [`<svg class="diagram" viewBox="0 0 780 355" xmlns="http://www.w3.org/2000/svg">`];
  svg.push(`<rect class="d-bg" x="0" y="0" width="780" height="355" rx="14"/>`);
  if (spec.type === "client") { buildClientInto(svg, spec); svg.push("</svg>"); return svg.join(""); }
  const { d, mods, nodes, edges, modRight, modBX } = flowSpec(spec);
  svg.push(`<rect class="d-inet" x="10" y="30" width="762" height="310" rx="14"/>
    <text class="d-inetlabel" x="42" y="22">☁ Internet</text>`);
  if (d.announce) svg.push(`<g class="d-announce"><text x="46" y="52" font-size="17">📣</text>
    <text class="d-an-t" x="72" y="46">BGP Announcement</text>
    <text class="d-an-s" x="72" y="60">Cloudflare Anycast IPs · Customer IPs</text></g>`);
  svg.push(`<rect data-did="edge" class="d-net" x="255" y="62" width="335" height="268" rx="12"/>`);
  svg.push(cfCloud(280, 74, 0.85));
  svg.push(`<text class="d-nettitle" x="432" y="90" text-anchor="middle">Cloudflare Global Network</text>`);
  for (const e of edges) {
    const mx = (e.x1 + e.x2) / 2, my = (e.y1 + e.y2) / 2;
    svg.push(`<path data-did="${e.id}" class="d-edge ${e.cls}" d="M ${e.x1} ${e.y1} L ${e.x2} ${e.y2}"/>`);
    if (e.label) svg.push(`<text data-did="${e.id}" class="d-elabel ${e.cls}" x="${mx}" y="${my - 8}" text-anchor="middle">${e.label}</text>`);
  }
  svg.push(`<g data-did="dc" class="d-dc">
    <text class="d-dc-t" x="300" y="112" text-anchor="middle">Data Center</text>
    <rect class="d-dcbox" x="270" y="120" width="60" height="140" rx="8"/>
    <rect class="d-srv" x="279" y="132" width="42" height="13" rx="3"/>
    <rect class="d-srv" x="279" y="151" width="42" height="13" rx="3"/>
    <rect class="d-srv" x="279" y="170" width="42" height="13" rx="3"/>
    <rect class="d-srv" x="279" y="189" width="42" height="13" rx="3"/>
    <text class="d-dc-s" x="300" y="228" text-anchor="middle">Server</text>
  </g>`);
  for (const m of mods) {
    svg.push(`<g data-did="${m.id}" class="d-mod-g"><rect x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}" rx="8"/>
      <text class="d-modtitle" x="${m.x + m.w / 2}" y="${m.y + 34}" text-anchor="middle">${m.label}</text>
      <text class="d-modsub" x="${m.x + m.w / 2}" y="${m.y + 52}" text-anchor="middle">${m.sub}</text></g>`);
  }
  const chkX = (modRight + 648) / 2;
  svg.push(`<g data-did="chk" class="d-chk"><circle cx="${chkX}" cy="180" r="13"/><text x="${chkX}" y="185" text-anchor="middle">✓</text></g>`);
  svg.push(`<g data-did="t0" class="d-cust">
    <text class="d-cust-t" x="704" y="52" text-anchor="middle">Customer Network /</text>
    <text class="d-cust-t" x="704" y="66" text-anchor="middle">Applications</text>
    <rect x="645" y="78" width="118" height="120" rx="10"/>
    <rect class="d-srv b" x="662" y="95" width="84" height="14" rx="3"/>
    <rect class="d-srv b" x="662" y="115" width="84" height="14" rx="3"/>
    <rect class="d-srv b" x="662" y="135" width="84" height="14" rx="3"/>
    <text class="d-cust-s" x="704" y="172" text-anchor="middle">${d.targets[0].icon} ${d.targets[0].label}</text>
    <text class="d-cust-s" x="704" y="188" text-anchor="middle">☁️ Public clouds</text>
  </g>`);
  svg.push(`<g data-did="t1" class="d-blocked">
    <rect x="${modBX - 58}" y="282" width="116" height="42" rx="9"/>
    <text x="${modBX}" y="308" text-anchor="middle">⛔ ${d.targets[1].label}</text>
  </g>`);
  for (const n of nodes) svg.push(iconBox(n));
  svg.push(`</svg>`);
  return svg.join("");
}

function buildClientInto(svg, spec) {
  const at = id => spec.nodes.find(n => n.id === id);
  const anchor = n => n.kind ? { x: n.x + n.w / 2, y: n.y + n.h / 2 } : { x: n.x, y: n.y };
  svg.push(`<rect class="d-inet" x="10" y="15" width="762" height="325" rx="14"/>
    <text class="d-inetlabel" x="42" y="10">☁ Lado del cliente</text>`);
  for (const e of spec.edges) {
    const a = anchor(at(e.from)), b = anchor(at(e.to)), t = at(e.to);
    const x2 = b.x - (t.kind ? t.w / 2 + 4 : 34);
    const mx = (a.x + 30 + x2) / 2, my = (a.y + b.y) / 2;
    svg.push(`<path data-did="${e.id}" class="d-edge ${e.cls}" d="M ${a.x + 30} ${a.y} L ${x2} ${b.y}"/>`);
    if (e.label) svg.push(`<text data-did="${e.id}" class="d-elabel ${e.cls}" x="${mx}" y="${my - 8}" text-anchor="middle">${e.label}</text>`);
  }
  for (const n of spec.nodes) {
    if (n.kind === "edge") {
      svg.push(`<rect data-did="${n.id}" class="d-site" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="12"/>
        <text class="d-nettitle sm" x="${n.x + n.w / 2}" y="${n.y + 18}" text-anchor="middle">${n.label}</text>`);
    } else if (n.kind === "mod") {
      svg.push(`<g data-did="${n.id}" class="d-mod-g"><rect class="${n.cls === "warn" ? "warn" : ""}" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="8"/>
        <text class="d-modtitle" x="${n.x + n.w / 2}" y="${n.y + 26}" text-anchor="middle">${n.label}</text>
        ${n.sub ? `<text class="d-modsub" x="${n.x + n.w / 2}" y="${n.y + 42}" text-anchor="middle">${n.sub}</text>` : ""}</g>`);
    } else {
      svg.push(iconBox(n));
    }
  }
}

// ── Mapa del portafolio (vista Portafolio) ───────────────────────────────────
const PF_NAME = { waf: "WAF", bots: "Bot Mgmt", api: "API Shield", ddos: "DDoS", ratelimit: "Rate Limiting", pageshield: "Page Shield", ssl: "SSL/TLS" };
const PF_ICONS = { ddos: "🌊", ratelimit: "⏱️", waf: "🛡️", bots: "🤖", api: "🔌", pageshield: "👁️", ssl: "🔒" };
const PF_SUB = { ddos: "defensa volumétrica", ratelimit: "control de abuso", waf: "exploits y ataques", bots: "bots y fraude", api: "APIs seguras", pageshield: "lado del cliente", ssl: "cifrado gestionado" };

function pfTile(id, x, y) {
  const p = PRODUCTS.find(p => p.id === id);
  return `<g class="pf-tile" data-pid="${id}" transform="translate(${x} ${y})" style="--tacc:${p.accent}">
    <rect width="125" height="56" rx="8"/>
    <rect width="4" height="56" rx="2" fill="${p.accent}"/>
    <text class="pf-ic" x="14" y="34">${PF_ICONS[id]}</text>
    <text class="pf-name" x="38" y="27">${PF_NAME[id]}</text>
    <text class="pf-sub" x="38" y="43">${PF_SUB[id]}</text>
  </g>`;
}

function buildPfDiagram() {
  const rows = [
    { label: "PROTEGE TU INFRAESTRUCTURA", ids: ["ddos", "ratelimit"] },
    { label: "PROTEGE TUS APLICACIONES", ids: ["waf", "bots", "api"] },
    { label: "PROTEGE A TUS USUARIOS", ids: ["pageshield", "ssl"] }
  ];
  const s = [`<svg class="diagram" viewBox="0 0 780 430" xmlns="http://www.w3.org/2000/svg">`];
  s.push(`<rect class="d-bg" x="0" y="0" width="780" height="430" rx="14"/>`);
  s.push(`<path class="d-edge good on" d="M 101 220 L 168 220"/>`);
  s.push(`<text class="d-elabel good on" x="134" y="208" text-anchor="middle">tráfico</text>`);
  s.push(`<path class="d-edge good on" d="M 612 220 L 640 220"/>`);
  s.push(`<text class="d-elabel good on" x="626" y="208" text-anchor="middle">limpio</text>`);
  s.push(`<rect class="d-net" x="170" y="45" width="440" height="345" rx="14"/>`);
  s.push(cfCloud(196, 58, 0.85));
  s.push(`<text class="d-nettitle" x="420" y="74" text-anchor="middle">Application Security · detección integrada por ML</text>`);
  let y = 100;
  for (const r of rows) {
    s.push(`<text class="d-layer" x="390" y="${y - 6}" text-anchor="middle">${r.label}</text>`);
    const cols = r.ids.length === 3 ? [190, 327, 464] : [258, 395];
    r.ids.forEach((id, i) => s.push(pfTile(id, cols[i], y)));
    y += 84;
  }
  s.push(`<g class="pf-sc"><rect x="190" y="${y - 8}" width="399" height="42" rx="8"/>
    <text x="390" y="${y + 18}" text-anchor="middle">🛡️ Cloudflare Security Center · Security Events & Analytics</text></g>`);
  s.push(iconBox({ id: "pf-client", x: 75, y: 220, icon: "🌐", label: "Clientes / Internet", cls: "good" }));
  s.push(`<g class="d-cust"><rect x="645" y="150" width="115" height="140" rx="10"/>
    <text class="d-cust-t" x="702" y="172" text-anchor="middle">Tu origen /</text>
    <text class="d-cust-t" x="702" y="186" text-anchor="middle">apps</text>
    <rect class="d-srv b" x="662" y="200" width="80" height="14" rx="3"/>
    <rect class="d-srv b" x="662" y="220" width="80" height="14" rx="3"/>
    <rect class="d-srv b" x="662" y="240" width="80" height="14" rx="3"/>
    <text class="d-cust-s" x="702" y="272" text-anchor="middle">☁️ público · DC</text></g>`);
  s.push(`</svg>`);
  return s.join("");
}

function viewProducto(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p || !LEARN[id]) return viewPortafolio();
  const L = LEARN[id];
  const step = state.diagram?.product === id ? state.diagram.step : 0;
  return `
    <a class="muted" href="#/portafolio" style="text-decoration:none">← Portafolio</a>
    <div class="product-page">
      <div class="product-info">
        <div class="card-kicker" style="--accent:${p.accent}">${p.num} · Application Security</div>
        <h2 class="page-title">${p.name}</h2>
        <p class="page-sub" style="margin-bottom:18px">${p.tagline}</p>
        <h4 class="learn-h">Visión General</h4>
        <p class="muted">${p.desc} ${p.solves}</p>
        <h4 class="learn-h">Cómo Funciona</h4>
        <p class="muted">${L.how}</p>
        <div class="analogy"><span class="analogy-icon">💡</span><div><strong>Piénsalo así</strong><p>${L.analogy}</p></div></div>
        <h4 class="learn-h">Objetivos</h4>
        ${p.objectives.map(o => `<div class="objective" style="--accent:${p.accent}">${o}</div>`).join("")}
        <div class="pitch" style="--accent:${p.accent}">“${p.pitch}”</div>
      </div>
      <div class="product-diagram">
        <div class="card" style="--accent:${p.accent}">
          <div class="card-kicker">Diagrama interactivo</div>
          ${buildDiagram(L.diagram)}
          <div class="step-caption"></div>
          ${diagramControlsHTML(L.diagram.steps.length)}
          <div class="diagram-legend">
            <span><i class="lg good"></i> Tráfico legítimo</span>
            <span><i class="lg bad"></i> Ataque / bloqueado</span>
          </div>
        </div>
      </div>
    </div>`;
}

function diagramControlsHTML(n, zoom = true) {
  return `<div class="step-controls">
    <button class="btn btn-sm" data-step-act="prev">←</button>
    <div class="step-dots">${Array.from({ length: n }, (_, i) => `<button class="step-dot" data-step-act="step" data-step="${i}">${i + 1}</button>`).join("")}</div>
    <button class="btn btn-sm" data-step-act="next">→</button>
    <button class="btn btn-sm" data-step-act="play">▶ Auto</button>
    ${zoom ? `<button class="btn btn-sm" data-step-act="zoom">⛶ Ampliar</button>` : ""}
  </div>`;
}

const SVGNS = "http://www.w3.org/2000/svg";

function spawnPackets(svg) {
  svg.querySelectorAll(".d-packet, .d-burst").forEach(el => el.remove());
  svg.querySelectorAll(".d-edge.on").forEach(edge => {
    const d = edge.getAttribute("d");
    const bad = edge.classList.contains("bad");
    const pkt = document.createElementNS(SVGNS, "circle");
    pkt.setAttribute("r", "5");
    pkt.setAttribute("class", `d-packet ${bad ? "bad" : "good"}`);
    const am = document.createElementNS(SVGNS, "animateMotion");
    am.setAttribute("dur", "1.4s");
    am.setAttribute("repeatCount", "indefinite");
    am.setAttribute("path", d);
    pkt.appendChild(am);
    svg.appendChild(pkt);
    if (bad) {
      const m = d.match(/M ([\d.]+) ([\d.]+) L ([\d.]+) ([\d.]+)/);
      if (m) {
        const id = edge.dataset.did || "";
        const bx = id.includes("-in") ? +m[3] : id.includes("-out") ? +m[1] : (+m[1] + +m[3]) / 2;
        const by = id.includes("-in") ? +m[4] : id.includes("-out") ? +m[2] : (+m[2] + +m[4]) / 2;
        const burst = document.createElementNS(SVGNS, "g");
        burst.setAttribute("class", "d-burst");
        burst.innerHTML = `<circle cx="${bx}" cy="${by}" r="11"/><text x="${bx}" y="${by + 5}" text-anchor="middle">✕</text>`;
        svg.appendChild(burst);
      }
    }
  });
}

function setDiagramStep(i) {
  const [r, id] = route();
  const L = LEARN[id];
  if (!L) return;
  const n = L.diagram.steps.length;
  state.diagram = { product: id, step: (i + n) % n };
  const s = L.diagram.steps[state.diagram.step];
  $$("[data-did]").forEach(el => el.classList.toggle("on", s.on.includes(el.dataset.did)));
  $$(".step-dot").forEach((d, j) => d.classList.toggle("on", j === state.diagram.step));
  $$(".step-caption").forEach(c => c.innerHTML = `<strong>${state.diagram.step + 1}. ${s.t}</strong><p>${s.d}</p>`);
  $$(".diagram").forEach(spawnPackets);
}

function syncPlayBtns() {
  $$(`[data-step-act="play"]`).forEach(b => b.textContent = state.diagramTimer ? "⏸ Pausa" : "▶ Auto");
}

function togglePlay() {
  if (state.diagramTimer) {
    clearInterval(state.diagramTimer);
    state.diagramTimer = null;
  } else {
    state.diagramTimer = setInterval(() => {
      const [, id] = route();
      const L = LEARN[id];
      if (!L) { clearInterval(state.diagramTimer); state.diagramTimer = null; }
      else if (state.diagram.step >= L.diagram.steps.length - 1) {
        clearInterval(state.diagramTimer); state.diagramTimer = null; syncPlayBtns();
      } else setDiagramStep(state.diagram.step + 1);
    }, 2800);
  }
  syncPlayBtns();
}

function openDiagramModal() {
  const [, id] = route();
  const p = PRODUCTS.find(x => x.id === id);
  const L = LEARN[id];
  if (!p || !L || $("#diagram-modal")) return;
  const m = document.createElement("div");
  m.className = "diagram-modal";
  m.id = "diagram-modal";
  m.innerHTML = `
    <div class="diagram-modal-box" style="--accent:${p.accent}">
      <div class="dm-head">
        <span class="card-kicker">${p.num} ${p.name} · Diagrama interactivo</span>
        <button class="btn btn-sm" data-step-act="close-diagram">✕ Cerrar</button>
      </div>
      ${buildDiagram(L.diagram)}
      <div class="step-caption"></div>
      ${diagramControlsHTML(L.diagram.steps.length, false)}
      <div class="diagram-legend">
        <span><i class="lg good"></i> Tráfico legítimo</span>
        <span><i class="lg bad"></i> Ataque / bloqueado</span>
      </div>
    </div>`;
  m.addEventListener("click", e => { if (e.target === m) closeDiagramModal(); });
  document.body.appendChild(m);
  setDiagramStep(state.diagram.step);
  syncPlayBtns();
}

function closeDiagramModal() {
  $("#diagram-modal")?.remove();
  if (state.diagramTimer) { clearInterval(state.diagramTimer); state.diagramTimer = null; syncPlayBtns(); }
}

document.addEventListener("click", e => {
  const btn = e.target.closest("[data-step-act]");
  if (!btn) return;
  const act = btn.dataset.stepAct;
  if (!state.diagram && act !== "zoom" && act !== "close-diagram") return;
  if (act === "prev") setDiagramStep(state.diagram.step - 1);
  else if (act === "next") setDiagramStep(state.diagram.step + 1);
  else if (act === "step") setDiagramStep(+btn.dataset.step);
  else if (act === "play") togglePlay();
  else if (act === "zoom") openDiagramModal();
  else if (act === "close-diagram") closeDiagramModal();
});

// ── Render + event wiring ────────────────────────────────────────────────────
function markActiveNav() {
  const [r] = route();
  $$(".nav-link").forEach(a => a.classList.toggle("active", a.dataset.route === r));
}

function render() {
  const [r, arg] = route();
  const view = $("#view");
  const views = { inicio: viewInicio, portafolio: viewPortafolio, flashcards: viewFlashcards, quiz: viewQuiz, labs: viewLabs, progreso: viewProgreso, pruebas: viewPruebas, producto: viewProducto };
  view.innerHTML = views[r] ? views[r](arg) : viewInicio();
  markActiveNav();
  if (state.diagramTimer) { clearInterval(state.diagramTimer); state.diagramTimer = null; }
  wire(r, arg);
  if (r === "portafolio" && arg) $("#p-" + arg)?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (r === "labs" && arg) $("#" + arg)?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.scrollTo({ top: 0 });
}

function wire(r, arg) {
  if (r === "portafolio") {
    $$(".product-head").forEach(h => h.addEventListener("click", () => h.parentElement.classList.toggle("open")));
    $$(".pf-tile").forEach(t => {
      t.addEventListener("click", () => go("producto/" + t.dataset.pid));
      t.addEventListener("mouseenter", () => {
        const p = PRODUCTS.find(x => x.id === t.dataset.pid);
        const cap = $("#pf-caption");
        if (cap) cap.innerHTML = `<strong style="color:${p.accent}">${p.num} ${p.name}</strong><p>${p.pitch}</p>`;
      });
    });
    $$("#view .diagram").forEach(spawnPackets);
  }

  if (r === "producto") {
    const step = state.diagram?.product === arg ? state.diagram.step : 0;
    setDiagramStep(step);
  }
  if (r === "flashcards") {
    const flip = () => { state.flash.flipped = !state.flash.flipped; $("#flashcard").classList.toggle("flipped", state.flash.flipped); };
    $("#flashcard").addEventListener("click", flip);
    $("#flash-flip").addEventListener("click", flip);
    const nav = d => { const n = flashDeck().length; state.flash.idx = (state.flash.idx + d + n) % n; state.flash.flipped = false; render(); };
    $("#flash-prev").addEventListener("click", () => nav(-1));
    $("#flash-next").addEventListener("click", () => nav(1));
    $("#flash-filter").addEventListener("change", e => { state.flash.product = e.target.value; state.flash.idx = 0; state.flash.flipped = false; render(); });
    document.onkeydown = e => {
      if (e.key === "ArrowRight") nav(1);
      if (e.key === "ArrowLeft") nav(-1);
      if (e.key === " " && $("#palette").hidden) { e.preventDefault(); flip(); }
    };
  } else document.onkeydown = null;

  if (r === "quiz") {
    $$(".quiz-opt").forEach(b => b.addEventListener("click", () => {
      const qz = state.quiz;
      if (qz.answered) return;
      qz.picked = +b.dataset.opt;
      qz.answered = true;
      qz.picks = qz.picks || [];
      qz.picks[qz.idx] = qz.picked;
      const ok = qz.picked === QUIZ[qz.idx].answer;
      qz.results[qz.idx] = ok;
      if (ok) qz.score++;
      render();
    }));
    $("#quiz-next")?.addEventListener("click", () => {
      const qz = state.quiz;
      if (qz.idx === QUIZ.length - 1) {
        qz.done = true;
        const pct = Math.round((qz.score / QUIZ.length) * 100);
        store.set("poc_quiz_scores", [...store.get("poc_quiz_scores", []), pct]);
      } else { qz.idx++; qz.answered = false; qz.picked = -1; }
      render();
    });
    $("#quiz-restart")?.addEventListener("click", () => { state.quiz = { idx: 0, score: 0, answered: false, picked: -1, done: false, results: [], picks: [] }; render(); });
  }

  if (r === "labs") {
    $$("input[data-lab]").forEach(c => c.addEventListener("change", () => {
      const all = store.get("poc_labs", {});
      const lab = LABS.find(l => l.id === c.dataset.lab);
      all[c.dataset.lab] = all[c.dataset.lab] || lab.steps.map(() => false);
      all[c.dataset.lab][+c.dataset.step] = c.checked;
      store.set("poc_labs", all);
      render();
    }));
    $$("[data-reset-lab]").forEach(b => b.addEventListener("click", () => {
      const all = store.get("poc_labs", {});
      delete all[b.dataset.resetLab];
      store.set("poc_labs", all);
      render();
    }));
  }

  if (r === "pruebas") {
    const kind = $("#test-kind"), host = $("#test-host");
    const syncDesc = () => {
      const t = SECURITY_TESTS.find(t => t.id === kind.value);
      $("#test-desc").textContent = `${t.desc} Esperado: ${t.expected}.`;
      $("#curl-cmd").textContent = t.curl(host.value);
    };
    kind.addEventListener("change", syncDesc);
    host.addEventListener("change", syncDesc);
    syncDesc();
    $("#curl-copy").addEventListener("click", () => {
      navigator.clipboard.writeText($("#curl-cmd").textContent);
      $("#curl-copy").textContent = "¡Copiado!";
      setTimeout(() => ($("#curl-copy").textContent = "Copiar"), 1500);
    });
    $("#test-run").addEventListener("click", runTest);
    $("#hist-clear")?.addEventListener("click", () => { store.set("poc_tests", []); render(); });
  }
}

async function runTest() {
  const now = Date.now();
  if (now - state.lastRun < 1500) { $("#test-note").textContent = "Espera un momento entre pruebas…"; return; }
  state.lastRun = now;
  const host = $("#test-host").value;
  const t = SECURITY_TESTS.find(t => t.id === $("#test-kind").value);
  const out = $("#test-result");
  out.innerHTML = `<div class="verdict passed"><div class="v-title">Ejecutando…</div></div>`;
  $("#test-note").textContent = "";

  let res;
  if (EDGE_FUNCTION_URL) {
    try {
      const r = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host, test: t.id })
      });
      res = await r.json();
    } catch (e) {
      res = { status: "error", headers: {}, body: String(e), blocked: false, ray: null };
    }
  } else {
    // Modo simulación hasta conectar la Edge Function de Supabase.
    await new Promise(r => setTimeout(r, 600));
    const blocked = t.id !== "benign";
    res = {
      simulated: true,
      status: blocked ? 403 : 200,
      ray: blocked ? "9f3a1c2d4e5f6789-MEX" : null,
      body: blocked
        ? "error code: 1020 · This website is using a security service to protect itself from online attacks."
        : "<!doctype html><html>…demo site…</html>",
      blocked
    };
  }

  const entry = {
    time: new Date().toLocaleTimeString("es-MX"),
    host, test: t.name,
    status: res.status,
    ray: res.ray || null,
    blocked: !!res.blocked
  };
  store.set("poc_tests", [entry, ...store.get("poc_tests", [])].slice(0, 50));

  state.testResult = `
    <div class="verdict ${res.blocked ? "blocked" : "passed"}">
      <div class="v-title">${res.blocked ? "✔ Bloqueado por Cloudflare" : "— La petición pasó"}</div>
      <div class="muted">HTTP ${res.status}${res.ray ? ` · cf-ray ${res.ray}` : ""}${res.simulated ? " · ⚠ resultado simulado (conecta la Edge Function de Supabase)" : ""}</div>
      <pre>${res.body || ""}</pre>
    </div>`;
  render();
  $("#test-host").value = host;
  $("#test-kind").value = t.id;
  $("#test-kind").dispatchEvent(new Event("change"));
}

function renderTopbar() {
  $("#topbar").innerHTML = `
    <div>
      <h1>Cloudflare Portafolio Guide</h1>
      <div class="sub">Training del portafolio de Application Security · estudia, practica y demuestra en vivo</div>
    </div>
    <button class="btn btn-ghost" onclick="alert('Sign In — placeholder. El sitio se protegerá con Cloudflare Access a nivel de red.')">Sign In</button>`;
}

// ── Boot ─────────────────────────────────────────────────────────────────────
renderSidebar();
renderTopbar();
render();
