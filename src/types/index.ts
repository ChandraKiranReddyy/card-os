export type NavId =
  | 'dashboard'
  | 'wallet'
  | 'analyze'
  | 'transactions'
  | 'rewards'
  | 'benefits'
  | 'settings'
  | 'more'

export interface DemoCard {
  id: string
  name: string
  issuer: string
  network: string
  nickname?: string
  gradient: string
  last4Hint?: string
  accent: string
}

export interface DemoStat {
  id: string
  label: string
  value: string | number
  hint?: string
  tone?: 'default' | 'positive' | 'warning' | 'accent'
}

export interface DemoHealthItem {
  id: string
  cardName: string
  status: 'cap' | 'healthy' | 'milestone'
  detail: string
  progress?: number
}

export interface DemoTransaction {
  id: string
  merchant: string
  category: string
  amount: number
  card: string
  date: string
  rewardLabel: string
}

export interface DemoBenefit {
  id: string
  title: string
  subtitle: string
  type: 'milestone' | 'travel' | 'offer'
  due: string
}

export interface SpendSlice {
  category: string
  amount: number
  color: string
}
