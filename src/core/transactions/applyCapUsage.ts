import type { EngineCardProfile } from '../../types/engine'
import type { Transaction } from '../../types/transaction'
import { monthlyRewardUsageByCard } from './aggregates'

/**
 * Merge transaction-derived monthly usage into engine card caps.
 * Preserves configured limits; sets `used` from recorded rewards this month
 * (plus any base used already on the profile that isn't from txs is replaced
 * for monthly caps so edit/delete recalculate cleanly).
 */
export function applyTransactionCapUsage(
  profiles: EngineCardProfile[],
  transactions: Transaction[],
  now = new Date(),
): EngineCardProfile[] {
  const usage = monthlyRewardUsageByCard(transactions, now)

  return profiles.map((profile) => {
    const usedFromTx = usage.get(profile.id) ?? 0
    if (!profile.caps.length) return profile

    return {
      ...profile,
      caps: profile.caps.map((cap) => {
        if (cap.period === 'monthly' || cap.period === 'category' || cap.period === 'merchant') {
          // For monthly: used = transaction-derived reward units this month
          if (cap.period === 'monthly') {
            return { ...cap, used: usedFromTx }
          }
        }
        // transaction caps stay per-purchase (engine handles); leave as configured
        if (cap.period === 'transaction') return cap
        if (cap.period === 'quarterly' || cap.period === 'annual') {
          // Approximate: use all-time reward raw for that card (simple V1)
          const allTime = transactions
            .filter((t) => t.cardId === profile.id && t.rewardRaw > 0)
            .reduce((s, t) => s + t.rewardRaw, 0)
          return { ...cap, used: allTime }
        }
        return cap
      }),
    }
  })
}
