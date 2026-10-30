// ── Cloudflare PoC Hub · contenido ──────────────────────────────────────────

const PRODUCTS = [
  {
    id: "waf",
    num: "1.0",
    name: "WAF",
    weight: 25,
    accent: "#F6821F",
    tagline: "Firewall de aplicaciones web en el edge",
    desc: "Managed Rulesets, reglas personalizadas y WAF Attack Score basado en ML.",
    solves: "OWASP Top 10, inyección, XSS, zero-days y exploits conocidos antes de llegar al origen.",
    pitch: "El WAF de Cloudflare bloquea ataques en milisegundos en el edge, con reglas gestionadas que se actualizan solas ante cada zero-day.",
    objectives: [
      "Cloudflare Managed Ruleset y OWASP Core Ruleset",
      "Reglas personalizadas con expresiones (custom rules)",
      "WAF Attack Score: clasificación ML del tráfico (1–99)",
      "Exposed Credential Check y detección de fuga de datos",
      "Acciones: block, challenge, skip, log"
    ]
  },
  {
    id: "bots",
    num: "2.0",
    name: "Bot Management",
    weight: 15,
    accent: "#00C2FF",
    tagline: "Distingue humanos de automatización",
    desc: "Bot Score por ML, verified bots y detección de automatización sin fricción.",
    solves: "Credential stuffing, scraping, hoarding de inventario y fraude automatizado.",
    pitch: "Clasifica cada request con un score de 1 a 99 y detiene bots maliciosos sin captchas para los humanos.",
    objectives: [
      "Bot Score (1 = bot seguro, 99 = humano)",
      "Verified bots y lista de bots permitidos",
      "Definitely automated vs. likely automated",
      "JS Challenge y Cloudflare Turnstile",
      "Super Bot Fight Mode para planes self-serve"
    ]
  },
  {
    id: "api",
    num: "3.0",
    name: "API Shield",
    weight: 20,
    accent: "#FBAD41",
    tagline: "Seguridad positiva para tus APIs",
    desc: "Descubrimiento de endpoints, Schema Validation, rate limiting por endpoint, Sequence Analytics y mTLS.",
    solves: "APIs shadow/zombie, abuso de endpoints, exfiltración de datos y tráfico fuera de contrato.",
    pitch: "API Shield convierte tu esquema OpenAPI en un modelo de seguridad positivo: solo pasa lo que tu API declara.",
    objectives: [
      "API Discovery automático de endpoints",
      "Schema Validation con OpenAPI v3",
      "Rate limiting por endpoint y por sesión",
      "Sequence Analytics: orden esperado de llamadas",
      "mTLS para autenticación de cliente"
    ]
  },
  {
    id: "ddos",
    num: "4.0",
    name: "DDoS Protection",
    weight: 15,
    accent: "#0051C3",
    tagline: "Mitigación automática, siempre activa",
    desc: "Mitigación autónoma L3/L4/L7 en el edge, sin configuración ni ventanas de exposición.",
    solves: "Ataques volumétricos, de protocolo y de capa de aplicación, incluidos los récord mundiales.",
    pitch: "Cada datacenter de Cloudflare mitiga DDoS de forma autónoma: el ataque se absorbe en el edge, no en tu infraestructura.",
    objectives: [
      "Mitigación autónoma L3/L4 (always-on)",
      "HTTP DDoS Attack Protection (L7)",
      "Adaptive DDoS Protection con perfiles por tráfico",
      "Advanced TCP/UDP Protection (Magic Transit)",
      "Sin cobro por mitigación: ancho de banda ilimitado"
    ]
  },
  {
    id: "ratelimit",
    num: "5.0",
    name: "Rate Limiting",
    weight: 10,
    accent: "#F6821F",
    tagline: "Control de abuso por ruta, IP o sesión",
    desc: "Límites granulares por URL, IP, ASN, cookie o cabecera; acciones block, challenge o log.",
    solves: "Fuerza bruta en login, abuso de APIs, scraping agresivo y picos de tráfico malicioso.",
    pitch: "Con Rate Limiting defines exactamente cuántas peticiones aceptas por endpoint — el resto se frena en el edge.",
    objectives: [
      "Contadores por IP, sesión, ASN, JA3/JA4 o cabecera",
      "Reglas con expression y umbrales por periodo",
      "Acciones: block, challenge, managed challenge, log",
      "Complexity-based rate limiting para bots distribuidos",
      "Rate Limiting nativo dentro de API Shield"
    ]
  },
  {
    id: "pageshield",
    num: "6.0",
    name: "Page Shield",
    weight: 8,
    accent: "#00C2FF",
    tagline: "Seguridad del lado del cliente",
    desc: "Monitorea scripts de terceros y conexiones salientes del navegador para detectar Magecart.",
    solves: "Skimming de tarjetas (Magecart), scripts comprometidos de la cadena de suministro y fugas en el cliente.",
    pitch: "Page Shield vigila lo que pasa en el navegador de tu cliente — donde el WAF tradicional no puede ver.",
    objectives: [
      "Inventario y monitor de scripts de terceros",
      "Detección de scripts maliciosos (Magecart)",
      "Connection Monitor: destinos de datos del navegador",
      "Alertas por cambios de script y CSP reporting",
      "Page Shield policies para bloquear scripts"
    ]
  },
  {
    id: "ssl",
    num: "7.0",
    name: "SSL/TLS",
    weight: 7,
    accent: "#FBAD41",
    tagline: "Cifrado gestionado de extremo a extremo",
    desc: "Certificados gestionados (Universal SSL) y modos de cifrado Flexible, Full y Full (Strict).",
    solves: "Tráfico en claro, certificados caducados y configuraciones TLS débiles o incorrectas.",
    pitch: "Cloudflare emite y renueva tus certificados automáticamente — el HTTPS deja de ser una tarea operativa.",
    objectives: [
      "Universal SSL y Advanced Certificate Manager",
      "Modos: Off, Flexible, Full, Full (Strict), Strict (mTLS)",
      "Always Use HTTPS y HSTS",
      "Minimum TLS Version y TLS 1.3",
      "Origin Certificates para cifrar origen ↔ edge"
    ]
  }
];

