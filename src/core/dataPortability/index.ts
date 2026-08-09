/**
 * Phase 8 data tools — export / import / wipe local CARD//OS data.
 * Never includes PAN, CVV, PIN, OTP, or banking credentials by design.
 */

import {
  emptyWallet,
  loadWalletSync,
  saveWalletSync,
  type WalletSnapshot,
} from '../../store/walletStorage'
import {
  emptyTransactions,
  loadTransactionsSync,
  saveTransactionsSync,
  type TransactionSnapshot,
} from '../../store/transactionStorage'
import {
  loadPreferences,
  savePreferences,
  type PreferencesSnapshot,
} from '../../store/preferencesStorage'
import {
  emptyOptimization,
  loadOptimizationSync,
  saveOptimizationSync,
  type OptimizationSnapshot,
} from '../../store/optimizationStorage'
import { DEFAULT_PREFERENCE_WEIGHTS } from '../valuationEngine'

export const EXPORT_FORMAT = 'cardos-export' as const
export const EXPORT_VERSION = 1 as const

export const LOCAL_STORAGE_KEYS = [
  'cardos.wallet.v1',
  'cardos.transactions.v1',
  'cardos.preferences.v1',
  'cardos.optimization.v1',
] as const

export interface CardOsExport {
  format: typeof EXPORT_FORMAT
  version: typeof EXPORT_VERSION
  exportedAt: string
  app: 'CARD//OS'
  wallet: WalletSnapshot
  transactions: TransactionSnapshot
  preferences: PreferencesSnapshot
  optimization: OptimizationSnapshot
}

export function exportAllData(): CardOsExport {
  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'CARD//OS',
    wallet: loadWalletSync(),
    transactions: loadTransactionsSync(),
    preferences: loadPreferences(),
    optimization: loadOptimizationSync(),
  }
}

export function exportAllDataJson(pretty = true): string {
  const data = exportAllData()
  // Defense-in-depth: strip any accidental long digit sequences that look like PANs
  const sanitized = sanitizeExport(data)
  return JSON.stringify(sanitized, null, pretty ? 2 : 0)
}

/** Reject objects with dangerous keys; ensure shape matches export. */
export function parseImportJson(raw: string): {
  ok: true
  data: CardOsExport
} | { ok: false; error: string } {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'File is not valid JSON. Choose a CARD//OS export file.' }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'Export file has an invalid structure.' }
  }

  if (hasDangerousKeys(parsed)) {
    return { ok: false, error: 'Export file contains unsupported keys and was rejected.' }
  }

  const obj = parsed as Record<string, unknown>
  if (obj.format !== EXPORT_FORMAT) {
    return {
      ok: false,
      error: 'Not a CARD//OS export (missing format marker).',
    }
  }
  if (obj.version !== 1) {
    return {
      ok: false,
      error: `Unsupported export version (${String(obj.version)}). This app reads version 1.`,
    }
  }

  const wallet = normalizeWallet(obj.wallet)
  const transactions = normalizeTransactions(obj.transactions)
  const preferences = normalizePreferences(obj.preferences)
  const optimization = normalizeOptimization(obj.optimization)

  if (!wallet) return { ok: false, error: 'Wallet data in export is invalid.' }
  if (!transactions) return { ok: false, error: 'Transactions data in export is invalid.' }
  if (!preferences) return { ok: false, error: 'Preferences data in export is invalid.' }
  if (!optimization) return { ok: false, error: 'Offers/milestones/benefits data is invalid.' }

  // Scan for PAN-like fields in string values
  if (containsPanLike(parsed)) {
    return {
      ok: false,
      error:
        'Import blocked: data appears to include a full card number. CARD//OS never stores PANs.',
    }
  }

  return {
    ok: true,
    data: {
      format: EXPORT_FORMAT,
      version: EXPORT_VERSION,
      exportedAt:
        typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString(),
      app: 'CARD//OS',
      wallet,
      transactions,
      preferences,
      optimization,
    },
  }
}

