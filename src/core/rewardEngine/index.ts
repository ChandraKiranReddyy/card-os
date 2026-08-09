import type {
  EngineCardProfile,
  PurchaseInput,
  RewardBreakdown,
  UserPreferenceWeights,
} from '../../types/engine'
import { applyCaps } from '../capEngine'
import { valueReward } from '../valuationEngine'
import { checkEligibility } from './eligibility'
import { computePreCapReward } from './rates'

export {
  baseReward,
  categoryReward,
  merchantMultiplier,
  cashbackAmount,
  pointsEarned,
  milesEarned,
  rawFromRate,
  computePreCapReward,
} from './rates'
export { checkEligibility, isCategoryExcluded, isMerchantExcluded } from './eligibility'

/**
 * Deterministic end-to-end reward calculation for one card + purchase.
 * No LLM. Pure TypeScript arithmetic.
 */
export function calculateReward(
  profile: EngineCardProfile,
  purchase: PurchaseInput,
  preferences: UserPreferenceWeights,
  offerValue = 0,
): RewardBreakdown {
  const eligibility = checkEligibility(profile, purchase)
  if (!eligibility.eligible) {
    return {
      eligible: false,
      ineligibilityReason: eligibility.reason,
      kind: 'none',
      rawReward: 0,
      rawRewardAfterCap: 0,
      baseComponent: 0,
      categoryComponent: 0,
      merchantMultiplierApplied: 1,
      cap: {
        beforeCap: 0,
        afterCap: 0,
        clipped: 0,
        remainingCap: null,
        appliedCapIds: [],
        notes: [],
      },
      effectiveValue: 0,
      valuationPath: 'none',
      offerValue: 0,
      totalValue: 0,
      explanation: [eligibility.reason || 'Not eligible.'],
      verification: profile.verification,
    }
  }

  const pre = computePreCapReward(profile.rules, purchase)
  if (!pre) {
    return {
      eligible: false,
      ineligibilityReason: 'No matching reward rule for this category/merchant.',
      kind: 'none',
      rawReward: 0,
      rawRewardAfterCap: 0,
      baseComponent: 0,
      categoryComponent: 0,
      merchantMultiplierApplied: 1,
      cap: {
        beforeCap: 0,
        afterCap: 0,
        clipped: 0,
        remainingCap: null,
        appliedCapIds: [],
        notes: [],
      },
      effectiveValue: 0,
      valuationPath: 'none',
      offerValue: 0,
      totalValue: 0,
      explanation: ['No matching reward rule for this category/merchant.'],
      verification: profile.verification,
    }
  }

  const cap = applyCaps(pre.rawReward, profile.caps, purchase, pre.kind)
  const valued = valueReward({
    kind: pre.kind,
    rawAfterCap: cap.afterCap,
    redemption: profile.redemption,
    preferences,
  })

  const totalValue = round4(valued.effectiveValue + offerValue)
  const explanation = [
    ...pre.notes,
    `Pre-cap reward: ${pre.rawReward} ${pre.kind === 'cashback' ? purchase.currency : 'units'}.`,
    ...cap.notes,
    `Valuation: ${valued.path} → ${valued.effectiveValue} ${purchase.currency}.`,
  ]
  if (offerValue > 0) {
    explanation.push(`Offer value added: ${offerValue} ${purchase.currency}.`)
  }
  explanation.push(`Total effective value: ${totalValue} ${purchase.currency}.`)

  return {
    eligible: true,
    kind: pre.kind,
    rawReward: pre.rawReward,
    rawRewardAfterCap: cap.afterCap,
    baseComponent: pre.baseComponent,
    categoryComponent: pre.categoryComponent,
    merchantMultiplierApplied: pre.merchantMultiplierApplied,
    cap,
    effectiveValue: valued.effectiveValue,
    valuationPath: valued.path,
    offerValue,
    totalValue,
    explanation,
    verification: profile.verification,
  }
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}
