# CARD//OS

> Your credit card operating system.

Premium, local-first web app that answers:

**Which credit card should I use for this purchase?**

## Stack (V1)

- React + TypeScript + Vite
- Tailwind CSS · Framer Motion · Lucide · Recharts · React Router
- No backend · no auth · no paid APIs

## Quick start

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## Features (Phases 1–8)

1. Premium dark UI shell + command palette  
2. Card wallet + India catalog (no invented rates)  
3. Deterministic reward / cap / valuation engines  
4. Purchase analyzer (URL heuristics + manual fallback)  
5. Transactions + Mark as used + cap usage  
6. Offers, milestones, benefits, alerts  
7. Analytics, efficiency score, missed opportunity  
8. Export / import / wipe data, security review, deploy configs  

## Data & privacy

- Stored only in your browser (`localStorage`)
- **Never** stores full card numbers, CVV, PIN, or OTP
- Settings → **Export my data** / **Import my data** / **Delete all local data**

See [SECURITY.md](./SECURITY.md).

## Deploy (free)

See [DEPLOY.md](./DEPLOY.md) for Cloudflare Pages and Vercel.

```bash
npm run build   # → dist/
```

## Spec & status

| File | Role |
|------|------|
| `CARD_OS_MASTER_BUILD.md` | Authoritative product plan (**do not edit casually**) |
| `PROJECT_STATUS.md` | Implementation phase tracker |

## Phase model

Build **one phase per “CONTINUE”**. Do not auto-advance.

## License

Personal / learning project — use freely.
