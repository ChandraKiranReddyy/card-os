import type {
  AnalysisResult,
  AnalysisStep,
  PurchaseDraft,
} from '../../types/analyzer'
import type { EngineCardProfile, UserPreferenceWeights } from '../../types/engine'
import type { UserMilestone, UserOffer } from '../../types/optimization'
import type { Transaction } from '../../types/transaction'
import { recommendCards } from '../recommendationEngine'
import { parsePurchaseUrl } from './urlParser'

export const ANALYSIS_STEP_DEFS: Array<{ id: AnalysisStep['id']; label: string }> = [
  { id: 'merchant', label: 'Merchant identified' },
  { id: 'category', label: 'Product category identified' },
  { id: 'eligibility', label: 'Checking card eligibility' },
  { id: 'caps', label: 'Checking reward caps' },
  { id: 'offers', label: 'Checking offers' },
  { id: 'rewards', label: 'Calculating reward value' },
  { id: 'preferences', label: 'Applying your preferences' },
]

export function createPendingSteps(): AnalysisStep[] {
  return ANALYSIS_STEP_DEFS.map((s) => ({
    id: s.id,
    label: s.label,
    status: 'pending' as const,
  }))
}

export function draftFromUrl(url: string): PurchaseDraft {
  const parse = parsePurchaseUrl(url)
  return {
    url: parse.rawUrl || url,
    merchant: parse.merchantName || '',
    product: parse.productName || '',
    price: parse.price,
    category: parse.category || 'Shopping',
    country: parse.country || 'IN',
    currency: parse.currency || 'INR',
    offerValue: 0,
    parse,
  }
}

export function draftIsComplete(draft: PurchaseDraft): {
  ok: boolean
  missing: string[]
} {
  const missing: string[] = []
  if (!draft.merchant.trim()) missing.push('merchant')
  if (!draft.product.trim()) missing.push('product')
  if (draft.price == null || !(draft.price > 0)) missing.push('price')
  if (!draft.category.trim()) missing.push('category')
  return { ok: missing.length === 0, missing }
}

/**
 * Run deterministic recommendation for a completed draft.
 * Uses wallet profiles when they have rates; otherwise synthetic fixtures.
 */
export function runPurchaseAnalysis(options: {
  draft: PurchaseDraft
  walletProfiles: EngineCardProfile[]
  fixtureProfiles: EngineCardProfile[]
  preferences: UserPreferenceWeights
  offers?: UserOffer[]
  milestones?: UserMilestone[]
  transactions?: Transaction[]
}): AnalysisResult {
  const {
    draft,
    walletProfiles,
    fixtureProfiles,
    preferences,
    offers = [],
    milestones = [],
    transactions = [],
  } = options
  const usableWallet = walletProfiles.filter((p) => p.rules.length > 0)
  const usedFixtures = usableWallet.length === 0
  const cards = usedFixtures ? fixtureProfiles : usableWallet

  const purchase = {
    amount: draft.price || 0,
    currency: draft.currency || 'INR',
    merchant: draft.merchant.trim(),
    category: draft.category.trim(),
    country: draft.country,
    product: draft.product.trim(),
    url: draft.url,
  }

  // Manual analyzer offer field applied to all cards; structured offers evaluated per card
  const offerValueByCardId = Object.fromEntries(
    cards.map((c) => [c.id, draft.offerValue || 0]),
  )

  const recommendations = recommendCards({
    purchase,
    cards,
    preferences,
    offerValueByCardId,
    offers,
    milestones,
    transactions,
  })

  const winner = recommendations.find((r) => r.breakdown.eligible) ?? null
  const totalOfferOnWinner = winner?.offerValue ?? (draft.offerValue || 0)
  const winnerReason = buildWinnerReason(winner, recommendations, purchase.currency)

  return {
    purchase,
    offerValue: totalOfferOnWinner,
    recommendations,
    winner,
    winnerReason,
    usedFixtures,
    analyzedAt: new Date().toISOString(),
  }
}

