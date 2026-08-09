import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  UserBenefit,
  UserMilestone,
  UserOffer,
} from '../types/optimization'
import {
  emptyOptimization,
  loadOptimizationSync,
  saveOptimizationSync,
  type OptimizationSnapshot,
} from './optimizationStorage'

type OfferInput = Omit<UserOffer, 'id' | 'createdAt' | 'updatedAt' | 'verification'> & {
  id?: string
}
type MilestoneInput = Omit<
  UserMilestone,
  'id' | 'createdAt' | 'updatedAt' | 'verification' | 'currency'
> & { id?: string; currency?: string }
type BenefitInput = Omit<
  UserBenefit,
  'id' | 'createdAt' | 'updatedAt' | 'verification' | 'currency'
> & { id?: string; currency?: string }

interface OptimizationContextValue {
  offers: UserOffer[]
  milestones: UserMilestone[]
  benefits: UserBenefit[]
  addOffer: (input: OfferInput) => UserOffer
  updateOffer: (id: string, patch: Partial<OfferInput>) => void
  removeOffer: (id: string) => void
  addMilestone: (input: MilestoneInput) => UserMilestone
  updateMilestone: (id: string, patch: Partial<MilestoneInput>) => void
  removeMilestone: (id: string) => void
  addBenefit: (input: BenefitInput) => UserBenefit
  updateBenefit: (id: string, patch: Partial<BenefitInput>) => void
  removeBenefit: (id: string) => void
}

const OptimizationContext = createContext<OptimizationContextValue | null>(null)

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

const userVer = {
  status: 'user_provided' as const,
  lastVerified: null,
  source: 'user',
  notes: 'User-provided optimization data',
}

export function OptimizationProvider({ children }: { children: ReactNode }) {
  const [snap, setSnap] = useState<OptimizationSnapshot>(() => loadOptimizationSync())

  const persist = useCallback((next: OptimizationSnapshot) => {
    saveOptimizationSync(next)
    setSnap({ ...next, updatedAt: new Date().toISOString() })
  }, [])

  const addOffer = useCallback(
    (input: OfferInput) => {
      const now = new Date().toISOString()
      const offer: UserOffer = {
        id: input.id || uid('off'),
        type: input.type,
        name: input.name.trim(),
        issuer: input.issuer.trim(),
        cardId: input.cardId || '',
        merchant: input.merchant || '',
        category: input.category || '',
        minSpend: input.minSpend || 0,
        discountPercent: input.discountPercent,
        discountFlat: input.discountFlat,
        maxDiscount: input.maxDiscount,
        rewardMultiplier: input.rewardMultiplier,
        validFrom: input.validFrom,
        validTo: input.validTo,
        eligibilityNotes: input.eligibilityNotes || '',
        active: input.active ?? true,
        verification: userVer,
        createdAt: now,
        updatedAt: now,
      }
      persist({ ...snap, offers: [offer, ...snap.offers] })
      return offer
    },
    [persist, snap],
  )

  const updateOffer = useCallback(
    (id: string, patch: Partial<OfferInput>) => {
      persist({
        ...snap,
        offers: snap.offers.map((o) =>
          o.id === id
            ? {
                ...o,
                ...patch,
                name: patch.name?.trim() ?? o.name,
                issuer: patch.issuer?.trim() ?? o.issuer,
                updatedAt: new Date().toISOString(),
              }
            : o,
        ),
      })
    },
    [persist, snap],
  )

  const removeOffer = useCallback(
    (id: string) => {
      persist({ ...snap, offers: snap.offers.filter((o) => o.id !== id) })
    },
    [persist, snap],
  )

  const addMilestone = useCallback(
    (input: MilestoneInput) => {
      const now = new Date().toISOString()
      const m: UserMilestone = {
        id: input.id || uid('ms'),
        name: input.name.trim(),
        cardId: input.cardId || '',
        period: input.period,
        targetSpend: input.targetSpend,
        rewardValue: input.rewardValue,
        currency: input.currency || 'INR',
        active: input.active ?? true,
        notes: input.notes || '',
        verification: userVer,
        createdAt: now,
        updatedAt: now,
      }
      persist({ ...snap, milestones: [m, ...snap.milestones] })
      return m
    },
    [persist, snap],
  )

  const updateMilestone = useCallback(
    (id: string, patch: Partial<MilestoneInput>) => {
      persist({
        ...snap,
        milestones: snap.milestones.map((m) =>
          m.id === id
            ? {
                ...m,
                ...patch,
                name: patch.name?.trim() ?? m.name,
                updatedAt: new Date().toISOString(),
              }
            : m,
        ),
      })
    },
    [persist, snap],
  )

  const removeMilestone = useCallback(
    (id: string) => {
      persist({
        ...snap,
        milestones: snap.milestones.filter((m) => m.id !== id),
      })
    },
    [persist, snap],
  )

  const addBenefit = useCallback(
    (input: BenefitInput) => {
      const now = new Date().toISOString()
      const b: UserBenefit = {
        id: input.id || uid('ben'),
        name: input.name.trim(),
        description: input.description || '',
        value: input.value,
        currency: input.currency || 'INR',
        eligibility: input.eligibility || '',
        expiry: input.expiry,
        status: input.status || 'active',
        cardId: input.cardId || '',
        verification: userVer,
        createdAt: now,
        updatedAt: now,
      }
      persist({ ...snap, benefits: [b, ...snap.benefits] })
      return b
    },
    [persist, snap],
  )

  const updateBenefit = useCallback(
    (id: string, patch: Partial<BenefitInput>) => {
      persist({
        ...snap,
        benefits: snap.benefits.map((b) =>
          b.id === id
            ? {
                ...b,
                ...patch,
                name: patch.name?.trim() ?? b.name,
                updatedAt: new Date().toISOString(),
              }
            : b,
        ),
      })
    },
    [persist, snap],
  )

  const removeBenefit = useCallback(
    (id: string) => {
      persist({
        ...snap,
        benefits: snap.benefits.filter((b) => b.id !== id),
      })
    },
    [persist, snap],
  )

  const value = useMemo(
    () => ({
      offers: snap.offers,
      milestones: snap.milestones,
      benefits: snap.benefits,
      addOffer,
      updateOffer,
      removeOffer,
      addMilestone,
      updateMilestone,
      removeMilestone,
      addBenefit,
      updateBenefit,
      removeBenefit,
    }),
    [
      snap,
      addOffer,
      updateOffer,
      removeOffer,
      addMilestone,
      updateMilestone,
      removeMilestone,
      addBenefit,
      updateBenefit,
      removeBenefit,
    ],
  )

  return (
    <OptimizationContext.Provider value={value}>
      {children}
    </OptimizationContext.Provider>
  )
}

export function useOptimization() {
  const ctx = useContext(OptimizationContext)
  if (!ctx) throw new Error('useOptimization must be used within OptimizationProvider')
  return ctx
}

// silence unused emptyOptimization in production tree-shaking edge cases
void emptyOptimization
