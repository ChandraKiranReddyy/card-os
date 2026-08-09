import { parsePurchaseUrl, isKnownMerchantUrl } from './urlParser'
import {
  draftFromUrl,
  draftIsComplete,
  runPurchaseAnalysis,
} from './analyzePurchase'
import { FIXTURE_CARDS } from '../../data/fixtures/engineFixtures'
import { DEFAULT_PREFERENCE_WEIGHTS } from '../valuationEngine'

export function runAnalyzerSelfTests(): {
  ok: boolean
  errors: string[]
  logs: string[]
} {
  const errors: string[] = []
  const logs: string[] = []
  const prefs = { ...DEFAULT_PREFERENCE_WEIGHTS, maximumValue: 2 }

  // Known merchant URLs
  const amazon = parsePurchaseUrl(
    'https://www.amazon.in/Sony-WH-1000XM6-Headphones/dp/B0DXXXX123',
  )
  logs.push(`amazon supported=${amazon.supported} merchant=${amazon.merchantName}`)
  if (!amazon.supported || amazon.merchantName !== 'Amazon') {
    errors.push('Amazon.in URL should be supported')
  }
  if (amazon.category !== 'Shopping') errors.push('Amazon default category Shopping')
  if (!amazon.needsManualCompletion || !amazon.missingFields.includes('price')) {
    errors.push('Amazon parse should require price manually')
  }
  if (!amazon.productName?.toLowerCase().includes('sony')) {
    errors.push(`Expected Sony in product, got ${amazon.productName}`)
  }

  const flipkart = parsePurchaseUrl(
    'https://www.flipkart.com/apple-iphone-15/p/itm123456',
  )
  if (!flipkart.supported || flipkart.merchantName !== 'Flipkart') {
    errors.push('Flipkart URL should be supported')
  }

  const swiggy = parsePurchaseUrl('https://www.swiggy.com/restaurants/demo')
  if (swiggy.category !== 'Food') errors.push('Swiggy should be Food')

  const mmt = parsePurchaseUrl('https://www.makemytrip.com/flights/')
  if (mmt.category !== 'Travel') errors.push('MMT should be Travel')

  // Unsupported URL
  const weird = parsePurchaseUrl('https://random-shop.example/item/blue-widget')
  if (weird.supported) errors.push('Unknown domain must be unsupported')
  if (!weird.needsManualCompletion) errors.push('Unsupported needs manual completion')
  if (!isKnownMerchantUrl('https://www.amazon.in/dp/B0TEST')) {
    errors.push('isKnownMerchantUrl amazon failed')
  }
  if (isKnownMerchantUrl('https://not-a-merchant.test/x')) {
    errors.push('isKnownMerchantUrl should reject unknown')
  }

  // Manual fallback path
  const draft = draftFromUrl('https://unknown.example/p/test')
  draft.merchant = 'Demo Mart'
  draft.product = 'Sony WH-1000XM6'
  draft.price = 39990
  draft.category = 'Shopping'
  draft.offerValue = 500
  const complete = draftIsComplete(draft)
  if (!complete.ok) errors.push(`Manual draft incomplete: ${complete.missing}`)

  const result = runPurchaseAnalysis({
    draft,
    walletProfiles: [],
    fixtureProfiles: FIXTURE_CARDS,
    preferences: prefs,
  })
  if (!result.winner) errors.push('Expected a winner with fixtures')
  if (!result.usedFixtures) errors.push('Empty wallet should use fixtures')
  if (result.winner && result.recommendations[0].cardId !== result.winner.cardId) {
    errors.push('Winner should be rank 1')
  }
  // 5% of 39990 = 1999.5 + 500 offer = 2499.5 for cashback fixture
  if (result.winner) {
    const expectedReward = (39990 * 5) / 100
    const expectedTotal = expectedReward + 500
    if (Math.abs(result.winner.effectiveValue - expectedTotal) > 0.05) {
      errors.push(
        `Expected total ~${expectedTotal}, got ${result.winner.effectiveValue}`,
      )
    }
    logs.push(
      `winner ${result.winner.label} effective ${result.winner.effectiveValue}`,
    )
  }
  if (!result.winnerReason.length) errors.push('Winner reason required')

  // Caps scenario via fixtures on high amount
  const capDraft = draftFromUrl('https://www.amazon.in/dp/B0CAPTEST')
  capDraft.price = 30000
  capDraft.product = 'Cap test item'
  // merchant/category already set from amazon
  const capResult = runPurchaseAnalysis({
    draft: capDraft,
    walletProfiles: [],
    fixtureProfiles: FIXTURE_CARDS,
    preferences: prefs,
  })
  const capped = capResult.recommendations.find((r) => r.cardId === 'fx-cap-monthly')
  if (!capped || Math.abs(capped.breakdown.rawRewardAfterCap - 1150) > 0.05) {
    errors.push(
      `Cap fixture expected 1150 after cap, got ${capped?.breakdown.rawRewardAfterCap}`,
    )
  } else {
    logs.push('cap scenario OK 1150')
  }

  return { ok: errors.length === 0, errors, logs }
}
