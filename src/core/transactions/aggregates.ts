import type { SpendingAggregates, Transaction } from '../../types/transaction'

const CATEGORY_COLORS: Record<string, string> = {
  Shopping: '#7c8cff',
  Food: '#34d399',
  Travel: '#60a5fa',
  Fuel: '#fbbf24',
  Utilities: '#a78bfa',
  Entertainment: '#f472b6',
  Other: '#94a3b8',
}

export function computeSpendingAggregates(
  transactions: Transaction[],
): SpendingAggregates {
  let totalSpending = 0
  let totalRewardsEffective = 0
  let totalOfferValue = 0
  const cardMap = new Map<
    string,
    { cardId: string; cardLabel: string; spending: number; rewards: number }
  >()
  const catMap = new Map<string, number>()

  for (const tx of transactions) {
    totalSpending += tx.amount
    totalRewardsEffective += tx.effectiveValue
    totalOfferValue += tx.offerValue

    const card = cardMap.get(tx.cardId) ?? {
      cardId: tx.cardId,
      cardLabel: tx.cardLabel,
      spending: 0,
      rewards: 0,
    }
    card.spending += tx.amount
    card.rewards += tx.effectiveValue
    card.cardLabel = tx.cardLabel
    cardMap.set(tx.cardId, card)

    catMap.set(tx.category, (catMap.get(tx.category) ?? 0) + tx.amount)
  }

  const byCard = [...cardMap.values()].sort((a, b) => b.spending - a.spending)
  const byCategory = [...catMap.entries()]
    .map(([category, spending]) => ({
      category,
      spending,
      color: CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other,
    }))
    .sort((a, b) => b.spending - a.spending)

  return {
    totalSpending: round2(totalSpending),
    totalRewardsEffective: round2(totalRewardsEffective),
    totalOfferValue: round2(totalOfferValue),
    byCard,
    byCategory,
    count: transactions.length,
  }
}

/** Reward raw units used toward caps for a card in the current calendar month */
export function monthlyRewardUsageByCard(
  transactions: Transaction[],
  now = new Date(),
): Map<string, number> {
  const y = now.getFullYear()
  const m = now.getMonth()
  const map = new Map<string, number>()

  for (const tx of transactions) {
    const d = new Date(tx.date)
    if (d.getFullYear() !== y || d.getMonth() !== m) continue
    if (tx.rewardKind === 'none' || tx.rewardRaw <= 0) continue
    // Cap engine for cashback uses currency units; for points uses points units
    map.set(tx.cardId, (map.get(tx.cardId) ?? 0) + tx.rewardRaw)
  }
  return map
}

export function formatRelativeDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round(
    (startToday.getTime() - startThat.getTime()) / (24 * 60 * 60 * 1000),
  )
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