const QUICK_LINKS = [
  { id: "flashcards", label: "Flashcards", icon: "🃏", color: "#00C2FF", desc: "Repasa conceptos de App Security tarjeta a tarjeta" },
  { id: "quiz", label: "Practice Quiz", icon: "✅", color: "#F6821F", desc: "Preguntas estilo examen con retroalimentación" },
  { id: "progreso", label: "Mi Progreso", icon: "📈", color: "#FBAD41", desc: "Racha de estudio, dominio por producto y puntajes" },
  { id: "labs", label: "Labs", icon: "🧪", color: "#0051C3", desc: "Demos prácticas y topologías paso a paso" }
];

// Portafolios y slugs para el routing (#/<portafolio>/<solucion>)
const PORTFOLIOS = {
  "application-security": { title: "Application Security", accent: "#F6821F" },
  "cloudflare-one": { title: "Cloudflare One · Zero Trust · SASE", accent: "#00C2FF" },
  "network-services": { title: "Network Services", accent: "#FBAD41" }
};
const APPSEC = "application-security";

// Portafolios futuros — placeholders "en progreso"
const SOON_PORTFOLIOS = [
  {
    id: "cfone",
    slug: "cloudflare-one",
    title: "Cloudflare One · Zero Trust · SASE",
    short: "Cloudflare One",
    accent: "#00C2FF",
    items: [
      { name: "Access / ZTNA", slug: "access-ztna", objectives: [
        "Acceso a apps internas basado en identidad",
        "Políticas por usuario, dispositivo y postura",
        "App Launcher y acceso self-service",
        "Logs de acceso por identidad"
      ]},
      { name: "Secure Web Gateway", slug: "secure-web-gateway", objectives: [
        "Inspección del tráfico saliente (egress)",
        "Filtrado DNS y HTTP por categorías",
        "Protección contra amenazas web y phishing",
        "Políticas de uso aceptable"
      ]},
      { name: "CASB", slug: "casb", objectives: [
        "Descubrimiento de shadow IT y apps SaaS",
        "Postura de seguridad de aplicaciones SaaS",
        "Detección de permisos excesivos",
        "Alertas por configuraciones riesgosas"
      ]},
      { name: "Data Loss Prevention", slug: "dlp", objectives: [
        "Detección de datos sensibles (PII, tarjetas)",
        "Políticas contra exfiltración",
        "Watermarks en descargas",
        "Integración con Gateway y CASB"
      ]},
      { name: "Browser Isolation", slug: "browser-isolation", objectives: [
        "Navegación remota aislada del endpoint",
        "Protección ante phishing y drive-by",
        "Ejecución de código web fuera del equipo",
        "Políticas por nivel de riesgo del destino"
      ]},
      { name: "Digital Experience Monitoring", slug: "dem", objectives: [
        "Monitoreo de experiencia del usuario final",
        "Salud de la ruta hacia la aplicación",
        "Pruebas sintéticas de disponibilidad",
        "Visibilidad para equipos de soporte"
      ]}
    ]
  },
  {
    id: "net",
    slug: "network-services",
    title: "Network Services",
    short: "Network Services",
    accent: "#FBAD41",
    items: [
      { name: "Magic Transit", slug: "magic-transit", objectives: [
        "Protección DDoS para tu propia red",
        "Anuncio de prefijos vía GRE/anycast",
        "Limpieza del tráfico en el edge",
        "Retorno por túneles al origen"
      ]},
      { name: "Magic WAN", slug: "magic-wan", objectives: [
        "WAN como servicio en el edge",
        "Conecta sitios y VPCs a la red global",
        "Políticas de ruteo por red",
        "Reemplaza MPLS tradicional"
      ]},
      { name: "Magic Firewall", slug: "magic-firewall", objectives: [
        "Firewall de red stateful en el edge",
        "Políticas L3/L4 por IP, puerto y geografía",
        "Detección de intrusiones (IDS)",
        "Reglas gestionadas por Cloudflare"
      ]},
      { name: "Cloudflare Tunnel", slug: "cloudflare-tunnel", objectives: [
        "Conecta orígenes sin exponer la IP",
        "Túnel saliente: cero conexiones entrantes",
        "Acceso a apps y redes privadas",
        "Integración nativa con Zero Trust"
      ]},
      { name: "Load Balancing", slug: "load-balancing", objectives: [
        "Distribución por geografía y latencia",
        "Health checks y failover automático",
        "Pools multi-origen y multi-nube",
        "Steering por sesión (sticky)"
      ]},
      { name: "Cloudflare DNS", slug: "cloudflare-dns", objectives: [
        "DNS autoritativo anycast global",
        "Respuestas en ~11 ms promedio",
        "DNSSEC incluido de fábrica",
        "Secondary DNS y transferencias de zona"
      ]}
    ]
  }
];

const NAV_TOP = [
  { id: "inicio", label: "Inicio", color: "#F6821F" },
  { id: "portafolio", label: "Portafolio", color: "#00C2FF" }
];

const NAV_EXTRA = [
  { id: "pruebas", label: "Pruebas de seguridad", color: "#35D07F" }
];

