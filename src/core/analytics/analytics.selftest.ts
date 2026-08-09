import {
  buildAnalytics,
  computeWalletEfficiency,
  estimateMissedOpportunity,
  spendingTrendDaily,
  monthlyTrend,
  cardPerformance,
  categoryOptimization,
} from './index'
import type { Transaction } from '../../types/transaction'
import type { WalletCard } from '../../types/card'
import { FIXTURE_CARDS } from '../../data/fixtures/engineFixtures'
import { DEFAULT_PREFERENCE_WEIGHTS } from '../valuationEngine'

function tx(
  partial: Partial<Transaction> & Pick<Transaction, 'id' | 'amount' | 'cardId'>,
): Transaction {
  const now = new Date().toISOString()
  return {
    date: now,
    merchant: 'Amazon',
    product: 'Item',
    currency: 'INR',
    category: 'Shopping',
    cardLabel: 'Card',
    offerValue: 0,
    rewardRaw: 50,
    rewardKind: 'cashback',
    effectiveValue: 50,
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export function runAnalyticsSelfTests(): {
  ok: boolean
  errors: string[]
  logs: string[]
} {
  const errors: string[] = []
  const logs: string[] = []
  const now = new Date()

  const txs: Transaction[] = [
    tx({
      id: '1',
      amount: 10_000,
      cardId: 'fx-cashback-5',
      cardLabel: 'CB5',
      effectiveValue: 200, // suboptimal vs 5% = 500
      rewardRaw: 200,
      category: 'Shopping',
      date: now.toISOString(),
    }),
    tx({
      id: '2',
      amount: 5_000,
      cardId: 'fx-cashback-5',
      cardLabel: 'CB5',
      effectiveValue: 250,
      rewardRaw: 250,
      category: 'Food',
      date: now.toISOString(),
    }),
  ]

  const daily = spendingTrendDaily(txs, 30, now)
  if (daily.length !== 30) errors.push(`daily length ${daily.length}`)
  logs.push(`daily points ${daily.length}`)

  const monthly = monthlyTrend(txs, 6, now)
  if (monthly.length !== 6) errors.push(`monthly length ${monthly.length}`)

  const perf = cardPerformance(txs)
  if (perf[0]?.rewards !== 450) errors.push(`card rewards ${perf[0]?.rewards}`)

  const cats = categoryOptimization(txs)
  if (cats.length !== 2) errors.push('category count')

  const missed = estimateMissedOpportunity(
    txs,
    FIXTURE_CARDS,
    { ...DEFAULT_PREFERENCE_WEIGHTS, maximumValue: 2 },
    now,
  )
  // Best for 10000 shopping: 5% = 500; actual 200 → miss 300
  // Best for 5000 food: 5% = 250; actual 250 → miss 0
  logs.push(`missed ${missed.amount} on ${missed.txCount} tx`)
  if (missed.amount < 250) {
    errors.push(`Expected missed ≥250, got ${missed.amount}`)
  }
  if (missed.label !== '≈ ESTIMATED') errors.push('missed label')

  const wallet: WalletCard[] = [
    {
      walletId: 'w1',
      catalogCardId: null,
      isCustom: true,
      country: 'IN',
      issuer: 'Test',
      name: 'Card',
      variant: '',
      network: 'Visa',
      nickname: 'T',
      annualFee: null,
      currency: 'INR',
      rewardCurrency: 'Cashback',
      rewardType: 'Cashback',
      rewardRate: 5,
      eligibleCategories: '',
      exclusions: '',
      merchantRules: '',
      redemptionValues: '',
      capsNotes: 'monthly:5000:1000',
      milestonesNotes: '',
      benefitsNotes: '',
      gradient: '',
      accent: '',
      verification: {
        status: 'user_provided',
        lastVerified: null,
        source: 'user',
      },
      addedAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ]

  const eff = computeWalletEfficiency(wallet, txs, FIXTURE_CARDS)
  logs.push(`efficiency ${eff.score} ${eff.grade}`)
  if (eff.score < 0 || eff.score > 100) errors.push('efficiency out of range')
  if (eff.components.length !== 4) errors.push('efficiency components')
  if (!eff.formula.includes('0.30')) errors.push('formula missing weights')

  const bundle = buildAnalytics({
    transactions: txs,
    walletCards: wallet,
    profiles: FIXTURE_CARDS,
    preferences: { ...DEFAULT_PREFERENCE_WEIGHTS, maximumValue: 2 },
    now,
  })
  if (bundle.monthSpending <= 0) errors.push('month spending')
  if (!bundle.missedOpportunity) errors.push('bundle missed')

  // reduced motion not applicable; accessibility: ensure no throw on empty
  const empty = buildAnalytics({
    transactions: [],
    walletCards: [],
    profiles: [],
  })
  if (empty.efficiency.score !== 0) errors.push('empty efficiency should be 0')

  return { ok: errors.length === 0, errors, logs }
}
