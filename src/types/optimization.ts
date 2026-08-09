import type { VerificationMeta } from './card'

export type OfferType =
  | 'bank'
  | 'merchant'
  | 'instant_discount'
  | 'reward_multiplier'

export interface UserOffer {
  id: string
  type: OfferType
  name: string
  issuer: string
  /** Empty = any wallet/fixture card */
  cardId: string
  merchant: string
  category: string
  minSpend: number
  /** Percent off purchase (instant discount) */
  discountPercent: number | null
  /** Flat currency discount */
  discountFlat: number | null
  maxDiscount: number | null
  /** Multiplier on reward units e.g. 2 = 2× */
  rewardMultiplier: number | null
  validFrom: string
  validTo: string
  eligibilityNotes: string
  active: boolean
  verification: VerificationMeta
  createdAt: string
  updatedAt: string
}

export type MilestonePeriod = 'monthly' | 'quarterly' | 'annual' | 'custom'

export interface UserMilestone {
  id: string
  name: string
  /** Empty = whole wallet spend */
  cardId: string
  period: MilestonePeriod
  targetSpend: number
  /** User-estimated value when milestone is hit (currency) */
  rewardValue: number
  currency: string
  active: boolean
  notes: string
  verification: VerificationMeta
  createdAt: string
  updatedAt: string
}

export type BenefitStatus = 'active' | 'used' | 'expired'

export interface UserBenefit {
  id: string
  name: string
  description: string
  value: number | null
  currency: string
  eligibility: string
  expiry: string | null
  status: BenefitStatus
  cardId: string
  verification: VerificationMeta
  createdAt: string
  updatedAt: string
}

export type AlertKind =
  | 'cap_approaching'
  | 'cap_reached'
  | 'milestone_approaching'
  | 'better_card'
  | 'benefit_expiring'

export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface AppAlert {
  id: string
  kind: AlertKind
  severity: AlertSeverity
  title: string
  body: string
  href?: string
}

export interface OfferEvaluation {
  offerId: string
  offerName: string
  applicable: boolean
  discountValue: number
  rewardMultiplier: number
  notes: string[]
}

export interface MilestoneProgress {
  milestone: UserMilestone
  currentSpend: number
  remaining: number
  progressPct: number
  wouldCompleteWith: (purchaseAmount: number) => boolean
}
