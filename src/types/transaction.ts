export interface Transaction {
  id: string
  date: string // ISO
  merchant: string
  product: string
  amount: number
  currency: string
  category: string
  /** Wallet card id or fixture id */
  cardId: string
  cardLabel: string
  offerValue: number
  /** Raw reward units after caps (cashback currency or points) */
  rewardRaw: number
  rewardKind: 'cashback' | 'points' | 'miles' | 'none'
  /** Effective currency value */
  effectiveValue: number
  /** Optional source URL */
  url?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type TransactionInput = Omit<
  Transaction,
  'id' | 'createdAt' | 'updatedAt'
> & {
  id?: string
}

export interface SpendingAggregates {
  totalSpending: number
  totalRewardsEffective: number
  totalOfferValue: number
  byCard: Array<{ cardId: string; cardLabel: string; spending: number; rewards: number }>
  byCategory: Array<{ category: string; spending: number; color: string }>
  count: number
}
