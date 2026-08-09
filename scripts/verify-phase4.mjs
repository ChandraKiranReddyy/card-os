import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')
const errors = []

const files = [
  'src/core/analyzer/urlParser.ts',
  'src/core/analyzer/analyzePurchase.ts',
  'src/data/merchants/india.v1.ts',
  'src/features/analyzer/AnalyzerPage.tsx',
  'src/features/analyzer/AnalysisResultView.tsx',
  'src/features/analyzer/AnalysisSteps.tsx',
  'src/features/analyzer/ManualFallbackForm.tsx',
]

for (const f of files) {
  try {
    read(f)
  } catch {
    errors.push(`Missing ${f}`)
  }
}

const merchants = read('src/data/merchants/india.v1.ts')
for (const name of [
  'Amazon',
  'Flipkart',
  'Myntra',
  'Croma',
  'Reliance Digital',
  'Swiggy',
  'Zomato',
  'Uber',
  'MakeMyTrip',
]) {
  if (!merchants.includes(`name: '${name}'`)) errors.push(`Merchant missing: ${name}`)
}

const analyzer = read('src/features/analyzer/AnalyzerPage.tsx')
if (analyzer.includes('URL analysis not wired yet')) {
  errors.push('Analyzer still showing placeholder')
}

const steps = read('src/core/analyzer/analyzePurchase.ts')
for (const label of [
  'Merchant identified',
  'Product category identified',
  'Checking card eligibility',
  'Checking reward caps',
  'Checking offers',
  'Calculating reward value',
  'Applying your preferences',
]) {
  if (!steps.includes(label)) errors.push(`Missing step: ${label}`)
}

if (errors.length) {
  console.error('Phase 4 verify FAILED')
  errors.forEach((e) => console.error(' -', e))
  process.exit(1)
}
console.log('Phase 4 structural verification OK')
