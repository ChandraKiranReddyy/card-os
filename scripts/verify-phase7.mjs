import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')
const errors = []

const files = [
  'src/core/analytics/index.ts',
  'src/features/analytics/AnalyticsPage.tsx',
  'src/features/dashboard/OpportunitiesPanel.tsx',
  'src/components/ui/EmptyState.tsx',
  'src/components/ui/ErrorBanner.tsx',
]

for (const f of files) {
  try {
    read(f)
  } catch {
    errors.push(`Missing ${f}`)
  }
}

const analytics = read('src/core/analytics/index.ts')
for (const key of [
  'estimateMissedOpportunity',
  'computeWalletEfficiency',
  'spendingTrendDaily',
  '0.30',
  '≈ ESTIMATED',
]) {
  if (!analytics.includes(key)) errors.push(`Analytics missing ${key}`)
}

const dash = read('src/features/dashboard/DashboardPage.tsx')
if (dash.includes('DEMO_CARDS')) {
  errors.push('Dashboard still imports DEMO_CARDS as primary wallet')
}
if (!dash.includes('OpportunitiesPanel')) {
  errors.push('Dashboard missing OpportunitiesPanel')
}

const app = read('src/App.tsx')
if (!app.includes('analytics')) errors.push('Analytics route missing')

const side = read('src/components/layout/Sidebar.tsx')
if (!side.includes('/analytics')) errors.push('Sidebar analytics link missing')

if (errors.length) {
  console.error('Phase 7 verify FAILED')
  errors.forEach((e) => console.error(' -', e))
  process.exit(1)
}
console.log('Phase 7 structural verification OK')
