import type { CardRecommendation, PurchaseInput } from './engine'

export type AnalysisStepId =
  | 'merchant'
  | 'category'
  | 'eligibility'
  | 'caps'
  | 'offers'
  | 'rewards'
  | 'preferences'

export type AnalysisStepStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped'

export interface AnalysisStep {
  id: AnalysisStepId
  label: string
  status: AnalysisStepStatus
  detail?: string
}

export interface UrlParseResult {
  rawUrl: string
  supported: boolean
  merchantId: string | null
  merchantName: string | null
  productName: string | null
  price: number | null
  category: string | null
  country: string | null
  currency: string
  confidence: {
    merchant: number
    product: number
    price: number
    category: number
  }
  notes: string[]
  /** True when user must complete fields before ranking */
  needsManualCompletion: boolean
  missingFields: Array<'merchant' | 'product' | 'price' | 'category'>
}

export interface PurchaseDraft {
  url: string
  merchant: string
  product: string
  price: number | null
  category: string
  country: string
  currency: string
  offerValue: number
  parse: UrlParseResult | null
}

export interface AnalysisResult {
  purchase: PurchaseInput & { product: string; url: string }
  offerValue: number
  recommendations: CardRecommendation[]
  winner: CardRecommendation | null
  winnerReason: string[]
  usedFixtures: boolean
  analyzedAt: string
}
