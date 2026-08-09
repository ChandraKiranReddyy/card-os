import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')
const errors = []

const files = [
  'src/types/optimization.ts',
  'src/core/offerEngine/index.ts',
  'src/core/milestoneEngine/index.ts',
  'src/core/alertEngine/index.ts',
  'src/store/OptimizationContext.tsx',
  'src/features/benefits/BenefitsPage.tsx',
  'src/components/AlertsBar.tsx',
]

for (const f of files) {
  try {
    read(f)
  } catch {
    errors.push(`Missing ${f}`)
  }
}

const benefits = read('src/features/benefits/BenefitsPage.tsx')
if (benefits.includes('Benefits engine not active yet')) {
  errors.push('Benefits still placeholder')
}

const rec = read('src/core/recommendationEngine/index.ts')
if (!rec.includes('evaluateOffersForCard') || !rec.includes('milestoneBonusForPurchase')) {
  errors.push('Recommendation engine not wired to offers/milestones')
}

const app = read('src/App.tsx')
if (!app.includes('OptimizationProvider')) errors.push('OptimizationProvider missing')

if (errors.length) {
  console.error('Phase 6 verify FAILED')
  errors.forEach((e) => console.error(' -', e))
  process.exit(1)
}
console.log('Phase 6 structural verification OK')
