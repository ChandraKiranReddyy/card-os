import type { WalletCard } from '../types/card'

const STORAGE_KEY = 'cardos.wallet.v1'
const DB_NAME = 'cardos'
const DB_VERSION = 1
const STORE = 'wallet'

export interface WalletSnapshot {
  version: 1
  country: string
  cards: WalletCard[]
  updatedAt: string
}

export function emptyWallet(country = 'IN'): WalletSnapshot {
  return {
    version: 1,
    country,
    cards: [],
    updatedAt: new Date().toISOString(),
  }
}

function safeParse(raw: string | null): WalletSnapshot | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as WalletSnapshot
    if (data?.version !== 1 || !Array.isArray(data.cards)) return null
    return data
  } catch {
    return null
  }
}

export function loadWalletSync(): WalletSnapshot {
  if (typeof localStorage === 'undefined') return emptyWallet()
  return safeParse(localStorage.getItem(STORAGE_KEY)) ?? emptyWallet()
}

export function saveWalletSync(snapshot: WalletSnapshot): void {
  if (typeof localStorage === 'undefined') return
  const next = { ...snapshot, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  // Best-effort IndexedDB mirror for larger future datasets
  void mirrorToIndexedDb(next)
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IDB open failed'))
  })
}

async function mirrorToIndexedDb(snapshot: WalletSnapshot): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(snapshot, 'primary')
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    // localStorage remains source of truth for V1
  }
}

/** For tests / diagnostics */
export function clearWalletStorage(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}
