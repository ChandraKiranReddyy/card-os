/**
 * Phase 2 verification harness (Node).
 * Mirrors fuzzy-match expectations against the India catalog source file.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const catalogSrc = readFileSync(join(root, 'src/data/cards/india.v1.ts'), 'utf8')
const matchingSrc = readFileSync(join(root, 'src/core/cardMatching.ts'), 'utf8')
const storageSrc = readFileSync(join(root, 'src/store/walletStorage.ts'), 'utf8')
const walletCtx = readFileSync(join(root, 'src/store/WalletContext.tsx'), 'utf8')

const errors = []

const requiredIssuers = [
  'HDFC Bank',
  'SBI Card',
  'ICICI Bank',
  'Axis Bank',
  'American Express',
  'IDFC FIRST Bank',
  'HSBC',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'RBL Bank',
  'AU Small Finance Bank',
]

for (const issuer of requiredIssuers) {
  if (!catalogSrc.includes(`issuer: '${issuer}'`)) {
    errors.push(`Missing issuer in catalog: ${issuer}`)
  }
}

if (!catalogSrc.includes("version: '1.0.0'")) {
  errors.push('Catalog version missing')
}
if (!catalogSrc.includes('requires_verification')) {
  errors.push('Catalog must mark verification status')
}
if (!catalogSrc.includes('rewardRules: []')) {
  errors.push('Catalog should keep rewardRules empty (no invented rates)')
}

if (!matchingSrc.includes('uncertain')) {
  errors.push('Matching must support uncertain flag')
}
if (!matchingSrc.includes('levenshtein')) {
  errors.push('Fuzzy matcher missing')
}

if (!storageSrc.includes('localStorage') || !storageSrc.includes('indexedDB')) {
  errors.push('Persistence must use localStorage and IndexedDB mirror')
}

for (const fn of [
  'addFromCatalog',
  'addCustom',
  'updateCard',
  'removeCard',
  'isCatalogInWallet',
]) {
  if (!walletCtx.includes(fn)) errors.push(`WalletContext missing ${fn}`)
}

// Count catalog card ids
const ids = [...catalogSrc.matchAll(/id: '(in-[^']+)'/g)].map((m) => m[1])
if (ids.length < 20) errors.push(`Expected 20+ catalog cards, found ${ids.length}`)
if (new Set(ids).size !== ids.length) errors.push('Duplicate catalog ids')

if (errors.length) {
  console.error('Phase 2 verification FAILED:')
  errors.forEach((e) => console.error(' -', e))
  process.exit(1)
}

console.log('Phase 2 verification OK')
console.log(` - Catalog cards: ${ids.length}`)
console.log(` - Issuers checked: ${requiredIssuers.length}`)
console.log(' - Fuzzy matcher + wallet persistence APIs present')
