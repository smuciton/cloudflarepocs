// ── Escenas animadas en vivo ────────────────────────────────────────────────
// Simulaciones continuas (requestAnimationFrame) para funcionalidades que se
// entienden mejor viendo el tráfico en tiempo real que en pasos fijos.

const SCENES = {
  ratelimit: mountRateLimitScene,
  customrules: mountCustomRulesScene,
  response: mountResponseScene,
  managed: mountManagedScene,
  owasp: mountOwaspScene
};

function mountScene(name, root, title = "") {
  if (!SCENES[name]) return null;
  let inner, obs;
  const boot = () => {
    inner = SCENES[name](root);
    addSceneChrome(root, inner, title);
    // Al cerrar la vista ampliada (botón rojo, Esc o "Cerrar"), la escena vuelve a su estado inicial
    let wasFull = false;
    obs = new MutationObserver(() => {
      const full = root.classList.contains("scene-full");
      if (wasFull && !full) setTimeout(remount);
      wasFull = full;
    });
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
  };
  const remount = () => {
    inner.destroy();
    obs.disconnect();
    if (!root.isConnected) return;
    const fresh = root.cloneNode(false);
    fresh.classList.remove("scene-full");
    root.replaceWith(fresh);
    root = fresh;
    boot();
  };
  boot();
  return { destroy() { inner.destroy(); obs.disconnect(); } };
}

// Pantalla de inicio (la escena arranca en pausa) + barra de ventana tipo Mac para el modo ampliado
function addSceneChrome(root, scene, title) {
  const bar = document.createElement("div");
  bar.className = "scene-titlebar";
  bar.innerHTML = `
    <button class="mac-btn close" data-chrome="close" title="Cerrar" aria-label="Cerrar">✕</button>
    <span class="mac-btn min"></span><span class="mac-btn max"></span>
    <span class="scene-title">${esc(title)} · simulación en vivo</span>`;
  root.prepend(bar);

  const svg = root.querySelector(".scene-svg");
  const stage = document.createElement("div");
  stage.className = "scene-stage";
  svg.before(stage);
  stage.appendChild(svg);
  const overlay = document.createElement("div");
  overlay.className = "scene-start";
  overlay.innerHTML = `
    <button class="btn btn-primary" data-chrome="start">▶ Iniciar animación</button>
    <button class="btn" data-chrome="startfull">⛶ Iniciar en pantalla completa</button>`;
  stage.appendChild(overlay);

  // Contadores + Security Events en un panel lateral (columna derecha en la vista ampliada)
  const side = document.createElement("div");
  side.className = "scene-side";
  const stats = root.querySelector(".rl-stats"), con = root.querySelector(".rl-console");
  (stats || con).before(side);
  if (stats) side.appendChild(stats);
  if (con) side.appendChild(con);

  const cap = root.querySelector(".rl-caption");
  if (cap && !cap.textContent.trim()) {
    cap.innerHTML = "<strong>▶ Lista para iniciar</strong><p>Presiona <b>Iniciar animación</b> para ver la simulación, o iníciala en pantalla completa para presentarla.</p>";
  }

  root.addEventListener("click", e => {
    const b = e.target.closest("[data-chrome]");
    if (!b) return;
    if (b.dataset.chrome === "start") scene.start();
    else if (b.dataset.chrome === "startfull") { scene.full(true); scene.start(); }
    else if (b.dataset.chrome === "close") scene.full(false);
  });
}

