# Nitro starter

Create your full-stack apps and deploy it anywhere with this [Vite](https://vite.dev/) + [Nitro](https://v3.nitro.build/) starter.

## Getting started

```bash
npm install
npm run dev
```

## Deploying

```bash
npm run build
npm run preview
```

Then checkout the [Nitro documentation](https://v3.nitro.build/deploy) to learn more about the different deployment presets.

## Current Architecture (Nitro 3 + Vite)

- `index.html`: single renderer template with [rendu](https://github.com/h3js/rendu) conditionals — serves both the markdown viewer and the config page.
- `app/main.ts`: client entry for the markdown page.
- `app/config.ts`: client entry for the config page.
- `app/assets/main.css`: shared styles for both pages.
- `server/routes/api/content.ts`: server markdown rendering endpoint (replace placeholder source with WebDAV read logic).

### Why this works

Nitro's renderer catches all unmatched routes via `index.html`. The template uses rendu `<? if ?>` blocks to branch on `$URL.pathname`: `/config` serves the config UI, everything else does SSR markdown rendering. Both `<script type="module">` tags are present in the raw HTML so Vite discovers and bundles both client entries, but rendu only includes the relevant one at runtime.

### Asset placement

- Put static files that should be served directly in `public/`.
- Put page scripts and styles that should be Vite-bundled in `app/` and reference them from HTML with `<script type="module" ...>`.
