import { findMerchantByHost, type MerchantPattern } from '../../data/merchants/india.v1'
import type { UrlParseResult } from '../../types/analyzer'

function ensureUrl(raw: string): URL | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    if (/^https?:\/\//i.test(trimmed)) return new URL(trimmed)
    return new URL(`https://${trimmed}`)
  } catch {
    return null
  }
}

function humanizeSlug(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/\+/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function extractAmazonProduct(pathname: string, searchParams: URLSearchParams): string | null {
  // /Product-Name/dp/ASIN (prefer title slug)
  const named = pathname.match(/\/([^/]+)\/dp\/([A-Z0-9]{8,12})/i)
  if (named?.[1] && named[1].toLowerCase() !== 'gp') {
    return humanizeSlug(named[1])
  }
  // /dp/B0XXXX or /gp/product/B0XXXX
  const dp = pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{8,12})/i)
  if (dp) {
    const titleHint = searchParams.get('th') || searchParams.get('psc')
    return titleHint ? humanizeSlug(titleHint) : `Amazon product ${dp[1].toUpperCase()}`
  }
  return null
}

function extractFlipkartProduct(pathname: string): string | null {
  // /product-name/p/itm...
  const m = pathname.match(/\/([^/]+)\/p\//i)
  if (m?.[1]) return humanizeSlug(m[1])
  return null
}

function extractMyntraProduct(pathname: string): string | null {
  // /brand/product-name/123/buy
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length >= 2) {
    return humanizeSlug(parts.slice(0, 2).join(' '))
  }
  return null
}

function extractGenericProduct(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean)
  if (!parts.length) return null
  // skip boring segments
  const skip = new Set(['in', 'en', 'p', 'dp', 'product', 'products', 'item', 'buy', 'search'])
  const meaningful = parts.filter((p) => !skip.has(p.toLowerCase()) && p.length > 2)
  if (!meaningful.length) return null
  const candidate = meaningful[meaningful.length - 1]
  if (/^[A-Z0-9]{8,}$/i.test(candidate) && meaningful.length > 1) {
    return humanizeSlug(meaningful[meaningful.length - 2])
  }
  // ignore pure query-like
  if (candidate.includes('?')) return humanizeSlug(candidate.split('?')[0])
  return humanizeSlug(candidate)
}

function categoryFor(merchant: MerchantPattern, pathAndQuery: string): string {
  for (const hint of merchant.categoryHints) {
    if (hint.match.test(pathAndQuery)) return hint.category
  }
  return merchant.defaultCategory
}

/**
 * Parse a product/merchant URL without network access.
 * Prices are almost never present in URLs → needsManualCompletion when missing.
 */
export function parsePurchaseUrl(rawUrl: string): UrlParseResult {
  const notes: string[] = []
  const url = ensureUrl(rawUrl)

  if (!url) {
    return {
      rawUrl,
      supported: false,
      merchantId: null,
      merchantName: null,
      productName: null,
      price: null,
      category: null,
      country: null,
      currency: 'INR',
      confidence: { merchant: 0, product: 0, price: 0, category: 0 },
      notes: ['Could not parse URL. Enter details manually.'],
      needsManualCompletion: true,
      missingFields: ['merchant', 'product', 'price', 'category'],
    }
  }

  const host = url.hostname.toLowerCase()
  const merchant = findMerchantByHost(host)
  const pathQ = `${url.pathname}${url.search}`

  // Attempt price from query (rare)
  let price: number | null = null
  for (const key of ['price', 'amount', 'p', 'finalPrice']) {
    const v = url.searchParams.get(key)
    if (v && Number.isFinite(Number(v))) {
      price = Number(v)
      notes.push(`Price read from query param “${key}” (unverified).`)
      break
    }
  }

  if (!merchant) {
    notes.push(
      'Merchant domain is not in the supported list. CARD//OS does not scrape arbitrary sites in V1.',
    )
    const productGuess = extractGenericProduct(url.pathname)
    const missing: UrlParseResult['missingFields'] = ['merchant', 'price']
    if (!productGuess) missing.push('product')
    missing.push('category')

    return {
      rawUrl: url.toString(),
      supported: false,
      merchantId: null,
      merchantName: host.replace(/^www\./, ''),
      productName: productGuess,
      price,
      category: null,
      country: host.endsWith('.in') ? 'IN' : null,
      currency: 'INR',
      confidence: {
        merchant: 0.2,
        product: productGuess ? 0.35 : 0,
        price: price != null ? 0.4 : 0,
        category: 0,
      },
      notes,
      needsManualCompletion: true,
      missingFields: missing,
    }
  }

  let productName: string | null = null
  let productConfidence = 0.3

  if (merchant.id === 'amazon-in') {
    productName = extractAmazonProduct(url.pathname, url.searchParams)
    productConfidence = productName?.includes('product ') ? 0.45 : 0.7
  } else if (merchant.id === 'flipkart') {
    productName = extractFlipkartProduct(url.pathname)
    productConfidence = productName ? 0.75 : 0.3
  } else if (merchant.id === 'myntra') {
    productName = extractMyntraProduct(url.pathname)
    productConfidence = productName ? 0.65 : 0.3
  } else {
    productName = extractGenericProduct(url.pathname)
    productConfidence = productName ? 0.55 : 0.25
  }

  if (!productName) {
    productName = `${merchant.name} purchase`
    productConfidence = 0.25
    notes.push('Product title not found in URL — using merchant default label.')
  }

  const category = categoryFor(merchant, pathQ)
  notes.push(
    `Recognized ${merchant.name} via domain heuristics (no page scrape).`,
  )
  if (price == null) {
    notes.push('Price is not available from the URL alone — enter it manually.')
  }

  const missing: UrlParseResult['missingFields'] = []
  if (price == null) missing.push('price')
  // product always has a fallback string
  if (productConfidence < 0.4) missing.push('product')

  return {
    rawUrl: url.toString(),
    supported: true,
    merchantId: merchant.id,
    merchantName: merchant.name,
    productName,
    price,
    category,
    country: merchant.country,
    currency: merchant.currency,
    confidence: {
      merchant: 0.95,
      product: productConfidence,
      price: price != null ? 0.5 : 0,
      category: 0.8,
    },
    notes,
    needsManualCompletion: missing.length > 0,
    missingFields: missing,
  }
}

export function isKnownMerchantUrl(rawUrl: string): boolean {
  const url = ensureUrl(rawUrl)
  if (!url) return false
  return !!findMerchantByHost(url.hostname)
}