function mountRateLimitScene(root) {
  const NS = "http://www.w3.org/2000/svg";
  const cfg = { threshold: 12, window: 6, timeout: 8, rate: 4, userRate: 0.45 };
  const IP = { atk: "203.0.113.7", usr: "198.51.100.4" };
  const PATH = {
    usr: [[98, 120], [240, 168]],
    atk: [[98, 270], [240, 266]],
    back: [[240, 284], [98, 288]],
    out: [[560, 216], [646, 216]]
  };
  const ROWS = { usr: { y: 166, h: 11 }, atk: { y: 258, h: 16 } };
  const CX0 = 262, CX1 = 538, BAR_W = CX1 - CX0;
  const wire = (cls, [[x1, y1], [x2, y2]]) => `<line class="rl-wire ${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;

  root.innerHTML = `
    <svg class="scene-svg" viewBox="0 0 780 380" xmlns="${NS}">
      <rect class="d-bg" x="0" y="0" width="780" height="380" rx="14"/>
      <rect class="d-inet" x="10" y="26" width="762" height="344" rx="14"/>
      <text class="d-inetlabel" x="42" y="19">☁ Internet</text>
      ${wire("usr", PATH.usr)}${wire("atk", PATH.atk)}${wire("back", PATH.back)}${wire("out", PATH.out)}
      <text class="rl-wlabel usr" x="168" y="132" text-anchor="middle">POST /login · humano</text>
      <text class="rl-wlabel atk" x="168" y="259" text-anchor="middle"></text>
      <text class="rl-wlabel back" x="168" y="304" text-anchor="middle">← 429 Too Many Requests</text>
      <rect class="d-net" x="240" y="44" width="320" height="316" rx="12"/>
      ${cfCloud(262, 54, 0.75)}
      <text class="d-nettitle" x="420" y="72" text-anchor="middle">Cloudflare Global Network</text>
      <g class="rl-rule">
        <rect x="256" y="84" width="288" height="58" rx="8"/>
        <text class="rl-rule-t" x="268" y="101">⏱ Rate Limiting Rule</text>
        <g class="rl-live"><circle cx="494" cy="97" r="3.5"/><text x="501" y="100">ACTIVA</text></g>
        <text class="rl-rule-x" x="268" y="117">http.request.uri.path eq "/login"</text>
        <text class="rl-rule-x rl-cfg" x="268" y="132"></text>
      </g>
      <text class="rl-row-l" x="262" y="160">IP ${IP.usr} · usuario</text>
      <text class="rl-row-n usr" x="538" y="160" text-anchor="end"></text>
      <g class="rl-cells usr"></g>
      <g class="rl-status"><rect x="290" y="192" width="220" height="30" rx="15"/><text x="400" y="211" text-anchor="middle"></text></g>
      <text class="rl-row-l" x="262" y="250">IP ${IP.atk} · script</text>
      <text class="rl-row-n atk" x="538" y="251" text-anchor="end"></text>
      <g class="rl-cells atk"></g>
      <text class="rl-timer" x="262" y="294"></text>
      <rect class="rl-tbar-bg" x="${CX0}" y="301" width="${BAR_W}" height="4" rx="2"/>
      <rect class="rl-tbar" x="${CX0}" y="301" width="0" height="4" rx="2"/>
      <text class="rl-action" x="400" y="338" text-anchor="middle">Acción: Block · Respuesta: 429 Too Many Requests</text>
      ${iconBox({ id: "rl-usr", x: 70, y: 120, icon: "🧑", label: "Usuario normal", sub: IP.usr, cls: "good" })}
      <g class="rl-atk-node">${iconBox({ id: "rl-atk", x: 70, y: 270, icon: "🤖", label: "Script abusivo", sub: "while true; curl /login", cls: "bad" })}</g>
      <g class="d-cust rl-origin">
        <rect x="648" y="120" width="120" height="190" rx="10"/>
        <text class="d-cust-t" x="708" y="142" text-anchor="middle">Tu origen</text>
        <text class="d-cust-s" x="708" y="156" text-anchor="middle">POST /login</text>
        <rect class="d-srv b" x="666" y="166" width="84" height="12" rx="3"/>
        <rect class="d-srv b" x="666" y="184" width="84" height="12" rx="3"/>
        <rect class="d-srv b" x="666" y="202" width="84" height="12" rx="3"/>
        <text class="d-cust-s" x="708" y="236" text-anchor="middle">Recibidos</text>
        <text class="rl-origin-n" x="708" y="257" text-anchor="middle">0</text>
        <text class="d-cust-s" x="708" y="278" text-anchor="middle">Carga del servidor</text>
        <rect class="rl-load-bg" x="666" y="286" width="84" height="7" rx="3.5"/>
        <rect class="rl-load" x="666" y="286" width="0" height="7" rx="3.5"/>
      </g>
      <g class="rl-packets"></g>
    </svg>
    <div class="step-caption rl-caption"></div>
    <div class="rl-controls">
      <label>Ritmo del script <input type="range" min="0.5" max="8" step="0.5" value="${cfg.rate}" data-rl="rate"><b data-out="rate"></b></label>
      <label>Umbral <input type="range" min="4" max="20" step="1" value="${cfg.threshold}" data-rl="thr"><b data-out="thr"></b></label>
    </div>
    <div class="rl-controls">
      <button class="btn btn-sm" data-rl="play">⏸ Pausa</button>
      <button class="btn btn-sm" data-rl="reset">↺ Reiniciar</button>
      <button class="btn btn-sm" data-rl="full">⛶ Ampliar</button>
      ${SPEED_HTML}
    </div>
    <div class="rl-stats">
      <div class="rl-stat sent"><b data-out="sent">0</b><span>Intentos enviados</span></div>
      <div class="rl-stat pass"><b data-out="allowed">0</b><span>Llegaron al origen</span></div>
      <div class="rl-stat block"><b data-out="blocked">0</b><span>Bloqueados (429)</span></div>
    </div>
    <div class="rl-console">
      <div class="rl-console-head"><i style="background:#F87171"></i><i style="background:#FBAD41"></i><i style="background:#4ADE80"></i><span>Security Events · en vivo</span></div>
      <div class="rl-log"></div>
    </div>`;

  const $s = sel => root.querySelector(sel);
  const out = name => $s(`[data-out="${name}"]`);
  const layer = $s(".rl-packets"), logEl = $s(".rl-log");
  const els = {
    status: $s(".rl-status"), statusT: $s(".rl-status text"),
    wireAtk: $s(".rl-wire.atk"), wireBack: $s(".rl-wire.back"), labelBack: $s(".rl-wlabel.back"), labelAtk: $s(".rl-wlabel.atk"),
    timer: $s(".rl-timer"), tbar: $s(".rl-tbar"), cfgText: $s(".rl-cfg"),
    rowN: { usr: $s(".rl-row-n.usr"), atk: $s(".rl-row-n.atk") },
    originBox: $s(".rl-origin > rect"), originN: $s(".rl-origin-n"), load: $s(".rl-load"),
    atkNode: $s(".rl-atk-node"), caption: $s(".rl-caption"), playBtn: $s('[data-rl="play"]'), fullBtn: $s('[data-rl="full"]')
  };
  const cells = {};
  let st, raf, last = null;

  const fresh = () => ({
    t: 0, running: true, nextAtk: 0.6, nextUsr: 0.3,
    seq: { usr: 0, atk: 0 }, hits: { usr: [], atk: [] }, blockedUntil: { usr: -1, atk: -1 },
    prevCount: { usr: 0, atk: 0 }, unblockedAt: -99, wasBlocked: false,
    packets: [], originHits: [], sent: 0, allowed: 0, blocked: 0, capKey: ""
  });

  const clock = () => {
    const d = new Date();
    return `${d.toTimeString().slice(0, 8)}.${String(d.getMilliseconds()).padStart(3, "0")}`;
  };

  function buildCells() {
    for (const k of ["usr", "atk"]) {
      const g = $s(`.rl-cells.${k}`);
      g.innerHTML = "";
      const n = cfg.threshold, gap = 3, w = (BAR_W - gap * (n - 1)) / n;
      cells[k] = Array.from({ length: n }, (_, i) => {
        const r = document.createElementNS(NS, "rect");
        r.setAttribute("x", CX0 + i * (w + gap));
        r.setAttribute("y", ROWS[k].y);
        r.setAttribute("width", w);
        r.setAttribute("height", ROWS[k].h);
        r.setAttribute("rx", 2.5);
        r.setAttribute("class", "rl-cell");
        g.appendChild(r);
        return r;
      });
      st && (st.prevCount[k] = 0);
    }
  }

  function syncCfg() {
    els.cfgText.textContent = `${cfg.threshold} req / ${cfg.window} s · por IP · Block ${cfg.timeout} s`;
    els.labelAtk.textContent = `POST /login · ${cfg.rate} req/s`;
    out("rate").textContent = `${cfg.rate} req/s`;
    out("thr").textContent = `${cfg.threshold} / ${cfg.window} s`;
  }

  function pushLog(html, cls) {
    const d = document.createElement("div");
    d.className = `rl-log-line ${cls}`;
    d.innerHTML = html;
    logEl.prepend(d);
    while (logEl.children.length > 18) logEl.lastElementChild.remove();
  }

  const logReq = (p, ok) => pushLog(
    `<span>${clock()}</span><span>${IP[p.kind]}</span><span>POST /login #${p.n}</span><span class="res">${ok ? "200 → origen" : "429 rate_limit"}</span>`,
    ok ? (p.kind === "usr" ? "ok" : "warn") : "bad"
  );

  function spawn(kind) {
    const n = ++st.seq[kind];
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", `rl-pkt ${kind}`);
    g.innerHTML = `<rect x="-27" y="-8" width="54" height="16" rx="8"/><text x="0" y="3.2" text-anchor="middle">POST #${n}</text>`;
    layer.appendChild(g);
    st.packets.push({ g, kind, n, leg: "in", path: PATH[kind], t0: st.t, dur: kind === "atk" ? 0.9 : 1.3 });
    st.sent++;
    if (kind === "atk") els.atkNode.animate?.([{ transform: "translateX(-3px)" }, { transform: "translateX(0)" }], { duration: 140 });
  }

  function decide(k) {
    const now = st.t;
    if (st.blockedUntil[k] > now) return false;
    const h = st.hits[k];
    while (h.length && h[0] <= now - cfg.window) h.shift();
    h.push(now);
    if (h.length > cfg.threshold) {
      st.blockedUntil[k] = now + cfg.timeout;
      pushLog(`⚠ Regla disparada · ${IP[k]} superó ${cfg.threshold} req / ${cfg.window} s → Block ${cfg.timeout} s`, "evt");
      return false;
    }
    return true;
  }

  function impact([x, y]) {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "rl-hit");
    g.innerHTML = `<circle cx="${x}" cy="${y}" r="11"/><text x="${x}" y="${y + 5}" text-anchor="middle">✕</text>`;
    layer.appendChild(g);
    setTimeout(() => g.remove(), 600);
  }

  function arrive(p) {
    if (p.leg === "in") {
      const ok = decide(p.kind);
      logReq(p, ok);
      if (ok) {
        p.leg = "out"; p.path = PATH.out; p.dur = 0.75;
      } else {
        impact(PATH[p.kind][1]);
        st.blocked++;
        p.leg = "back";
        p.path = p.kind === "atk" ? PATH.back : [PATH[p.kind][1], PATH[p.kind][0]];
        p.dur = 0.9;
        p.g.classList.add("r429");
        p.g.querySelector("text").textContent = "429";
      }
      p.t0 = st.t;
    } else {
      if (p.leg === "out") {
        st.allowed++;
        st.originHits.push(st.t);
        els.originBox.animate?.([{ fill: "#BFDBFE" }, { fill: "#EFF6FF" }], { duration: 350 });
      }
      p.dead = true;
      p.g.remove();
    }
  }

  function paintRow(k, now) {
    const blocked = st.blockedUntil[k] > now;
    const count = Math.min(st.hits[k].length, cfg.threshold);
    const lvl = count >= Math.ceil(cfg.threshold * 0.7) ? "warn" : "on";
    cells[k].forEach((c, i) => c.setAttribute("class", `rl-cell ${blocked ? "full" : i < count ? lvl : ""}`));
    if (!blocked && count > st.prevCount[k]) {
      cells[k][count - 1]?.animate?.([{ transform: "scale(1.7)" }, { transform: "scale(1)" }], { duration: 260 });
    }
    st.prevCount[k] = count;
    els.rowN[k].textContent = `${blocked ? cfg.threshold : count}/${cfg.threshold}`;
    els.rowN[k].classList.toggle("block", blocked);
  }

  function phase(now) {
    const c = Math.min(st.hits.atk.length, cfg.threshold), thr = cfg.threshold, w = cfg.window;
    if (!st.running && st.t === 0) return ["ready", "▶ Lista para iniciar", "Presiona <b>Iniciar</b> para ver cómo el edge cuenta cada intento del script hasta llegar al umbral."];
    if (!st.running) return ["pause", "⏸ Simulación en pausa", "Reanuda para seguir viendo cómo el edge cuenta y responde a cada intento."];
    if (st.blockedUntil.atk > now) return ["block", "🚫 Umbral superado: Cloudflare bloquea al script",
      `Cada intento nuevo del script recibe <b>429</b> en el edge durante el mitigation timeout (${cfg.timeout} s) — mira cómo rebotan por la línea roja. El origen deja de recibirlos y el usuario normal sigue pasando: su contador por IP es independiente.`];
    if (now - st.unblockedAt < 2.5) return ["rearm", "🔁 Terminó el mitigation timeout",
      "La ventana quedó limpia. Si el script sigue disparando, el contador vuelve a llenarse y la regla lo bloquea otra vez."];
    if (cfg.rate * w <= thr) return [`below${cfg.rate}`, "✅ Ritmo por debajo del umbral",
      `A ${cfg.rate} req/s el script hace ~${Math.round(cfg.rate * w)} intentos cada ${w} s: Cloudflare cuenta cada uno, pero no actúa hasta pasar de ${thr}. Sube el ritmo con el slider para disparar la regla.`];
    if (c >= Math.ceil(thr * 0.7)) return [`near${c}`, "⚠ El script se acerca al umbral",
      `Ya lleva <b>${c}/${thr}</b> intentos en los últimos ${w} s. Unos cuantos más y la regla se dispara.`];
    return ["count", "📈 El script dispara intentos sin parar",
      `Cada <b>POST /login</b> que llega al edge enciende una celda del contador de su IP. Mientras no pase de ${thr} en ${w} s, las peticiones siguen llegando al origen (naranja).`];
  }

  function paint() {
    const now = st.t;
    for (const k of ["usr", "atk"]) {
      const h = st.hits[k];
      while (h.length && h[0] <= now - cfg.window) h.shift();
      paintRow(k, now);
    }
    const blocked = st.blockedUntil.atk > now;
    if (st.wasBlocked && !blocked) st.unblockedAt = now;
    st.wasBlocked = blocked;

    const c = Math.min(st.hits.atk.length, cfg.threshold);
    const sk = blocked ? "block" : c >= Math.ceil(cfg.threshold * 0.7) ? "near" : "ok";
    els.status.setAttribute("class", `rl-status ${sk}`);
    els.statusT.textContent = { block: "⛔ BLOQUEANDO · 429", near: "⚠ CERCA DEL UMBRAL", ok: "✓ CONTANDO · PERMITE" }[sk];
    els.wireAtk.classList.toggle("hot", st.running && cfg.rate >= 2 && !blocked);
    els.wireAtk.classList.toggle("blocked", blocked);
    els.wireBack.classList.toggle("on", blocked);
    els.labelBack.classList.toggle("on", blocked);

    if (blocked) {
      const rem = st.blockedUntil.atk - now;
      els.timer.textContent = `⛔ Mitigation timeout · ${rem.toFixed(1)} s restantes`;
      els.tbar.setAttribute("width", BAR_W * (rem / cfg.timeout));
    } else {
      els.timer.textContent = `Ventana deslizante · últimos ${cfg.window} s`;
      els.tbar.setAttribute("width", 0);
    }
    els.timer.classList.toggle("block", blocked);

    while (st.originHits.length && st.originHits[0] <= now - 2) st.originHits.shift();
    const load = Math.min(1, st.originHits.length / 8);
    els.load.setAttribute("width", 84 * load);
    els.load.style.fill = load > 0.7 ? "#DC2626" : load > 0.4 ? "#F97316" : "#3B82F6";
    els.originN.textContent = st.allowed;

    out("sent").textContent = st.sent;
    out("allowed").textContent = st.allowed;
    out("blocked").textContent = st.blocked;

    const [key, title, text] = phase(now);
    if (key !== st.capKey) {
      st.capKey = key;
      els.caption.innerHTML = `<strong>${title}</strong><p>${text}</p>`;
    }
  }

  function frame(ts) {
    const dt = last == null ? 0 : Math.min(0.05, (ts - last) / 1000);
    last = ts;
    if (st.running) {
      st.t += dt * speed;
      if (st.t >= st.nextAtk) { spawn("atk"); st.nextAtk = st.t + (0.75 + Math.random() * 0.5) / cfg.rate; }
      if (st.t >= st.nextUsr) { spawn("usr"); st.nextUsr = st.t + (0.7 + Math.random() * 0.6) / cfg.userRate; }
    }
    for (const p of st.packets) {
      const k = Math.min(1, (st.t - p.t0) / p.dur);
      const [[x1, y1], [x2, y2]] = p.path;
      p.g.setAttribute("transform", `translate(${x1 + (x2 - x1) * k} ${y1 + (y2 - y1) * k})`);
      if (k >= 1) arrive(p);
    }
    st.packets = st.packets.filter(p => !p.dead);
    paint();
    raf = requestAnimationFrame(frame);
  }

  const syncPlay = () => { els.playBtn.textContent = st.running ? "⏸ Pausa" : st.t > 0 ? "▶ Reanudar" : "▶ Iniciar"; };

  function reset() {
    const run = st ? st.running : false;
    layer.innerHTML = "";
    logEl.innerHTML = "";
    st = fresh();
    st.running = run;
    buildCells();
    syncPlay();
    pushLog("Escuchando eventos de seguridad en /login…", "hint");
  }

  function start() {
    st.running = true;
    syncPlay();
    root.querySelector(".scene-start")?.remove();
  }

  function toggleFull(force) {
    const on = root.classList.toggle("scene-full", force);
    els.fullBtn.textContent = on ? "✕ Cerrar" : "⛶ Ampliar";
  }

  root.addEventListener("click", e => {
    const b = e.target.closest("button[data-rl]");
    if (!b) return;
    if (b.dataset.rl === "play") {
      if (st.running) { st.running = false; syncPlay(); } else start();
    } else if (b.dataset.rl === "reset") reset();
    else if (b.dataset.rl === "full") toggleFull();
  });
  let speed = 1;
  root.addEventListener("input", e => {
    if (e.target.matches("[data-speed]")) { speed = syncSpeed(e.target); return; }
    const a = e.target.dataset.rl;
    if (a === "rate") {
      cfg.rate = +e.target.value;
      st.nextAtk = Math.min(st.nextAtk, st.t + 1 / cfg.rate);
    } else if (a === "thr") {
      cfg.threshold = +e.target.value;
      buildCells();
    }
    syncCfg();
  });
  const onKey = e => { if (e.key === "Escape" && root.classList.contains("scene-full")) toggleFull(false); };
  document.addEventListener("keydown", onKey);

  syncCfg();
  reset();
  raf = requestAnimationFrame(frame);

  return {
    start,
    full: toggleFull,
    destroy() {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
    }
  };
}

// ── Kit compartido para escenas ─────────────────────────────────────────────
const SVG_NS = "http://www.w3.org/2000/svg";
const SPEED_HTML = `<label class="sc-speed">🐢 Velocidad <input type="range" min="0.25" max="2" step="0.25" value="1" data-speed><b>1x</b> 🐇</label>`;
const syncSpeed = input => {
  const v = +input.value;
  input.nextElementSibling.textContent = `${v}x`;
  return v;
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const sceneClock = () => {
  const d = new Date();
  return `${d.toTimeString().slice(0, 8)}.${String(d.getMilliseconds()).padStart(3, "0")}`;
};

// Posición en una polilínea a una fracción k (0–1) de su longitud
function along(pts, k) {
  if (k <= 0) return pts[0];
  if (k >= 1) return pts[pts.length - 1];
  const seg = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(l);
    total += l;
  }
  let d = k * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) {
      const f = seg[i] ? d / seg[i] : 0, a = pts[i], b = pts[i + 1];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
}

const wireLine = (cls, pts) => `<polyline class="rl-wire ${cls}" fill="none" points="${pts.map(p => p.join(",")).join(" ")}"/>`;

function sceneFrame({ edge = [240, 44, 320, 316], title = "Cloudflare Global Network", outer = "", inner = "" }) {
  const [x, y, w, h] = edge;
  return `<svg class="scene-svg" viewBox="0 0 780 380" xmlns="${SVG_NS}">
    <rect class="d-bg" x="0" y="0" width="780" height="380" rx="14"/>
    <rect class="d-inet" x="10" y="26" width="762" height="344" rx="14"/>
    <text class="d-inetlabel" x="42" y="19">☁ Internet</text>
    ${outer}
    <rect class="d-net" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>
    ${cfCloud(x + 22, y + 10, 0.75)}
    <text class="d-nettitle" x="${x + w / 2 + 20}" y="${y + 28}" text-anchor="middle">${title}</text>
    ${inner}
    <g class="sc-layer"></g>
  </svg>`;
}

