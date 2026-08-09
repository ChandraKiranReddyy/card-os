import type {
  CardRecommendation,
  EngineCardProfile,
  PurchaseInput,
  UserPreferenceWeights,
} from '../../types/engine'
import type { UserMilestone, UserOffer } from '../../types/optimization'
import type { Transaction } from '../../types/transaction'
import { calculateReward } from '../rewardEngine'
import { evaluateOffersForCard } from '../offerEngine'
import { milestoneBonusForPurchase } from '../milestoneEngine'
import { valueReward } from '../valuationEngine'

export function recommendCards(options: {
  purchase: PurchaseInput
  cards: EngineCardProfile[]
  preferences: UserPreferenceWeights
  /** Optional flat offer value override per card (manual analyzer field) */
  offerValueByCardId?: Record<string, number>
  /** Phase 6 structured offers */
  offers?: UserOffer[]
  milestones?: UserMilestone[]
  transactions?: Transaction[]
}): CardRecommendation[] {
  const {
    purchase,
    cards,
    preferences,
    offerValueByCardId = {},
    offers = [],
    milestones = [],
    transactions = [],
  } = options

  const rows = cards.map((card) => {
    const offerEval = evaluateOffersForCard(offers, purchase, card.id)
    const manualOffer = offerValueByCardId[card.id] ?? 0
    const structuredDiscount = offerEval.discountValue
    const combinedOfferValue = manualOffer + structuredDiscount

    // Base calculation with flat offer value (discounts)
    let breakdown = calculateReward(
      card,
      purchase,
      preferences,
      combinedOfferValue,
    )

    // Apply reward multiplier from offers (re-value multiplied raw)
    if (
      breakdown.eligible &&
      offerEval.rewardMultiplier > 1 &&
      breakdown.rawRewardAfterCap > 0 &&
      breakdown.kind !== 'none'
    ) {
      const multipliedRaw = breakdown.rawRewardAfterCap * offerEval.rewardMultiplier
      const valued = valueReward({
        kind: breakdown.kind,
        rawAfterCap: multipliedRaw,
        redemption: card.redemption,
        preferences,
      })
      const totalValue = round4(valued.effectiveValue + combinedOfferValue)
      breakdown = {
        ...breakdown,
        rawRewardAfterCap: round4(multipliedRaw),
        effectiveValue: valued.effectiveValue,
        valuationPath: `${valued.path} · ×${offerEval.rewardMultiplier} offer mult`,
        totalValue,
        explanation: [
          ...breakdown.explanation,
          ...offerEval.notes,
          `Reward multiplier ×${offerEval.rewardMultiplier} → ${multipliedRaw} units → ${valued.effectiveValue} ${purchase.currency}.`,
        ],
      }
    } else if (offerEval.notes.length) {
      breakdown = {
        ...breakdown,
        explanation: [...breakdown.explanation, ...offerEval.notes],
      }
    }

    // Milestone completion bonus
    const ms = milestoneBonusForPurchase(
      milestones,
      transactions,
      card.id,
      purchase.amount,
    )
    if (ms.bonus > 0 && breakdown.eligible) {
      breakdown = {
        ...breakdown,
        totalValue: round4(breakdown.totalValue + ms.bonus),
        explanation: [
          ...breakdown.explanation,
          ...ms.notes,
          `Milestone contribution ${ms.bonus} ${purchase.currency}.`,
        ],
      }
    } else if (ms.notes.length) {
      breakdown = {
        ...breakdown,
        explanation: [...breakdown.explanation, ...ms.notes],
      }
    }

    const estimatedRewardLabel = formatRewardLabel(breakdown, purchase.currency)
    const capImpact =
      breakdown.cap.clipped > 0
        ? `Clipped ${breakdown.cap.clipped} by cap(s); remaining headroom ${breakdown.cap.remainingCap ?? 'n/a'}`
        : breakdown.cap.remainingCap != null
          ? `Within caps · remaining ${breakdown.cap.remainingCap}`
          : 'No caps applied'

    return {
      rank: 0,
      cardId: card.id,
      label: card.label,
      breakdown,
      estimatedRewardLabel,
      effectiveValue: breakdown.totalValue,
      capImpact,
      offerValue: combinedOfferValue,
      explanation: breakdown.explanation,
      source: card.source,
    } satisfies CardRecommendation
  })

  rows.sort((a, b) => {
    if (a.breakdown.eligible !== b.breakdown.eligible) {
      return a.breakdown.eligible ? -1 : 1
    }
    if (b.effectiveValue !== a.effectiveValue) {
      return b.effectiveValue - a.effectiveValue
    }
    return a.label.localeCompare(b.label)
  })

  return rows.map((r, i) => ({ ...r, rank: i + 1 }))
}

function formatRewardLabel(
  breakdown: CardRecommendation['breakdown'],
  currency: string,
): string {
  if (!breakdown.eligible) return 'Ineligible'
  if (breakdown.kind === 'cashback') {
    return `${currency} ${breakdown.rawRewardAfterCap.toFixed(2)} cashback`
  }
  if (breakdown.kind === 'points') {
    return `${breakdown.rawRewardAfterCap.toFixed(1)} pts`
  }
  if (breakdown.kind === 'miles') {
    return `${breakdown.rawRewardAfterCap.toFixed(1)} miles`
  }
  return '—'
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}
