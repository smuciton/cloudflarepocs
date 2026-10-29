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

const NAV_EXTRA = [
  { id: "inicio", label: "Inicio" },
  { id: "portafolio", label: "Portafolio" },
  { id: "pruebas", label: "Pruebas de seguridad" }
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
