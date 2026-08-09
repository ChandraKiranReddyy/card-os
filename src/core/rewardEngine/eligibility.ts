import type { EngineCardProfile, PurchaseInput } from '../../types/engine'

function norm(s: string): string {
  return s.trim().toLowerCase()
}

export function isCategoryExcluded(
  profile: EngineCardProfile,
  category: string,
): boolean {
  const c = norm(category)
  return profile.exclusions.categories.some((x) => norm(x) === c)
}

export function isMerchantExcluded(
  profile: EngineCardProfile,
  merchant: string,
): boolean {
  const m = norm(merchant)
  return profile.exclusions.merchants.some((x) => {
    const nx = norm(x)
    return m === nx || m.includes(nx) || nx.includes(m)
  })
}

export function checkEligibility(
  profile: EngineCardProfile,
  purchase: PurchaseInput,
): { eligible: boolean; reason?: string } {
  if (!(purchase.amount > 0) || !Number.isFinite(purchase.amount)) {
    return { eligible: false, reason: 'Purchase amount must be a positive number.' }
  }
  if (isCategoryExcluded(profile, purchase.category)) {
    return {
      eligible: false,
      reason: `Category “${purchase.category}” is excluded on this card.`,
    }
  }
  if (isMerchantExcluded(profile, purchase.merchant)) {
    return {
      eligible: false,
      reason: `Merchant “${purchase.merchant}” is excluded on this card.`,
    }
  }
  if (!profile.rules.length) {
    return {
      eligible: false,
      reason:
        'No reward rules configured for this card. Add user-provided rates or use a fixture profile.',
    }
  }
  return { eligible: true }
}
