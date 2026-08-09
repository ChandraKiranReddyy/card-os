import type { VerificationMeta } from './card'

/** Purchase input for deterministic calculation (Phase 3+) */
export interface PurchaseInput {
  amount: number
  currency: string
  merchant: string
  category: string
  country?: string
}

export type RewardKind = 'cashback' | 'points' | 'miles'

/**
 * Normalized rule used only by engines.
 * Rates must come from user-provided or explicitly labeled fixture data — never invented bank rates.
 */
export interface EngineRewardRule {
  id: string
  kind: RewardKind
  /**
   * cashback → percent of spend (5 = 5%)
   * points/miles → units earned per 100 currency (2 = 2 pts / ₹100)
   */
  rate: number
  categories: string[] // empty = all categories (unless excluded)
  merchants: string[] // empty = all merchants; non-empty = only these (case-insensitive)
  /** Multiplier applied after base/category rate when merchant matches */
  merchantMultiplier: number
  verification: VerificationMeta
}

export type CapPeriod =
  | 'transaction'
  | 'monthly'
  | 'quarterly'
  | 'annual'
  | 'category'
  | 'merchant'

/**
 * Caps limit reward in **currency value** for cashback,
 * or **raw points/miles units** for points/miles (converted later).
 */
export interface EngineCap {
  id: string
  period: CapPeriod
  limit: number
  used: number
  category?: string
  merchant?: string
  /** What the cap measures */
  unit: 'currency' | 'points'
  verification: VerificationMeta
}

export interface RedemptionValues {
  /** Currency value of 1 point/mile */
  travel: number
  hotels: number
  voucher: number
  cashback: number
  shopping: number
}

export type PreferenceKey =
  | 'travel'
  | 'cashback'
  | 'hotels'
  | 'shopping'
  | 'maximumValue'

export interface UserPreferenceWeights {
  travel: number
  cashback: number
  hotels: number
  shopping: number
  /** When high, rank purely by max effective value */
  maximumValue: number
}

export interface EngineCardProfile {
  id: string
  label: string
  currency: string
  rewardCurrency: string
  rules: EngineRewardRule[]
  exclusions: {
    categories: string[]
    merchants: string[]
  }
  caps: EngineCap[]
  redemption: RedemptionValues
  source: 'wallet' | 'fixture'
  verification: VerificationMeta
}

export interface CapApplicationResult {
  beforeCap: number
  afterCap: number
  clipped: number
  remainingCap: number | null
  appliedCapIds: string[]
  notes: string[]
}

export interface RewardBreakdown {
  eligible: boolean
  ineligibilityReason?: string
  kind: RewardKind | 'none'
  /** Raw units: cashback currency amount OR points/miles count before valuation */
  rawReward: number
  /** After caps */
  rawRewardAfterCap: number
  baseComponent: number
  categoryComponent: number
  merchantMultiplierApplied: number
  cap: CapApplicationResult
  /** Currency effective value after valuation + preferences */
  effectiveValue: number
  valuationPath: string
  offerValue: number
  totalValue: number
  explanation: string[]
  verification: VerificationMeta
}

export interface CardRecommendation {
  rank: number
  cardId: string
  label: string
  breakdown: RewardBreakdown
  estimatedRewardLabel: string
  effectiveValue: number
  capImpact: string
  offerValue: number
  explanation: string[]
  source: 'wallet' | 'fixture'
}
