import type {
  DemoBenefit,
  DemoCard,
  DemoHealthItem,
  DemoStat,
  DemoTransaction,
  SpendSlice,
} from '../types'

/** Phase 1 demo UI objects only — not verified financial data. */
export const DEMO_CARDS: DemoCard[] = [
  {
    id: 'demo-infinia',
    name: 'HDFC Infinia',
    issuer: 'HDFC Bank',
    network: 'Visa Infinite',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #e94560 140%)',
    accent: '#e94560',
    nickname: 'Primary',
  },
  {
    id: 'demo-sbi-cb',
    name: 'SBI Cashback',
    issuer: 'SBI Card',
    network: 'Visa',
    gradient: 'linear-gradient(135deg, #0b3d2e 0%, #145a32 45%, #1e8449 80%, #82e0aa 130%)',
    accent: '#34d399',
    nickname: 'Online',
  },
  {
    id: 'demo-atlas',
    name: 'Axis Atlas',
    issuer: 'Axis Bank',
    network: 'Visa Signature',
    gradient: 'linear-gradient(135deg, #1b1464 0%, #2c2c54 40%, #474787 75%, #706fd3 120%)',
    accent: '#7c8cff',
    nickname: 'Travel',
  },
]

export const DEMO_STATS: DemoStat[] = [
  {
    id: 'est-rewards',
    label: 'Estimated Rewards',
    value: 4820,
    hint: '≈ ESTIMATED · demo',
    tone: 'positive',
  },
  {
    id: 'capacity',
    label: 'Reward Capacity',
    value: 78,
    hint: 'of monthly caps · demo',
    tone: 'accent',
  },
  {
    id: 'potential',
    label: 'Potential Value',
    value: 1240,
    hint: '≈ ESTIMATED · demo',
    tone: 'warning',
  },
  {
    id: 'active',
    label: 'Cards Active',
    value: 3,
    hint: 'in demo wallet',
    tone: 'default',
  },
]

export const DEMO_HEALTH: DemoHealthItem[] = [
  {
    id: 'h1',
    cardName: 'SBI Cashback',
    status: 'cap',
    detail: '₹3,850 / ₹5,000',
    progress: 77,
  },
  {
    id: 'h2',
    cardName: 'HDFC Infinia',
    status: 'healthy',
    detail: 'Healthy',
    progress: 100,
  },
  {
    id: 'h3',
    cardName: 'Axis Atlas',
    status: 'milestone',
    detail: '62% milestone progress',
    progress: 62,
  },
]

export const DEMO_SPEND: SpendSlice[] = [
  { category: 'Shopping', amount: 18500, color: '#7c8cff' },
  { category: 'Food', amount: 9200, color: '#34d399' },
  { category: 'Travel', amount: 15400, color: '#60a5fa' },
  { category: 'Fuel', amount: 4800, color: '#fbbf24' },
  { category: 'Utilities', amount: 6100, color: '#a78bfa' },
  { category: 'Entertainment', amount: 3200, color: '#f472b6' },
  { category: 'Other', amount: 2100, color: '#94a3b8' },
]

export const DEMO_BENEFITS: DemoBenefit[] = [
  {
    id: 'b1',
    title: 'Milestone reward approaching',
    subtitle: 'Axis Atlas — ~₹25k remaining for next tier',
    type: 'milestone',
    due: 'This month',
  },
  {
    id: 'b2',
    title: 'Travel benefit window',
    subtitle: 'Complimentary lounge access window open',
    type: 'travel',
    due: 'Valid now',
  },
  {
    id: 'b3',
    title: 'Partner offer',
    subtitle: 'Merchant partnership period (demo)',
    type: 'offer',
    due: 'Ends in 12 days',
  },
]

export const DEMO_TRANSACTIONS: DemoTransaction[] = [
  {
    id: 't1',
    merchant: 'Amazon',
    category: 'Shopping',
    amount: 4599,
    card: 'SBI Cashback',
    date: 'Today',
    rewardLabel: '≈ ₹230 est.',
  },
  {
    id: 't2',
    merchant: 'Swiggy',
    category: 'Food',
    amount: 680,
    card: 'HDFC Infinia',
    date: 'Yesterday',
    rewardLabel: '≈ ₹34 est.',
  },
  {
    id: 't3',
    merchant: 'MakeMyTrip',
    category: 'Travel',
    amount: 12450,
    card: 'Axis Atlas',
    date: '3 days ago',
    rewardLabel: '≈ ₹498 est.',
  },
  {
    id: 't4',
    merchant: 'Croma',
    category: 'Shopping',
    amount: 8990,
    card: 'HDFC Infinia',
    date: '5 days ago',
    rewardLabel: '≈ ₹450 est.',
  },
]
