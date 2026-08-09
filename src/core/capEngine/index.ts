import type {
  CapApplicationResult,
  EngineCap,
  PurchaseInput,
  RewardKind,
} from '../../types/engine'

function norm(s: string): string {
  return s.trim().toLowerCase()
}

/**
 * Apply caps to a raw reward.
 *
 * Example from spec:
 * Cap ₹5,000, used ₹3,850, remaining ₹1,150.
 * If purchase would generate ₹1,500 → actual eligible ₹1,150.
 */
export function remainingOnCap(cap: EngineCap): number {
  return Math.max(0, cap.limit - cap.used)
}

export function capsApplicable(
  caps: EngineCap[],
  purchase: PurchaseInput,
  kind: RewardKind,
): EngineCap[] {
  const unit = kind === 'cashback' ? 'currency' : 'points'
  return caps.filter((cap) => {
    if (cap.unit !== unit && !(kind === 'cashback' && cap.unit === 'currency')) {
      // miles/points caps use points unit; cashback uses currency
      if (kind !== 'cashback' && cap.unit !== 'points') return false
      if (kind === 'cashback' && cap.unit !== 'currency') return false
    }
    if (cap.period === 'category' && cap.category) {
      if (norm(cap.category) !== norm(purchase.category)) return false
    }
    if (cap.period === 'merchant' && cap.merchant) {
      const m = norm(purchase.merchant)
      const cm = norm(cap.merchant)
      if (!(m === cm || m.includes(cm) || cm.includes(m))) return false
    }
    return true
  })
}

export function applyCaps(
  rawReward: number,
  caps: EngineCap[],
  purchase: PurchaseInput,
  kind: RewardKind,
): CapApplicationResult {
  if (rawReward <= 0) {
    return {
      beforeCap: rawReward,
      afterCap: 0,
      clipped: 0,
      remainingCap: null,
      appliedCapIds: [],
      notes: ['No positive reward to cap.'],
    }
  }

  const applicable = capsApplicable(caps, purchase, kind)
  if (!applicable.length) {
    return {
      beforeCap: rawReward,
      afterCap: rawReward,
      clipped: 0,
      remainingCap: null,
      appliedCapIds: [],
      notes: ['No applicable caps.'],
    }
  }

  let current = rawReward
  const notes: string[] = []
  const appliedCapIds: string[] = []
  let tightestRemaining: number | null = null

  for (const cap of applicable) {
    const remaining = remainingOnCap(cap)
    tightestRemaining =
      tightestRemaining == null
        ? remaining
        : Math.min(tightestRemaining, remaining)

    if (current > remaining) {
      notes.push(
        `Cap “${cap.id}” (${cap.period}): limit ${cap.limit}, used ${cap.used}, remaining ${remaining}. Clipped ${round2(current - remaining)}.`,
      )
      current = remaining
      appliedCapIds.push(cap.id)
    } else {
      notes.push(
        `Cap “${cap.id}” (${cap.period}): remaining ${remaining} — no clip.`,
      )
      appliedCapIds.push(cap.id)
    }
  }

  return {
    beforeCap: round4(rawReward),
    afterCap: round4(current),
    clipped: round4(Math.max(0, rawReward - current)),
    remainingCap: tightestRemaining,
    appliedCapIds,
    notes,
  }
}

/** Project cap utilization after awarding `rewardAfterCap` */
export function projectCapUsage(
  caps: EngineCap[],
  rewardAfterCap: number,
  purchase: PurchaseInput,
  kind: RewardKind,
): EngineCap[] {
  const applicableIds = new Set(
    capsApplicable(caps, purchase, kind).map((c) => c.id),
  )
  return caps.map((cap) => {
    if (!applicableIds.has(cap.id)) return cap
    return {
      ...cap,
      used: round4(cap.used + rewardAfterCap),
    }
  })
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}