const FLASHCARDS = [
  { product: "waf", q: "¿Qué significa un WAF Attack Score de 2?", a: "Tráfico casi seguramente malicioso. El score va de 1 a 99: 1–20 ataque, 21–50 probable ataque, 51–80 probable limpio, 81–99 limpio." },
  { product: "waf", q: "¿Qué es un Managed Ruleset?", a: "Un conjunto de reglas mantenido por Cloudflare (ej. Cloudflare Managed y OWASP Core) que se actualiza automáticamente ante nuevas amenazas." },
  { product: "waf", q: "¿Qué hace la acción 'skip' en una regla del WAF?", a: "Omite fases o reglas específicas para el tráfico que coincide — útil para excluir falsos positivos sin desactivar la regla global." },
  { product: "waf", q: "¿Qué es Exposed Credential Check?", a: "Detección de login con credenciales filtradas en brechas conocidas; permite alertar o forzar verificación adicional." },
  { product: "bots", q: "¿Qué es el Bot Score?", a: "Un puntaje ML de 1 a 99 por request: 1 = casi seguro bot, 99 = casi seguro humano. Disponible como cf.bot_management.score." },
  { product: "bots", q: "¿Qué son los verified bots?", a: "Bots legítimos verificados por Cloudflare (Googlebot, Bingbot, Stripe…) que puedes permitir explícitamente con cf.verified_bot_category." },
  { product: "bots", q: "¿Qué es Cloudflare Turnstile?", a: "Alternativa al CAPTCHA sin fricción: valida humanos sin rompecabezas, con señales del navegador y ML." },
  { product: "api", q: "¿Qué hace Schema Validation en API Shield?", a: "Bloquea requests que no cumplen el esquema OpenAPI v3 del endpoint: método, ruta, parámetros y tipos. Es un modelo de seguridad positiva." },
  { product: "api", q: "¿Qué es Sequence Analytics?", a: "Aprende el orden esperado de llamadas a la API (ej. login → carrito → pago) y detecta desviaciones indicativas de abuso." },
  { product: "api", q: "¿Para qué sirve mTLS en API Shield?", a: "Autenticar al cliente por certificado: solo clientes con cert válido pueden llamar endpoints sensibles (B2B, partners)." },
  { product: "ddos", q: "¿La mitigación DDoS de Cloudflare requiere configuración?", a: "No para L3/L4/L7 base: es autónoma y always-on en el edge. Las reglas adaptativas ajustan sensibilidad según tu tráfico normal." },
  { product: "ratelimit", q: "¿Qué es complexity-based rate limiting?", a: "Cuenta requests por características del tráfico (no solo IP) para frenar bots distribuidos que rotan direcciones." },
  { product: "pageshield", q: "¿Qué detecta Page Shield?", a: "Scripts de terceros maliciosos o comprometidos en el navegador del usuario — ataques tipo Magecart que el WAF no ve." },
  { product: "ssl", q: "Diferencia entre Full y Full (Strict):", a: "Full cifra origen↔edge pero acepta cert autofirmado; Full (Strict) exige cert válido de CA confiable en el origen. Strict es lo recomendado." },
  { product: "waf", q: "¿Qué es el cf-ray?", a: "Identificador único de cada request (ej. 9abc…-MEX). Sirve para encontrar el evento exacto en Security Events." }
];

const QUIZ = [
  {
    product: "waf",
    q: "Un cliente recibe un WAF Attack Score de 15 en un request. ¿Qué indica?",
    opts: [
      "Tráfico limpio con alta confianza",
      "Tráfico probablemente automatizado",
      "Tráfico clasificado como ataque por el modelo ML",
      "Un score de bot, no del WAF"
    ],
    answer: 2,
    why: "El WAF Attack Score mide malicia del contenido: 1–20 = ataque. El Bot Score es otra señal."
  },
  {
    product: "api",
    q: "¿Qué capacidad de API Shield bloquea requests que no cumplen el contrato OpenAPI?",
    opts: ["Sequence Analytics", "Schema Validation", "Endpoint Discovery", "mTLS"],
    answer: 1,
    why: "Schema Validation aplica un modelo positivo: solo pasa lo que el esquema OpenAPI declara."
  },
  {
    product: "bots",
    q: "Tu cliente quiere permitir Googlebot pero bloquear scrapers. ¿Qué combinación usarías?",
    opts: [
      "Bloquear todo tráfico con Bot Score < 99",
      "Permitir cf.verified_bot_category y desafiar scores bajos",
      "Desactivar Bot Management y usar solo el WAF",
      "Rate limiting a 1 req/min para todos"
    ],
    answer: 1,
    why: "Verified bots identifica bots buenos; el Bot Score bajo marca la automatización maliciosa."
  },
  {
    product: "ddos",
    q: "¿Qué afirmación sobre DDoS Protection es correcta?",
    opts: [
      "Requiere activar reglas manualmente durante un ataque",
      "Solo protege capa 7 con planes Enterprise",
      "La mitigación L3/L4/L7 es autónoma y always-on en el edge",
      "Cobra por GB de tráfico mitigado"
    ],
    answer: 2,
    why: "La mitigación es autónoma en cada datacenter, sin config inicial ni cobro por mitigación."
  },
  {
    product: "ratelimit",
    q: "Un ataque de fuerza bruta al login usa 50,000 IPs distintas. ¿Qué técnica lo frena mejor?",
    opts: [
      "Rate limiting por IP con umbral bajo",
      "Complexity-based rate limiting por características de sesión",
      "Bloqueo geográfico",
      "Aumentar el umbral del WAF"
    ],
    answer: 1,
    why: "Con IPs rotativas, contar por IP no sirve: hay que contar por huella/características de sesión."
  },
  {
    product: "pageshield",
    q: "¿Qué tipo de ataque detecta principalmente Page Shield?",
    opts: [
      "Inyección SQL en el backend",
      "DDoS volumétrico",
      "Scripts maliciosos de terceros tipo Magecart en el navegador",
      "Credential stuffing"
    ],
    answer: 2,
    why: "Page Shield opera del lado del cliente: monitorea scripts y conexiones del navegador."
  },
  {
    product: "ssl",
    q: "¿Qué modo SSL/TLS exige un certificado válido de CA en el origen?",
    opts: ["Flexible", "Full", "Full (Strict)", "Off"],
    answer: 2,
    why: "Full (Strict) valida la cadena de confianza del cert del origen. Full acepta autofirmados."
  },
  {
    product: "waf",
    q: "Ejecutaste una prueba XSS y quieres mostrar el bloqueo en el dashboard. ¿Qué usas para encontrarlo?",
    opts: [
      "El ID de la regla solamente",
      "El cf-ray de la respuesta, en Security Events",
      "Los logs del servidor de origen",
      "El HTML de la página de bloqueo"
    ],
    answer: 1,
    why: "cf-ray identifica el request de forma única: lo buscas en Security Events y ves regla, score y acción."
  }
];