function buildWinnerReason(
  winner: AnalysisResult['winner'],
  all: AnalysisResult['recommendations'],
  currency: string,
): string[] {
  if (!winner) {
    return [
      'No eligible card produced a reward for this purchase.',
      'Check exclusions, add user-provided rates on wallet cards, or use fixture mode.',
    ]
  }

  const reasons = [
    `${winner.label} ranks #1 with effective value ${currency} ${winner.effectiveValue.toFixed(2)}.`,
    `Estimated reward: ${winner.estimatedRewardLabel}.`,
    winner.capImpact,
  ]

  const runnerUp = all.find(
    (r) => r.cardId !== winner.cardId && r.breakdown.eligible,
  )
  if (runnerUp) {
    const delta = winner.effectiveValue - runnerUp.effectiveValue
    reasons.push(
      `Beats ${runnerUp.label} by ${currency} ${delta.toFixed(2)} effective value.`,
    )
  }

  // Surface first engine explanations
  reasons.push(...winner.explanation.slice(0, 3))

  if (winner.offerValue > 0) {
    reasons.push(`Includes offer value ${currency} ${winner.offerValue.toFixed(2)}.`)
  }

  const msLine = winner.explanation.find((e) =>
    e.toLowerCase().includes('milestone'),
  )
  if (msLine) reasons.push(msLine)

  return reasons
}

/** Simulate timed analysis steps for UI (deterministic outcomes). */
export async function runAnalysisWithSteps(options: {
  draft: PurchaseDraft
  walletProfiles: EngineCardProfile[]
  fixtureProfiles: EngineCardProfile[]
  preferences: UserPreferenceWeights
  offers?: UserOffer[]
  milestones?: UserMilestone[]
  transactions?: Transaction[]
  onStep: (steps: AnalysisStep[]) => void
  reducedMotion?: boolean
  delayMs?: number
}): Promise<AnalysisResult> {
  const {
    draft,
    walletProfiles,
    fixtureProfiles,
    preferences,
    offers = [],
    milestones = [],
    transactions = [],
    onStep,
    reducedMotion,
    delayMs = 420,
  } = options

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, reducedMotion ? 0 : ms)
    })

  const steps = createPendingSteps()
  const complete = draftIsComplete(draft)

  const set = (id: AnalysisStep['id'], patch: Partial<AnalysisStep>) => {
    const i = steps.findIndex((s) => s.id === id)
    if (i >= 0) steps[i] = { ...steps[i], ...patch }
    onStep(steps.map((s) => ({ ...s })))
  }

  // Merchant
  set('merchant', { status: 'running' })
  await wait(delayMs)
  set('merchant', {
    status: draft.merchant ? 'done' : 'failed',
    detail: draft.merchant || 'Missing merchant',
  })

  // Category
  set('category', { status: 'running' })
  await wait(delayMs)
  set('category', {
    status: draft.category ? 'done' : 'failed',
    detail: draft.category || 'Missing category',
  })

  if (!complete.ok) {
    for (const id of [
      'eligibility',
      'caps',
      'offers',
      'rewards',
      'preferences',
    ] as const) {
      set(id, {
        status: 'skipped',
        detail: `Waiting for: ${complete.missing.join(', ')}`,
      })
    }
    throw new Error(
      `We couldn't retrieve all product details. Missing: ${complete.missing.join(', ')}`,
    )
  }

  const result = runPurchaseAnalysis({
    draft,
    walletProfiles,
    fixtureProfiles,
    preferences,
    offers,
    milestones,
    transactions,
  })

  set('eligibility', {
    status: 'running',
  })
  await wait(delayMs)
  const eligibleCount = result.recommendations.filter((r) => r.breakdown.eligible).length
  set('eligibility', {
    status: 'done',
    detail: `${eligibleCount} of ${result.recommendations.length} cards eligible`,
  })

  set('caps', { status: 'running' })
  await wait(delayMs)
  const clipped = result.recommendations.some((r) => r.breakdown.cap.clipped > 0)
  set('caps', {
    status: 'done',
    detail: clipped ? 'One or more caps reduced rewards' : 'Caps checked',
  })

  set('offers', { status: 'running' })
  await wait(delayMs)
  set('offers', {
    status: 'done',
    detail:
      offers.length > 0 || draft.offerValue > 0
        ? `${offers.length} structured offer(s) · manual ₹${draft.offerValue || 0}`
        : 'No offers configured',
  })

  set('rewards', { status: 'running' })
  await wait(delayMs)
  set('rewards', {
    status: 'done',
    detail: result.winner
      ? `Top effective ${draft.currency} ${result.winner.effectiveValue.toFixed(2)}`
      : 'No winner',
  })

  set('preferences', { status: 'running' })
  await wait(delayMs)
  set('preferences', {
    status: 'done',
    detail: 'Preference weights applied to point valuation',
  })

  return result
}
