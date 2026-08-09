import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CatalogCard, WalletCard, WalletCardInput } from '../types/card'
import {
  emptyWallet,
  loadWalletSync,
  saveWalletSync,
  type WalletSnapshot,
} from './walletStorage'
import { getCatalogCardById } from '../data/cards/india.v1'

interface WalletContextValue {
  ready: boolean
  country: string
  cards: WalletCard[]
  setCountry: (country: string) => void
  addFromCatalog: (catalog: CatalogCard, nickname?: string) => WalletCard | null
  addCustom: (input: WalletCardInput) => WalletCard
  updateCard: (walletId: string, patch: Partial<WalletCardInput>) => void
  removeCard: (walletId: string) => void
  getCard: (walletId: string) => WalletCard | undefined
  isCatalogInWallet: (catalogCardId: string) => boolean
  clearAll: () => void
}

const WalletContext = createContext<WalletContextValue | null>(null)

function uid(): string {
  return `wc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function defaultPresentation(issuer: string): { gradient: string; accent: string } {
  const key = issuer.toLowerCase()
  if (key.includes('hdfc')) {
    return {
      gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 60%, #e94560 140%)',
      accent: '#e94560',
    }
  }
  if (key.includes('sbi')) {
    return {
      gradient: 'linear-gradient(135deg, #0b3d2e 0%, #1e8449 80%, #82e0aa 130%)',
      accent: '#34d399',
    }
  }
  if (key.includes('axis')) {
    return {
      gradient: 'linear-gradient(135deg, #1b1464 0%, #474787 75%, #706fd3 120%)',
      accent: '#7c8cff',
    }
  }
  return {
    gradient: 'linear-gradient(135deg, #11141c 0%, #1e2433 50%, #7c8cff 130%)',
    accent: '#7c8cff',
  }
}

function fromCatalog(catalog: CatalogCard, nickname?: string): WalletCard {
  const now = new Date().toISOString()
  const presentation = catalog.presentation ?? defaultPresentation(catalog.issuer)
  return {
    walletId: uid(),
    catalogCardId: catalog.id,
    isCustom: false,
    country: catalog.country,
    issuer: catalog.issuer,
    name: catalog.name,
    variant: catalog.variant ?? '',
    network: catalog.network,
    nickname: nickname?.trim() || catalog.name,
    annualFee: catalog.annualFee,
    currency: catalog.currency,
    rewardCurrency: catalog.rewardCurrency,
    rewardType: catalog.rewardCurrency,
    rewardRate: null,
    eligibleCategories: '',
    exclusions: '',
    merchantRules: '',
    redemptionValues: '',
    capsNotes: '',
    milestonesNotes: '',
    benefitsNotes: '',
    gradient: presentation.gradient ?? defaultPresentation(catalog.issuer).gradient,
    accent: presentation.accent ?? defaultPresentation(catalog.issuer).accent,
    verification: {
      status: 'requires_verification',
      lastVerified: null,
      source: 'catalog:india.v1',
      notes:
        'Added from catalog. Financial rules not verified — user may enrich fields (marked user_provided).',
    },
    addedAt: now,
    updatedAt: now,
  }
}

function fromCustom(input: WalletCardInput): WalletCard {
  const now = new Date().toISOString()
  const presentation = defaultPresentation(input.issuer)
  return {
    walletId: uid(),
    catalogCardId: null,
    isCustom: true,
    country: input.country,
    issuer: input.issuer.trim(),
    name: input.name.trim(),
    variant: input.variant?.trim() ?? '',
    network: input.network.trim(),
    nickname: input.nickname?.trim() || input.name.trim(),
    annualFee: input.annualFee ?? null,
    currency: input.currency ?? 'INR',
    rewardCurrency: input.rewardCurrency?.trim() || 'Reward Points',
    rewardType: input.rewardType?.trim() || input.rewardCurrency?.trim() || 'Reward Points',
    rewardRate: input.rewardRate ?? null,
    eligibleCategories: input.eligibleCategories?.trim() ?? '',
    exclusions: input.exclusions?.trim() ?? '',
    merchantRules: input.merchantRules?.trim() ?? '',
    redemptionValues: input.redemptionValues?.trim() ?? '',
    capsNotes: input.capsNotes?.trim() ?? '',
    milestonesNotes: input.milestonesNotes?.trim() ?? '',
    benefitsNotes: input.benefitsNotes?.trim() ?? '',
    gradient: input.gradient ?? presentation.gradient,
    accent: input.accent ?? presentation.accent,
    verification: {
      status: 'user_provided',
      lastVerified: null,
      source: 'user',
      notes: 'Custom card created by user. Not verified against bank sources.',
    },
    addedAt: now,
    updatedAt: now,
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<WalletSnapshot>(() => loadWalletSync())

  const persist = useCallback((next: WalletSnapshot) => {
    saveWalletSync(next)
    setSnapshot({ ...next, updatedAt: new Date().toISOString() })
  }, [])

  const setCountry = useCallback(
    (country: string) => {
      persist({ ...snapshot, country })
    },
    [persist, snapshot],
  )

  const isCatalogInWallet = useCallback(
    (catalogCardId: string) =>
      snapshot.cards.some((c) => c.catalogCardId === catalogCardId),
    [snapshot.cards],
  )

  const addFromCatalog = useCallback(
    (catalog: CatalogCard, nickname?: string) => {
      if (isCatalogInWallet(catalog.id)) return null
      const card = fromCatalog(catalog, nickname)
      persist({ ...snapshot, cards: [card, ...snapshot.cards] })
      return card
    },
    [isCatalogInWallet, persist, snapshot],
  )

  const addCustom = useCallback(
    (input: WalletCardInput) => {
      const card = fromCustom(input)
      persist({ ...snapshot, cards: [card, ...snapshot.cards] })
      return card
    },
    [persist, snapshot],
  )

  const updateCard = useCallback(
    (walletId: string, patch: Partial<WalletCardInput>) => {
      const cards = snapshot.cards.map((c) => {
        if (c.walletId !== walletId) return c
        const next: WalletCard = {
          ...c,
          country: patch.country ?? c.country,
          issuer: patch.issuer?.trim() ?? c.issuer,
          name: patch.name?.trim() ?? c.name,
          variant: patch.variant !== undefined ? patch.variant.trim() : c.variant,
          network: patch.network?.trim() ?? c.network,
          nickname: patch.nickname !== undefined ? patch.nickname.trim() : c.nickname,
          annualFee:
            patch.annualFee !== undefined ? patch.annualFee : c.annualFee,
          currency: patch.currency ?? c.currency,
          rewardCurrency: patch.rewardCurrency?.trim() ?? c.rewardCurrency,
          rewardType: patch.rewardType?.trim() ?? c.rewardType,
          rewardRate:
            patch.rewardRate !== undefined ? patch.rewardRate : c.rewardRate,
          eligibleCategories:
            patch.eligibleCategories !== undefined
              ? patch.eligibleCategories
              : c.eligibleCategories,
          exclusions: patch.exclusions !== undefined ? patch.exclusions : c.exclusions,
          merchantRules:
            patch.merchantRules !== undefined ? patch.merchantRules : c.merchantRules,
          redemptionValues:
            patch.redemptionValues !== undefined
              ? patch.redemptionValues
              : c.redemptionValues,
          capsNotes: patch.capsNotes !== undefined ? patch.capsNotes : c.capsNotes,
          milestonesNotes:
            patch.milestonesNotes !== undefined
              ? patch.milestonesNotes
              : c.milestonesNotes,
          benefitsNotes:
            patch.benefitsNotes !== undefined ? patch.benefitsNotes : c.benefitsNotes,
          updatedAt: new Date().toISOString(),
          verification:
            c.isCustom || patch.nickname !== undefined || patch.rewardRate !== undefined
              ? {
                  ...c.verification,
                  status: c.isCustom ? 'user_provided' : c.verification.status,
                  notes: c.verification.notes,
                }
              : c.verification,
        }
        return next
      })
      persist({ ...snapshot, cards })
    },
    [persist, snapshot],
  )

  const removeCard = useCallback(
    (walletId: string) => {
      persist({
        ...snapshot,
        cards: snapshot.cards.filter((c) => c.walletId !== walletId),
      })
    },
    [persist, snapshot],
  )

  const getCard = useCallback(
    (walletId: string) => snapshot.cards.find((c) => c.walletId === walletId),
    [snapshot.cards],
  )

  const clearAll = useCallback(() => {
    persist(emptyWallet(snapshot.country))
  }, [persist, snapshot.country])

  const value = useMemo<WalletContextValue>(
    () => ({
      ready: true,
      country: snapshot.country,
      cards: snapshot.cards,
      setCountry,
      addFromCatalog,
      addCustom,
      updateCard,
      removeCard,
      getCard,
      isCatalogInWallet,
      clearAll,
    }),
    [
      snapshot.country,
      snapshot.cards,
      setCountry,
      addFromCatalog,
      addCustom,
      updateCard,
      removeCard,
      getCard,
      isCatalogInWallet,
      clearAll,
    ],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}

/** Map wallet card to dashboard visual shape */
export function walletToVisual(card: WalletCard) {
  return {
    id: card.walletId,
    name: card.nickname || `${card.issuer} ${card.name}`,
    issuer: card.issuer,
    network: card.network,
    nickname: card.nickname,
    gradient: card.gradient,
    accent: card.accent,
  }
}

export function resolveCatalog(card: WalletCard): CatalogCard | undefined {
  if (!card.catalogCardId) return undefined
  return getCatalogCardById(card.catalogCardId)
}
