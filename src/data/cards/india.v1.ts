import type { CardCatalogFile, CatalogCard, VerificationMeta } from '../../types/card'

const needsVerify = (notes?: string): VerificationMeta => ({
  status: 'requires_verification',
  lastVerified: null,
  source: null,
  notes:
    notes ??
    'Catalog product name only. Fees, reward rates, caps, and benefits require verification before use in calculations.',
})

function card(
  partial: Pick<CatalogCard, 'id' | 'country' | 'issuer' | 'name' | 'network'> &
    Partial<
      Pick<CatalogCard, 'variant' | 'rewardCurrency' | 'presentation'>
    >,
): CatalogCard {
  const { rewardCurrency, presentation, variant, ...rest } = partial
  return {
    ...rest,
    variant,
    presentation,
    annualFee: null,
    currency: 'INR',
    rewardCurrency: rewardCurrency ?? 'Reward Points',
    rewardRules: [],
    caps: [],
    categories: [],
    exclusions: [],
    benefits: [],
    milestones: [],
    offers: [],
    verification: needsVerify(),
  }
}

/**
 * India card catalog v1.
 *
 * IMPORTANT: Entries list publicly known product names for matching/UI.
 * Financial rules are intentionally empty / requires_verification.
 * Do not treat this file as a source of reward rates or fees.
 */
