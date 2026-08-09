import type { EngineRewardRule, PurchaseInput, RewardKind } from '../../types/engine'

function norm(s: string): string {
  return s.trim().toLowerCase()
}

function ruleMatchesCategory(rule: EngineRewardRule, category: string): boolean {
  if (!rule.categories.length) return true
  const c = norm(category)
  return rule.categories.some((x) => norm(x) === c)
}

function ruleMatchesMerchant(rule: EngineRewardRule, merchant: string): boolean {
  if (!rule.merchants.length) return true
  const m = norm(merchant)
  return rule.merchants.some((x) => {
    const nx = norm(x)
    return m === nx || m.includes(nx) || nx.includes(m)
  })
}

/** Convert rule rate to raw reward units for the purchase amount */
export function rawFromRate(
  kind: RewardKind,
  rate: number,
  amount: number,
): number {
  if (kind === 'cashback') {
    return (amount * rate) / 100
  }
  // points / miles: rate per 100 currency units
  return (amount / 100) * rate
}

export function cashbackAmount(percent: number, amount: number): number {
  return rawFromRate('cashback', percent, amount)
}

export function pointsEarned(pointsPer100: number, amount: number): number {
  return rawFromRate('points', pointsPer100, amount)
}

export function milesEarned(milesPer100: number, amount: number): number {
  return rawFromRate('miles', milesPer100, amount)
}

export function baseReward(
  rules: EngineRewardRule[],
  purchase: PurchaseInput,
): number {
  const generic = rules.find((r) => !r.categories.length && !r.merchants.length)
  if (!generic) return 0
  return rawFromRate(generic.kind, generic.rate, purchase.amount)
}

export function categoryReward(
  rules: EngineRewardRule[],
  purchase: PurchaseInput,
): number {
  const rule = rules.find(
    (r) =>
      r.categories.length > 0 &&
      ruleMatchesCategory(r, purchase.category) &&
      ruleMatchesMerchant(r, purchase.merchant),
  )
  if (!rule) return 0
  return rawFromRate(rule.kind, rule.rate, purchase.amount)
}

export function merchantMultiplier(
  rules: EngineRewardRule[],
  purchase: PurchaseInput,
): number {
  const rule = rules.find(
    (r) =>
      r.merchants.length > 0 &&
      ruleMatchesMerchant(r, purchase.merchant) &&
      (r.merchantMultiplier || 1) !== 1,
  )
  return rule?.merchantMultiplier || 1
}

/**
 * Among eligible rules, pick the highest raw reward (after merchant multiplier).
 * Specificity is a tie-breaker only.
 */
export function computePreCapReward(
  rules: EngineRewardRule[],
  purchase: PurchaseInput,
): {
  kind: RewardKind
  rawReward: number
  baseComponent: number
  categoryComponent: number
  merchantMultiplierApplied: number
  appliedRuleIds: string[]
  notes: string[]
} | null {
  const matching = rules.filter(
    (r) =>
      ruleMatchesCategory(r, purchase.category) &&
      ruleMatchesMerchant(r, purchase.merchant),
  )
  if (!matching.length) return null

  const evaluated = matching.map((rule) => {
    const base = rawFromRate(rule.kind, rule.rate, purchase.amount)
    const mult =
      rule.merchants.length > 0 ? rule.merchantMultiplier || 1 : 1
    const raw = base * mult
    const specificity =
      (rule.categories.length ? 2 : 0) + (rule.merchants.length ? 2 : 0)
    return { rule, base, mult, raw, specificity }
  })

  evaluated.sort((a, b) => {
    if (b.raw !== a.raw) return b.raw - a.raw
    return b.specificity - a.specificity
  })

  const best = evaluated[0]
  const genericRaw = baseReward(rules, purchase)
  const categoryRaw = categoryReward(rules, purchase)

  const notes: string[] = [
    `Applied rule “${best.rule.id}” (${best.rule.kind}, rate ${best.rule.rate}${
      best.rule.kind === 'cashback' ? '%' : ' / 100'
    }).`,
  ]
  if (best.mult !== 1) {
    notes.push(`Merchant multiplier ×${best.mult}.`)
  }

  return {
    kind: best.rule.kind,
    rawReward: round4(best.raw),
    baseComponent: round4(genericRaw),
    categoryComponent: round4(Math.max(0, categoryRaw - genericRaw)),
    merchantMultiplierApplied: best.mult,
    appliedRuleIds: [best.rule.id],
    notes,
  }
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}
