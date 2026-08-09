import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')
const errors = []

const files = [
  'src/types/transaction.ts',
  'src/store/transactionStorage.ts',
  'src/store/TransactionContext.tsx',
  'src/core/transactions/aggregates.ts',
  'src/core/transactions/applyCapUsage.ts',
  'src/features/transactions/TransactionsPage.tsx',
  'src/features/transactions/TransactionFormModal.tsx',
]

for (const f of files) {
  try {
    read(f)
  } catch {
    errors.push(`Missing ${f}`)
  }
}

const resultView = read('src/features/analyzer/AnalysisResultView.tsx')
if (!resultView.includes('Mark as used')) errors.push('Mark as used missing')

const app = read('src/App.tsx')
if (!app.includes('TransactionProvider')) errors.push('TransactionProvider not wired')

const txPage = read('src/features/transactions/TransactionsPage.tsx')
if (txPage.includes('Transaction tracking not active yet')) {
  errors.push('Transactions still placeholder')
}

if (errors.length) {
  console.error('Phase 5 verify FAILED')
  errors.forEach((e) => console.error(' -', e))
  process.exit(1)
}
console.log('Phase 5 structural verification OK')
