// ── Escenas animadas en vivo ────────────────────────────────────────────────
// Simulaciones continuas (requestAnimationFrame) para funcionalidades que se
// entienden mejor viendo el tráfico en tiempo real que en pasos fijos.

const SCENES = { ratelimit: mountRateLimitScene };

function mountScene(name, root) {
  return SCENES[name] ? SCENES[name](root) : null;
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
    while (logEl.children.length > 8) logEl.lastElementChild.remove();
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
      st.t += dt;
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

  function reset() {
    layer.innerHTML = "";
    logEl.innerHTML = "";
    st = fresh();
    buildCells();
    els.playBtn.textContent = "⏸ Pausa";
    pushLog("Escuchando eventos de seguridad en /login…", "hint");
  }

  function toggleFull(force) {
    const on = root.classList.toggle("scene-full", force);
    els.fullBtn.textContent = on ? "✕ Cerrar" : "⛶ Ampliar";
  }

  root.addEventListener("click", e => {
    const b = e.target.closest("button[data-rl]");
    if (!b) return;
    if (b.dataset.rl === "play") {
      st.running = !st.running;
      b.textContent = st.running ? "⏸ Pausa" : "▶ Reanudar";
    } else if (b.dataset.rl === "reset") reset();
    else if (b.dataset.rl === "full") toggleFull();
  });
  root.addEventListener("input", e => {
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
    destroy() {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
    }
  };
}
