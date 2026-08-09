/**
 * Phase 3 structural verification (source presence).
 * Runtime math is verified via: npx tsx -e "import { runEngineSelfTests }..."
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')

const errors = []
const files = [
  'src/core/rewardEngine/index.ts',
  'src/core/rewardEngine/rates.ts',
  'src/core/rewardEngine/eligibility.ts',
  'src/core/capEngine/index.ts',
  'src/core/valuationEngine/index.ts',
  'src/core/recommendationEngine/index.ts',
  'src/core/adapters/walletToProfile.ts',
  'src/data/fixtures/engineFixtures.ts',
  'src/core/engine.selftest.ts',
]

for (const f of files) {
  try {
    read(f)
  } catch {
    errors.push(`Missing ${f}`)
  }
}

const reward = read('src/core/rewardEngine/rates.ts')
for (const fn of [
  'baseReward',
  'categoryReward',
  'merchantMultiplier',
  'cashbackAmount',
  'pointsEarned',
  'milesEarned',
]) {
  if (!reward.includes(`export function ${fn}`)) errors.push(`Missing ${fn}`)
}

const cap = read('src/core/capEngine/index.ts')
if (!cap.includes('applyCaps') || !cap.includes('remainingOnCap')) {
  errors.push('Cap engine incomplete')
}

const rec = read('src/core/recommendationEngine/index.ts')
if (!rec.includes('recommendCards')) errors.push('recommendCards missing')

const fixtures = read('src/data/fixtures/engineFixtures.ts')
if (!fixtures.includes('SYNTHETIC') && !fixtures.includes('synthetic')) {
  errors.push('Fixtures must be labeled synthetic')
}

if (errors.length) {
  console.error('Phase 3 verify FAILED')
  errors.forEach((e) => console.error(' -', e))
  process.exit(1)
}
console.log('Phase 3 structural verification OK')