export const INDIA_CARD_CATALOG_V1: CardCatalogFile = {
  version: '1.0.0',
  country: 'IN',
  currency: 'INR',
  generatedFor: 'CARD//OS Phase 2 catalog',
  disclaimer:
    'Product names for selection only. Reward rates, fees, caps, and benefits are NOT verified and must not be used as financial advice until verified.',
  cards: [
    // HDFC
    card({
      id: 'in-hdfc-infinia',
      country: 'IN',
      issuer: 'HDFC Bank',
      name: 'Infinia',
      variant: 'Metal',
      network: 'Visa Infinite',
      rewardCurrency: 'Reward Points',
      presentation: {
        gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #e94560 140%)',
        accent: '#e94560',
      },
    }),
    card({
      id: 'in-hdfc-regalia-gold',
      country: 'IN',
      issuer: 'HDFC Bank',
      name: 'Regalia Gold',
      network: 'Visa Signature',
      presentation: {
        gradient: 'linear-gradient(135deg, #2c1810 0%, #5c3317 50%, #c9a227 120%)',
        accent: '#c9a227',
      },
    }),
    card({
      id: 'in-hdfc-millennia',
      country: 'IN',
      issuer: 'HDFC Bank',
      name: 'Millennia',
      network: 'Visa / Mastercard',
      rewardCurrency: 'CashPoints / Cashback',
      presentation: {
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #38bdf8 130%)',
        accent: '#38bdf8',
      },
    }),
    card({
      id: 'in-hdfc-swiggy',
      country: 'IN',
      issuer: 'HDFC Bank',
      name: 'Swiggy',
      network: 'Visa',
      rewardCurrency: 'Cashback',
      presentation: {
        gradient: 'linear-gradient(135deg, #1a0a0a 0%, #7c2d12 45%, #fc8019 120%)',
        accent: '#fc8019',
      },
    }),

    // SBI Card
    card({
      id: 'in-sbi-cashback',
      country: 'IN',
      issuer: 'SBI Card',
      name: 'Cashback',
      network: 'Visa',
      rewardCurrency: 'Cashback',
      presentation: {
        gradient: 'linear-gradient(135deg, #0b3d2e 0%, #145a32 45%, #1e8449 80%, #82e0aa 130%)',
        accent: '#34d399',
      },
    }),
    card({
      id: 'in-sbi-simplyclick',
      country: 'IN',
      issuer: 'SBI Card',
      name: 'SimplyCLICK',
      network: 'Visa',
      presentation: {
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #818cf8 120%)',
        accent: '#818cf8',
      },
    }),
    card({
      id: 'in-sbi-elite',
      country: 'IN',
      issuer: 'SBI Card',
      name: 'Elite',
      network: 'Visa Infinite',
      presentation: {
        gradient: 'linear-gradient(135deg, #111827 0%, #374151 50%, #d1d5db 120%)',
        accent: '#9ca3af',
      },
    }),

    // ICICI
    card({
      id: 'in-icici-amazon-pay',
      country: 'IN',
      issuer: 'ICICI Bank',
      name: 'Amazon Pay',
      network: 'Visa',
      rewardCurrency: 'Cashback',
      presentation: {
        gradient: 'linear-gradient(135deg, #0c1222 0%, #232f3e 50%, #ff9900 125%)',
        accent: '#ff9900',
      },
    }),
    card({
      id: 'in-icici-emeralde',
      country: 'IN',
      issuer: 'ICICI Bank',
      name: 'Emeralde',
      variant: 'Private',
      network: 'Visa Infinite',
      presentation: {
        gradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #34d399 120%)',
        accent: '#10b981',
      },
    }),
    card({
      id: 'in-icici-sapphiro',
      country: 'IN',
      issuer: 'ICICI Bank',
      name: 'Sapphiro',
      network: 'Visa / Amex',
      presentation: {
        gradient: 'linear-gradient(135deg, #0c1a3a 0%, #1e3a8a 50%, #60a5fa 120%)',
        accent: '#60a5fa',
      },
    }),

    // Axis
    card({
      id: 'in-axis-atlas',
      country: 'IN',
      issuer: 'Axis Bank',
      name: 'Atlas',
      network: 'Visa Signature',
      rewardCurrency: 'Edge Miles',
      presentation: {
        gradient: 'linear-gradient(135deg, #1b1464 0%, #2c2c54 40%, #474787 75%, #706fd3 120%)',
        accent: '#7c8cff',
      },
    }),
    card({
      id: 'in-axis-ace',
      country: 'IN',
      issuer: 'Axis Bank',
      name: 'ACE',
      network: 'Visa',
      rewardCurrency: 'Cashback',
      presentation: {
        gradient: 'linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #2dd4bf 120%)',
        accent: '#2dd4bf',
      },
    }),
    card({
      id: 'in-axis-magnus',
      country: 'IN',
      issuer: 'Axis Bank',
      name: 'Magnus',
      network: 'Visa Infinite',
      presentation: {
        gradient: 'linear-gradient(135deg, #1c1917 0%, #44403c 50%, #a8a29e 120%)',
        accent: '#a8a29e',
      },
    }),

    // Amex
    card({
      id: 'in-amex-smartearn',
      country: 'IN',
      issuer: 'American Express',
      name: 'SmartEarn',
      network: 'American Express',
      rewardCurrency: 'Membership Rewards',
      presentation: {
        gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #006fcf 120%)',
        accent: '#006fcf',
      },
    }),
    card({
      id: 'in-amex-mrcc',
      country: 'IN',
      issuer: 'American Express',
      name: 'Membership Rewards Credit Card',
      network: 'American Express',
      rewardCurrency: 'Membership Rewards',
      presentation: {
        gradient: 'linear-gradient(135deg, #111827 0%, #1f2937 45%, #c0c0c0 120%)',
        accent: '#c0c0c0',
      },
    }),

    // IDFC FIRST
    card({
      id: 'in-idfc-wealth',
      country: 'IN',
      issuer: 'IDFC FIRST Bank',
      name: 'Wealth',
      network: 'Visa Infinite',
      presentation: {
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #c4b5fd 120%)',
        accent: '#a78bfa',
      },
    }),
    card({
      id: 'in-idfc-select',
      country: 'IN',
      issuer: 'IDFC FIRST Bank',
      name: 'Select',
      network: 'Visa',
      presentation: {
        gradient: 'linear-gradient(135deg, #0f172a 0%, #334155 50%, #94a3b8 120%)',
        accent: '#94a3b8',
      },
    }),

    // HSBC
    card({
      id: 'in-hsbc-live-plus',
      country: 'IN',
      issuer: 'HSBC',
      name: 'Live+',
      network: 'Visa',
      rewardCurrency: 'Cashback',
      presentation: {
        gradient: 'linear-gradient(135deg, #1c1917 0%, #7f1d1d 50%, #db0011 120%)',
        accent: '#db0011',
      },
    }),
    card({
      id: 'in-hsbc-premier',
      country: 'IN',
      issuer: 'HSBC',
      name: 'Premier',
      network: 'Visa Infinite',
      presentation: {
        gradient: 'linear-gradient(135deg, #0c1222 0%, #1e293b 50%, #cbd5e1 120%)',
        accent: '#e2e8f0',
      },
    }),

    // Kotak
    card({
      id: 'in-kotak-811',
      country: 'IN',
      issuer: 'Kotak Mahindra Bank',
      name: '811',
      network: 'Visa',
      presentation: {
        gradient: 'linear-gradient(135deg, #1a1033 0%, #3b0764 50%, #ed1c24 120%)',
        accent: '#ed1c24',
      },
    }),
    card({
      id: 'in-kotak-league',
      country: 'IN',
      issuer: 'Kotak Mahindra Bank',
      name: 'League Platinum',
      network: 'Visa',
      presentation: {
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #64748b 120%)',
        accent: '#64748b',
      },
    }),

    // IndusInd
    card({
      id: 'in-indusind-legend',
      country: 'IN',
      issuer: 'IndusInd Bank',
      name: 'Legend',
      network: 'Visa Infinite',
      presentation: {
        gradient: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #86efac 120%)',
        accent: '#4ade80',
      },
    }),
    card({
      id: 'in-indusind-tiger',
      country: 'IN',
      issuer: 'IndusInd Bank',
      name: 'Tiger',
      network: 'Visa',
      rewardCurrency: 'Cashback / Points',
      presentation: {
        gradient: 'linear-gradient(135deg, #431407 0%, #9a3412 50%, #fb923c 120%)',
        accent: '#fb923c',
      },
    }),

    // RBL
    card({
      id: 'in-rbl-shoprite',
      country: 'IN',
      issuer: 'RBL Bank',
      name: 'Shoprite',
      network: 'Mastercard',
      presentation: {
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #a5b4fc 120%)',
        accent: '#818cf8',
      },
    }),
    card({
      id: 'in-rbl-world-safari',
      country: 'IN',
      issuer: 'RBL Bank',
      name: 'World Safari',
      network: 'Visa',
      presentation: {
        gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #7dd3fc 120%)',
        accent: '#38bdf8',
      },
    }),

    // AU
    card({
      id: 'in-au-zenith',
      country: 'IN',
      issuer: 'AU Small Finance Bank',
      name: 'Zenith+',
      network: 'Visa',
      presentation: {
        gradient: 'linear-gradient(135deg, #1c1917 0%, #44403c 40%, #f59e0b 120%)',
        accent: '#f59e0b',
      },
    }),
    card({
      id: 'in-au-vetta',
      country: 'IN',
      issuer: 'AU Small Finance Bank',
      name: 'Vetta',
      network: 'Visa',
      presentation: {
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #93c5fd 120%)',
        accent: '#60a5fa',
      },
    }),
  ],
}

export const CATALOG_COUNTRIES = [
  { code: 'IN', label: 'India', currency: 'INR' },
  // Global-ready placeholders — catalogs empty until later phases
  { code: 'US', label: 'United States', currency: 'USD', disabled: true },
  { code: 'GB', label: 'United Kingdom', currency: 'GBP', disabled: true },
  { code: 'AE', label: 'United Arab Emirates', currency: 'AED', disabled: true },
] as const

export function getCatalogByCountry(country: string): CardCatalogFile | null {
  if (country === 'IN') return INDIA_CARD_CATALOG_V1
  return null
}

export function getAllCatalogCards(country: string): CatalogCard[] {
  return getCatalogByCountry(country)?.cards ?? []
}

export function getCatalogCardById(id: string): CatalogCard | undefined {
  return INDIA_CARD_CATALOG_V1.cards.find((c) => c.id === id)
}

export function listIssuers(country: string): string[] {
  const cards = getAllCatalogCards(country)
  return [...new Set(cards.map((c) => c.issuer))].sort()
}
