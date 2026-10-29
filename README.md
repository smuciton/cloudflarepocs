# Cloudflare Portafolio Guide

Sitio estático de training del portafolio de **Application Security** de Cloudflare: mapa interactivo del portafolio, páginas de producto con diagramas animados, flashcards, quiz, hands-on labs, progreso y herramienta de pruebas de seguridad.

## Estructura

- `site/` — el sitio (HTML + CSS + JS puro, sin build)
- `wrangler.toml` — config para Workers Static Assets

## Desarrollo local

```bash
python3 -m venv .venv
.venv/bin/python -m http.server 8080 -d site
# → http://127.0.0.1:8080
```

## Deploy a Cloudflare Workers

### Opción A — desde el dashboard (Git integration)

1. Dash → **Workers & Pages** → **Create** → **Import a repository**
2. Conecta GitHub y elige `smuciton/cloudflarepocs`
3. Build settings: *no build command* (sitio estático)
4. Deploy → queda público en `*.workers.dev`

### Opción B — desde CLI

```bash
npx wrangler@4 deploy
```
