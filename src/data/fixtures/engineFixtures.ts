import type { EngineCardProfile, PurchaseInput } from '../../types/engine'
import { DEFAULT_REDEMPTION } from '../../core/valuationEngine'

const fixtureVerification = {
  status: 'requires_verification' as const,
  lastVerified: null,
  source: 'fixture:phase3',
  notes:
    'SYNTHETIC fixture for deterministic engine tests. NOT a real bank reward rule.',
}

/**
 * Synthetic cards with known arithmetic — for tests and playground only.
 * Do not present these as verified real-world card rates.
 */
export const FIXTURE_CARDS: EngineCardProfile[] = [
  {
    id: 'fx-cashback-5',
    label: 'Fixture Cashback 5%',
    currency: 'INR',
    rewardCurrency: 'Cashback',
    source: 'fixture',
    verification: fixtureVerification,
    exclusions: { categories: [], merchants: [] },
    caps: [],
    redemption: { ...DEFAULT_REDEMPTION },
    rules: [
      {
        id: 'fx-cb-5',
        kind: 'cashback',
        rate: 5,
        categories: [],
        merchants: [],
        merchantMultiplier: 1,
        verification: fixtureVerification,
      },
    ],
  },
  {
    id: 'fx-points-2',
    label: 'Fixture Points 2/100',
    currency: 'INR',
    rewardCurrency: 'Points',
    source: 'fixture',
    verification: fixtureVerification,
    exclusions: { categories: [], merchants: [] },
    caps: [],
    redemption: {
      travel: 1,
      hotels: 0.9,
      voucher: 0.6,
      cashback: 0.25,
      shopping: 0.5,
    },
    rules: [
      {
        id: 'fx-pts-2',
        kind: 'points',
        rate: 2,
        categories: [],
        merchants: [],
        merchantMultiplier: 1,
        verification: fixtureVerification,
      },
    ],
  },
  {
    id: 'fx-cap-monthly',
    label: 'Fixture Capped Cashback 5%',
    currency: 'INR',
    rewardCurrency: 'Cashback',
    source: 'fixture',
    verification: fixtureVerification,
    exclusions: { categories: [], merchants: [] },
    redemption: { ...DEFAULT_REDEMPTION },
    rules: [
      {
        id: 'fx-cap-cb',
        kind: 'cashback',
        rate: 5,
        categories: [],
        merchants: [],
        merchantMultiplier: 1,
        verification: fixtureVerification,
      },
    ],
    caps: [
      {
        id: 'monthly-5000',
        period: 'monthly',
        limit: 5000,
        used: 3850,
        unit: 'currency',
        verification: fixtureVerification,
      },
    ],
  },
  {
    id: 'fx-category-boost',
    label: 'Fixture Category Boost',
    currency: 'INR',
    rewardCurrency: 'Cashback',
    source: 'fixture',
    verification: fixtureVerification,
    exclusions: { categories: [], merchants: [] },
    caps: [],
    redemption: { ...DEFAULT_REDEMPTION },
    rules: [
      {
        id: 'fx-base-1',
        kind: 'cashback',
        rate: 1,
        categories: [],
        merchants: [],
        merchantMultiplier: 1,
        verification: fixtureVerification,
      },
      {
        id: 'fx-shop-5',
        kind: 'cashback',
        rate: 5,
        categories: ['Shopping'],
        merchants: [],
        merchantMultiplier: 1,
        verification: fixtureVerification,
      },
    ],
  },
  {
    id: 'fx-excluded-fuel',
    label: 'Fixture With Fuel Exclusion',
    currency: 'INR',
    rewardCurrency: 'Cashback',
    source: 'fixture',
    verification: fixtureVerification,
    exclusions: { categories: ['Fuel'], merchants: [] },
    caps: [],
    redemption: { ...DEFAULT_REDEMPTION },
    rules: [
      {
        id: 'fx-ex-5',
        kind: 'cashback',
        rate: 5,
        categories: [],
        merchants: [],
        merchantMultiplier: 1,
        verification: fixtureVerification,
      },
    ],
  },
  {
    id: 'fx-merchant-mult',
    label: 'Fixture Merchant 2× Points',
    currency: 'INR',
    rewardCurrency: 'Points',
    source: 'fixture',
    verification: fixtureVerification,
    exclusions: { categories: [], merchants: [] },
    caps: [],
    redemption: {
      travel: 1,
      hotels: 0.9,
      voucher: 0.6,
      cashback: 0.25,
      shopping: 0.5,
    },
    rules: [
      {
        id: 'fx-m-base',
        kind: 'points',
        rate: 2,
        categories: [],
        merchants: [],
        merchantMultiplier: 1,
        verification: fixtureVerification,
      },
      {
        id: 'fx-m-amazon',
        kind: 'points',
        rate: 2,
        categories: [],
        merchants: ['Amazon'],
        merchantMultiplier: 2,
        verification: fixtureVerification,
      },
    ],
  },
]

export const FIXTURE_PURCHASES = {
  basic10k: {
    amount: 10_000,
    currency: 'INR',
    merchant: 'Demo Store',
    category: 'Shopping',
  } satisfies PurchaseInput,
  capScenario: {
    amount: 30_000, // 5% = 1500 cashback before cap
    currency: 'INR',
    merchant: 'BigBazaar',
    category: 'Shopping',
  } satisfies PurchaseInput,
  fuel: {
    amount: 5_000,
    currency: 'INR',
    merchant: 'Petrol Pump',
    category: 'Fuel',
  } satisfies PurchaseInput,
  amazon: {
    amount: 10_000,
    currency: 'INR',
    merchant: 'Amazon',
    category: 'Shopping',
  } satisfies PurchaseInput,
  points2k: {
    amount: 100_000, // 2 per 100 → 2000 points
    currency: 'INR',
    merchant: 'TravelCo',
    category: 'Travel',
  } satisfies PurchaseInput,
}