function originBox(x, y, h, sub) {
  return `<g class="d-cust sc-origin">
    <rect x="${x}" y="${y}" width="120" height="${h}" rx="10"/>
    <text class="d-cust-t" x="${x + 60}" y="${y + 22}" text-anchor="middle">Tu origen</text>
    <text class="d-cust-s" x="${x + 60}" y="${y + 36}" text-anchor="middle">${sub}</text>
    <rect class="d-srv b" x="${x + 18}" y="${y + 46}" width="84" height="12" rx="3"/>
    <rect class="d-srv b" x="${x + 18}" y="${y + 64}" width="84" height="12" rx="3"/>
    <rect class="d-srv b" x="${x + 18}" y="${y + 82}" width="84" height="12" rx="3"/>
    <text class="d-cust-s" x="${x + 60}" y="${y + 116}" text-anchor="middle">Recibidos</text>
    <text class="rl-origin-n" x="${x + 60}" y="${y + 137}" text-anchor="middle" data-o="n">0</text>
    <text class="sc-origin-s" x="${x + 60}" y="${y + h - 14}" text-anchor="middle" data-o="s"></text>
  </g>`;
}

function sceneKit(root, { svg, controls = "", stats = "", consoleTitle = "Security Events · en vivo" }) {
  root.innerHTML = `${svg}
    <div class="step-caption rl-caption"></div>
    ${controls}
    <div class="rl-controls">
      <button class="btn btn-sm" data-sc="play">⏸ Pausa</button>
      <button class="btn btn-sm" data-sc="reset">↺ Reiniciar</button>
      <button class="btn btn-sm" data-sc="full">⛶ Ampliar</button>
      ${SPEED_HTML}
    </div>
    ${stats}
    <div class="rl-console">
      <div class="rl-console-head"><i style="background:#F87171"></i><i style="background:#FBAD41"></i><i style="background:#4ADE80"></i><span>${consoleTitle}</span></div>
      <div class="rl-log"></div>
    </div>`;
  const q = s => root.querySelector(s);
  const logEl = q(".rl-log"), capEl = q(".rl-caption"), layer = q(".sc-layer");
  let capKey = "";
  const el = (tag, attrs = {}, html = "", parent = layer) => {
    const e = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (html) e.innerHTML = html;
    parent.appendChild(e);
    return e;
  };
  const kit = {
    q, qa: s => [...root.querySelectorAll(s)], layer, el,
    out(name, v) { const e = q(`[data-out="${name}"]`); if (e) e.textContent = v; },
    log(html, cls = "") {
      const d = document.createElement("div");
      d.className = `rl-log-line ${cls}`;
      d.innerHTML = html;
      logEl.prepend(d);
      while (logEl.children.length > 18) logEl.lastElementChild.remove();
    },
    // Línea de log con columnas: hora · a · b · resultado
    logReq(a, b, res, cls) {
      kit.log(`<span>${sceneClock()}</span><span>${esc(a)}</span><span>${esc(b)}</span><span class="res">${esc(res)}</span>`, cls);
    },
    clear() { logEl.innerHTML = ""; layer.innerHTML = ""; capKey = ""; },
    caption(key, title, text) {
      if (key === capKey) return;
      capKey = key;
      capEl.innerHTML = `<strong>${title}</strong><p>${text}</p>`;
    },
    pill(cls, label, w = 54) {
      const g = el("g", { class: `rl-pkt ${cls}` }, `<rect x="${-w / 2}" y="-8" width="${w}" height="16" rx="8"/><text x="0" y="3.2" text-anchor="middle"></text>`);
      g.querySelector("text").textContent = label;
      return g;
    },
    relabel(g, cls, label, w) {
      g.setAttribute("class", `rl-pkt ${cls}`);
      g.querySelector("text").textContent = label;
      if (w) { const r = g.querySelector("rect"); r.setAttribute("x", -w / 2); r.setAttribute("width", w); }
    },
    place(g, [x, y]) { g.setAttribute("transform", `translate(${x} ${y})`); },
    impact([x, y]) {
      const g = el("g", { class: "rl-hit" }, `<circle cx="${x}" cy="${y}" r="11"/><text x="${x}" y="${y + 5}" text-anchor="middle">✕</text>`);
      setTimeout(() => g.remove(), 600);
    },
    float(text, [x, y], cls = "") {
      const t = el("text", { class: `sc-float ${cls}`, x, y, "text-anchor": "middle" });
      t.textContent = text;
      setTimeout(() => t.remove(), 1100);
    },
    flash(node, cls = "flash", ms = 500) {
      node.classList.add(cls);
      clearTimeout(node._flashT);
      node._flashT = setTimeout(() => node.classList.remove(cls), ms);
    },
    segment(attr, value) { kit.qa(`[${attr}]`).forEach(b => b.classList.toggle("on", b.getAttribute(attr) === String(value))); },
    // Mueve paquetes {g, path, t0, dur}; llama onArrive al llegar al final
    move(list, t, onArrive) {
      for (const p of list) {
        const k = Math.min(1, (t - p.t0) / p.dur);
        kit.place(p.g, along(p.path, k));
        if (k >= 1 && !p.dead) onArrive(p, t);
      }
      return list.filter(p => !p.dead);
    },
    drop(p) { p.dead = true; p.g.remove(); }
  };
  return kit;
}

function runScene(root, kit, { reset, tick }) {
  let raf, last = null, running = false, t = 0, speed = 1;
  root.addEventListener("input", e => { if (e.target.matches("[data-speed]")) speed = syncSpeed(e.target); });
  const playBtn = kit.q('[data-sc="play"]'), fullBtn = kit.q('[data-sc="full"]');
  const syncPlay = () => { playBtn.textContent = running ? "⏸ Pausa" : t > 0 ? "▶ Reanudar" : "▶ Iniciar"; };
  const restart = () => {
    kit.clear();
    t = 0;
    reset();
    syncPlay();
  };
  const start = () => {
    running = true;
    syncPlay();
    root.querySelector(".scene-start")?.remove();
  };
  const toggleFull = force => {
    const on = root.classList.toggle("scene-full", force);
    fullBtn.textContent = on ? "✕ Cerrar" : "⛶ Ampliar";
  };
  root.addEventListener("click", e => {
    const b = e.target.closest("button[data-sc]");
    if (!b) return;
    if (b.dataset.sc === "play") { if (running) { running = false; syncPlay(); } else start(); }
    else if (b.dataset.sc === "reset") restart();
    else toggleFull();
  });
  const onKey = e => { if (e.key === "Escape" && root.classList.contains("scene-full")) toggleFull(false); };
  document.addEventListener("keydown", onKey);
  const frame = ts => {
    const dt = last == null ? 0 : Math.min(0.05, (ts - last) / 1000);
    last = ts;
    if (running) { t += dt * speed; tick(t, dt * speed); }
    raf = requestAnimationFrame(frame);
  };
  restart();
  raf = requestAnimationFrame(frame);
  return { start, full: toggleFull, destroy() { cancelAnimationFrame(raf); document.removeEventListener("keydown", onKey); } };
}

