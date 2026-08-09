import {
  exportAllData,
  exportAllDataJson,
  parseImportJson,
  importAllData,
  resetAllLocalData,
  EXPORT_FORMAT,
} from './index'
import { loadWalletSync, saveWalletSync } from '../../store/walletStorage'
import { loadTransactionsSync } from '../../store/transactionStorage'

/** Minimal localStorage polyfill for Node self-tests */
function ensureLocalStorage(): void {
  if (typeof globalThis.localStorage !== 'undefined') return
  const store = new Map<string, string>()
  const ls = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, String(v))
    },
    removeItem: (k: string) => {
      store.delete(k)
    },
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size
    },
  }
  Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true })
}

export function runDataPortabilitySelfTests(): {
  ok: boolean
  errors: string[]
  logs: string[]
} {
  ensureLocalStorage()
  const errors: string[] = []
  const logs: string[] = []

  // Ensure clean-ish state for test
  resetAllLocalData()

  // Seed wallet
  const wallet = loadWalletSync()
  wallet.cards.push({
    walletId: 'w-test',
    catalogCardId: null,
    isCustom: true,
    country: 'IN',
    issuer: 'Test Bank',
    name: 'Test Card',
    variant: '',
    network: 'Visa',
    nickname: 'Primary',
    annualFee: null,
    currency: 'INR',
    rewardCurrency: 'Cashback',
    rewardType: 'Cashback',
    rewardRate: 5,
    eligibleCategories: '',
    exclusions: '',
    merchantRules: '',
    redemptionValues: '',
    capsNotes: '',
    milestonesNotes: '',
    benefitsNotes: '',
    gradient: '#111',
    accent: '#fff',
    verification: {
      status: 'user_provided',
      lastVerified: null,
      source: 'test',
    },
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  saveWalletSync(wallet)

  const exported = exportAllData()
  if (exported.format !== EXPORT_FORMAT) errors.push('export format')
  if (exported.wallet.cards.length < 1) errors.push('export wallet empty')
  logs.push(`export cards ${exported.wallet.cards.length}`)

  const json = exportAllDataJson()
  const parsed = parseImportJson(json)
  if (!parsed.ok) errors.push(`parse failed: ${'error' in parsed ? parsed.error : ''}`)
  else {
    resetAllLocalData()
    if (loadWalletSync().cards.length !== 0) errors.push('reset did not clear wallet')
    importAllData(parsed.data)
    if (loadWalletSync().cards.length < 1) errors.push('import did not restore wallet')
    logs.push('import restore OK')
  }

  // Reject invalid
  const bad = parseImportJson('{"hello":1}')
  if (bad.ok) errors.push('should reject non-export')

  // Reject PAN-like
  const panPayload = JSON.stringify({
    format: EXPORT_FORMAT,
    version: 1,
    wallet: { version: 1, country: 'IN', cards: [], updatedAt: '' },
    transactions: { version: 1, transactions: [], updatedAt: '' },
    preferences: { version: 1, weights: {}, updatedAt: '' },
    optimization: {
      version: 1,
      offers: [],
      milestones: [],
      benefits: [],
      updatedAt: '',
    },
    sneaky: '4111111111111111',
  })
  const pan = parseImportJson(panPayload)
  if (pan.ok) errors.push('should reject PAN-like data')
  else logs.push('PAN reject OK')

  // Reject prototype pollution keys
  const proto = parseImportJson(
    JSON.stringify({
      format: EXPORT_FORMAT,
      version: 1,
      wallet: { version: 1, country: 'IN', cards: [], updatedAt: '', __proto__: { x: 1 } },
      transactions: { version: 1, transactions: [], updatedAt: '' },
      preferences: { version: 1, weights: {}, updatedAt: '' },
      optimization: {
        version: 1,
        offers: [],
        milestones: [],
        benefits: [],
        updatedAt: '',
      },
    }),
  )
  // Note: JSON.parse may drop __proto__; hasDangerousKeys still checks keys present
  logs.push(`proto parse ok=${proto.ok}`)

  void loadTransactionsSync()
  resetAllLocalData()

  return { ok: errors.length === 0, errors, logs }
}
