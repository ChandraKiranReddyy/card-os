/**
 * Deterministic Phase 3 self-tests (importable + runnable via tsx).
 */
import { calculateReward } from './rewardEngine'
import { applyCaps, remainingOnCap } from './capEngine'
import { valuePointsBatch, valueReward } from './valuationEngine'
import { recommendCards } from './recommendationEngine'
import { FIXTURE_CARDS, FIXTURE_PURCHASES } from '../data/fixtures/engineFixtures'
import { DEFAULT_PREFERENCE_WEIGHTS } from './valuationEngine'
import { parseCapsNotes, walletCardToProfile } from './adapters/walletToProfile'
import type { WalletCard } from '../types/card'

function approx(a: number, b: number, eps = 0.02): boolean {
  return Math.abs(a - b) <= eps
}

export function runEngineSelfTests(): { ok: boolean; errors: string[]; logs: string[] } {
  const errors: string[] = []
  const logs: string[] = []
  const prefs = { ...DEFAULT_PREFERENCE_WEIGHTS, maximumValue: 2 }

  const byId = Object.fromEntries(FIXTURE_CARDS.map((c) => [c.id, c]))

  // 1. Basic cashback 5% on 10,000 = 500
  {
    const r = calculateReward(
      byId['fx-cashback-5'],
      FIXTURE_PURCHASES.basic10k,
      prefs,
    )
    logs.push(`cashback: ${r.rawRewardAfterCap}`)
    if (!approx(r.rawRewardAfterCap, 500) || !approx(r.effectiveValue, 500)) {
      errors.push(`Basic cashback expected 500, got ${r.rawRewardAfterCap}`)
    }
  }

  // 2. Points 2/100 on 10,000 = 200 pts; travel 1.0 → 200 value
  {
    const r = calculateReward(byId['fx-points-2'], FIXTURE_PURCHASES.basic10k, prefs)
    logs.push(`points: ${r.rawRewardAfterCap} value ${r.effectiveValue}`)
    if (!approx(r.rawRewardAfterCap, 200)) {
      errors.push(`Points expected 200, got ${r.rawRewardAfterCap}`)
    }
    if (!approx(r.effectiveValue, 200)) {
      errors.push(`Points travel value expected 200, got ${r.effectiveValue}`)
    }
  }

  // 3. Caps: 5% of 30k = 1500, remaining cap 1150 → 1150
  {
    const remaining = remainingOnCap(byId['fx-cap-monthly'].caps[0])
    if (!approx(remaining, 1150)) errors.push(`Remaining cap expected 1150, got ${remaining}`)
    const r = calculateReward(
      byId['fx-cap-monthly'],
      FIXTURE_PURCHASES.capScenario,
      prefs,
    )
    logs.push(`cap: before ${r.cap.beforeCap} after ${r.rawRewardAfterCap}`)
    if (!approx(r.cap.beforeCap, 1500)) {
      errors.push(`Cap pre expected 1500, got ${r.cap.beforeCap}`)
    }
    if (!approx(r.rawRewardAfterCap, 1150)) {
      errors.push(`Cap post expected 1150, got ${r.rawRewardAfterCap}`)
    }
  }

  // 4. Category multiplier / boost: shopping 5% wins over base 1%
  {
    const r = calculateReward(
      byId['fx-category-boost'],
      FIXTURE_PURCHASES.basic10k,
      prefs,
    )
    logs.push(`category: ${r.rawRewardAfterCap}`)
    if (!approx(r.rawRewardAfterCap, 500)) {
      errors.push(`Category boost expected 500, got ${r.rawRewardAfterCap}`)
    }
  }

  // 5. Exclusions: fuel → ineligible
  {
    const r = calculateReward(byId['fx-excluded-fuel'], FIXTURE_PURCHASES.fuel, prefs)
    if (r.eligible) errors.push('Fuel exclusion should be ineligible')
  }

  // 6. Valuation table for 2000 points
  {
    const batch = valuePointsBatch(2000, {
      travel: 1,
      hotels: 0.9,
      voucher: 0.6,
      cashback: 0.25,
      shopping: 0.5,
    })
    if (!approx(batch.travel, 2000)) errors.push('2000 pts travel != 2000')
    if (!approx(batch.hotels, 1800)) errors.push('2000 pts hotels != 1800')
    if (!approx(batch.voucher, 1200)) errors.push('2000 pts voucher != 1200')
    if (!approx(batch.cashback, 500)) errors.push('2000 pts cashback != 500')
  }

  // 7. Merchant multiplier
  {
    const r = calculateReward(
      byId['fx-merchant-mult'],
      FIXTURE_PURCHASES.amazon,
      prefs,
    )
    // 2 pts/100 * 10000 = 200 * 2 = 400
    if (!approx(r.rawRewardAfterCap, 400)) {
      errors.push(`Merchant mult expected 400 pts, got ${r.rawRewardAfterCap}`)
    }
  }

  // 8. Ranking multiple cards (shopping: cashback beats points)
  {
    const ranked = recommendCards({
      purchase: FIXTURE_PURCHASES.basic10k,
      cards: [byId['fx-cashback-5'], byId['fx-points-2']],
      preferences: prefs,
    })
    if (ranked[0].cardId !== 'fx-cashback-5') {
      errors.push(`Expected cashback fixture rank 1, got ${ranked[0].cardId}`)
    }
    logs.push(`ranking: ${ranked.map((r) => r.cardId).join(' > ')}`)
  }

  // 8b. Fuel exclusion ranks last on fuel purchase
  {
    const ranked = recommendCards({
      purchase: FIXTURE_PURCHASES.fuel,
      cards: [
        byId['fx-cashback-5'],
        byId['fx-points-2'],
        byId['fx-excluded-fuel'],
      ],
      preferences: prefs,
    })
    if (ranked[ranked.length - 1].cardId !== 'fx-excluded-fuel') {
      errors.push('Ineligible fuel card should rank last on fuel purchase')
    }
    if (ranked[ranked.length - 1].breakdown.eligible) {
      errors.push('Fuel-excluded card should be ineligible on fuel purchase')
    }
  }

  // 9. applyCaps isolated
  {
    const cap = applyCaps(
      1500,
      [
        {
          id: 'm',
          period: 'monthly',
          limit: 5000,
          used: 3850,
          unit: 'currency',
          verification: fixtureVerificationLite(),
        },
      ],
      FIXTURE_PURCHASES.capScenario,
      'cashback',
    )
    if (!approx(cap.afterCap, 1150)) errors.push(`applyCaps expected 1150, got ${cap.afterCap}`)
  }

  // 10. Wallet adapter caps parse
  {
    const caps = parseCapsNotes('monthly:5000:3850', 'currency')
    if (caps.length !== 1 || caps[0].limit !== 5000 || caps[0].used !== 3850) {
      errors.push('parseCapsNotes failed')
    }
    const profile = walletCardToProfile(sampleWalletCard())
    if (profile.rules.length !== 1 || profile.rules[0].rate !== 5) {
      errors.push('walletCardToProfile rate failed')
    }
  }

  // 11. valueReward cashback passthrough
  {
    const v = valueReward({
      kind: 'cashback',
      rawAfterCap: 100,
      redemption: {
        travel: 1,
        hotels: 0.9,
        voucher: 0.6,
        cashback: 0.25,
        shopping: 0.5,
      },
      preferences: prefs,
    })
    if (!approx(v.effectiveValue, 100)) {
      errors.push(`Cashback valuation expected 100, got ${v.effectiveValue}`)
    }
  }

  return { ok: errors.length === 0, errors, logs }
}

function fixtureVerificationLite() {
  return {
    status: 'requires_verification' as const,
    lastVerified: null,
    source: 'test',
  }
}

function sampleWalletCard(): WalletCard {
  return {
    walletId: 'w1',
    catalogCardId: null,
    isCustom: true,
    country: 'IN',
    issuer: 'Test',
    name: 'Card',
    variant: '',
    network: 'Visa',
    nickname: 'Test',
    annualFee: null,
    currency: 'INR',
    rewardCurrency: 'Cashback',
    rewardType: 'Cashback',
    rewardRate: 5,
    eligibleCategories: 'Shopping, Food',
    exclusions: 'Fuel',
    merchantRules: '',
    redemptionValues: 'travel:1,hotels:0.9',
    capsNotes: 'monthly:5000:1000',
    milestonesNotes: '',
    benefitsNotes: '',
    gradient: '',
    accent: '',
    verification: {
      status: 'user_provided',
      lastVerified: null,
      source: 'user',
    },
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