// ── Escena: WAF Custom Rules ────────────────────────────────────────────────
function mountCustomRulesScene(root) {
  const LANES = {
    vis: { icon: "🧑", who: "Visitante", label: "Visitantes", y: 95, cls: "good" },
    adm: { icon: "👩‍💼", who: "Admin", label: "Admin desde MX", y: 195, cls: "good" },
    bot: { icon: "🤖", who: "Bot", label: "Bots / scrapers", y: 295, cls: "bad" }
  };
  const ENTRY = [240, 236], HOLD = [196, 236], EXIT = [[560, 236], [646, 236]];
  const lanePath = k => [[98, LANES[k].y], HOLD];
  const POOL = [
    { lane: "vis", path: "/productos", cc: "US", score: 88 },
    { lane: "vis", path: "/carrito", cc: "MX", score: 91 },
    { lane: "vis", path: "/admin", cc: "BR", score: 79 },
    { lane: "adm", path: "/admin/panel", cc: "MX", score: 93 },
    { lane: "adm", path: "/admin/users", cc: "MX", score: 87 },
    { lane: "bot", path: "/admin/login", cc: "RU", score: 3 },
    { lane: "bot", path: "/admin/export", cc: "CN", score: 12 },
    { lane: "bot", path: "/admin/login", cc: "KP", score: 1 },
    { lane: "bot", path: "/productos", cc: "US", score: 8 }
  ];
  // Cada condición: campo, operador(es) intercambiables y valor. Los operadores con más de una opción se cambian con un clic.
  const CONDS = [
    { field: "http.request.uri.path", val: '"/admin*"',
      ops: { wildcard: { word: "coincide con", test: r => r.path.startsWith("/admin") } },
      ask: (r, op) => `¿El path <b>${esc(r.path)}</b> ${CONDS[0].ops[op].word} <b>/admin*</b>?` },
    { field: "ip.src.country", val: '"MX"',
      ops: { ne: { word: "distinto de", test: r => r.cc !== "MX" }, eq: { word: "igual a", test: r => r.cc === "MX" } },
      ask: (r, op) => `<i>${op}</i> = "${CONDS[1].ops[op].word}": ¿el país <b>${r.cc}</b> es ${CONDS[1].ops[op].word} <b>MX</b>?` },
    { field: "cf.bot_management.score", val: "30",
      ops: { lt: { word: "menor que", test: r => r.score < 30 }, gt: { word: "mayor que", test: r => r.score > 30 } },
      ask: (r, op) => `<i>${op}</i> = "${CONDS[2].ops[op].word}": ¿el bot score <b>${r.score}</b> es ${CONDS[2].ops[op].word} <b>30</b>?` }
  ];
  const exprOf = i => `${CONDS[i].field} ${cfg.op[i]} ${CONDS[i].val}`;
  const testOf = (i, r) => CONDS[i].ops[cfg.op[i]].test(r);
  const askOf = (i, r) => CONDS[i].ask(r, cfg.op[i]);
  const ACTIONS = {
    block: { label: "Block", pill: "403", cls: "bad", back: true, res: "403 block",
      why: "Cloudflare responde <b>403</b> en el edge: la petición nunca toca tu origen." },
    challenge: { label: "Managed Challenge", pill: "🧩 challenge", cls: "warn", back: true, res: "managed_challenge",
      why: "Cloudflare presenta un <b>Managed Challenge</b>: un humano lo pasa sin fricción, un bot se queda atorado." },
    log: { label: "Log", pill: "LOG", cls: "warn", back: false, res: "200 + log",
      why: "Con <b>Log</b> la petición pasa, pero queda registrada en Security Events — ideal para probar una regla antes de bloquear." },
    skip: { label: "Skip", pill: "SKIP", cls: "good", back: false, res: "200 skip",
      why: "Con <b>Skip</b> la petición se salta las reglas siguientes (útil para excepciones de confianza) y sigue al origen." }
  };
  const STEP = 0.42;
  // Arranca con la regla vacía (todo apagado) para ir encendiendo condiciones durante la demo
  const cfg = { action: "block", enabled: [false, false, false], op: ["wildcard", "ne", "lt"] };
  // Cada cápsula lleva el ícono de su origen y su número, así se distingue de quién es cada respuesta
  const tag = r => `${LANES[r.lane].icon} #${r.n}`;
  const pillW = s => Math.round(18 + s.replace(/[^\x20-\x7E]/g, "").length * 5.4 + (/[^\x20-\x7E]/.test(s) ? 14 : 0));

  const rows = CONDS.map((c, i) => `
    <g class="sc-cond" data-cond="${i}">
      <rect x="262" y="${108 + i * 26}" width="276" height="22" rx="5"/>
      <text class="sc-cond-x" x="270" y="${123 + i * 26}">${i ? "and " : ""}${c.field} <tspan class="sc-op ${Object.keys(c.ops).length > 1 ? "tog" : ""}" ${Object.keys(c.ops).length > 1 ? `data-op="${i}"` : ""}></tspan> ${esc(c.val)}</text>
      <circle class="sc-badge" cx="526" cy="${119 + i * 26}" r="8"/>
      <text class="sc-badge-t" x="526" y="${122.5 + i * 26}" text-anchor="middle">•</text>
    </g>`).join("");

  const svg = sceneFrame({
    outer: Object.keys(LANES).map(k => wireLine(`lane ${k}`, lanePath(k))).join("") + wireLine("out", EXIT)
      + Object.entries(LANES).map(([k, l]) => iconBox({ id: `cr-${k}`, x: 70, y: l.y, icon: l.icon, label: l.label, cls: l.cls })).join("")
      + originBox(648, 150, 170, "/admin · /productos"),
    inner: `
      <g class="sc-card"><rect x="254" y="84" width="292" height="124" rx="8"/>
        <text class="rl-rule-t" x="266" y="101">🎯 Custom Rule · Proteger /admin</text>
        ${rows}
        <text class="sc-then" x="266" y="199"></text>
      </g>
      <g class="sc-insp"><rect x="254" y="218" width="292" height="34" rx="8"/>
        <text class="sc-insp-l" x="266" y="231">INSPECCIONANDO</text>
        <text class="sc-insp-t" x="266" y="245">—</text>
      </g>
      <g class="rl-status ok sc-verdict"><rect x="270" y="262" width="260" height="30" rx="15"/><text x="400" y="281" text-anchor="middle"></text></g>
      <text class="sc-rulenote" x="400" y="308" text-anchor="middle">Acción solo si TODAS se cumplen · sin match = pasa</text>
      <text class="sc-hint" x="400" y="324" text-anchor="middle">👆 Condición: encender/apagar · operador naranja: cambiarlo</text>`
  });
  const controls = `<div class="rl-controls sc-seg"><span class="sc-seg-l">Acción al hacer match</span>
    ${Object.entries(ACTIONS).map(([k, a]) => `<button class="btn btn-sm" data-act="${k}">${a.label}</button>`).join("")}</div>`;
  const stats = `<div class="rl-stats">
    <div class="rl-stat sent"><b data-out="eval">0</b><span>Evaluadas</span></div>
    <div class="rl-stat block"><b data-out="match">0</b><span>Match de la regla</span></div>
    <div class="rl-stat pass"><b data-out="origin">0</b><span>Llegaron al origen</span></div>
  </div>`;

  const kit = sceneKit(root, { svg, controls, stats });
  const condEls = kit.qa(".sc-cond"), verdict = kit.q(".sc-verdict"), verdictT = kit.q(".sc-verdict text");
  const insp = kit.q(".sc-insp-t"), thenT = kit.q(".sc-then");
  const originN = kit.q('[data-o="n"]'), originBoxEl = kit.q(".sc-origin > rect");
  let S;

  const ruleActive = () => cfg.enabled.some(Boolean);
  const syncCfg = () => {
    kit.segment("data-act", cfg.action);
    thenT.textContent = ruleActive()
      ? `then → ${ACTIONS[cfg.action].label.toLowerCase()}`
      : "regla inactiva → sin acción";
    kit.q(".sc-card").classList.toggle("inactive", !ruleActive());
    condEls.forEach((g, i) => {
      g.classList.toggle("off", !cfg.enabled[i]);
      g.querySelector(".sc-op").textContent = cfg.op[i];
    });
  };
  const setBadge = (i, v) => {
    const g = condEls[i];
    g.classList.remove("yes", "no", "skip");
    g.querySelector(".sc-badge-t").textContent = v === true ? "✓" : v === false ? "✗" : v === "skip" ? "–" : "•";
    if (v === true) g.classList.add("yes");
    else if (v === false) g.classList.add("no");
    else if (v === "skip") g.classList.add("skip");
  };
  const setVerdict = (cls, text) => {
    verdict.setAttribute("class", `rl-status sc-verdict ${cls}`);
    verdictT.textContent = text;
  };
  const draw = () => {
    if (!S.deck.length) S.deck = shuffle(POOL.slice());
    return S.deck.pop();
  };

  const reset = () => {
    S = { packets: [], queue: [], cur: null, nextSpawn: 0.4, n: 0, eval: 0, match: 0, origin: 0, deck: [] };
    condEls.forEach((g, i) => { setBadge(i, null); g.classList.remove("cur"); });
    insp.textContent = "—";
    setVerdict("ok", "ESPERANDO PETICIÓN");
    originN.textContent = "0";
    ["eval", "match", "origin"].forEach(k => kit.out(k, 0));
    kit.log("Escuchando eventos de la Custom Rule…", "hint");
    syncCfg();
  };

  const spawn = t => {
    const r = { ...draw(), n: ++S.n };
    const label = tag(r);
    S.packets.push({ r, g: kit.pill("neutral", label, pillW(label)), leg: "in", path: lanePath(r.lane), t0: t, dur: 0.9 });
  };

  const arrive = (p, t) => {
    if (p.leg === "in") { p.leg = "wait"; S.queue.push(p); return; }
    if (p.leg === "out") {
      S.origin++;
      kit.out("origin", S.origin);
      originN.textContent = S.origin;
      originBoxEl.animate?.([{ fill: "#BFDBFE" }, { fill: "#EFF6FF" }], { duration: 350 });
    }
    kit.drop(p);
    S.nextSpawn = t + 0.6;
  };

  const dispatch = (c, t) => {
    const p = c.p, r = p.r, a = ACTIONS[cfg.action];
    S.cur = null;
    if (c.result && a.back) {
      kit.impact(ENTRY);
      const label = `${tag(r)} ${a.pill}`;
      kit.relabel(p.g, a.cls, label, pillW(label));
      p.leg = "back";
      p.path = [HOLD, [98, LANES[r.lane].y]];
      p.dur = 0.85;
      kit.logReq(`${LANES[r.lane].who} ${r.cc} · ${r.score}`, r.path, `${a.res} · match`, "bad");
    } else {
      const label = `${tag(r)} ${c.result ? a.pill : "200"}`;
      kit.relabel(p.g, c.result ? a.cls : "good", label, pillW(label));
      p.leg = "out";
      p.path = EXIT;
      p.dur = 0.75;
      kit.logReq(`${LANES[r.lane].who} ${r.cc} · ${r.score}`, r.path,
        c.result ? `${a.res} · match` : c.inactive ? "200 · regla inactiva" : "200 · sin match", c.result ? "warn" : "ok");
    }
    p.t0 = t;
  };

  const evaluate = t => {
    if (!S.cur) {
      if (!S.queue.length) {
        kit.caption("idle", "⏳ Esperando la siguiente petición",
          "Cada request que entra al edge se evalúa contra la expresión de tu Custom Rule, condición por condición.");
        return;
      }
      const p = S.queue.shift();
      S.cur = { p, t0: t, stage: -1, result: null, shown: false };
      condEls.forEach((g, i) => { setBadge(i, null); g.classList.remove("cur"); });
      insp.textContent = `${tag(p.r)} ${LANES[p.r.lane].who} · ${p.r.path} · ${p.r.cc} · score ${p.r.score}`;
      // Sin condiciones activas la regla no existe: no se evalúa y la petición pasa
      if (!ruleActive()) Object.assign(S.cur, { result: false, inactive: true, tDone: t });
      else setVerdict("near", "EVALUANDO…");
      S.eval++;
      kit.out("eval", S.eval);
    }
    const c = S.cur, r = c.p.r;
    const stage = Math.floor((t - c.t0) / STEP);
    while (c.stage < stage && c.result === null) {
      const i = ++c.stage;
      condEls.forEach(g => g.classList.remove("cur"));
      if (i >= CONDS.length) { c.result = true; c.tDone = t; break; }
      condEls[i].classList.add("cur");
      if (!cfg.enabled[i]) {
        setBadge(i, "skip");
        kit.caption(`ev${r.n}-${i}`, `🔎 Petición #${r.n} · condición ${i + 1} desactivada`,
          `<code>${esc(exprOf(i))}</code> está apagada, así que no se evalúa.`);
        continue;
      }
      const ok = testOf(i, r);
      setBadge(i, ok);
      kit.caption(`ev${r.n}-${i}`, `🔎 Evaluando petición #${r.n} · condición ${i + 1} de ${CONDS.length}`,
        `<code>${esc(exprOf(i))}</code><br>${askOf(i, r)} → <b>${ok ? "Sí ✓ se cumple" : "No ✗ no se cumple: la regla ya no puede coincidir"}</b>`);
      if (!ok) { c.result = false; c.failAt = i; c.tDone = t; }
    }
    if (c.result !== null && !c.shown) {
      c.shown = true;
      if (c.inactive) {
        setVerdict("ok", "REGLA INACTIVA → PASA AL ORIGEN");
        kit.caption(`i${r.n}`, "⚪ Regla inactiva: es como si no existiera",
          `Todas las condiciones están apagadas, así que la regla no se evalúa y no aplica ninguna acción. <b>${esc(r.path)}</b> de ${LANES[r.lane].who.toLowerCase()} pasa directo al origen, igual que cualquier bot. Enciende una condición para volver a proteger /admin.`);
      } else if (c.result) {
        const a = ACTIONS[cfg.action];
        S.match++;
        kit.out("match", S.match);
        setVerdict(a.back ? "block" : "near", `MATCH → ${a.label.toUpperCase()}`);
        kit.caption(`m${r.n}`, `🎯 ¡Match! → ${a.label}`,
          `Todas las condiciones activas se cumplen para <b>${esc(r.path)}</b> desde <b>${r.cc}</b> con bot score <b>${r.score}</b>. ${a.why}`);
      } else {
        setVerdict("ok", "SIN MATCH → PASA AL ORIGEN");
        kit.caption(`n${r.n}`, "✅ Sin match: la petición sigue su camino",
          `${askOf(c.failAt, r)} → <b>No</b>. Como las condiciones van unidas con <b>and</b>, basta una que no se cumpla para no aplicar la acción.`);
      }
    }
    if (c.shown && t - c.tDone > 0.7) dispatch(c, t);
  };

  const tick = t => {
    // Una petición a la vez: la siguiente sale cuando la anterior terminó (evaluación + acción + destino)
    if (!S.packets.length && !S.cur && t >= S.nextSpawn) { spawn(t); S.nextSpawn = Infinity; }
    const waiting = S.packets.filter(p => p.leg === "wait");
    waiting.forEach(p => {
      const i = S.queue.indexOf(p);
      kit.place(p.g, i < 0 ? HOLD : [HOLD[0] - 58, HOLD[1] + 22 * i]);
    });
    S.packets = waiting.concat(kit.move(S.packets.filter(p => p.leg !== "wait"), t, arrive));
    evaluate(t);
  };

  root.addEventListener("click", e => {
    const a = e.target.closest("[data-act]");
    if (a) { cfg.action = a.dataset.act; syncCfg(); return; }
    const o = e.target.closest("[data-op]");
    if (o) {
      const i = +o.dataset.op, ops = Object.keys(CONDS[i].ops);
      cfg.op[i] = ops[(ops.indexOf(cfg.op[i]) + 1) % ops.length];
      cfg.enabled[i] = true;
      syncCfg();
      return;
    }
    const c = e.target.closest("[data-cond]");
    if (c) { const i = +c.dataset.cond; cfg.enabled[i] = !cfg.enabled[i]; syncCfg(); }
  });

  return runScene(root, kit, { reset, tick });
}

