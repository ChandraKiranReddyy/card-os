# Deploy CARD//OS (free static hosting)

CARD//OS is a static SPA. No server, no env secrets required for V1.

## Live (GitHub Pages)

After the Actions workflow on `main` succeeds:

**https://chandrakiranreddyy.github.io/card-os/**

Deploy is automatic on every push to `main` (see `.github/workflows/deploy-pages.yml`).

Local / root hosts (Vercel, Cloudflare) use `base: '/'`.  
GitHub Pages builds set `GITHUB_PAGES=true` so assets load under `/card-os/`.

## Build

```bash
npm install
npm run build                 # root base (Vercel / Cloudflare / preview)
GITHUB_PAGES=true npm run build   # GitHub Pages base /card-os/
```

Output: `dist/`

```bash
npm run preview
```

## GitHub Pages (this repo)

1. Repo **Settings → Pages → Build and deployment → GitHub Actions**
2. Push to `main` (or re-run the **Deploy GitHub Pages** workflow)
3. Site URL: `https://<user>.github.io/card-os/`

SPA routes: `dist/404.html` is a copy of `index.html` so deep links work.

## Cloudflare Pages

1. Connect the repo (or upload `dist/`)
2. Build command: `npm run build` (do **not** set `GITHUB_PAGES`)
3. Build output directory: `dist`
4. Framework preset: Vite (optional)

SPA routing: `public/_redirects` is included:

```
/*    /index.html   200
```

## Vercel

1. Import `ChandraKiranReddyy/card-os`
2. Framework: Vite
3. Build: `npm run build` (no `GITHUB_PAGES`)
4. Output: `dist`

`vercel.json` rewrites handle client-side routes.

## Notes

- Free tier is enough on Pages / Vercel / Cloudflare
- No environment variables required for core V1
- HTTPS is provided by the host
