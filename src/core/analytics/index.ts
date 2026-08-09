/**
 * Phase 7 analytics — deterministic, documented formulas only.
 * All monetary opportunity figures are ≈ ESTIMATED from user data + configured rates.
 */
import type { EngineCardProfile, UserPreferenceWeights } from '../../types/engine'
import type { Transaction } from '../../types/transaction'
import type { WalletCard } from '../../types/card'
import { calculateReward } from '../rewardEngine'
import { DEFAULT_PREFERENCE_WEIGHTS } from '../valuationEngine'

export interface DayPoint {
  key: string
  label: string
  spending: number
  rewards: number
}

export interface CardPerformance {
  cardId: string
  cardLabel: string
  spending: number
  rewards: number
  txCount: number
  rewardRatePct: number
}

export interface CategoryOptimization {
  category: string
  spending: number
  rewards: number
  rewardRatePct: number
}

export interface WalletEfficiency {
  score: number
  grade: string
  components: Array<{
    id: string
    label: string
    score: number
    weight: number
    explanation: string
  }>
  formula: string
}

export interface MissedOpportunity {
  amount: number
  txCount: number
  explanation: string
  /** Always estimated */
  label: '≈ ESTIMATED'
}

export interface AnalyticsBundle {
  spendingTrendDaily: DayPoint[]
  spendingTrendMonthly: DayPoint[]
  rewardsTrendMonthly: DayPoint[]
  cardPerformance: CardPerformance[]
  categoryOptimization: CategoryOptimization[]
  missedOpportunity: MissedOpportunity
  efficiency: WalletEfficiency
  monthSpending: number
  monthRewards: number
  prevMonthRewards: number
  rewardsMomPct: number | null
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function inSameMonth(iso: string, ref: Date): boolean {
  const d = new Date(iso)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}

/**
 * Build last N daily points (including zeros) for charts.
 */
export function spendingTrendDaily(
  transactions: Transaction[],
  days = 30,
  now = new Date(),
): DayPoint[] {
  const map = new Map<string, { spending: number; rewards: number }>()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setHours(12, 0, 0, 0)
    d.setDate(d.getDate() - i)
    map.set(dayKey(d), { spending: 0, rewards: 0 })
  }
  for (const tx of transactions) {
    const k = dayKey(new Date(tx.date))
    const row = map.get(k)
    if (!row) continue
    row.spending += tx.amount
    row.rewards += tx.effectiveValue
  }
  return [...map.entries()].map(([key, v]) => ({
    key,
    label: key.slice(5), // MM-DD
    spending: round2(v.spending),
    rewards: round2(v.rewards),
  }))
}

export function monthlyTrend(
  transactions: Transaction[],
  months = 6,
  now = new Date(),
): DayPoint[] {
  const keys: string[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(monthKey(d))
  }
  const map = new Map(keys.map((k) => [k, { spending: 0, rewards: 0 }]))
  for (const tx of transactions) {
    const k = monthKey(new Date(tx.date))
    const row = map.get(k)
    if (!row) continue
    row.spending += tx.amount
    row.rewards += tx.effectiveValue
  }
  return keys.map((key) => {
    const v = map.get(key)!
    const [y, m] = key.split('-')
    return {
      key,
      label: `${m}/${y.slice(2)}`,
      spending: round2(v.spending),
      rewards: round2(v.rewards),
    }
  })
}

export function cardPerformance(transactions: Transaction[]): CardPerformance[] {
  const map = new Map<string, CardPerformance>()
  for (const tx of transactions) {
    const row = map.get(tx.cardId) ?? {
      cardId: tx.cardId,
      cardLabel: tx.cardLabel,
      spending: 0,
      rewards: 0,
      txCount: 0,
      rewardRatePct: 0,
    }
    row.spending += tx.amount
    row.rewards += tx.effectiveValue
    row.txCount += 1
    row.cardLabel = tx.cardLabel
    map.set(tx.cardId, row)
  }
  return [...map.values()]
    .map((r) => ({
      ...r,
      spending: round2(r.spending),
      rewards: round2(r.rewards),
      rewardRatePct:
        r.spending > 0 ? round2((r.rewards / r.spending) * 100) : 0,
    }))
    .sort((a, b) => b.rewards - a.rewards)
}

