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
      ${QUICK_LINKS.map(q => `
        <a class="nav-link" href="#/${q.id}" data-route="${q.id}">
          <span class="dot" style="background:${q.color};box-shadow:0 0 8px ${q.color}"></span>${q.label}
        </a>`).join("")}
      ${NAV_EXTRA.map(n => `<a class="nav-link" href="#/${n.id}" data-route="${n.id}"><span class="dot" style="background:var(--text-faint)"></span>${n.label}</a>`).join("")}
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
            ${p.objectives.map((o, i) => `<a href="#/portafolio/${p.id}">${i + 1}. ${o}</a>`).join("")}
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
    ...PRODUCTS.map(p => ({ label: `${p.num} ${p.name}`, hint: p.tagline, type: "producto", go: `portafolio/${p.id}` })),
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
  if (e.key === "Escape") { closePalette(); return; }
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
        <div class="card clickable card-accent-top" style="--accent:${p.accent}" onclick="location.hash='#/portafolio/${p.id}'">
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

// ── Render + event wiring ────────────────────────────────────────────────────
function markActiveNav() {
  const [r] = route();
  $$(".nav-link").forEach(a => a.classList.toggle("active", a.dataset.route === r));
}

function render() {
  const [r, arg] = route();
  const view = $("#view");
  const views = { inicio: viewInicio, portafolio: viewPortafolio, flashcards: viewFlashcards, quiz: viewQuiz, labs: viewLabs, progreso: viewProgreso, pruebas: viewPruebas };
  view.innerHTML = views[r] ? views[r](arg) : viewInicio();
  markActiveNav();
  wire(r, arg);
  if (r === "portafolio" && arg) $("#p-" + arg)?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (r === "labs" && arg) $("#" + arg)?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.scrollTo({ top: 0 });
}

function wire(r) {
  if (r === "portafolio") {
    $$(".product-head").forEach(h => h.addEventListener("click", () => h.parentElement.classList.toggle("open")));
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
