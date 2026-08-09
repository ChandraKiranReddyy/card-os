import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')
const errors = []

const files = [
  'src/core/dataPortability/index.ts',
  'src/components/ErrorBoundary.tsx',
  'SECURITY.md',
  'DEPLOY.md',
  'public/_redirects',
  'vercel.json',
]

for (const f of files) {
  if (!existsSync(join(root, f))) errors.push(`Missing ${f}`)
}

const port = read('src/core/dataPortability/index.ts')
for (const k of [
  'exportAllData',
  'parseImportJson',
  'importAllData',
  'resetAllLocalData',
  'containsPanLike',
  'hasDangerousKeys',
]) {
  if (!port.includes(k)) errors.push(`dataPortability missing ${k}`)
}

const settings = read('src/features/settings/SettingsPage.tsx')
if (!settings.includes('Export my data') || !settings.includes('Import my data')) {
  errors.push('Settings missing export/import UI')
}
if (!settings.includes('Delete all local data')) {
  errors.push('Settings missing reset UI')
}

const app = read('src/App.tsx')
if (!app.includes('ErrorBoundary')) errors.push('ErrorBoundary not wired')
if (!app.includes('lazy')) errors.push('Lazy routes not used for performance')

const shell = read('src/components/layout/AppShell.tsx')
if (!shell.includes('Skip to main content')) errors.push('Skip link missing')
if (!shell.includes('main-content')) errors.push('main id missing')

if (errors.length) {
  console.error('Phase 8 verify FAILED')
  errors.forEach((e) => console.error(' -', e))
  process.exit(1)
}
console.log('Phase 8 structural verification OK')
