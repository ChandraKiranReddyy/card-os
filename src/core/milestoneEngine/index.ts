import type { Transaction } from '../../types/transaction'
import type { MilestoneProgress, UserMilestone } from '../../types/optimization'

function startOfPeriod(period: UserMilestone['period'], now: Date): Date {
  const d = new Date(now)
  if (period === 'monthly') {
    return new Date(d.getFullYear(), d.getMonth(), 1)
  }
  if (period === 'quarterly') {
    const q = Math.floor(d.getMonth() / 3) * 3
    return new Date(d.getFullYear(), q, 1)
  }
  if (period === 'annual') {
    return new Date(d.getFullYear(), 0, 1)
  }
  // custom: last 365 days
  const x = new Date(d)
  x.setDate(x.getDate() - 365)
  return x
}

export function spendTowardMilestone(
  milestone: UserMilestone,
  transactions: Transaction[],
  now = new Date(),
): number {
  const start = startOfPeriod(milestone.period, now)
  return transactions
    .filter((t) => {
      if (milestone.cardId && t.cardId !== milestone.cardId) return false
      const td = new Date(t.date)
      return td >= start && td <= now
    })
    .reduce((s, t) => s + t.amount, 0)
}

export function getMilestoneProgress(
  milestone: UserMilestone,
  transactions: Transaction[],
  now = new Date(),
): MilestoneProgress {
  const currentSpend = spendTowardMilestone(milestone, transactions, now)
  const remaining = Math.max(0, milestone.targetSpend - currentSpend)
  const progressPct = milestone.targetSpend > 0
    ? Math.min(100, Math.round((currentSpend / milestone.targetSpend) * 100))
    : 0

  return {
    milestone,
    currentSpend: round2(currentSpend),
    remaining: round2(remaining),
    progressPct,
    wouldCompleteWith: (purchaseAmount: number) =>
      currentSpend < milestone.targetSpend &&
      currentSpend + purchaseAmount >= milestone.targetSpend,
  }
}

/**
 * If this purchase would complete an incomplete milestone, contribute its rewardValue.
 * Already-completed milestones contribute 0.
 */
export function milestoneBonusForPurchase(
  milestones: UserMilestone[],
  transactions: Transaction[],
  cardId: string,
  purchaseAmount: number,
  now = new Date(),
): { bonus: number; notes: string[]; progress: MilestoneProgress[] } {
  const notes: string[] = []
  let bonus = 0
  const progress: MilestoneProgress[] = []

  for (const m of milestones) {
    if (!m.active) continue
    if (m.cardId && m.cardId !== cardId) continue
    const p = getMilestoneProgress(m, transactions, now)
    progress.push(p)
    if (p.wouldCompleteWith(purchaseAmount)) {
      bonus += m.rewardValue
      notes.push(
        `Completing “${m.name}” (${p.currentSpend}→${p.currentSpend + purchaseAmount} / ${m.targetSpend}) adds ≈ ${m.rewardValue}`,
      )
    } else if (p.progressPct >= 70 && p.remaining > 0) {
      notes.push(
        `Milestone “${m.name}” at ${p.progressPct}% — ${p.remaining} remaining`,
      )
    }
  }

  return { bonus: round2(bonus), notes, progress }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
