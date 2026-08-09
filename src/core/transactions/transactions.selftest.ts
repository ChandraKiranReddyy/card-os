import { computeSpendingAggregates, monthlyRewardUsageByCard } from './aggregates'
import { applyTransactionCapUsage } from './applyCapUsage'
import { FIXTURE_CARDS } from '../../data/fixtures/engineFixtures'
import type { Transaction } from '../../types/transaction'

function sampleTx(partial: Partial<Transaction> & Pick<Transaction, 'id' | 'cardId'>): Transaction {
  const now = new Date().toISOString()
  return {
    date: now,
    merchant: 'Amazon',
    product: 'Item',
    amount: 1000,
    currency: 'INR',
    category: 'Shopping',
    cardLabel: 'Test',
    offerValue: 0,
    rewardRaw: 50,
    rewardKind: 'cashback',
    effectiveValue: 50,
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export function runTransactionSelfTests(): {
  ok: boolean
  errors: string[]
  logs: string[]
} {
  const errors: string[] = []
  const logs: string[] = []

  const txs: Transaction[] = [
    sampleTx({
      id: '1',
      cardId: 'fx-cap-monthly',
      cardLabel: 'Fixture Capped',
      amount: 10000,
      rewardRaw: 500,
      effectiveValue: 500,
      category: 'Shopping',
    }),
    sampleTx({
      id: '2',
      cardId: 'fx-cap-monthly',
      cardLabel: 'Fixture Capped',
      amount: 5000,
      rewardRaw: 250,
      effectiveValue: 250,
      category: 'Food',
    }),
    sampleTx({
      id: '3',
      cardId: 'fx-cashback-5',
      cardLabel: 'Cashback',
      amount: 2000,
      rewardRaw: 100,
      effectiveValue: 100,
      category: 'Travel',
    }),
  ]

  // Create
  if (txs.length !== 3) errors.push('create count')

  // Aggregates
  const agg = computeSpendingAggregates(txs)
  logs.push(`spend ${agg.totalSpending} rewards ${agg.totalRewardsEffective}`)
  if (agg.totalSpending !== 17000) errors.push(`total spending ${agg.totalSpending}`)
  if (agg.totalRewardsEffective !== 850) errors.push(`rewards ${agg.totalRewardsEffective}`)
  if (agg.byCard.length !== 2) errors.push('byCard length')
  if (agg.byCategory.length !== 3) errors.push('byCategory length')

  // Edit simulation
  const edited = txs.map((t) =>
    t.id === '3' ? { ...t, amount: 3000, effectiveValue: 150, rewardRaw: 150 } : t,
  )
  const agg2 = computeSpendingAggregates(edited)
  if (agg2.totalSpending !== 18000) errors.push(`after edit spend ${agg2.totalSpending}`)

  // Delete simulation
  const deleted = edited.filter((t) => t.id !== '2')
  const agg3 = computeSpendingAggregates(deleted)
  if (agg3.count !== 2) errors.push('after delete count')
  if (agg3.totalSpending !== 13000) errors.push(`after delete spend ${agg3.totalSpending}`)

  // Cap usage from monthly txs
  const usage = monthlyRewardUsageByCard(txs)
  if ((usage.get('fx-cap-monthly') ?? 0) !== 750) {
    errors.push(`monthly usage expected 750 got ${usage.get('fx-cap-monthly')}`)
  }

  const profiles = applyTransactionCapUsage(
    FIXTURE_CARDS.filter((c) => c.id === 'fx-cap-monthly'),
    txs,
  )
  const monthly = profiles[0]?.caps.find((c) => c.period === 'monthly')
  if (!monthly || monthly.used !== 750) {
    errors.push(`cap used expected 750 got ${monthly?.used}`)
  } else {
    logs.push(`cap used ${monthly.used}/${monthly.limit}`)
  }

  // Persistence shape (serialize roundtrip)
  const raw = JSON.stringify({ version: 1, transactions: txs })
  const parsed = JSON.parse(raw) as { transactions: Transaction[] }
  if (parsed.transactions.length !== 3) errors.push('persistence roundtrip')

  return { ok: errors.length === 0, errors, logs }
}