const LABS = [
  {
    id: "lab-waf",
    title: "WAF: del ataque al bloqueo",
    product: "waf",
    accent: "#F6821F",
    goal: "Mostrar en vivo cómo el WAF detecta y bloquea un ataque, y encontrar el evento por su Ray ID.",
    reqs: "Un hostname propio detrás de Cloudflare con el Managed Ruleset desplegado.",
    steps: [
      { title: "Ver el sitio de demo normal", desc: "Abre el hostname protegido en el navegador y confirma que responde 200.", note: "Presentador: explica que el tráfico ya pasa por el edge de Cloudflare." },
      { title: "Revisar la regla del Managed Ruleset", desc: "En Security → WAF, muestra el Cloudflare Managed Ruleset activo.", note: "Menciona que se actualiza solo ante zero-days." },
      { title: "Ejecutar una prueba desde Pruebas de seguridad", desc: "Lanza la prueba de XSS reflejado contra el destino de demo y captura el Ray ID.", note: "La cadena de prueba es la estándar de la documentación de Cloudflare." },
      { title: "Encontrar el evento en Security Events", desc: "Filtra por Ray ID y muestra regla, acción y score.", note: "Este es el momento 'wow': el evento aparece en segundos." },
      { title: "Explicar el WAF Attack Score", desc: "Muestra el score del request y explica la escala 1–99.", note: "Conecta con cómo se construye una regla de bloqueo por score." }
    ]
  },
  {
    id: "lab-bots",
    title: "Bot Management: bot bueno vs. bot malo",
    product: "bots",
    accent: "#00C2FF",
    goal: "Diferenciar verified bots de automatización maliciosa usando Bot Score.",
    reqs: "Bot Management habilitado en el hostname de demo.",
    steps: [
      { title: "Generar request con user-agent de bot", desc: "Desde Pruebas de seguridad, ejecuta la prueba 'User-agent de bot'.", note: "Observa el cf.bot_management.score en Security Events." },
      { title: "Comparar con un verified bot", desc: "Revisa en el dashboard un request de un verified bot (ej. Googlebot).", note: "verified_bot_category es la forma correcta de permitirlos." },
      { title: "Crear una regla de desafío", desc: "Regla: score < 30 y no verified → managed challenge.", note: "Explica por qué challenge y no block directo (falsos positivos)." }
    ]
  },
  {
    id: "lab-api",
    title: "API Shield: Schema Validation en acción",
    product: "api",
    accent: "#FBAD41",
    goal: "Bloquear una llamada que viola el esquema OpenAPI de un endpoint.",
    reqs: "Un endpoint de demo registrado en API Shield con esquema OpenAPI v3.",
    steps: [
      { title: "Mostrar el endpoint descubierto", desc: "En API Shield, enseña el Endpoint Discovery.", note: "Shadow APIs aparecen aquí sin configuración." },
      { title: "Subir el esquema OpenAPI", desc: "Carga el schema y activa Schema Validation en modo block.", note: "Modelo de seguridad positiva: lo no declarado no pasa." },
      { title: "Enviar una llamada inválida", desc: "Request con parámetro fuera de contrato y muestra el bloqueo.", note: "El evento queda en Security Events con el endpoint asociado." }
    ]
  }
];

const ALLOWLIST = [
  "juiceshop.cloudflarepocs.com",
  "acmecorp.cloudflarepocs.com"
];

// Endpoint de la Supabase Edge Function. Déjalo vacío hasta conectar Supabase;
// mientras tanto la herramienta corre en modo simulación.
const EDGE_FUNCTION_URL = "";

const SECURITY_TESTS = [
  {
    id: "benign",
    name: "Petición benigna",
    desc: "GET normal al inicio. Debe pasar: valida que el sitio responde antes de lanzar pruebas.",
    path: "/",
    expected: "200 OK",
    curl: (h) => `curl -i https://${h}/`
  },
  {
    id: "xss",
    name: "XSS reflejado",
    desc: "Parámetro con la cadena de prueba estándar de Cloudflare para disparar el Managed Ruleset.",
    path: "/?q=<script>alert(1)</script>",
    expected: "403 · Cloudflare",
    curl: (h) => `curl -i "https://${h}/?q=%3Cscript%3Ealert(1)%3C/script%3E"`
  },
  {
    id: "envfile",
    name: "Ruta sensible /.env",
    desc: "Solicita un archivo de entorno expuesto. El WAF debería bloquearlo como ruta sensible.",
    path: "/.env",
    expected: "403 · Cloudflare",
    curl: (h) => `curl -i https://${h}/.env`
  },
  {
    id: "botua",
    name: "User-agent de bot",
    desc: "User-Agent típico de escáner/automatización. Útil para mostrar Bot Score y reglas de desafío.",
    path: "/",
    expected: "403 / challenge",
    curl: (h) => `curl -i -A "sqlmap/1.7" https://${h}/`
  },
  {
    id: "burst",
    name: "Ráfaga (rate limiting)",
    desc: "Varias peticiones rápidas para activar una regla de rate limiting en el destino.",
    path: "/",
    expected: "429 / 403",
    curl: (h) => `for i in {1..30}; do curl -s -o /dev/null -w "%{http_code}\\n" https://${h}/; done`
  }
];