// ── Escena: Response Rules ──────────────────────────────────────────────────
function mountResponseScene(root) {
  const REQ = [[184, 186], [250, 186]], RESP = [[250, 212], [184, 212]];
  const FWD = [[555, 190], [646, 190]], OBACK = [[646, 214], [555, 214]];
  const COMBOS = {
    headers: [["browser", false], ["browser", true]],
    block: [["browser", false], ["browser", true], ["api", false], ["api", true]]
  };
  const PATHS = { headers: "/productos", block: "/admin" };
  const SCREENS = {
    "headers-false": {
      lines: [["brand", "🛍 ACME · Productos"], ["p", "200 OK · página cargada"], ["err", "Server: Apache/2.4.49"], ["err", "X-Powered-By: PHP/7.2"], ["s", "sin HSTS · sin X-Frame-Options"]],
      banner: ["bad", "⚠ Expones tu stack"],
      cap: ["⚠ La página carga, pero filtra información",
        "Cualquiera ve que corres <b>Apache 2.4.49</b> y <b>PHP 7.2</b>. Un atacante cruza esas versiones con CVEs conocidos (Apache 2.4.49 → CVE-2021-41773, path traversal) y va directo a explotarlas. Además falta HSTS y protección contra clickjacking."]
    },
    "headers-true": {
      lines: [["brand", "🛍 ACME · Productos"], ["p", "200 OK · página cargada"], ["s", "Server: (oculto)"], ["ok", "HSTS: max-age=31536000"], ["ok", "X-Frame-Options: DENY"]],
      banner: ["good", "✅ Headers seguros"],
      cap: ["✅ Misma página, respuesta endurecida",
        "La Response Rule quitó <b>Server</b> y <b>X-Powered-By</b> y agregó <b>HSTS</b> y <b>X-Frame-Options</b> en el edge, sin tocar el código ni el servidor de origen."]
    },
    "browser-false": {
      lines: [["h", "Sorry, you have been blocked"], ["p", "You are unable to access"], ["p", "cloudflarepocs.com"], ["s", "Cloudflare Ray ID: {ray}"], ["s", "Security by Cloudflare"]],
      banner: ["neutral", "Página genérica de Cloudflare"],
      cap: ["😐 Funciona, pero es genérico", "El usuario ve la página estándar de Cloudflare: sin tu marca, sin un mensaje claro ni un canal de soporte."]
    },
    "browser-true": {
      lines: [["brand", "🛡 ACME Corp"], ["h", "Acceso restringido"], ["p", "Por seguridad bloqueamos"], ["p", "esta solicitud."], ["s", "Ref {ray} · soporte@acme.com"]],
      banner: ["good", "✅ Respuesta con tu marca"],
      cap: ["✅ El bloqueo habla con tu identidad", "Mismo bloqueo en el edge, pero con tu marca, un mensaje claro y una referencia (Ray ID) para que soporte encuentre el evento."]
    },
    "api-false": {
      lines: [["m", "403 · text/html"], ["m", "<!DOCTYPE html><html>"], ["m", "<title>Attention Required"], ["err", "💥 SyntaxError:"], ["err", "Unexpected token '<'"]],
      banner: ["bad", "❌ La app no entiende HTML"],
      cap: ["💥 La app truena", "Tu app esperaba JSON y recibió una página HTML: el parser falla y el usuario ve un error que no tiene sentido."]
    },
    "api-true": {
      lines: [["m", "403 · application/json"], ["m", '{"error":"forbidden",'], ["m", ' "ray":"{ray}"}'], ["h", "Acceso bloqueado"], ["p", "Contacta a soporte"]],
      banner: ["good", "✅ La app maneja el error"],
      cap: ["✅ La app entiende el bloqueo", "Recibe JSON con el formato de tu API, lo interpreta y muestra un mensaje útil. Puedes tener una respuesta JSON para /api y otra HTML para la web."]
    }
  };
  const cfg = { mode: "headers", client: "browser", custom: false, auto: true, combo: 0 };
  const lineY = i => 106 + i * 22;

  const svg = sceneFrame({
    edge: [250, 44, 305, 300],
    outer: `
      ${wireLine("req", REQ)}${wireLine("back on", RESP)}${wireLine("out", FWD)}${wireLine("oback", OBACK)}
      <text class="rl-wlabel sc-reqlabel" x="217" y="168" text-anchor="middle"></text>
      <g class="sc-device browser">
        <g class="sc-dev-browser">
          <rect class="sc-dev" x="16" y="56" width="166" height="268" rx="8"/>
          <rect class="sc-dev-bar" x="16" y="56" width="166" height="22" rx="8"/>
          <circle class="sc-dot" cx="28" cy="67" r="3"/><circle class="sc-dot" cx="37" cy="67" r="3"/><circle class="sc-dot" cx="46" cy="67" r="3"/>
          <text class="sc-url" x="56" y="70"></text>
        </g>
        <g class="sc-dev-phone">
          <rect class="sc-dev" x="34" y="50" width="130" height="282" rx="20"/>
          <rect class="sc-notch" x="74" y="57" width="50" height="7" rx="3.5"/>
          <text class="sc-apphead" x="99" y="84" text-anchor="middle">ACME App</text>
        </g>
        ${[0, 1, 2, 3, 4].map(i => `<text class="sc-l" data-l="${i}" x="99" y="${lineY(i)}" text-anchor="middle"></text>`).join("")}
        <g class="sc-banner"><rect x="28" y="266" width="142" height="26" rx="6"/><text x="99" y="283" text-anchor="middle"></text></g>
        <text class="sc-devlabel" x="99" y="350" text-anchor="middle"></text>
      </g>
      ${originBox(648, 110, 180, "")}`,
    inner: `
      <g class="sc-card sc-waf"><rect x="264" y="84" width="277" height="40" rx="8"/>
        <text class="rl-rule-t" x="276" y="100">🛡 WAF Custom Rule</text>
        <text class="sc-mono" x="276" y="115">uri.path wildcard "/admin*" → block</text>
      </g>
      <text class="sc-arrow" x="402" y="138" text-anchor="middle">▼</text>
      <g class="sc-card sc-rr"><rect x="264" y="144" width="277" height="78" rx="8"/>
        <text class="rl-rule-t sc-rr-t" x="276" y="161"></text>
        <text class="sc-pill-t" x="529" y="160" text-anchor="end"></text>
        ${[0, 1, 2].map(i => `<text class="sc-mono" data-rr="${i}" x="276" y="${178 + i * 16}"></text>`).join("")}
      </g>
      <g class="sc-gen"><rect x="264" y="230" width="277" height="84" rx="8"/>
        <text class="sc-insp-l sc-gen-t" x="276" y="244"></text>
        ${[0, 1, 2, 3].map(i => `<text class="sc-gen-l" data-g="${i}" x="276" y="${260 + i * 14}"></text>`).join("")}
      </g>`
  });
  const controls = `
    <div class="rl-controls sc-seg"><span class="sc-seg-l">Caso de uso</span>
      <button class="btn btn-sm" data-mode="headers">🛡 Headers seguros · pasa al origen</button>
      <button class="btn btn-sm" data-mode="block">🧱 Bloqueo con tu marca</button>
    </div>
    <div class="rl-controls sc-seg sc-clientrow"><span class="sc-seg-l">Cliente</span>
      <button class="btn btn-sm" data-client="browser">🌐 Navegador</button>
      <button class="btn btn-sm" data-client="api">📱 App / API</button>
    </div>
    <div class="rl-controls sc-seg"><span class="sc-seg-l">Response Rule</span>
      <button class="btn btn-sm" data-custom="false">Desactivada</button>
      <button class="btn btn-sm" data-custom="true">Activada</button>
      <label class="sc-check"><input type="checkbox" data-auto checked> Comparar automáticamente</label>
    </div>`;

  const kit = sceneKit(root, { svg, controls });
  const device = kit.q(".sc-device"), lineEls = kit.qa(".sc-l"), banner = kit.q(".sc-banner"), bannerT = kit.q(".sc-banner text");
  const devLabel = kit.q(".sc-devlabel"), wafCard = kit.q(".sc-waf"), rrCard = kit.q(".sc-rr"), rrPill = kit.q(".sc-pill-t");
  const rrTitle = kit.q(".sc-rr-t"), rrLines = kit.qa("[data-rr]"), genTitle = kit.q(".sc-gen-t"), genLines = kit.qa("[data-g]");
  const autoBox = kit.q("[data-auto]"), clientRow = kit.q(".sc-clientrow"), urlEl = kit.q(".sc-url"), reqLabel = kit.q(".sc-reqlabel");
  const originN = kit.q('[data-o="n"]'), originS = kit.q('[data-o="s"]'), originSub = kit.q(".sc-origin .d-cust-s"), originBoxEl = kit.q(".sc-origin > rect");
  let S = { t: 0, k: 0, packets: [], origin: 0 };

  const isHeaders = () => cfg.mode === "headers";
  const key = () => (isHeaders() ? `headers-${cfg.custom}` : `${cfg.client}-${cfg.custom}`);
  const rrText = () => {
    if (isHeaders()) return cfg.custom
      ? ["remove: Server, X-Powered-By", "set: Strict-Transport-Security", "set: X-Frame-Options: DENY"]
      : ["— sin Response Rule —", "los headers del origen", "pasan tal cual al cliente"];
    return cfg.custom
      ? ["status_code: 403", `content_type: ${cfg.client === "api" ? "application/json" : "text/html"}`, `body: ${cfg.client === "api" ? '{"error":"forbidden",…}' : "plantilla ACME (HTML)"}`]
      : ["— sin Response Rule —", "Cloudflare usa su página", "de bloqueo por defecto"];
  };
  const genText = () => {
    if (isHeaders()) return cfg.custom
      ? [["", "HTTP/1.1 200 OK"], ["del", "server: Apache/2.4.49"], ["del", "x-powered-by: PHP/7.2"], ["add", "+ HSTS · + X-Frame-Options: DENY"]]
      : [["", "HTTP/1.1 200 OK"], ["leak", "server: Apache/2.4.49"], ["leak", "x-powered-by: PHP/7.2"], ["dim", "(sin headers de seguridad)"]];
    const json = cfg.custom && cfg.client === "api";
    return [["", "HTTP/1.1 403 Forbidden"], ["", `content-type: ${json ? "application/json" : "text/html"}`],
      ["", json ? `{"error":"forbidden","ray":"${S.ray}"}` : cfg.custom ? "<html> plantilla ACME …" : "<!DOCTYPE html> página genérica…"], ["", ""]];
  };

  const sync = () => {
    if (isHeaders()) cfg.client = "browser";
    device.setAttribute("class", `sc-device ${cfg.client}`);
    devLabel.textContent = cfg.client === "api" ? "📱 App móvil (consume tu API)" : "🌐 Navegador web";
    urlEl.textContent = `cloudflarepocs.com${PATHS[cfg.mode]}`;
    reqLabel.innerHTML = `<tspan x="217" dy="0">GET</tspan><tspan x="217" dy="10">${PATHS[cfg.mode]}</tspan>`;
    originSub.textContent = PATHS[cfg.mode];
    clientRow.style.display = isHeaders() ? "none" : "";
    kit.segment("data-mode", cfg.mode);
    kit.segment("data-client", cfg.client);
    kit.segment("data-custom", cfg.custom);
    rrTitle.textContent = isHeaders() ? "📤 Response Rule · headers" : "📤 Response Rule · bloqueo";
    genTitle.textContent = isHeaders() ? "📦 RESPUESTA QUE RECIBE EL CLIENTE" : "📦 RESPUESTA GENERADA EN EL EDGE";
    rrCard.classList.toggle("off", !cfg.custom);
    rrPill.textContent = cfg.custom ? "ACTIVA" : "DESACTIVADA";
    rrPill.setAttribute("class", `sc-pill-t ${cfg.custom ? "on" : "off"}`);
    rrText().forEach((s, i) => { rrLines[i].textContent = s; });
    autoBox.checked = cfg.auto;
  };
  const clearScreen = () => {
    lineEls.forEach(e => { e.setAttribute("class", "sc-l"); e.textContent = ""; });
    banner.setAttribute("class", "sc-banner");
    genLines.forEach(e => { e.setAttribute("class", "sc-gen-l"); e.textContent = ""; });
    rrCard.classList.remove("hl");
    originS.textContent = isHeaders() ? "esperando petición…" : "🔒 No le llega nada";
    originS.setAttribute("class", "sc-origin-s");
  };
  const startCycle = (t, advance) => {
    const combos = COMBOS[cfg.mode];
    if (advance && cfg.auto) {
      cfg.combo = (cfg.combo + 1) % combos.length;
      [cfg.client, cfg.custom] = combos[cfg.combo];
    }
    S.packets.forEach(p => p.g.remove());
    Object.assign(S, { c0: t, ei: 0, k: S.k + 1, packets: [], ray: Math.random().toString(16).slice(2, 10) });
    sync();
    clearScreen();
  };
  const send = (cls, label, path, t) => {
    S.packets.push({ g: kit.pill(cls, label, Math.max(56, Math.round(18 + label.length * 5.4))), path, t0: t, dur: 0.7 });
  };
  const showLine = i => {
    const [cls, txt] = SCREENS[key()].lines[i];
    lineEls[i].setAttribute("class", `sc-l ${cls} on`);
    lineEls[i].textContent = txt.replace("{ray}", S.ray);
  };
  const showGen = i => {
    const [cls, txt] = genText()[i];
    genLines[i].setAttribute("class", `sc-gen-l ${cls} on`);
    genLines[i].textContent = txt;
  };
  const finish = (res, logCls) => {
    const sc = SCREENS[key()];
    banner.setAttribute("class", `sc-banner ${sc.banner[0]} on`);
    bannerT.textContent = sc.banner[1];
    kit.caption(`c${S.k}z`, sc.cap[0], sc.cap[1]);
    kit.logReq(`ray ${S.ray}`, `${cfg.client === "api" ? "app" : "web"} GET ${PATHS[cfg.mode]}`, res, logCls);
  };
  const who = () => (cfg.client === "api" ? "📱 La app" : "🌐 El navegador");

  // Caso 1: la petición es legítima, llega al origen y la Response Rule reescribe los headers de la respuesta
  const HEADERS_EVENTS = [
    [0.05, t => {
      send("neutral", "GET /productos", REQ, t);
      kit.caption(`c${S.k}a`, `${who()} pide /productos`, "Una petición normal de un cliente legítimo viaja al edge de Cloudflare.");
    }],
    [0.78, t => {
      kit.flash(wafCard, "pass", 900);
      kit.caption(`c${S.k}b`, "✅ El WAF la deja pasar", "<b>/productos</b> no coincide con la regla <code>/admin*</code>, así que la petición sigue hacia tu origen.");
      send("neutral", "GET /productos", FWD, t);
    }],
    [1.5, t => {
      S.origin++;
      originN.textContent = S.origin;
      originS.textContent = "✓ respondió 200";
      originBoxEl.animate?.([{ fill: "#BFDBFE" }, { fill: "#EFF6FF" }], { duration: 400 });
      kit.caption(`c${S.k}c`, "🖥 Tu origen responde 200",
        "Responde con todos sus headers, incluidos <b>Server: Apache/2.4.49</b> y <b>X-Powered-By: PHP/7.2</b>: pistas gratis para un atacante.");
      send("warn", "200 + headers", OBACK, t);
    }],
    [2.25, () => {
      rrCard.classList.toggle("hl", cfg.custom);
      if (cfg.custom) kit.caption(`c${S.k}d`, "📤 La Response Rule reescribe los headers",
        "En el edge se <b>quitan</b> Server y X-Powered-By y se <b>agregan</b> HSTS y X-Frame-Options. Tu servidor no cambia.");
      else kit.caption(`c${S.k}d`, "📄 Sin Response Rule: los headers pasan tal cual",
        "Cloudflare entrega la respuesta del origen sin modificarla, con todo lo que revela.");
    }],
    ...[0, 1, 2, 3].map(i => [2.45 + i * 0.18, () => showGen(i)]),
    [3.25, t => send(cfg.custom ? "good" : "warn", cfg.custom ? "200 limpio" : "200 + Server", RESP, t)],
    ...[0, 1, 2, 3, 4].map(i => [4.0 + i * 0.2, () => showLine(i)]),
    [5.05, () => finish(cfg.custom ? "200 · headers limpios" : "200 · Server expuesto", cfg.custom ? "ok" : "warn")],
    [8.4, t => startCycle(t, true)]
  ];

  // Caso 2: el WAF bloquea /admin y la Response Rule decide qué le responde el edge al cliente
  const BLOCK_EVENTS = [
    [0.05, t => {
      send("neutral", "GET /admin", REQ, t);
      kit.caption(`c${S.k}a`, `${who()} pide /admin`, "La petición viaja al edge de Cloudflare, como cualquier otra.");
    }],
    [0.78, () => {
      kit.impact(REQ[1]);
      kit.flash(wafCard, "flash", 900);
      kit.caption(`c${S.k}b`, "🛡 El WAF bloquea la petición",
        "Una regla del WAF coincide y decide bloquear, así que nunca llega a tu origen. La pregunta ahora es: <b>¿qué le respondemos al cliente?</b>");
    }],
    [1.2, () => {
      rrCard.classList.toggle("hl", cfg.custom);
      if (cfg.custom) kit.caption(`c${S.k}c`, "📤 La Response Rule arma tu respuesta",
        `Status <b>403</b>, content-type <b>${cfg.client === "api" ? "application/json" : "text/html"}</b> y un cuerpo con tu formato, en vez de la página genérica.`);
      else kit.caption(`c${S.k}c`, "📄 Sin Response Rule: respuesta por defecto",
        "Cloudflare devuelve su página HTML estándar de bloqueo, igual para un navegador que para una app.");
    }],
    ...[0, 1, 2].map(i => [1.45 + i * 0.22, () => showGen(i)]),
    [2.2, t => {
      const json = cfg.custom && cfg.client === "api";
      send(cfg.custom ? "good" : "bad", json ? "403 JSON" : "403 HTML", RESP, t);
    }],
    ...[0, 1, 2, 3, 4].map(i => [2.95 + i * 0.2, () => showLine(i)]),
    [4.0, () => {
      const json = cfg.custom && cfg.client === "api", b = SCREENS[key()].banner[0];
      finish(`403 ${json ? "application/json" : "text/html"} · ${cfg.custom ? "Response Rule" : "default"}`, b === "bad" ? "bad" : b === "good" ? "ok" : "warn");
    }],
    [7.4, t => startCycle(t, true)]
  ];

  const reset = () => {
    Object.assign(cfg, { mode: "headers", auto: true, combo: 0 });
    [cfg.client, cfg.custom] = COMBOS.headers[0];
    S.origin = 0;
    originN.textContent = "0";
    kit.log("Escuchando respuestas en el edge…", "hint");
    startCycle(0, false);
  };
  const tick = t => {
    S.t = t;
    const ev = isHeaders() ? HEADERS_EVENTS : BLOCK_EVENTS;
    while (S.ei < ev.length && t - S.c0 >= ev[S.ei][0]) ev[S.ei++][1](t);
    S.packets = kit.move(S.packets, t, p => kit.drop(p));
  };

  root.addEventListener("click", e => {
    const m = e.target.closest("[data-mode]"), c = e.target.closest("[data-client]"), r = e.target.closest("[data-custom]");
    if (!m && !c && !r) return;
    if (m) {
      cfg.mode = m.dataset.mode;
      [cfg.client, cfg.custom] = COMBOS[cfg.mode][0];
      cfg.combo = 0;
    } else {
      if (c) cfg.client = c.dataset.client;
      if (r) cfg.custom = r.dataset.custom === "true";
      cfg.auto = false;
      cfg.combo = Math.max(0, COMBOS[cfg.mode].findIndex(([a, b]) => a === cfg.client && b === cfg.custom));
    }
    startCycle(S.t, false);
  });
  autoBox.addEventListener("change", () => { cfg.auto = autoBox.checked; });

  return runScene(root, kit, { reset, tick });
}

