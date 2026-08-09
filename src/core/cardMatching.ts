import type { CardMatchResult, CatalogCard } from '../types/card'

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(s: string): string[] {
  return normalize(s).split(' ').filter(Boolean)
}

/** Simple Levenshtein distance for short strings */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost)
      prev = tmp
    }
  }
  return row[b.length]
}

function similarity(a: string, b: string): number {
  const na = normalize(a)
  const nb = normalize(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  if (na.includes(nb) || nb.includes(na)) return 0.9
  const dist = levenshtein(na, nb)
  const maxLen = Math.max(na.length, nb.length)
  return Math.max(0, 1 - dist / maxLen)
}

function scoreCard(query: string, card: CatalogCard): number {
  const q = normalize(query)
  if (!q) return 0

  const full = normalize(`${card.issuer} ${card.name} ${card.variant ?? ''}`)
  const name = normalize(card.name)
  const issuer = normalize(card.issuer)
  const qTokens = tokens(query)
  const hayTokens = new Set(tokens(full))

  let score = 0
  score = Math.max(score, similarity(q, full) * 100)
  score = Math.max(score, similarity(q, name) * 95)
  score = Math.max(score, similarity(q, `${issuer} ${name}`) * 98)

  // Token coverage (fuzzy: "hdfc infinia" → Infinia)
  let covered = 0
  for (const t of qTokens) {
    let best = 0
    for (const h of hayTokens) {
      best = Math.max(best, similarity(t, h))
    }
    if (best >= 0.75) covered += 1
  }
  if (qTokens.length) {
    score = Math.max(score, (covered / qTokens.length) * 88)
  }

  // Issuer boost when issuer token present
  if (qTokens.some((t) => similarity(t, issuer.split(' ')[0] ?? '') > 0.85)) {
    score += 4
  }

  return Math.min(100, score)
}

/**
 * Fuzzy catalog match. Never silently picks uncertain results —
 * callers must require explicit user selection when `uncertain` is true
 * or when multiple close matches exist.
 */
export function matchCatalogCards(
  query: string,
  cards: CatalogCard[],
  options?: { limit?: number; minScore?: number },
): CardMatchResult[] {
  const limit = options?.limit ?? 8
  const minScore = options?.minScore ?? 35

  const ranked = cards
    .map((card) => {
      const score = scoreCard(query, card)
      return {
        card,
        score,
        uncertain: score < 85,
      } satisfies CardMatchResult
    })
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)

  const top = ranked.slice(0, limit)

  // If top two are close, mark both uncertain so UI won't auto-select
  if (top.length >= 2 && top[0].score - top[1].score < 8) {
    return top.map((r) => ({ ...r, uncertain: true }))
  }

  // Even a high score is uncertain if query is very short
  if (normalize(query).length < 3) {
    return top.map((r) => ({ ...r, uncertain: true }))
  }

  return top
}

export function formatCatalogLabel(card: CatalogCard): string {
  const variant = card.variant ? ` ${card.variant}` : ''
  return `${card.issuer} ${card.name}${variant}`
}