export function categoryOptimization(
  transactions: Transaction[],
): CategoryOptimization[] {
  const map = new Map<string, { spending: number; rewards: number }>()
  for (const tx of transactions) {
    const row = map.get(tx.category) ?? { spending: 0, rewards: 0 }
    row.spending += tx.amount
    row.rewards += tx.effectiveValue
    map.set(tx.category, row)
  }
  return [...map.entries()]
    .map(([category, v]) => ({
      category,
      spending: round2(v.spending),
      rewards: round2(v.rewards),
      rewardRatePct: v.spending > 0 ? round2((v.rewards / v.spending) * 100) : 0,
    }))
    .sort((a, b) => a.rewardRatePct - b.rewardRatePct)
}

/**
 * For each transaction this month, if a different configured card would have
 * produced higher effective value, count the delta as missed opportunity.
 *
 * Formula per tx: max(0, bestEligibleEffective − actualEffective)
 * Total = sum of deltas. Labeled ≈ ESTIMATED (depends on user rates & engine).
 */
export function estimateMissedOpportunity(
  transactions: Transaction[],
  profiles: EngineCardProfile[],
  preferences: UserPreferenceWeights = DEFAULT_PREFERENCE_WEIGHTS,
  now = new Date(),
): MissedOpportunity {
  const usable = profiles.filter((p) => p.rules.length > 0)
  if (!usable.length) {
    return {
      amount: 0,
      txCount: 0,
      explanation:
        'No missed-opportunity estimate: add user-provided reward rates on wallet cards.',
      label: '≈ ESTIMATED',
    }
  }

  let amount = 0
  let txCount = 0
  const monthTx = transactions.filter((t) => inSameMonth(t.date, now))

  for (const tx of monthTx) {
    let best = 0
    for (const profile of usable) {
      const b = calculateReward(
        profile,
        {
          amount: tx.amount,
          currency: tx.currency || 'INR',
          merchant: tx.merchant,
          category: tx.category,
        },
        preferences,
        tx.offerValue || 0,
      )
      if (b.eligible && b.totalValue > best) best = b.totalValue
    }
    const delta = best - tx.effectiveValue
    if (delta > 0.5) {
      amount += delta
      txCount += 1
    }
  }

  return {
    amount: round2(amount),
    txCount,
    explanation:
      txCount > 0
        ? `Across ${txCount} purchase(s) this month, a higher-value configured card may have earned about ${round2(amount)} more. Uses your rates only — not verified bank rules.`
        : 'No positive gap found this month between recorded rewards and best configured card.',
    label: '≈ ESTIMATED',
  }
}

/**
 * Wallet efficiency score (0–100), documented components:
 *
 * coverage (30%): share of wallet cards with a user-provided reward rate
 * yield (30%): reward / spend vs a 1% baseline, capped at 100
 *   yieldRaw = (totalRewards / totalSpend) / 0.01 * 100, clamp 0–100
 * capHealth (20%): average remaining capacity on monthly caps (100 if no caps)
 * offerLeverage (20%): offerValue / max(rewards, 1) * 100, clamp 0–100
 *
 * score = 0.30*coverage + 0.30*yield + 0.20*capHealth + 0.20*offerLeverage
 */
