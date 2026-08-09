import type { Transaction } from '../types/transaction'

const STORAGE_KEY = 'cardos.transactions.v1'

export interface TransactionSnapshot {
  version: 1
  transactions: Transaction[]
  updatedAt: string
}

export function emptyTransactions(): TransactionSnapshot {
  return {
    version: 1,
    transactions: [],
    updatedAt: new Date().toISOString(),
  }
}

function safeParse(raw: string | null): TransactionSnapshot | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as TransactionSnapshot
    if (data?.version !== 1 || !Array.isArray(data.transactions)) return null
    return data
  } catch {
    return null
  }
}

export function loadTransactionsSync(): TransactionSnapshot {
  if (typeof localStorage === 'undefined') return emptyTransactions()
  return safeParse(localStorage.getItem(STORAGE_KEY)) ?? emptyTransactions()
}

export function saveTransactionsSync(snapshot: TransactionSnapshot): void {
  if (typeof localStorage === 'undefined') return
  const next = { ...snapshot, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function clearTransactionsStorage(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}