const BLOG = [
  {
    tag: "Bot Management",
    accent: "#00C2FF",
    title: "Bloquea bots sin fricción",
    desc: "Cómo usar Bot Score + Turnstile para frenar credential stuffing sin captchas para usuarios reales.",
    date: "Caso de uso · 6 min"
  },
  {
    tag: "API Shield",
    accent: "#FBAD41",
    title: "Valida tu API con Schema Validation",
    desc: "Del esquema OpenAPI al bloqueo: modelo de seguridad positiva para endpoints en producción.",
    date: "Caso de uso · 8 min"
  },
  {
    tag: "WAF",
    accent: "#F6821F",
    title: "Del ataque al bloqueo en 5 minutos",
    desc: "Cómo demostrar el Managed Ruleset en vivo frente a un cliente usando una cadena de prueba y el Ray ID.",
    date: "Caso de uso · 5 min"
  }
];

// ── Contenido didáctico por producto (páginas de detalle) ─────────────────────
// diagram.type "flow": fuentes → edge (módulo) → destinos
// diagram.type "client": navegador → tu sitio → terceros (Page Shield)
const LEARN = {
  waf: {
    features: [
      { icon: "🎯", name: "WAF Custom Rules", blurb: "Reglas a tu medida con expresiones sobre cualquier campo del request.",
        detail: "Escribes condiciones sobre IP, URI, método, headers, cookies, ASN, geografía, JA3/JA4, Bot Score o Attack Score — y aplicas acción: block, challenge (Turnstile/JS), skip o log. Ideal para cerrar endpoints por país, frenar scrapers por fingerprint o excluir tráfico interno.",
        d: { type: "flow",
          sources: [
            { icon: "🧑", label: "Tráfico permitido", cls: "good", packet: "GET /" },
            { icon: "🎭", label: "Fingerprint malo", cls: "bad", packet: "JA3 · país X" }
          ],
          module: "Custom Rules", moduleSub: "expression → acción",
          targets: [
            { icon: "🖥️", label: "Servidor de Origen", cls: "good" },
            { icon: "⚙️", label: "Tu acción · block/skip", cls: "bad" }
          ],
          steps: [
            { t: "Llegan las peticiones", d: "Tráfico normal y requests con características específicas (JA3, ASN, geografía, headers).", on: ["s0", "s1", "e-in0", "e-in1"] },
            { t: "El edge evalúa tu expression", d: "Cada campo del request se compara contra las condiciones que escribiste.", on: ["edge", "dc", "e-dc"] },
            { t: "Match → tu acción", d: "Si la expression coincide, se ejecuta lo que elegiste: block, challenge, skip o log.", on: ["e-dc", "mod"] },
            { t: "Resultado por tu regla", d: "El tráfico permitido pasa; el que coincide recibe tu acción configurada — sin tocar el origen.", on: ["e-out0", "chk", "t0", "e-out1", "t1"] }
          ] } },
      { icon: "⏱️", name: "Rate Limiting Rules", blurb: "Cuenta peticiones por característica y actúa al superar el umbral.",
        detail: "Contadores por IP, sesión, ASN, header o fingerprint en ventanas configurables. Contra fuerza bruta en login, abuso de API y scraping: acciones block, managed challenge o log. Complexity-based counting frena bots que rotan IPs.",
        d: { type: "flow",
          sources: [
            { icon: "🧑", label: "Usuario normal", cls: "good", packet: "2 req/s" },
            { icon: "🔁", label: "Script abusivo", cls: "bad", packet: "500 req/s" }
          ],
          module: "Rate Limit", moduleSub: "umbral: 100 req/min",
          targets: [
            { icon: "🖥️", label: "Servidor de Origen", cls: "good" },
            { icon: "⏱️", label: "429 · Límite alcanzado", cls: "bad" }
          ],
          steps: [
            { t: "Peticiones a distinto ritmo", d: "Un usuario normal hace 2 req/s; un script abusivo dispara 500 req/s contra el login.", on: ["s0", "s1", "e-in0", "e-in1"], m: { label: "Requests contados", value: 25, max: 100 } },
            { t: "El edge cuenta por característica", d: "Contadores por IP, sesión, ASN, header o fingerprint — no solo IP.", on: ["edge", "dc", "e-dc"], m: { label: "Requests contados", value: 65, max: 100 } },
            { t: "Umbral excedido → acción", d: "Al pasar el límite en el periodo, se aplica la acción: block, challenge o log.", on: ["e-dc", "mod"], m: { label: "¡Umbral alcanzado!", value: 100, max: 100 } },
            { t: "El servicio se protege", d: "El usuario normal sigue igual; el abusivo recibe 429 hasta que baja el ritmo.", on: ["e-out0", "chk", "t0", "e-out1", "t1"], m: { label: "Bloqueado · 429", value: 100, max: 100 } }
          ] } },
      { icon: "📤", name: "Response Rules", blurb: "Personaliza la respuesta de bloqueo que ve el usuario.",
        detail: "Define código de estado, content-type y cuerpo de la respuesta de bloqueo — HTML con tu marca o JSON consistente para clientes de API, en vez de la página genérica. Útil para que el bloqueo 'hable el idioma' de tu app.",
        d: { type: "flow",
          sources: [
            { icon: "🧑", label: "Usuario legítimo", cls: "good", packet: "GET /" },
            { icon: "💀", label: "Request bloqueado", cls: "bad", packet: "match de regla" }
          ],
          module: "Response Rule", moduleSub: "código + cuerpo custom",
          targets: [
            { icon: "🖥️", label: "Servidor de Origen", cls: "good" },
            { icon: "📄", label: "Tu respuesta · JSON/HTML", cls: "bad" }
          ],
          steps: [
            { t: "Llegan las peticiones", d: "Tráfico limpio y requests que disparan una regla del WAF.", on: ["s0", "s1", "e-in0", "e-in1"] },
            { t: "La regla bloquea", d: "El request coincide con una regla — hasta aquí es un bloqueo normal.", on: ["edge", "dc", "e-dc", "mod"] },
            { t: "Tu respuesta personalizada", d: "En vez de la página genérica, el cliente recibe TU código y cuerpo: HTML con tu marca o JSON para APIs.", on: ["e-dc", "mod"] },
            { t: "Bloqueo con tu idioma", d: "El usuario ve una respuesta consistente con tu producto — mejor UX incluso al bloquear.", on: ["e-out0", "chk", "t0", "e-out1", "t1"] }
          ] } },
      { icon: "🛡️", name: "WAF Managed Ruleset", blurb: "Reglas escritas y mantenidas por Cloudflare contra exploits conocidos.",
        detail: "Cubierto por el equipo de seguridad de Cloudflare: se actualiza ante cada nuevo exploit (zero-days incluidos, a veces en horas). Cubre ataques genéricos, inyección, anomalías HTTP y rutas sensibles como /.env o wp-admin.",
        d: { type: "flow",
          sources: [
            { icon: "🧑", label: "Usuario legítimo", cls: "good", packet: "GET /" },
            { icon: "☠️", label: "Exploit conocido", cls: "bad", packet: "CVE · zero-day" }
          ],
          module: "Managed Rules", moduleSub: "actualizado por CF",
          targets: [
            { icon: "🖥️", label: "Servidor de Origen", cls: "good" },
            { icon: "⛔", label: "Bloqueado · 403", cls: "bad" }
          ],
          steps: [
            { t: "Llegan las peticiones", d: "Tráfico normal y exploits conocidos buscando endpoints vulnerables.", on: ["s0", "s1", "e-in0", "e-in1"] },
            { t: "Firmas en el edge", d: "Las reglas escritas por Cloudflare comparan cada request contra ataques conocidos.", on: ["edge", "dc", "e-dc"] },
            { t: "Se actualiza solo", d: "Cuando sale un CVE nuevo, el equipo de CF agrega la regla — tú no haces nada.", on: ["e-dc", "mod"] },
            { t: "Zero-day bloqueado", d: "El exploit recibe 403 en el edge; tu origen sigue sin saber que existía.", on: ["e-out0", "chk", "t0", "e-out1", "t1"] }
          ] } },
      { icon: "📚", name: "WAF Core (OWASP) Ruleset", blurb: "La implementación Cloudflare del OWASP ModSecurity Core Rule Set.",
        detail: "El estándar de la industria contra el OWASP Top 10: cada regla aporta a un score de anomalía (paranoia levels) que tú calibras para balancear protección vs. falsos positivos. Excelente base antes de tus custom rules.",
        d: { type: "flow",
          sources: [
            { icon: "🧑", label: "Usuario legítimo", cls: "good", packet: "GET /" },
            { icon: "💣", label: "Payload OWASP", cls: "bad", packet: "Top 10 · SQLi/XSS" }
          ],
          module: "OWASP Core", moduleSub: "anomaly score → umbral",
          targets: [
            { icon: "🖥️", label: "Servidor de Origen", cls: "good" },
            { icon: "⛔", label: "Score superado · 403", cls: "bad" }
          ],
          steps: [
            { t: "Llegan las peticiones", d: "Tráfico limpio y payloads del OWASP Top 10 (inyección, XSS, LFI).", on: ["s0", "s1", "e-in0", "e-in1"] },
            { t: "Cada regla suma puntos", d: "Las reglas OWASP no bloquean de una: cada match suma a un anomaly score.", on: ["edge", "dc", "e-dc"] },
            { t: "Score vs. umbral", d: "Tú calibras el nivel de paranoia: más alto = más protección, más falsos positivos.", on: ["e-dc", "mod"] },
            { t: "Bloqueo por anomalía", d: "Si el score supera el umbral → 403. Así se balancean ataques ambiguos.", on: ["e-out0", "chk", "t0", "e-out1", "t1"] }
          ] } }
    ],
    analogy: "Es como un guardia en la puerta del club que conoce todas las tácticas de los intrusos: revisa a cada persona que intenta entrar y no deja pasar a nadie sospechoso — y lo hace en milisegundos, sin hacer fila.",
    how: "Cada petición HTTP/HTTPS pasa por el punto de presencia (PoP) de Cloudflare más cercano antes de tocar tu origen. Ahí el WAF la compara contra los Managed Rulesets (Cloudflare Managed + OWASP Core) y la puntúa con ML mediante el WAF Attack Score. Si coincide con un ataque, se bloquea en el edge: el origen ni se entera.",
    diagram: {
      type: "flow",
      sources: [
        { icon: "🧑", label: "Usuario legítimo", cls: "good", packet: "GET /" },
        { icon: "💀", label: "Atacante", cls: "bad", packet: "SQLi · XSS · LFI" }
      ],
      module: "WAF",
      moduleSub: "Attack Score > Threshold",
      targets: [
        { icon: "🖥️", label: "Servidor de Origen", cls: "good" },
        { icon: "⛔", label: "Bloqueado · 403", cls: "bad" }
      ],
      steps: [
        { t: "Llegan las peticiones", d: "Usuarios reales y atacantes envían requests al mismo hostname. Desde fuera se ven igual — ambos son solo tráfico HTTP.", on: ["s0", "s1", "e-in0", "e-in1"] },
        { t: "Todo pasa por el edge", d: "Las peticiones entran al PoP de Cloudflare más cercano al visitante. El tráfico nunca va directo al origen.", on: ["edge", "dc", "e-dc"] },
        { t: "El WAF inspecciona cada petición", d: "Los Managed Rulesets buscan firmas de ataque (SQLi, XSS, rutas sensibles) y el Attack Score puntúa la malicia con ML: 1–20 = ataque.", on: ["e-dc", "mod"] },
        { t: "Dos destinos posibles", d: "El tráfico limpio continúa al origen sin latencia perceptible. El ataque recibe un 403 con un Ray ID — así lo rastreas en Security Events.", on: ["e-out0", "chk", "t0", "e-out1", "t1"] }
      ]
    }
  },
  bots: {
    analogy: "Es como el detector de metales del aeropuerto: no detiene a todas las personas — solo a las que traen algo que no deberían. Y a los bots 'buenos' (Googlebot) les da un pase VIP verificado.",
    how: "Bot Management puntúa cada request de 1 a 99 con machine learning entrenado en toda la red de Cloudflare. Combina esa señal con verified bots (automatización legítima identificada) para que permitas lo bueno y desafíes lo malo — sin captchas para los humanos.",
    diagram: {
      type: "flow",
      sources: [
        { icon: "🧑", label: "Usuario humano", cls: "good", packet: "score ~90" },
        { icon: "🤖", label: "Bot malicioso", cls: "bad", packet: "score ~5" }
      ],
      premod: { label: "Score Engine", sub: "ML · Bot Score 1–99" },
      module: "Bot Mgmt",
      moduleSub: "Score + Verified Bots",
      targets: [
        { icon: "🖥️", label: "Servidor de Origen", cls: "good" },
        { icon: "🧩", label: "Challenge / Block", cls: "bad" }
      ],
      steps: [
        { t: "Llegan humanos y bots", d: "Humanos navegando y bots automatizados (scrapers, credential stuffing) golpean el mismo endpoint.", on: ["s0", "s1", "e-in0", "e-in1"] },
        { t: "El edge puntúa cada request", d: "Bot Score de 1 a 99 por request, calculado con ML sobre comportamiento, fingerprints (JA3/JA4) y señales del navegador.", on: ["edge", "dc", "e-dc"] },
        { t: "Se decide la acción", d: "Regla típica: score < 30 y no es verified bot → managed challenge o block. Los verified bots pasan siempre.", on: ["e-dc", "premod", "e-mm", "mod"] },
        { t: "Humanos pasan, bots se frenan", d: "El humano ni se entera. El bot recibe un Turnstile/challenge que casi ninguna automatización resuelve.", on: ["e-out0", "chk", "t0", "e-out1", "t1"] }
      ]
    }
  },
  api: {
    analogy: "Es como un contrato notariado: si la petición no está literalmente escrita en el acuerdo (tu esquema OpenAPI), ni siquiera se considera — se rechaza en la puerta.",
    how: "API Shield descubre tus endpoints reales observando el tráfico, subes tu esquema OpenAPI v3 y a partir de ahí opera un modelo de seguridad positiva: solo pasa lo que la API declara. Sequence Analytics aprende el orden esperado de llamadas y mTLS autentica clientes por certificado.",
    diagram: {
      type: "flow",
      sources: [
        { icon: "📱", label: "Cliente API válido", cls: "good", packet: "POST /v1/pay" },
        { icon: "🕳️", label: "Request inválido", cls: "bad", packet: "GET /v1/../../" }
      ],
      module: "API Shield",
      moduleSub: "Schema Validation + mTLS",
      targets: [
        { icon: "🖥️", label: "API de Origen", cls: "good" },
        { icon: "⛔", label: "Rechazado · 400/403", cls: "bad" }
      ],
      steps: [
        { t: "Llegan llamadas a la API", d: "Clientes válidos y tráfico anómalo (fuera de contrato, shadow endpoints, fuzzing) llegan al mismo hostname.", on: ["s0", "s1", "e-in0", "e-in1"] },
        { t: "El edge conoce tu esquema", d: "Endpoint Discovery ya mapeó tus rutas reales; el esquema OpenAPI define método, parámetros y tipos permitidos.", on: ["edge", "dc", "e-dc"] },
        { t: "Validación positiva", d: "Schema Validation rechaza lo no declarado; Sequence Analytics detecta orden anómalo de llamadas; mTLS exige certificado de cliente.", on: ["e-dc", "mod"] },
        { t: "Solo contratos válidos pasan", d: "La llamada que cumple el esquema llega al origen. La inválida se rechaza con 400/403 antes de tocar tu código.", on: ["e-out0", "chk", "t0", "e-out1", "t1"] }
      ]
    }
  },
  ddos: {
    analogy: "Es como un muro de contención infinito: el tsunami no golpea una sola muralla — golpea cientos a la vez, en el borde de la red, y ninguna se desborda.",
    how: "La mitigación DDoS es autónoma y always-on: cada PoP de Cloudflare detecta y absorbe ataques L3/L4/L7 sin configuración ni ventanas de exposición. La capacidad agregada de la red supera los mayores ataques registrados, y no hay cobro por tráfico mitigado.",
    diagram: {
      type: "flow",
      sources: [
        { icon: "👥", label: "Usuarios reales", cls: "good", packet: "tráfico normal" },
        { icon: "🌊", label: "Botnet DDoS", cls: "bad", packet: "millones de req/s" }
      ],
      announce: true,
      module: "DDoS",
      moduleSub: "Mitigación autónoma L3/L4/L7",
      targets: [
        { icon: "🖥️", label: "Servidor de Origen", cls: "good" },
        { icon: "🕳️", label: "Absorbido en el edge", cls: "bad" }
      ],
      steps: [
        { t: "Estalla el ataque", d: "Una botnet lanza un volumen masivo de peticiones mientras usuarios legítimos intentan usar el servicio.", on: ["s0", "s1", "e-in0", "e-in1"] },
        { t: "Anycast distribuye el golpe", d: "El ataque se reparte entre todos los PoPs de la red — ningún punto concentra el volumen completo.", on: ["edge", "dc", "e-dc"] },
        { t: "Mitigación autónoma", d: "El edge clasifica el tráfico en tiempo real y descarta el ataque sin intervención humana ni reglas manuales.", on: ["e-dc", "mod"] },
        { t: "El origen ni se entera", d: "Solo el tráfico legítimo llega al servidor. El ataque quedó absorbido en el edge — el servicio sigue en línea.", on: ["e-out0", "chk", "t0", "e-out1", "t1"] }
      ]
    }
  },
  ratelimit: {
    analogy: "Es como la fila de una taquilla: cada persona puede comprar un número limitado de boletos por minuto. Quien intenta comprar de más, simplemente espera fuera.",
    how: "Rate Limiting cuenta peticiones por las características que definas — IP, sesión, ASN, JA3/JA4, header — y aplica la acción configurada (block, challenge, log) cuando se supera el umbral. Es la herramienta contra fuerza bruta, abuso de API y scraping agresivo.",
    diagram: {
      type: "flow",
      sources: [
        { icon: "🧑", label: "Usuario normal", cls: "good", packet: "2 req/s" },
        { icon: "🔁", label: "Script abusivo", cls: "bad", packet: "500 req/s" }
      ],
      module: "Rate Limit",
      moduleSub: "Contadores por IP/sesión/JA4",
      targets: [
        { icon: "🖥️", label: "Servidor de Origen", cls: "good" },
        { icon: "⏱️", label: "429 · Límite", cls: "bad" }
      ],
      steps: [
        { t: "Llegan peticiones a distinto ritmo", d: "Un usuario normal hace 2 req/s; un script abusivo dispara 500 req/s contra el login.", on: ["s0", "s1", "e-in0", "e-in1"] },
        { t: "El edge cuenta", d: "Cada regla mantiene contadores por la característica elegida — no solo IP: también sesión, fingerprint o header.", on: ["edge", "dc", "e-dc"] },
        { t: "Umbral excedido → acción", d: "Al pasar el límite en el periodo, se aplica la acción: block, managed challenge o solo log.", on: ["e-dc", "mod"] },
        { t: "El servicio se protege", d: "El usuario normal sigue sin notar nada; el abusivo recibe 429. Contra bots que rotan IPs existe complexity-based counting.", on: ["e-out0", "chk", "t0", "e-out1", "t1"] }
      ]
    }
  },
  pageshield: {
    analogy: "Es como el circuito de cámaras dentro de tu tienda: el WAF vigila la puerta, pero Page Shield vigila lo que pasa adentro — lo que hacen los 'empleados' (scripts de terceros) una vez que ya entraron.",
    how: "Tu página carga scripts de terceros (analytics, chat, ads) directo en el navegador del cliente — donde el WAF no puede ver. Page Shield inventaría cada script y conexión saliente, detecta comportamiento tipo Magecart (skimming de datos) y te permite bloquear scripts comprometidos.",
    diagram: {
      type: "client",
      nodes: [
        { id: "browser", x: 95, y: 150, icon: "🧑‍💻", label: "Navegador del visitante", cls: "good" },
        { id: "site", kind: "edge", x: 275, y: 55, w: 190, h: 190, label: "TU SITIO (CHECKOUT)" },
        { id: "mod", kind: "mod", x: 290, y: 90, w: 160, h: 58, label: "Page Shield", cls: "mod" },
        { id: "scripts", kind: "mod", x: 290, y: 158, w: 160, h: 58, label: "Scripts 3ros", sub: "analytics · chat · ads", cls: "warn" },
        { id: "cdn", x: 595, y: 85, icon: "✅", label: "CDN / terceros OK", cls: "good" },
        { id: "evil", x: 595, y: 215, icon: "🕳️", label: "Servidor atacante", cls: "bad" }
      ],
      edges: [
        { id: "e-load", from: "browser", to: "site", cls: "good", label: "carga página" },
        { id: "e-cdn", from: "site", to: "cdn", cls: "good", label: "scripts válidos" },
        { id: "e-exfil", from: "site", to: "evil", cls: "bad", label: "exfil de datos" }
      ],
      steps: [
        { t: "El visitante carga tu checkout", d: "El navegador descarga la página y todo lo que la página le dice que cargue — incluidos scripts de terceros.", on: ["browser", "e-load", "site"] },
        { t: "Entran scripts que no son tuyos", d: "Analytics, chat, ads… cada uno se ejecuta con acceso total a lo que el usuario teclea — incluida la tarjeta.", on: ["scripts"] },
        { t: "Page Shield inventaría y vigila", d: "Registra cada script activo, de dónde vino y a qué destinos envía datos. Alerta ante cambios o comportamiento de skimming.", on: ["mod"] },
        { t: "La exfiltración se detecta", d: "Si un script comprometido intenta mandar datos a un servidor extraño, Page Shield lo marca — con policies puedes bloquearlo.", on: ["e-exfil", "evil", "e-cdn", "cdn"] }
      ]
    }
  },
  ssl: {
    analogy: "Es como mandar una carta dentro de una caja fuerte en vez de una postal: cualquiera que la intercepte en el camino solo ve metal — el contenido solo lo abre quien tiene la llave.",
    how: "Cloudflare emite y renueva certificados automáticamente (Universal SSL), así que el HTTPS deja de ser una tarea operativa. El modo de cifrado define cuánto del camino va protegido: con Full (Strict) el canal queda cifrado de extremo a extremo, validando también el certificado del origen.",
    diagram: {
      type: "flow",
      sources: [
        { icon: "🌐", label: "Navegador", cls: "good", packet: "HTTPS request" },
        { icon: "🕵️", label: "Espía (MITM)", cls: "bad", packet: "intercepta" }
      ],
      module: "SSL/TLS",
      moduleSub: "Universal SSL · Full (Strict)",
      targets: [
        { icon: "🖥️", label: "Origen cifrado", cls: "good" },
        { icon: "🔒", label: "Solo ve ruido", cls: "bad" }
      ],
      steps: [
        { t: "El cliente inicia la conexión", d: "El navegador pide HTTPS. En el camino puede haber alguien intentando interceptar (MITM).", on: ["s0", "s1", "e-in0", "e-in1"] },
        { t: "El edge presenta el certificado", d: "Universal SSL emite y renueva el cert automáticamente — cero operación manual, cero caducados olvidados.", on: ["edge", "dc", "e-dc"] },
        { t: "Full (Strict) valida ambos extremos", d: "El modo Strict exige cert válido de CA también en el origen. Flexible deja un tramo en claro: nunca lo uses en producción.", on: ["e-dc", "mod"] },
        { t: "Cifrado extremo a extremo", d: "El navegador y el origen hablan en claro solo entre ellos; el espía en medio solo ve texto cifrado ilegible.", on: ["e-out0", "chk", "t0", "e-out1", "t1"] }
      ]
    }
  }
};
