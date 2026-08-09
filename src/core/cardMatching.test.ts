/**
 * Lightweight runtime checks for fuzzy matching (run via node/tsx or import in devtools).
 * Not a full test runner — used by scripts/verify-phase2.mjs
 */
import { matchCatalogCards } from './cardMatching'
import { INDIA_CARD_CATALOG_V1 } from '../data/cards/india.v1'

export function verifyFuzzyMatching(): string[] {
  const errors: string[] = []
  const cards = INDIA_CARD_CATALOG_V1.cards

  const infinia = matchCatalogCards('HDFC infinia', cards)
  if (!infinia.length || !infinia[0].card.id.includes('infinia')) {
    errors.push('Expected HDFC infinia to match Infinia')
  }

  const cashback = matchCatalogCards('sbi cashback', cards)
  if (!cashback.length || !cashback[0].card.id.includes('cashback')) {
    errors.push('Expected sbi cashback match')
  }

  const atlas = matchCatalogCards('axis atlas', cards)
  if (!atlas.length || !atlas[0].card.id.includes('atlas')) {
    errors.push('Expected axis atlas match')
  }

  // Short query should be uncertain
  const short = matchCatalogCards('ab', cards, { minScore: 20 })
  if (short.some((r) => !r.uncertain)) {
    errors.push('Short queries must remain uncertain')
  }

  return errors
}
