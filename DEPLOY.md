# Deploy CARD//OS (free static hosting)

CARD//OS is a static SPA. No server, no env secrets required for V1.

## Build

```bash
npm install
npm run build
```

Output: `dist/`

Preview locally:

```bash
npm run preview
```

## Cloudflare Pages

1. Connect the repo (or upload `dist/`)
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Framework preset: Vite (optional)

SPA routing: add a `_redirects` or Pages “single-page application” fallback so all paths serve `index.html`.

A `public/_redirects` file is included for Cloudflare:

```
/*    /index.html   200
```

## Vercel

1. Import project
2. Framework: Vite
3. Build: `npm run build`
4. Output: `dist`

`vercel.json` rewrites are included for client-side routes.

## Notes

- Free tier is enough
- No environment variables required for core V1
- HTTPS is provided by the host
