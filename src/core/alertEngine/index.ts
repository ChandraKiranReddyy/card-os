import type { EngineCardProfile } from '../../types/engine'
import type { Transaction } from '../../types/transaction'
import type {
  AppAlert,
  UserBenefit,
  UserMilestone,
} from '../../types/optimization'
import { getMilestoneProgress } from '../milestoneEngine'
import { applyTransactionCapUsage } from '../transactions/applyCapUsage'

/**
 * Non-intrusive, derived alerts — no push spam, computed on read.
 */
export function generateAlerts(options: {
  profiles: EngineCardProfile[]
  transactions: Transaction[]
  milestones: UserMilestone[]
  benefits: UserBenefit[]
  /** Optional: if second-best is close to winner in last analysis */
  lastRanking?: Array<{ cardId: string; label: string; effectiveValue: number; eligible: boolean }>
  now?: Date
}): AppAlert[] {
  const now = options.now ?? new Date()
  const alerts: AppAlert[] = []
  const profiles = applyTransactionCapUsage(
    options.profiles,
    options.transactions,
    now,
  )

  // Caps
  for (const p of profiles) {
    for (const cap of p.caps) {
      if (cap.limit <= 0) continue
      const pct = (cap.used / cap.limit) * 100
      if (pct >= 100) {
        alerts.push({
          id: `cap-reached-${p.id}-${cap.id}`,
          kind: 'cap_reached',
          severity: 'critical',
          title: `Cap reached · ${p.label}`,
          body: `${cap.period} cap ${cap.limit} is fully used (${cap.used}). Further rewards may be ₹0.`,
          href: '/wallet',
        })
      } else if (pct >= 80) {
        alerts.push({
          id: `cap-approach-${p.id}-${cap.id}`,
          kind: 'cap_approaching',
          severity: 'warning',
          title: `Cap approaching · ${p.label}`,
          body: `${Math.round(pct)}% of ${cap.period} cap used (${cap.used}/${cap.limit}).`,
          href: '/rewards',
        })
      }
    }
  }

  // Milestones
  for (const m of options.milestones.filter((x) => x.active)) {
    const prog = getMilestoneProgress(m, options.transactions, now)
    if (prog.progressPct >= 100) continue
    if (prog.progressPct >= 75) {
      alerts.push({
        id: `ms-${m.id}`,
        kind: 'milestone_approaching',
        severity: 'info',
        title: `Milestone nearing · ${m.name}`,
        body: `${prog.progressPct}% · ${prog.remaining} remaining to unlock ≈ ${m.rewardValue}.`,
        href: '/benefits',
      })
    }
  }

  // Benefits expiring within 14 days
  const in14 = now.getTime() + 14 * 24 * 60 * 60 * 1000
  for (const b of options.benefits) {
    if (b.status !== 'active' || !b.expiry) continue
    const exp = new Date(b.expiry).getTime()
    if (exp >= now.getTime() && exp <= in14) {
      alerts.push({
        id: `ben-exp-${b.id}`,
        kind: 'benefit_expiring',
        severity: 'warning',
        title: `Benefit expiring · ${b.name}`,
        body: `Expires ${b.expiry.slice(0, 10)}. ${b.eligibility || ''}`.trim(),
        href: '/benefits',
      })
    }
  }

  // Better card: if last ranking has close runner-up within 10%
  const ranking = options.lastRanking?.filter((r) => r.eligible) ?? []
  if (ranking.length >= 2) {
    const [a, b] = ranking
    if (a.effectiveValue > 0) {
      const gap = (a.effectiveValue - b.effectiveValue) / a.effectiveValue
      if (gap > 0 && gap <= 0.1) {
        alerts.push({
          id: `better-close-${a.cardId}-${b.cardId}`,
          kind: 'better_card',
          severity: 'info',
          title: 'Close call on last analysis',
          body: `${a.label} led ${b.label} by only ${(gap * 100).toFixed(1)}%. Re-check if an offer applies.`,
          href: '/analyze',
        })
      }
    }
  }

  // Dedupe by id, cap list length for non-intrusive UI
  const seen = new Set<string>()
  return alerts.filter((a) => {
    if (seen.has(a.id)) return false
    seen.add(a.id)
    return true
  }).slice(0, 8)
}