// ── Escena: WAF Managed Ruleset · caso real php2shell (CVE-2026-109618 / 109619) ──
// Basado en https://blog.cloudflare.com/php-vulnerabilities-waf-protection/
function mountManagedScene(root) {
  const T = 30, RULE_T = 2, DEP = 2.5, LEAK_T = 5, DISC_T = 11, MUT_T = 13, PATCH_T = 24, ATK_END = 28;
  const PATH = {
    usr: [[98, 120], [240, 168]], bot: [[98, 262], [240, 252]],
    out: [[560, 200], [646, 200]], oback: [[646, 226], [560, 226]], exfil: [[240, 280], [98, 284]]
  };
  const RULES = [
    ["100015", "SQLi · inyección genérica", false],
    ["c1d409ad", "PHP RCE · CVE-2026-109618/9", true],
    ["f9a45927", "PHP RCE · CVE-2026-109618/9 #2", true]
  ];
  const DOTS = 28;
  const tlX = s => 40 + 700 * (s / T);
  const cfg = { enabled: true };

  const rows = RULES.map(([id, name, isNew], i) => `
    <g class="sc-row ${isNew ? "new" : ""}"><rect x="262" y="${106 + i * 23}" width="276" height="19" rx="4"/>
      <text x="270" y="${119.5 + i * 23}">${id} · ${name}</text>
      ${isNew ? `<text class="sc-newtag" x="528" y="${119.5 + i * 23}" text-anchor="end">NUEVA</text>` : `<text class="ok" x="528" y="${120 + i * 23}" text-anchor="end">✓</text>`}</g>`).join("");
  const dots = Array.from({ length: DOTS }, (_, i) =>
    `<circle class="sc-pop" cx="${272 + (i % 14) * 19.5}" cy="${262 + Math.floor(i / 14) * 15}" r="4"/>`).join("");
  const marks = [[RULE_T, "Reglas CF", "good", "rule"], [LEAK_T, "Filtración", "bad", "leak"], [DISC_T, "Divulgación", "bad", "disc"], [PATCH_T, "Tu parche", "", "patch"]];

  const svg = sceneFrame({
    edge: [240, 44, 320, 282],
    outer: `
      ${wireLine("usr", PATH.usr)}${wireLine("atk", PATH.bot)}${wireLine("out", PATH.out)}${wireLine("oback", PATH.oback)}${wireLine("back", PATH.exfil)}
      <g class="sc-toast"><rect x="16" y="32" width="218" height="44" rx="8"/>
        <text class="t1" x="28" y="50"></text>
        <text class="t2" x="28" y="66"></text></g>
      ${iconBox({ id: "mr-usr", x: 70, y: 120, icon: "🧑", label: "Usuarios", sub: "tráfico normal", cls: "good" })}
      <g class="sc-bot sc-dim">${iconBox({ id: "mr-bot", x: 70, y: 262, icon: "☠️", label: "Atacantes", sub: "exploit php2shell", cls: "bad" })}</g>
      ${originBox(648, 110, 190, "PHP 8.x · WordPress")}
      <line class="sc-tl-track" x1="40" y1="352" x2="740" y2="352"/>
      <line class="sc-tl-done" x1="40" y1="352" x2="40" y2="352"/>
      ${marks.map(([t, label, cls, id]) => `<g class="sc-tl-mark ${cls}" data-m="${id}"><circle cx="${tlX(t)}" cy="352" r="5"/><text x="${tlX(t)}" y="342" text-anchor="middle">${label}</text></g>`).join("")}
      <circle class="sc-tl-head" cx="40" cy="352" r="4"/>
      <text class="sc-tl-comp" x="740" y="366" text-anchor="end">⏱ tiempo comprimido · caso real oct 2026</text>`,
    inner: `
      <g class="sc-card sc-mr"><rect x="254" y="84" width="292" height="96" rx="8"/>
        <text class="rl-rule-t" x="266" y="100">🛡 Cloudflare Managed Ruleset</text>
        <text class="sc-pill-t on sc-mr-pill" x="538" y="99" text-anchor="end">AUTO-UPDATE</text>
        ${rows}
      </g>
      <g class="sc-card sc-rf"><rect x="254" y="188" width="292" height="44" rx="8"/>
        <text class="rl-rule-t" x="266" y="204">🔁 Response Firewall</text>
        <text class="sc-pill-t on" x="538" y="203" text-anchor="end">FULL TRANSACTION</text>
        <text class="sc-mono" x="266" y="222">analiza la respuesta · bloquea fugas de memoria</text>
      </g>
      <text class="sc-label" x="262" y="250">DESPLIEGUE GLOBAL</text>
      <text class="sc-dep" x="538" y="250" text-anchor="end"></text>
      ${dots}
      <text class="sc-hint sc-mr-hint" x="400" y="306" text-anchor="middle"></text>`
  });
  const controls = `<div class="rl-controls sc-seg"><span class="sc-seg-l">Managed Ruleset</span>
    <button class="btn btn-sm" data-mr="on">Activado</button>
    <button class="btn btn-sm" data-mr="off">Desactivado</button></div>`;
  const stats = `<div class="rl-stats">
    <div class="rl-stat sent"><b data-out="sent">0</b><span>Exploits enviados</span></div>
    <div class="rl-stat good"><b data-out="req">0</b><span>Bloqueados · petición</span></div>
    <div class="rl-stat pass"><b data-out="resp">0</b><span>Bloqueados · respuesta</span></div>
    <div class="rl-stat block"><b data-out="leak">0</b><span>Datos filtrados</span></div>
  </div>`;

  const kit = sceneKit(root, { svg, controls, stats });
  const toast = kit.q(".sc-toast"), toastT1 = kit.q(".sc-toast .t1"), toastT2 = kit.q(".sc-toast .t2");
  const bot = kit.q(".sc-bot"), newRows = kit.qa(".sc-row.new"), card = kit.q(".sc-mr"), rfCard = kit.q(".sc-rf"), mrPill = kit.q(".sc-mr-pill");
  const dotEls = kit.qa(".sc-pop"), dep = kit.q(".sc-dep"), hint = kit.q(".sc-mr-hint"), head = kit.q(".sc-tl-head"), done = kit.q(".sc-tl-done");
  const markEls = Object.fromEntries(kit.qa(".sc-tl-mark").map(m => [m.dataset.m, m]));
  const originS = kit.q('[data-o="s"]'), originN = kit.q('[data-o="n"]'), originG = kit.q(".sc-origin"), originSub = kit.q(".sc-origin .d-cust-s");
  let S;
  const randIp = () => `${[45, 89, 103, 185, 193][Math.floor(Math.random() * 5)]}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  const setToast = (cls, a, b) => {
    toast.setAttribute("class", `sc-toast on ${cls}`);
    toastT1.textContent = a;
    toastT2.textContent = b;
  };
  const count = (k, n = 1) => { S[k] += n; kit.out(k, S[k]); };

  const cycle = t => {
    S.packets.forEach(p => p.g.remove());
    Object.assign(S, {
      c0: t, packets: [], ruled: false, live: false, leaked: false, disclosed: false, mutated: false, patched: false,
      lastLeak: -9, lit: 0, nextUsr: 0.2, nextBot: LEAK_T + 0.3, order: shuffle([...Array(DOTS).keys()])
    });
    toast.setAttribute("class", "sc-toast");
    bot.classList.add("sc-dim");
    newRows.forEach(r => r.classList.remove("on"));
    rfCard.classList.add("sc-dim");
    dotEls.forEach(d => d.classList.remove("on"));
    Object.values(markEls).forEach(m => m.classList.remove("on"));
    card.classList.toggle("off", !cfg.enabled);
    rfCard.classList.toggle("off", !cfg.enabled);
    mrPill.textContent = cfg.enabled ? "AUTO-UPDATE" : "DESACTIVADO";
    mrPill.setAttribute("class", `sc-pill-t sc-mr-pill ${cfg.enabled ? "on" : "off"}`);
    markEls.rule.style.opacity = cfg.enabled ? "" : "0.3";
    originSub.textContent = "PHP 8.x · WordPress";
    hint.textContent = "PHP corre en ~70% de los sitios web (WordPress, Magento…)";
    kit.segment("data-mr", cfg.enabled ? "on" : "off");
  };

  const reset = () => {
    S = { t: 0, packets: [], n: 0, sent: 0, req: 0, resp: 0, leak: 0, origin: 0 };
    ["sent", "req", "resp", "leak"].forEach(k => kit.out(k, 0));
    originN.textContent = "0";
    kit.log("Monitoreando el Managed Ruleset…", "hint");
    cycle(0);
  };

  const spawn = (kind, t) => {
    const n = ++S.n;
    const p = { kind, n, ip: kind === "usr" ? "" : randIp(), leg: "in", path: PATH[kind === "usr" ? "usr" : "bot"], t0: t, dur: kind === "usr" ? 1.2 : 0.95 };
    p.g = kind === "usr" ? kit.pill("good", "GET", 40) : kind === "mut" ? kit.pill("exploit", `🧬 #${n}`, 52) : kit.pill("exploit", `php2shell #${n}`, 84);
    S.packets.push(p);
    if (kind !== "usr") count("sent");
  };

  const arrive = (p, t, frac) => {
    const ct = t - S.c0;
    if (p.leg === "in") {
      // La firma de la petición atrapa el payload original; la variante mutada la evade
      if (p.kind === "x" && S.ruled && Math.random() < frac) {
        kit.impact(PATH.bot[1]);
        kit.relabel(p.g, "bad", "403", 44);
        Object.assign(p, { leg: "back", path: PATH.bot.slice().reverse(), dur: 0.85, t0: t });
        count("req");
        kit.logReq(p.ip, `POST /index.php #${p.n}`, `403 · regla ${RULES[1][0]}`, "ok");
        return;
      }
      Object.assign(p, { leg: "out", path: PATH.out, dur: 0.7, t0: t });
      if (p.kind === "mut") kit.logReq(p.ip, `POST /index.php #${p.n}`, "⚠ variante evadió la firma", "warn");
      else if (p.kind === "x") kit.logReq(p.ip, `POST /index.php #${p.n}`, "⚠ llegó al origen", "bad");
      return;
    }
    if (p.leg === "out") {
      S.origin++;
      originN.textContent = S.origin;
      if (p.kind !== "usr" && !S.patched) {
        // El origen vulnerable responde filtrando memoria
        S.lastLeak = ct;
        kit.flash(originG, "alarm", 500);
        kit.relabel(p.g, "warn", "💾 fuga", 52);
        Object.assign(p, { leg: "oback", path: PATH.oback, dur: 0.7, t0: t });
        return;
      }
      if (p.kind !== "usr") kit.logReq(p.ip, `POST /index.php #${p.n}`, "500 · PHP parchado, sin fuga", "ok");
      kit.drop(p);
      return;
    }
    if (p.leg === "oback") {
      // Full transaction detection: se revisa la respuesta del origen antes de entregarla
      if (S.live) {
        kit.impact(PATH.oback[1]);
        kit.flash(rfCard, "hl", 700);
        count("resp");
        kit.logReq(p.ip, `respuesta #${p.n}`, "bloqueada · Response Firewall", "ok");
        kit.drop(p);
      } else {
        kit.relabel(p.g, "bad", "💾 datos", 58);
        Object.assign(p, { leg: "exfil", path: PATH.exfil, dur: 0.85, t0: t });
      }
      return;
    }
    if (p.leg === "exfil") {
      count("leak");
      kit.logReq(p.ip, `respuesta #${p.n}`, "⚠ datos filtrados al atacante", "bad");
    }
    kit.drop(p);
  };

  const phase = ct => {
    if (ct < RULE_T) return ["calm", "🌐 Un día normal",
      "El tráfico legítimo llega a tu sitio PHP. El Managed Ruleset ya protege contra ataques conocidos como SQLi."];
    if (!cfg.enabled) {
      if (ct < LEAK_T) return ["off0", "⚠ Managed Ruleset desactivado", "No recibirás las reglas de php2shell que Cloudflare está a punto de publicar."];
      if (ct < PATCH_T) return ["off1", "⚠ Sin Managed Ruleset: el exploit entra y filtra datos",
        "Cada intento llega a tu origen, PHP filtra memoria en la respuesta y los datos regresan al atacante. Así sigues hasta que tu equipo actualice PHP."];
      return ["off2", "🔧 Por fin actualizas PHP", "Todo el tiempo entre la filtración y tu parche, tu sitio estuvo expuesto."];
    }
    if (ct < LEAK_T) return ["rule", "🛡 Cloudflare despliega las reglas antes del anuncio",
      "En coordinación con PHP Foundation, Wiz y OpenAI, Cloudflare publica las reglas <b>PHP RCE</b> en el Managed Ruleset unas <b>9 horas antes</b> de la divulgación pública. Mira cómo se encienden los PoPs."];
    if (ct < DISC_T) return ["leak", "☠️ La vulnerabilidad se filtra y empiezan los ataques",
      "El exploit circula antes del anuncio oficial. Las botnets atacan, pero tus sitios ya tienen la regla: cada intento rebota con <b>403</b> en el edge."];
    if (ct < MUT_T) return ["disc", "📢 Divulgación pública: CVE-2026-109618 y 109619",
      "php2shell afecta a PHP 5.4 o posterior y permite RCE, denegación de servicio y exposición de datos. Tu servidor sigue sin parche, pero ya estaba protegido desde antes."];
    if (ct < PATCH_T) return ["mut", "🧬 Los atacantes mutan el payload",
      "Una variante 🧬 evade la firma de la petición y llega al origen, que filtra memoria en su respuesta. La <b>detección de transacción completa</b> revisa la respuesta y la bloquea antes de que llegue al atacante."];
    return ["patch", "🔧 Tu equipo actualiza PHP",
      "Con el parche el origen ya no filtra datos. Cloudflare te dio el margen para parchar con calma. Aun así, mantén el WAF activo como defensa en profundidad."];
  };

  const tick = t => {
    S.t = t;
    let ct = t - S.c0;
    if (ct >= T) { cycle(t); ct = 0; }
    if (cfg.enabled && !S.ruled && ct >= RULE_T) {
      S.ruled = true;
      newRows.forEach(r => r.classList.add("on"));
      rfCard.classList.remove("sc-dim");
      markEls.rule.classList.add("on");
      setToast("info", "🤝 Divulgación coordinada", "reglas listas ~9 h antes del anuncio");
      kit.log(`🛡 Cloudflare publica ${RULES[1][0]} y ${RULES[2][0]} · PHP RCE (php2shell)`, "evt");
    }
    if (!S.leaked && ct >= LEAK_T) {
      S.leaked = true;
      bot.classList.remove("sc-dim");
      markEls.leak.classList.add("on");
      setToast("", "☠️ El exploit se filtró", "ataques antes del anuncio oficial");
      kit.log("☠️ El exploit de php2shell se filtra antes de la fecha oficial", "evt");
    }
    if (!S.disclosed && ct >= DISC_T) {
      S.disclosed = true;
      markEls.disc.classList.add("on");
      setToast("", "📢 CVE-2026-109618 / 109619", "php2shell · PHP 5.4+ · RCE");
      kit.log("📢 Divulgación pública de CVE-2026-109618 y CVE-2026-109619", "evt");
    }
    if (!S.mutated && ct >= MUT_T) {
      S.mutated = true;
      setToast("", "🧬 Payload mutado", "intentan evadir la firma");
      kit.log("🧬 Los atacantes mutan el payload para evadir la regla", "evt");
    }
    const frac = S.ruled ? Math.min(1, (ct - RULE_T) / DEP) : 0;
    while (S.lit < Math.floor(frac * DOTS)) dotEls[S.order[S.lit++]].classList.add("on");
    if (S.ruled && frac >= 1 && !S.live) {
      S.live = true;
      kit.log("✓ Reglas activas en toda la red, en todos los planes (incluido Free)", "evt");
    }
    dep.textContent = !cfg.enabled ? "Ruleset desactivado" : !S.ruled ? "sin reglas pendientes" : S.live ? "✓ activa en toda la red" : `desplegando… ${Math.round(frac * 100)}%`;
    if (!S.patched && ct >= PATCH_T) {
      S.patched = true;
      markEls.patch.classList.add("on");
      originSub.textContent = "PHP actualizado";
      kit.log("🔧 Tu equipo actualiza PHP en el origen", "evt");
    }

    if (ct >= S.nextUsr) { spawn("usr", t); S.nextUsr = ct + 0.9 + Math.random() * 0.6; }
    if (S.leaked && ct < ATK_END && ct >= S.nextBot) {
      spawn(S.mutated && Math.random() < 0.45 ? "mut" : "x", t);
      S.nextBot = ct + 0.55 + Math.random() * 0.4;
    }
    S.packets = kit.move(S.packets, t, (p, tt) => arrive(p, tt, frac));

    const leaking = ct - S.lastLeak < 1.2;
    originS.textContent = S.patched ? "✓ PHP parchado" : leaking ? "⚠ Filtrando memoria" : S.live ? "🛡 Protegido sin parche" : "✓ Operando";
    originS.setAttribute("class", `sc-origin-s ${leaking && !S.patched ? "bad" : ""}`);
    head.setAttribute("cx", tlX(ct));
    done.setAttribute("x2", tlX(ct));
    const [k, title, text] = phase(ct);
    kit.caption(k, title, text);
  };

  root.addEventListener("click", e => {
    const b = e.target.closest("[data-mr]");
    if (!b) return;
    cfg.enabled = b.dataset.mr === "on";
    cycle(S.t);
  });

  return runScene(root, kit, { reset, tick });
}

