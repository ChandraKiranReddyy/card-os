# CARD//OS — Security & Privacy Review (V1)

Last reviewed: Phase 8

## Threat model (V1)

- Browser-only SPA
- No backend, no auth, no paid APIs
- All user data stays in `localStorage` (+ optional IndexedDB mirror for wallet)

## Confirmed controls

| Requirement | Status |
|-------------|--------|
| No complete card numbers (PAN) | **Yes** — wallet identifies cards by issuer/name/nickname only |
| No CVV / PIN / OTP | **Yes** — never requested |
| No banking credentials | **Yes** |
| No secrets in frontend | **Yes** — no API keys |
| No unsafe remote URL execution | **Yes** — URLs parsed client-side; not `eval`'d or fetched for scrape |
| User content not as HTML | **Yes** — React text nodes |
| Import rejects PAN-like strings | **Yes** — 13–19 digit sequences blocked |
| Import rejects `__proto__` pollution keys | **Yes** |
| Export redacts accidental PANs | **Yes** |

## Data at rest (local)

| Key | Contents |
|-----|----------|
| `cardos.wallet.v1` | Wallet cards (no PAN) |
| `cardos.transactions.v1` | Purchases & reward outcomes |
| `cardos.preferences.v1` | Valuation weights |
| `cardos.optimization.v1` | Offers, milestones, benefits |

## Residual risks (accepted for V1)

- Anyone with device access can read `localStorage`
- XSS in a compromised dependency could exfiltrate local data (standard SPA risk)
- User-provided reward rates may be wrong — labeled as user-provided / estimated

## Reporting

This is a personal/local project. Treat exported JSON as sensitive financial *behavior* data even without PANs.
