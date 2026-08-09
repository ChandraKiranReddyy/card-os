/** Verification status for catalog / user financial fields */
export type VerificationStatus =
  | 'verified'
  | 'user_provided'
  | 'requires_verification'
  | 'estimated'

export interface VerificationMeta {
  status: VerificationStatus
  lastVerified: string | null
  source: string | null
  notes?: string
}

export interface RewardRuleStub {
  id: string
  description: string
  /** Intentionally optional — do not invent rates */
  rate?: number | null
  unit?: string | null
  categories?: string[]
  merchants?: string[]
  verification: VerificationMeta
}

export interface CapStub {
  id: string
  description: string
  amount?: number | null
  period?: 'transaction' | 'monthly' | 'quarterly' | 'annual' | 'unknown'
  currency?: string
  verification: VerificationMeta
}

export interface BenefitStub {
  id: string
  name: string
  description?: string
  verification: VerificationMeta
}

export interface MilestoneStub {
  id: string
  description: string
  threshold?: number | null
  currency?: string
  verification: VerificationMeta
}

export interface OfferStub {
  id: string
  description: string
  verification: VerificationMeta
}

/**
 * Catalog card — extensible, global-ready.
 * Reward arithmetic fields are stubs until Phase 3 engines + verified data.
 */
export interface CatalogCard {
  id: string
  country: string
  issuer: string
  name: string
  variant?: string
  network: string
  annualFee: number | null
  currency: string
  rewardCurrency: string
  rewardRules: RewardRuleStub[]
  caps: CapStub[]
  categories: string[]
  exclusions: string[]
  benefits: BenefitStub[]
  milestones: MilestoneStub[]
  offers: OfferStub[]
  verification: VerificationMeta
  /** UI presentation only */
  presentation?: {
    gradient?: string
    accent?: string
  }
}

export interface CardCatalogFile {
  version: string
  country: string
  currency: string
  generatedFor: string
  disclaimer: string
  cards: CatalogCard[]
}

/**
 * A card instance in the user's wallet (persisted locally).
 * Never stores full PAN, CVV, PIN, or OTP.
 */
export interface WalletCard {
  walletId: string
  catalogCardId: string | null
  isCustom: boolean
  country: string
  issuer: string
  name: string
  variant: string
  network: string
  nickname: string
  annualFee: number | null
  currency: string
  rewardCurrency: string
  rewardType: string
  rewardRate: number | null
  eligibleCategories: string
  exclusions: string
  merchantRules: string
  redemptionValues: string
  capsNotes: string
  milestonesNotes: string
  benefitsNotes: string
  gradient: string
  accent: string
  verification: VerificationMeta
  addedAt: string
  updatedAt: string
}

export interface WalletCardInput {
  catalogCardId?: string | null
  isCustom: boolean
  country: string
  issuer: string
  name: string
  variant?: string
  network: string
  nickname?: string
  annualFee?: number | null
  currency?: string
  rewardCurrency?: string
  rewardType?: string
  rewardRate?: number | null
  eligibleCategories?: string
  exclusions?: string
  merchantRules?: string
  redemptionValues?: string
  capsNotes?: string
  milestonesNotes?: string
  benefitsNotes?: string
  gradient?: string
  accent?: string
}

export interface CardMatchResult {
  card: CatalogCard
  score: number
  /** When true, UI must not auto-select */
  uncertain: boolean
}
