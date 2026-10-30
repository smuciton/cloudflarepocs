// ════════════════════════════════════════════════════════════════════════════
// ARCHIVO · Mapa de Application Security (vista Portafolio)
// Retirado del sitio en el commit d35d654 por ser redundante con el mapa del
// connectivity cloud. Se guarda aquí solo como referencia; NO se carga en el sitio
// (está fuera de site/, así que tampoco se publica en el Worker).
//
// Cómo restaurarlo:
//   1. Pega la sección "CÓDIGO" en site/js/app.js (antes de viewProducto).
//   2. En viewPortafolio agrega:
//        <div class="card" style="--accent:var(--orange);margin-bottom:26px">
//          <div class="card-kicker">Mapa de Application Security</div>
//          ${buildPfDiagram()}
//          <div class="step-caption" id="pf-caption"><strong>Explora el mapa</strong><p>…</p></div>
//        </div>
//   3. Pega la sección "WIRING" dentro de wire(), en el bloque if (r === "portafolio").
//   4. El CSS (.pf-tile, .d-layer, .pf-sc…) sigue en site/css/styles.css; abajo hay copia.
//
// Depende de: PRODUCTS (data.js), cfCloud(), iconBox(), spawnPackets(), go(), $ / $$ (app.js).
// También disponible en Git: git show 691d9f7:site/js/app.js
// ════════════════════════════════════════════════════════════════════════════

// ── CÓDIGO ──────────────────────────────────────────────────────────────────
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

// ── WIRING (dentro de wire(), bloque portafolio) ───────────────────────────
/*
    $$(".pf-tile").forEach(t => {
      t.addEventListener("click", () => go(`${APPSEC}/${t.dataset.pid}`));
      t.addEventListener("mouseenter", () => {
        const p = PRODUCTS.find(x => x.id === t.dataset.pid);
        const cap = $("#pf-caption");
        if (cap) cap.innerHTML = `<strong style="color:${p.accent}">${p.num} ${p.name}</strong><p>${p.pitch}</p>`;
      });
    });
    $$("#view .diagram").forEach(spawnPackets);
*/

// ── CSS (copia de site/css/styles.css) ─────────────────────────────────────
/*
  (Mapa del portafolio)
.pf-tile { cursor: pointer; transition: filter 0.2s; }
.pf-tile > rect:first-child { fill: #FFFFFF; stroke: #E2E8F0; stroke-width: 1.2; }
.pf-tile:hover { filter: drop-shadow(0 0 12px color-mix(in srgb, var(--tacc) 60%, transparent)); }
.pf-tile:hover > rect:first-child { stroke: var(--tacc); stroke-width: 2; }
.pf-ic { font-size: 18px; }
.pf-name { fill: #1F2937; font-size: 10.5px; font-weight: 700; font-family: var(--font-display); }
.pf-sub { fill: #9CA3AF; font-size: 8.5px; font-family: var(--font-body); }
.d-layer { fill: #B45309; font-size: 9px; letter-spacing: 2px; font-family: var(--font-display); font-weight: 600; }
.pf-sc rect { fill: #1F2937; stroke: #F6821F; stroke-width: 1.5; }
.pf-sc text { fill: #FDEAD7; font-size: 11px; font-weight: 600; font-family: var(--font-body); }
*/