export function computeWalletEfficiency(
  walletCards: WalletCard[],
  transactions: Transaction[],
  profiles: EngineCardProfile[],
): WalletEfficiency {
  const formula =
    '0.30×coverage + 0.30×yield + 0.20×capHealth + 0.20×offerLeverage (each 0–100)'

  if (walletCards.length === 0 && transactions.length === 0) {
    return {
      score: 0,
      grade: '—',
      formula,
      components: [
        {
          id: 'coverage',
          label: 'Rate coverage',
          score: 0,
          weight: 0.3,
          explanation: 'No cards in wallet.',
        },
        {
          id: 'yield',
          label: 'Reward yield',
          score: 0,
          weight: 0.3,
          explanation: 'No transactions yet.',
        },
        {
          id: 'capHealth',
          label: 'Cap headroom',
          score: 100,
          weight: 0.2,
          explanation: 'No caps to evaluate.',
        },
        {
          id: 'offerLeverage',
          label: 'Offer leverage',
          score: 0,
          weight: 0.2,
          explanation: 'No offer value recorded.',
        },
      ],
    }
  }

  const withRates = walletCards.filter(
    (c) => c.rewardRate != null && c.rewardRate > 0,
  ).length
  const coverage =
    walletCards.length > 0
      ? round2((withRates / walletCards.length) * 100)
      : profiles.filter((p) => p.rules.length).length > 0
        ? 50
        : 0

  const spend = transactions.reduce((s, t) => s + t.amount, 0)
  const rewards = transactions.reduce((s, t) => s + t.effectiveValue, 0)
  const offers = transactions.reduce((s, t) => s + t.offerValue, 0)
  const yieldRaw =
    spend > 0 ? ((rewards / spend) / 0.01) * 100 : transactions.length ? 0 : 50
  const yieldScore = clamp(yieldRaw, 0, 100)

  const monthlyCaps = profiles.flatMap((p) =>
    p.caps.filter((c) => c.period === 'monthly' && c.limit > 0),
  )
  let capHealth = 100
  if (monthlyCaps.length) {
    const avgRemain =
      monthlyCaps.reduce(
        (s, c) => s + Math.max(0, 1 - c.used / c.limit),
        0,
      ) / monthlyCaps.length
    capHealth = round2(avgRemain * 100)
  }

  const offerLeverage = clamp(
    (offers / Math.max(rewards, 1)) * 100,
    0,
    100,
  )

  const components = [
    {
      id: 'coverage',
      label: 'Rate coverage',
      score: coverage,
      weight: 0.3,
      explanation: `${withRates}/${walletCards.length || 0} cards have a user-provided reward rate.`,
    },
    {
      id: 'yield',
      label: 'Reward yield',
      score: round2(yieldScore),
      weight: 0.3,
      explanation: `Effective rewards ÷ spend vs 1% baseline (${spend > 0 ? ((rewards / spend) * 100).toFixed(2) : '0'}% realized).`,
    },
    {
      id: 'capHealth',
      label: 'Cap headroom',
      score: capHealth,
      weight: 0.2,
      explanation: monthlyCaps.length
        ? `Average remaining room across ${monthlyCaps.length} monthly cap(s).`
        : 'No monthly caps configured — full headroom assumed.',
    },
    {
      id: 'offerLeverage',
      label: 'Offer leverage',
      score: round2(offerLeverage),
      weight: 0.2,
      explanation: `Offer value ${round2(offers)} relative to rewards ${round2(rewards)}.`,
    },
  ]

  const score = round2(
    components.reduce((s, c) => s + c.score * c.weight, 0),
  )

  return {
    score,
    grade: gradeFor(score),
    components,
    formula,
  }
}

export function buildAnalytics(options: {
  transactions: Transaction[]
  walletCards: WalletCard[]
  profiles: EngineCardProfile[]
  preferences?: UserPreferenceWeights
  now?: Date
}): AnalyticsBundle {
  const now = options.now ?? new Date()
  const prefs = options.preferences ?? DEFAULT_PREFERENCE_WEIGHTS
  const monthly = monthlyTrend(options.transactions, 6, now)
  const daily = spendingTrendDaily(options.transactions, 30, now)

  const thisKey = monthKey(now)
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevKey = monthKey(prev)
  const monthSpending =
    monthly.find((m) => m.key === thisKey)?.spending ?? 0
  const monthRewards =
    monthly.find((m) => m.key === thisKey)?.rewards ?? 0
  const prevMonthRewards =
    monthly.find((m) => m.key === prevKey)?.rewards ?? 0
  const rewardsMomPct =
    prevMonthRewards > 0
      ? round2(((monthRewards - prevMonthRewards) / prevMonthRewards) * 100)
      : monthRewards > 0
        ? 100
        : null

  return {
    spendingTrendDaily: daily,
    spendingTrendMonthly: monthly,
    rewardsTrendMonthly: monthly,
    cardPerformance: cardPerformance(options.transactions),
    categoryOptimization: categoryOptimization(options.transactions),
    missedOpportunity: estimateMissedOpportunity(
      options.transactions,
      options.profiles,
      prefs,
      now,
    ),
    efficiency: computeWalletEfficiency(
      options.walletCards,
      options.transactions,
      options.profiles,
    ),
    monthSpending,
    monthRewards,
    prevMonthRewards,
    rewardsMomPct,
  }
}

function gradeFor(score: number): string {
  if (score >= 85) return 'A'
  if (score >= 70) return 'B'
  if (score >= 55) return 'C'
  if (score >= 40) return 'D'
  return 'E'
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