export function importAllData(data: CardOsExport): void {
  saveWalletSync(data.wallet)
  saveTransactionsSync(data.transactions)
  savePreferences(data.preferences.weights)
  saveOptimizationSync(data.optimization)
}

/** Wipe all CARD//OS localStorage keys (and best-effort IndexedDB wallet mirror). */
export function resetAllLocalData(): void {
  if (typeof localStorage !== 'undefined') {
    for (const key of LOCAL_STORAGE_KEYS) {
      localStorage.removeItem(key)
    }
  }
  // Reset in-memory defaults via writes of empties (helps if reload is delayed)
  saveWalletSync(emptyWallet())
  saveTransactionsSync(emptyTransactions())
  savePreferences({ ...DEFAULT_PREFERENCE_WEIGHTS })
  saveOptimizationSync(emptyOptimization())

  if (typeof indexedDB !== 'undefined') {
    try {
      indexedDB.deleteDatabase('cardos')
    } catch {
      // ignore
    }
  }
}

function normalizeWallet(raw: unknown): WalletSnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const w = raw as WalletSnapshot
  if (!Array.isArray(w.cards)) return null
  return {
    version: 1,
    country: typeof w.country === 'string' ? w.country : 'IN',
    cards: w.cards,
    updatedAt: typeof w.updatedAt === 'string' ? w.updatedAt : new Date().toISOString(),
  }
}

function normalizeTransactions(raw: unknown): TransactionSnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const t = raw as TransactionSnapshot
  if (!Array.isArray(t.transactions)) return null
  return {
    version: 1,
    transactions: t.transactions,
    updatedAt: typeof t.updatedAt === 'string' ? t.updatedAt : new Date().toISOString(),
  }
}

function normalizePreferences(raw: unknown): PreferencesSnapshot | null {
  if (!raw || typeof raw !== 'object') {
    return {
      version: 1,
      weights: { ...DEFAULT_PREFERENCE_WEIGHTS },
      updatedAt: new Date().toISOString(),
    }
  }
  const p = raw as PreferencesSnapshot
  return {
    version: 1,
    weights: { ...DEFAULT_PREFERENCE_WEIGHTS, ...(p.weights || {}) },
    updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : new Date().toISOString(),
  }
}

function normalizeOptimization(raw: unknown): OptimizationSnapshot | null {
  if (!raw || typeof raw !== 'object') return emptyOptimization()
  const o = raw as OptimizationSnapshot
  return {
    version: 1,
    offers: Array.isArray(o.offers) ? o.offers : [],
    milestones: Array.isArray(o.milestones) ? o.milestones : [],
    benefits: Array.isArray(o.benefits) ? o.benefits : [],
    updatedAt: typeof o.updatedAt === 'string' ? o.updatedAt : new Date().toISOString(),
  }
}

function hasDangerousKeys(value: unknown, depth = 0): boolean {
  if (depth > 12 || value == null) return false
  if (Array.isArray(value)) {
    return value.some((v) => hasDangerousKeys(v, depth + 1))
  }
  if (typeof value === 'object') {
    for (const key of Object.keys(value as object)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return true
      }
      if (hasDangerousKeys((value as Record<string, unknown>)[key], depth + 1)) {
        return true
      }
    }
  }
  return false
}

/** 13–19 consecutive digits often indicate a full card number */
function containsPanLike(value: unknown, depth = 0): boolean {
  if (depth > 12 || value == null) return false
  if (typeof value === 'string') {
    const digits = value.replace(/[\s-]/g, '')
    if (/^\d{13,19}$/.test(digits)) return true
  }
  if (Array.isArray(value)) {
    return value.some((v) => containsPanLike(v, depth + 1))
  }
  if (typeof value === 'object') {
    return Object.values(value as object).some((v) => containsPanLike(v, depth + 1))
  }
  return false
}

function sanitizeExport<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => {
      if (typeof value === 'string') {
        const digits = value.replace(/[\s-]/g, '')
        if (/^\d{13,19}$/.test(digits)) return '[REDACTED_CARD_NUMBER]'
      }
      return value
    }),
  ) as T
}

export function downloadJsonFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
