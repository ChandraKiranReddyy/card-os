import type {
  PreferenceKey,
  RedemptionValues,
  RewardKind,
  UserPreferenceWeights,
} from '../../types/engine'

export const DEFAULT_REDEMPTION: RedemptionValues = {
  travel: 1,
  hotels: 0.9,
  voucher: 0.6,
  cashback: 0.25,
  shopping: 0.5,
}

export const DEFAULT_PREFERENCE_WEIGHTS: UserPreferenceWeights = {
  travel: 1,
  cashback: 1,
  hotels: 1,
  shopping: 1,
  maximumValue: 1,
}

/**
 * Value raw points/miles into currency using redemption table + preferences.
 * Cashback raw is already currency — returned as-is.
 */
export function valueReward(options: {
  kind: RewardKind | 'none'
  rawAfterCap: number
  redemption: RedemptionValues
  preferences: UserPreferenceWeights
}): { effectiveValue: number; path: string; perUnit: number } {
  const { kind, rawAfterCap, redemption, preferences } = options

  if (kind === 'none' || rawAfterCap <= 0) {
    return { effectiveValue: 0, path: 'none', perUnit: 0 }
  }

  if (kind === 'cashback') {
    return {
      effectiveValue: round4(rawAfterCap),
      path: 'cashback (currency)',
      perUnit: 1,
    }
  }

  if (isMaxValueMode(preferences)) {
    const best = bestRedemption(redemption)
    return {
      effectiveValue: round4(rawAfterCap * best.value),
      path: `max value via ${best.key} @ ${best.value}/pt`,
      perUnit: best.value,
    }
  }

  const weighted = weightedRedemption(redemption, preferences)
  return {
    effectiveValue: round4(rawAfterCap * weighted.value),
    path: `weighted prefs → ${weighted.key} @ ${weighted.value}/pt`,
    perUnit: weighted.value,
  }
}

function isMaxValueMode(p: UserPreferenceWeights): boolean {
  const others = p.travel + p.cashback + p.hotels + p.shopping
  return p.maximumValue >= others && p.maximumValue > 0
}

function bestRedemption(
  r: RedemptionValues,
): { key: string; value: number } {
  const entries: Array<{ key: string; value: number }> = [
    { key: 'travel', value: r.travel },
    { key: 'hotels', value: r.hotels },
    { key: 'voucher', value: r.voucher },
    { key: 'cashback', value: r.cashback },
    { key: 'shopping', value: r.shopping },
  ]
  return entries.reduce((a, b) => (b.value > a.value ? b : a))
}

function weightedRedemption(
  r: RedemptionValues,
  p: UserPreferenceWeights,
): { key: string; value: number } {
  const pairs: Array<{ key: string; value: number; w: number }> = [
    { key: 'travel', value: r.travel, w: p.travel },
    { key: 'hotels', value: r.hotels, w: p.hotels },
    { key: 'cashback', value: r.cashback, w: p.cashback },
    { key: 'shopping', value: r.shopping, w: p.shopping },
    { key: 'voucher', value: r.voucher, w: Math.max(p.shopping * 0.5, 0.1) },
  ]
  const totalW = pairs.reduce((s, x) => s + Math.max(0, x.w), 0) || 1
  let best = pairs[0]
  let bestScore = -1
  for (const pair of pairs) {
    const score = (Math.max(0, pair.w) / totalW) * pair.value
    if (score > bestScore) {
      bestScore = score
      best = pair
    }
  }
  return { key: best.key, value: best.value }
}

/**
 * Example: 2,000 points with
 * Travel = ₹2,000 · Hotels = ₹1,800 · Voucher = ₹1,200 · Cashback = ₹500
 */
export function valuePointsBatch(
  points: number,
  redemption: RedemptionValues,
): Record<keyof RedemptionValues, number> {
  return {
    travel: round4(points * redemption.travel),
    hotels: round4(points * redemption.hotels),
    voucher: round4(points * redemption.voucher),
    cashback: round4(points * redemption.cashback),
    shopping: round4(points * redemption.shopping),
  }
}

export type { PreferenceKey }

function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}
