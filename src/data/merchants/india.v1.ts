/**
 * Client-side merchant recognition for Phase 4.
 * Does NOT scrape product pages (CORS / free V1 constraint).
 * Domain + path heuristics only.
 */
export interface MerchantPattern {
  id: string
  name: string
  country: string
  currency: string
  /** Hostnames without www */
  hosts: string[]
  defaultCategory: string
  /** Path keywords → category */
  categoryHints: Array<{ match: RegExp; category: string }>
}

export const INDIA_MERCHANTS_V1: MerchantPattern[] = [
  {
    id: 'amazon-in',
    name: 'Amazon',
    country: 'IN',
    currency: 'INR',
    hosts: ['amazon.in', 'www.amazon.in', 'amzn.in', 'amazon.com'],
    defaultCategory: 'Shopping',
    categoryHints: [
      { match: /grocery|pantry|fresh/i, category: 'Food' },
      { match: /primevideo|music|kindle/i, category: 'Entertainment' },
      { match: /travel|flight|hotel/i, category: 'Travel' },
    ],
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    country: 'IN',
    currency: 'INR',
    hosts: ['flipkart.com', 'www.flipkart.com', 'dl.flipkart.com'],
    defaultCategory: 'Shopping',
    categoryHints: [
      { match: /grocery|supermart/i, category: 'Food' },
      { match: /flight|travel/i, category: 'Travel' },
    ],
  },
  {
    id: 'myntra',
    name: 'Myntra',
    country: 'IN',
    currency: 'INR',
    hosts: ['myntra.com', 'www.myntra.com'],
    defaultCategory: 'Shopping',
    categoryHints: [],
  },
  {
    id: 'croma',
    name: 'Croma',
    country: 'IN',
    currency: 'INR',
    hosts: ['croma.com', 'www.croma.com'],
    defaultCategory: 'Shopping',
    categoryHints: [],
  },
  {
    id: 'reliance-digital',
    name: 'Reliance Digital',
    country: 'IN',
    currency: 'INR',
    hosts: ['reliancedigital.in', 'www.reliancedigital.in'],
    defaultCategory: 'Shopping',
    categoryHints: [],
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    country: 'IN',
    currency: 'INR',
    hosts: ['swiggy.com', 'www.swiggy.com'],
    defaultCategory: 'Food',
    categoryHints: [
      { match: /instamart/i, category: 'Food' },
      { match: /genie/i, category: 'Other' },
    ],
  },
  {
    id: 'zomato',
    name: 'Zomato',
    country: 'IN',
    currency: 'INR',
    hosts: ['zomato.com', 'www.zomato.com'],
    defaultCategory: 'Food',
    categoryHints: [],
  },
  {
    id: 'uber',
    name: 'Uber',
    country: 'IN',
    currency: 'INR',
    hosts: ['uber.com', 'www.uber.com', 'm.uber.com'],
    defaultCategory: 'Travel',
    categoryHints: [
      { match: /eats/i, category: 'Food' },
    ],
  },
  {
    id: 'makemytrip',
    name: 'MakeMyTrip',
    country: 'IN',
    currency: 'INR',
    hosts: ['makemytrip.com', 'www.makemytrip.com'],
    defaultCategory: 'Travel',
    categoryHints: [
      { match: /hotel/i, category: 'Travel' },
      { match: /flight/i, category: 'Travel' },
      { match: /bus|cab/i, category: 'Travel' },
    ],
  },
]

export function findMerchantByHost(host: string): MerchantPattern | null {
  const h = host.toLowerCase().replace(/^www\./, '')
  return (
    INDIA_MERCHANTS_V1.find((m) =>
      m.hosts.some((x) => x.replace(/^www\./, '') === h || h.endsWith(`.${x.replace(/^www\./, '')}`)),
    ) ?? null
  )
}
