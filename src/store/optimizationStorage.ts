import type { UserBenefit, UserMilestone, UserOffer } from '../types/optimization'

const STORAGE_KEY = 'cardos.optimization.v1'

export interface OptimizationSnapshot {
  version: 1
  offers: UserOffer[]
  milestones: UserMilestone[]
  benefits: UserBenefit[]
  updatedAt: string
}

export function emptyOptimization(): OptimizationSnapshot {
  return {
    version: 1,
    offers: [],
    milestones: [],
    benefits: [],
    updatedAt: new Date().toISOString(),
  }
}

export function loadOptimizationSync(): OptimizationSnapshot {
  if (typeof localStorage === 'undefined') return emptyOptimization()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyOptimization()
    const data = JSON.parse(raw) as OptimizationSnapshot
    if (data?.version !== 1) return emptyOptimization()
    return {
      version: 1,
      offers: data.offers ?? [],
      milestones: data.milestones ?? [],
      benefits: data.benefits ?? [],
      updatedAt: data.updatedAt || new Date().toISOString(),
    }
  } catch {
    return emptyOptimization()
  }
}

export function saveOptimizationSync(snapshot: OptimizationSnapshot): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...snapshot, updatedAt: new Date().toISOString() }),
  )
}
