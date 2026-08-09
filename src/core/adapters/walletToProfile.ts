import type { WalletCard } from '../../types/card'
import type {
  EngineCap,
  EngineCardProfile,
  EngineRewardRule,
  RedemptionValues,
  RewardKind,
} from '../../types/engine'
import { DEFAULT_REDEMPTION } from '../valuationEngine'

function splitList(raw: string): string[] {
  return raw
    .split(/[,;|/]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function detectKind(rewardType: string, rewardCurrency: string): RewardKind {
  const t = `${rewardType} ${rewardCurrency}`.toLowerCase()
  if (t.includes('mile')) return 'miles'
  if (t.includes('cash')) return 'cashback'
  if (t.includes('point') || t.includes('rp') || t.includes('edge')) return 'points'
  // default: if rate looks like small percent assume cashback when type empty
  return t.includes('reward') ? 'points' : 'cashback'
}

/**
 * Parse capsNotes formats:
 * - monthly:5000:3850
 * - monthly:5000
 * - transaction:500
 * - category:Shopping:1000:200
 * - merchant:Amazon:500:0
 * Multiple caps separated by ; or newline
 */
export function parseCapsNotes(
  notes: string,
  unit: 'currency' | 'points',
): EngineCap[] {
  if (!notes.trim()) return []
  const parts = notes.split(/[;\n]+/).map((s) => s.trim()).filter(Boolean)
  const caps: EngineCap[] = []

  for (const part of parts) {
    const segs = part.split(':').map((s) => s.trim())
    if (segs.length < 2) continue
    const periodRaw = segs[0].toLowerCase()
    let period: EngineCap['period'] = 'monthly'
    let category: string | undefined
    let merchant: string | undefined
    let limit = 0
    let used = 0

    if (
      periodRaw === 'monthly' ||
      periodRaw === 'quarterly' ||
      periodRaw === 'annual' ||
      periodRaw === 'transaction'
    ) {
      period = periodRaw
      limit = Number(segs[1])
      used = segs[2] != null ? Number(segs[2]) : 0
    } else if (periodRaw === 'category' && segs.length >= 3) {
      period = 'category'
      category = segs[1]
      limit = Number(segs[2])
      used = segs[3] != null ? Number(segs[3]) : 0
    } else if (periodRaw === 'merchant' && segs.length >= 3) {
      period = 'merchant'
      merchant = segs[1]
      limit = Number(segs[2])
      used = segs[3] != null ? Number(segs[3]) : 0
    } else {
      continue
    }

    if (!Number.isFinite(limit) || limit <= 0) continue
    if (!Number.isFinite(used) || used < 0) used = 0

    caps.push({
      id: `cap-${period}-${category || merchant || 'all'}-${limit}`,
      period,
      limit,
      used,
      category,
      merchant,
      unit,
      verification: {
        status: 'user_provided',
        lastVerified: null,
        source: 'wallet.capsNotes',
      },
    })
  }
  return caps
}

/**
 * Parse redemptionValues:
 * travel:1, hotels:0.9, voucher:0.6, cashback:0.25, shopping:0.5
 */
export function parseRedemptionValues(raw: string): RedemptionValues {
  const base = { ...DEFAULT_REDEMPTION }
  if (!raw.trim()) return base
  for (const part of raw.split(/[,;]/)) {
    const [k, v] = part.split(':').map((s) => s.trim())
    if (!k || v == null) continue
    const num = Number(v)
    if (!Number.isFinite(num)) continue
    const key = k.toLowerCase()
    if (key in base) {
      ;(base as Record<string, number>)[key] = num
    }
  }
  return base
}

/**
 * Convert a wallet card into an engine profile using only user-provided fields.
 * Cards without a rewardRate produce an empty ruleset (ineligible until configured).
 */
export function walletCardToProfile(card: WalletCard): EngineCardProfile {
  const kind = detectKind(card.rewardType, card.rewardCurrency)
  const unit = kind === 'cashback' ? 'currency' : 'points'
  const categories = splitList(card.eligibleCategories)
  const merchants = splitList(card.merchantRules)
  const exclusionCats = splitList(card.exclusions).filter(
    (x) => !x.toLowerCase().startsWith('merchant:'),
  )
  const exclusionMerchants = splitList(card.exclusions)
    .filter((x) => x.toLowerCase().startsWith('merchant:'))
    .map((x) => x.split(':').slice(1).join(':').trim())
    .concat(
      // also allow plain merchant names only if prefixed — keep categories as categories
    )

  const rules: EngineRewardRule[] = []
  if (card.rewardRate != null && Number.isFinite(card.rewardRate) && card.rewardRate > 0) {
    rules.push({
      id: `${card.walletId}-primary`,
      kind,
      rate: card.rewardRate,
      categories,
      merchants: merchants.length ? merchants : [],
      merchantMultiplier: 1,
      verification: {
        status: 'user_provided',
        lastVerified: null,
        source: 'wallet.rewardRate',
        notes: 'User-provided rate — not a verified bank rule.',
      },
    })
  }

  // Optional category boost syntax in eligibleCategories is not used;
  // advanced multi-rules deferred — primary rate + category allowlist is enough for Phase 3.

  return {
    id: card.walletId,
    label: card.nickname || `${card.issuer} ${card.name}`,
    currency: card.currency || 'INR',
    rewardCurrency: card.rewardCurrency,
    rules,
    exclusions: {
      categories: exclusionCats,
      merchants: exclusionMerchants,
    },
    caps: parseCapsNotes(card.capsNotes, unit),
    redemption: parseRedemptionValues(card.redemptionValues),
    source: 'wallet',
    verification: card.verification,
  }
}

export function walletCardsToProfiles(cards: WalletCard[]): EngineCardProfile[] {
  return cards.map(walletCardToProfile)
}