// ── Escena: WAF Core (OWASP) Ruleset — anomaly scoring ──────────────────────
function mountOwaspScene(root) {
  const FAM = [["920", "Protocolo"], ["930", "LFI"], ["932", "RCE"], ["941", "XSS"], ["942", "SQLi"]];
  const GX = [292, 344, 396, 448, 500];
  const Y = 196, DEC = 536;
  const IN = [[98, Y], [DEC, Y]], OUT = [[DEC, Y], [646, Y]], BACK = [[DEC, 262], [240, 262], [98, 222]];
  const THR = { low: 60, med: 40, high: 25 };
  const THR_LABEL = { low: "Baja", med: "Media", high: "Alta" };
  const GMAX = 70, GX0 = 262, GW = 276;
  // Puntos por familia en cada paranoia level [PL1, PL2, PL3, PL4] (acumulativos, ilustrativos)
  const REQS = [
    { q: "GET /buscar?q=zapatos", atk: false, s: {} },
    { q: "POST /perfil nombre=O'Brien", atk: false, s: { 942: [0, 5, 5, 5], 920: [0, 0, 5, 7] } },
    { q: "GET /blog?c=te amo <3", atk: false, s: { 941: [0, 5, 5, 5], 920: [0, 0, 5, 5] } },
    { q: "GET /item?id=1' OR '1'='1", atk: true, s: { 942: [35, 10, 5, 5], 920: [5, 0, 0, 0] } },
    { q: "GET /?q=<script>alert(1)</script>", atk: true, s: { 941: [45, 5, 5, 5] } },
    { q: "GET /static/../../etc/passwd", atk: true, s: { 930: [40, 5, 5, 0], 932: [10, 0, 0, 0] } },
    { q: "POST /ping host=;cat /etc/shadow", atk: true, s: { 932: [45, 10, 0, 0], 930: [5, 0, 0, 0] } },
    { q: "GET /item?id=1%27/**/oR/**/1", atk: true, s: { 942: [15, 15, 10, 5], 920: [0, 5, 0, 5] } }
  ];
  const cfg = { pl: 1, thr: "med" };
  const gx = v => GX0 + GW * Math.min(v, GMAX) / GMAX;
  const contrib = (r, fam) => (r.s[fam] || []).slice(0, cfg.pl).reduce((a, b) => a + b, 0);

  const gates = FAM.map(([code, name], i) => `
    <g class="sc-gate" data-gate="${i}">
      <text class="code" x="${GX[i]}" y="128" text-anchor="middle">${code}</text>
      <rect x="${GX[i] - 7}" y="136" width="14" height="104" rx="7"/>
      <text class="name" x="${GX[i]}" y="252" text-anchor="middle">${name}</text>
    </g>`).join("");
  const ticks = Object.entries(THR).map(([k, v]) => `
    <line class="sc-tickline" x1="${gx(v)}" y1="290" x2="${gx(v)}" y2="308"/>
    <text class="sc-tick" data-tick="${k}" x="${gx(v)}" y="320" text-anchor="middle">${THR_LABEL[k]} ${v}</text>`).join("");

  const svg = sceneFrame({
    edge: [240, 44, 320, 300],
    outer: `
      ${wireLine("req", [[98, Y], [240, Y]])}${wireLine("out", [[560, Y], [646, Y]])}${wireLine("back", BACK)}
      ${iconBox({ id: "ow-src", x: 70, y: Y, icon: "🌐", label: "Clientes", sub: "tráfico mixto", cls: "good" })}
      ${originBox(648, 110, 180, "app web")}`,
    inner: `
      <g class="sc-insp"><rect x="254" y="80" width="292" height="34" rx="8"/>
        <text class="sc-insp-l" x="266" y="93">PAYLOAD</text>
        <text class="sc-truth" x="534" y="93" text-anchor="end"></text>
        <text class="sc-insp-t" x="266" y="107">—</text>
      </g>
      <line class="sc-lane" x1="240" y1="${Y}" x2="${DEC}" y2="${Y}"/>
      ${gates}
      <line class="sc-decide" x1="${DEC}" y1="140" x2="${DEC}" y2="240"/>
      <text class="sc-label" x="${DEC}" y="132" text-anchor="middle">⚖</text>
      <text class="sc-label" x="${GX0}" y="284">ANOMALY SCORE</text>
      <text class="sc-score" x="${GX0 + GW}" y="285" text-anchor="end"></text>
      <rect class="sc-gauge-bg" x="${GX0}" y="292" width="${GW}" height="12" rx="6"/>
      <rect class="sc-gauge" x="${GX0}" y="292" width="0" height="12" rx="6"/>
      ${ticks}
      <line class="sc-thr-line" x1="0" y1="288" x2="0" y2="310"/>
      <text class="sc-hint" x="400" y="337" text-anchor="middle">Puntajes ilustrativos por familia de reglas CRS</text>`
  });
  const controls = `
    <div class="rl-controls sc-seg"><span class="sc-seg-l">Paranoia level</span>
      ${[1, 2, 3, 4].map(p => `<button class="btn btn-sm" data-pl="${p}">PL${p}</button>`).join("")}
    </div>
    <div class="rl-controls sc-seg"><span class="sc-seg-l">Umbral de anomalía</span>
      ${Object.entries(THR).map(([k, v]) => `<button class="btn btn-sm" data-thr="${k}">${THR_LABEL[k]} · ${v}</button>`).join("")}
    </div>`;
  const stats = `<div class="rl-stats">
    <div class="rl-stat good"><b data-out="ab">0</b><span>Ataques bloqueados</span></div>
    <div class="rl-stat block"><b data-out="fn">0</b><span>Falsos negativos</span></div>
    <div class="rl-stat sent"><b data-out="fp">0</b><span>Falsos positivos</span></div>
    <div class="rl-stat pass"><b data-out="lp">0</b><span>Legítimos permitidos</span></div>
  </div>`;

  const kit = sceneKit(root, { svg, controls, stats });
  const gateEls = kit.qa(".sc-gate"), insp = kit.q(".sc-insp-t"), truth = kit.q(".sc-truth");
  const gauge = kit.q(".sc-gauge"), scoreT = kit.q(".sc-score"), thrLine = kit.q(".sc-thr-line");
  const originN = kit.q('[data-o="n"]'), originS = kit.q('[data-o="s"]'), originBoxEl = kit.q(".sc-origin > rect");
  let S;

  const sync = () => {
    kit.segment("data-pl", cfg.pl);
    kit.segment("data-thr", cfg.thr);
    kit.qa("[data-tick]").forEach(e => e.classList.toggle("on", e.dataset.tick === cfg.thr));
    const x = gx(THR[cfg.thr]);
    thrLine.setAttribute("x1", x);
    thrLine.setAttribute("x2", x);
  };
  const draw = () => {
    if (!S.deck.length) S.deck = shuffle(REQS.slice());
    return S.deck.pop();
  };

  const reset = () => {
    S = { cur: null, packets: [], n: 0, nextAt: 0.4, disp: 0, origin: 0, ab: 0, fn: 0, fp: 0, lp: 0, deck: [] };
    ["ab", "fn", "fp", "lp"].forEach(k => kit.out(k, 0));
    originN.textContent = "0";
    originS.textContent = "";
    insp.textContent = "—";
    truth.textContent = "";
    kit.log("Escuchando evaluaciones del OWASP Core Ruleset…", "hint");
    sync();
  };

  const spawn = t => {
    const r = draw(), n = ++S.n;
    S.cur = { r, n, g: kit.pill("neutral", `#${n}`, 40), t0: t, dur: 2.7, score: 0, passed: new Set() };
    insp.textContent = r.q;
    truth.textContent = r.atk ? "REAL: ATAQUE" : "REAL: LEGÍTIMO";
    truth.setAttribute("class", `sc-truth ${r.atk ? "atk" : "ok"}`);
    gateEls.forEach(g => g.classList.remove("hit", "clean"));
    kit.caption(`s${n}`, `🔬 Petición #${n} · ${r.atk ? "ataque" : "legítima"}`,
      `<code>${esc(r.q)}</code> recorre las familias de reglas OWASP. Cada coincidencia suma puntos al anomaly score; al final se compara contra el umbral.`);
  };

  const decide = t => {
    const c = S.cur, r = c.r, thr = THR[cfg.thr], blocked = c.score >= thr;
    const kind = r.atk ? (blocked ? "ab" : "fn") : (blocked ? "fp" : "lp");
    S[kind]++;
    kit.out(kind, S[kind]);
    const CAP = {
      ab: [`✅ Ataque bloqueado · score ${c.score} ≥ ${thr}`, "La suma de coincidencias supera el umbral: Cloudflare responde 403 y el ataque no llega a tu app."],
      fn: [`⚠ Falso negativo · score ${c.score} < ${thr}`, "El ataque pasó: es evasivo y a este paranoia level casi no hace match. Sube el <b>PL</b> o usa un umbral más sensible."],
      fp: [`⚠ Falso positivo · score ${c.score} ≥ ${thr}`, "Tráfico legítimo bloqueado: un paranoia level alto marca caracteres inocentes (como O'Brien o &lt;3). Baja el PL o el umbral, o crea una excepción."],
      lp: [`✅ Legítimo permitido · score ${c.score} < ${thr}`, "No hubo suficientes coincidencias: la petición llega a tu app sin fricción."]
    }[kind];
    kit.caption(`d${c.n}`, CAP[0], CAP[1]);
    const res = { ab: "403 ✓ bloqueado", fn: "200 ⚠ falso negativo", fp: "403 ⚠ falso positivo", lp: "200 ✓ permitido" }[kind];
    kit.logReq(`PL${cfg.pl} · score ${c.score}`, r.q, res, kind === "ab" || kind === "lp" ? "ok" : "bad");
    if (blocked) {
      kit.impact([DEC, Y]);
      kit.relabel(c.g, "bad", "403", 44);
      S.packets.push({ g: c.g, leg: "back", path: BACK, t0: t, dur: 1.1 });
    } else {
      kit.relabel(c.g, r.atk ? "exploit" : "good", "200", 44);
      S.packets.push({ g: c.g, leg: "out", path: OUT, t0: t, dur: 0.7, atk: r.atk });
    }
    S.cur = null;
    S.nextAt = t + 1.5;
  };

  const tick = (t, dt) => {
    if (!S.cur && t >= S.nextAt) spawn(t);
    const c = S.cur;
    if (c) {
      const k = Math.min(1, (t - c.t0) / c.dur), pos = along(IN, k);
      kit.place(c.g, pos);
      GX.forEach((x, i) => {
        if (c.passed.has(i) || pos[0] < x) return;
        c.passed.add(i);
        const [fam, name] = FAM[i], pts = contrib(c.r, fam);
        if (pts > 0) {
          c.score += pts;
          kit.flash(gateEls[i], "hit", 700);
          kit.float(`+${pts}`, [x, 150]);
          kit.caption(`h${c.n}-${i}`, `+${pts} en ${fam} · ${name}`,
            `Coincidencias de reglas ${name} a PL${cfg.pl}. Score acumulado: <b>${c.score}</b> de un umbral de <b>${THR[cfg.thr]}</b>.`);
        } else kit.flash(gateEls[i], "clean", 400);
      });
      if (k >= 1) decide(t);
    }
    S.packets = kit.move(S.packets, t, p => {
      if (p.leg === "out") {
        S.origin++;
        originN.textContent = S.origin;
        originBoxEl.animate?.([{ fill: p.atk ? "#FECACA" : "#BFDBFE" }, { fill: "#EFF6FF" }], { duration: 400 });
        originS.textContent = p.atk ? "⚠ Llegó un ataque" : "✓ Petición legítima";
        originS.setAttribute("class", `sc-origin-s ${p.atk ? "bad" : ""}`);
      }
      kit.drop(p);
    });
    const target = S.cur ? S.cur.score : S.disp;
    S.disp += (target - S.disp) * Math.min(1, dt * 8);
    if (S.cur && S.cur.score === 0 && S.disp < 0.5) S.disp = 0;
    const thr = THR[cfg.thr];
    gauge.setAttribute("width", Math.max(0, gx(S.disp) - GX0));
    gauge.setAttribute("class", `sc-gauge ${S.disp >= thr - 0.5 ? "over" : ""}`);
    scoreT.textContent = `score ${Math.round(S.disp)} · umbral ${thr} · PL${cfg.pl}`;
  };

  root.addEventListener("click", e => {
    const p = e.target.closest("[data-pl]"), h = e.target.closest("[data-thr]");
    if (p) cfg.pl = +p.dataset.pl;
    if (h) cfg.thr = h.dataset.thr;
    if (p || h) sync();
  });

  return runScene(root, kit, { reset, tick });
}
