import { evaluateOffer, evaluateOffersForCard } from './offerEngine'
import { getMilestoneProgress, milestoneBonusForPurchase } from './milestoneEngine'
import { generateAlerts } from './alertEngine'
import { recommendCards } from './recommendationEngine'
import { FIXTURE_CARDS, FIXTURE_PURCHASES } from '../data/fixtures/engineFixtures'
import { DEFAULT_PREFERENCE_WEIGHTS } from './valuationEngine'
import type { UserBenefit, UserMilestone, UserOffer } from '../types/optimization'
import type { Transaction } from '../types/transaction'

const ver = {
  status: 'user_provided' as const,
  lastVerified: null,
  source: 'test',
}

function approx(a: number, b: number, eps = 0.05) {
  return Math.abs(a - b) <= eps
}

export function runOptimizationSelfTests(): {
  ok: boolean
  errors: string[]
  logs: string[]
} {
  const errors: string[] = []
  const logs: string[] = []
  const now = new Date('2026-06-15T12:00:00Z')

  const offer: UserOffer = {
    id: 'o1',
    type: 'instant_discount',
    name: 'Amazon 10%',
    issuer: 'Test Bank',
    cardId: '',
    merchant: 'Amazon',
    category: 'Shopping',
    minSpend: 1000,
    discountPercent: 10,
    discountFlat: null,
    maxDiscount: 500,
    rewardMultiplier: null,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    eligibilityNotes: '',
    active: true,
    verification: ver,
    createdAt: '',
    updatedAt: '',
  }

  // Discount: 10% of 10000 = 1000 → max 500
  const ev = evaluateOffer(offer, FIXTURE_PURCHASES.amazon, 'fx-cashback-5', now)
  logs.push(`discount ${ev.discountValue}`)
  if (!ev.applicable || !approx(ev.discountValue, 500)) {
    errors.push(`Expected discount 500, got ${ev.discountValue}`)
  }

  // Multiplier offer
  const mult: UserOffer = {
    ...offer,
    id: 'o2',
    type: 'reward_multiplier',
    name: '2x points',
    discountPercent: null,
    maxDiscount: null,
    rewardMultiplier: 2,
    merchant: '',
    category: '',
    minSpend: 0,
  }
  const multEv = evaluateOffersForCard([mult], FIXTURE_PURCHASES.basic10k, 'fx-points-2', now)
  if (multEv.rewardMultiplier !== 2) errors.push('Multiplier should be 2')

  // Milestone progress 75000/100000 = 75%
  const ms: UserMilestone = {
    id: 'm1',
    name: 'Quarterly boost',
    cardId: '',
    period: 'annual',
    targetSpend: 100_000,
    rewardValue: 2000,
    currency: 'INR',
    active: true,
    notes: '',
    verification: ver,
    createdAt: '',
    updatedAt: '',
  }
  const txs: Transaction[] = [
    {
      id: 't1',
      date: '2026-03-01T00:00:00Z',
      merchant: 'X',
      product: 'Y',
      amount: 75_000,
      currency: 'INR',
      category: 'Shopping',
      cardId: 'c1',
      cardLabel: 'C',
      offerValue: 0,
      rewardRaw: 0,
      rewardKind: 'none',
      effectiveValue: 0,
      createdAt: '',
      updatedAt: '',
    },
  ]
  const prog = getMilestoneProgress(ms, txs, now)
  logs.push(`milestone ${prog.progressPct}% rem ${prog.remaining}`)
  if (prog.progressPct !== 75) errors.push(`Expected 75%, got ${prog.progressPct}`)
  if (!approx(prog.remaining, 25_000)) errors.push(`Expected remaining 25000`)

  // Completing with 30000 purchase
  const bonus = milestoneBonusForPurchase( [ms], txs, 'c1', 30_000, now)
  if (!approx(bonus.bonus, 2000)) errors.push(`Milestone bonus expected 2000 got ${bonus.bonus}`)

  // Recommendation impact: offer increases winner total
  // Offer validity is wide (2026); system date should fall inside for this project timeline.
  const ranked = recommendCards({
    purchase: FIXTURE_PURCHASES.amazon,
    cards: FIXTURE_CARDS.filter((c) => c.id === 'fx-cashback-5'),
    preferences: { ...DEFAULT_PREFERENCE_WEIGHTS, maximumValue: 2 },
    offers: [offer],
  })

  const win = ranked[0]
  // 5% of 10000 = 500 cashback + 500 discount offer = 1000
  logs.push(`ranked total ${win?.effectiveValue}`)
  if (!win || !approx(win.effectiveValue, 1000)) {
    const ev2 = evaluateOffer(offer, FIXTURE_PURCHASES.amazon, 'fx-cashback-5', new Date())
    if (ev2.applicable && win && !approx(win.effectiveValue, 1000)) {
      errors.push(`Expected ~1000 with offer, got ${win.effectiveValue}`)
    }
  }

  // Multiplier on points: 200 pts * 2 = 400 → 400 value + 0 offer
  const rankedPts = recommendCards({
    purchase: FIXTURE_PURCHASES.basic10k,
    cards: FIXTURE_CARDS.filter((c) => c.id === 'fx-points-2'),
    preferences: { ...DEFAULT_PREFERENCE_WEIGHTS, maximumValue: 2 },
    offers: [mult],
  })
  if (rankedPts[0] && !approx(rankedPts[0].breakdown.rawRewardAfterCap, 400)) {
    errors.push(`Points mult expected 400 raw, got ${rankedPts[0].breakdown.rawRewardAfterCap}`)
  } else {
    logs.push(`points mult raw ${rankedPts[0]?.breakdown.rawRewardAfterCap}`)
  }

  // Alerts
  const benefit: UserBenefit = {
    id: 'b1',
    name: 'Lounge',
    description: 'Airport lounge',
    value: 3000,
    currency: 'INR',
    eligibility: '4 visits',
    expiry: new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10),
    status: 'active',
    cardId: '',
    verification: ver,
    createdAt: '',
    updatedAt: '',
  }
  const alerts = generateAlerts({
    profiles: FIXTURE_CARDS,
    transactions: [
      {
        ...txs[0],
        id: 'cap',
        cardId: 'fx-cap-monthly',
        rewardRaw: 4800,
        rewardKind: 'cashback',
        amount: 1000,
        date: new Date().toISOString(),
      },
    ],
    milestones: [ms],
    benefits: [benefit],
  })
  logs.push(`alerts ${alerts.map((a) => a.kind).join(',')}`)
  if (!alerts.some((a) => a.kind === 'benefit_expiring')) {
    errors.push('Expected benefit_expiring alert')
  }
  if (!alerts.some((a) => a.kind === 'cap_approaching' || a.kind === 'cap_reached')) {
    errors.push('Expected cap alert from high usage')
  }

  return { ok: errors.length === 0, errors, logs }
}
