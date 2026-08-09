import type { PurchaseInput } from '../../types/engine'
import type { OfferEvaluation, UserOffer } from '../../types/optimization'

function norm(s: string): string {
  return s.trim().toLowerCase()
}

function inRange(from: string, to: string, now = new Date()): boolean {
  const t = now.getTime()
  const a = from ? new Date(from).getTime() : 0
  // validTo end of day
  const bEnd = to
    ? new Date(to).setHours(23, 59, 59, 999)
    : Number.POSITIVE_INFINITY
  return t >= a && t <= bEnd
}

function matchesField(filter: string, value: string): boolean {
  if (!filter.trim()) return true
  const f = norm(filter)
  const v = norm(value)
  return v === f || v.includes(f) || f.includes(v)
}

/**
 * Deterministic offer evaluation for one offer + purchase + card.
 * Instant discount → currency value; multiplier → reward multiplier (≥1).
 */
export function evaluateOffer(
  offer: UserOffer,
  purchase: PurchaseInput,
  cardId: string,
  now = new Date(),
): OfferEvaluation {
  const notes: string[] = []
  if (!offer.active) {
    return {
      offerId: offer.id,
      offerName: offer.name,
      applicable: false,
      discountValue: 0,
      rewardMultiplier: 1,
      notes: ['Offer inactive'],
    }
  }
  if (!inRange(offer.validFrom, offer.validTo, now)) {
    return {
      offerId: offer.id,
      offerName: offer.name,
      applicable: false,
      discountValue: 0,
      rewardMultiplier: 1,
      notes: ['Outside validity window'],
    }
  }
  if (offer.cardId && offer.cardId !== cardId) {
    return {
      offerId: offer.id,
      offerName: offer.name,
      applicable: false,
      discountValue: 0,
      rewardMultiplier: 1,
      notes: ['Card not eligible for this offer'],
    }
  }
  if (!matchesField(offer.merchant, purchase.merchant)) {
    return {
      offerId: offer.id,
      offerName: offer.name,
      applicable: false,
      discountValue: 0,
      rewardMultiplier: 1,
      notes: ['Merchant mismatch'],
    }
  }
  if (!matchesField(offer.category, purchase.category)) {
    return {
      offerId: offer.id,
      offerName: offer.name,
      applicable: false,
      discountValue: 0,
      rewardMultiplier: 1,
      notes: ['Category mismatch'],
    }
  }
  if (purchase.amount < (offer.minSpend || 0)) {
    return {
      offerId: offer.id,
      offerName: offer.name,
      applicable: false,
      discountValue: 0,
      rewardMultiplier: 1,
      notes: [`Min spend ${offer.minSpend} not met`],
    }
  }

  let discountValue = 0
  let rewardMultiplier = 1

  if (offer.type === 'instant_discount' || offer.type === 'merchant' || offer.type === 'bank') {
    if (offer.discountFlat != null && offer.discountFlat > 0) {
      discountValue = offer.discountFlat
      notes.push(`Flat discount ${discountValue}`)
    } else if (offer.discountPercent != null && offer.discountPercent > 0) {
      discountValue = (purchase.amount * offer.discountPercent) / 100
      notes.push(`${offer.discountPercent}% discount → ${discountValue}`)
    }
    if (offer.maxDiscount != null && offer.maxDiscount > 0) {
      discountValue = Math.min(discountValue, offer.maxDiscount)
      notes.push(`Capped at max discount ${offer.maxDiscount}`)
    }
  }

  if (
    offer.type === 'reward_multiplier' ||
    (offer.rewardMultiplier != null && offer.rewardMultiplier > 1)
  ) {
    rewardMultiplier = offer.rewardMultiplier && offer.rewardMultiplier > 0
      ? offer.rewardMultiplier
      : 1
    notes.push(`Reward multiplier ×${rewardMultiplier}`)
  }

  // Hybrid: bank offer can have both small discount + multiplier
  if (offer.type === 'bank' && offer.rewardMultiplier && offer.rewardMultiplier > 1) {
    rewardMultiplier = Math.max(rewardMultiplier, offer.rewardMultiplier)
  }

  const applicable = discountValue > 0 || rewardMultiplier > 1
  if (!applicable) {
    notes.push('No discount or multiplier configured')
  }

  return {
    offerId: offer.id,
    offerName: offer.name,
    applicable,
    discountValue: round2(discountValue),
    rewardMultiplier,
    notes,
  }
}

export function evaluateOffersForCard(
  offers: UserOffer[],
  purchase: PurchaseInput,
  cardId: string,
  now = new Date(),
): {
  discountValue: number
  rewardMultiplier: number
  applied: OfferEvaluation[]
  notes: string[]
} {
  const applied: OfferEvaluation[] = []
  let discountValue = 0
  let rewardMultiplier = 1
  const notes: string[] = []

  for (const offer of offers) {
    const ev = evaluateOffer(offer, purchase, cardId, now)
    if (!ev.applicable) continue
    applied.push(ev)
    discountValue += ev.discountValue
    rewardMultiplier = Math.max(rewardMultiplier, ev.rewardMultiplier)
    notes.push(...ev.notes.map((n) => `${offer.name}: ${n}`))
  }

  return {
    discountValue: round2(discountValue),
    rewardMultiplier,
    applied,
    notes,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
