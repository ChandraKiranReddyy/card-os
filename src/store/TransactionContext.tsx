import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Transaction, TransactionInput } from '../types/transaction'
import {
  emptyTransactions,
  loadTransactionsSync,
  saveTransactionsSync,
  type TransactionSnapshot,
} from './transactionStorage'
import { computeSpendingAggregates } from '../core/transactions/aggregates'
import type { SpendingAggregates } from '../types/transaction'

interface TransactionContextValue {
  transactions: Transaction[]
  aggregates: SpendingAggregates
  addTransaction: (input: TransactionInput) => Transaction
  updateTransaction: (id: string, patch: Partial<TransactionInput>) => void
  deleteTransaction: (id: string) => void
  getTransaction: (id: string) => Transaction | undefined
  clearAll: () => void
}

const TransactionContext = createContext<TransactionContextValue | null>(null)

function uid(): string {
  return `tx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<TransactionSnapshot>(() =>
    loadTransactionsSync(),
  )

  const persist = useCallback((next: TransactionSnapshot) => {
    saveTransactionsSync(next)
    setSnapshot({ ...next, updatedAt: new Date().toISOString() })
  }, [])

  const addTransaction = useCallback(
    (input: TransactionInput) => {
      const now = new Date().toISOString()
      const tx: Transaction = {
        id: input.id || uid(),
        date: input.date || now,
        merchant: input.merchant.trim(),
        product: input.product.trim(),
        amount: input.amount,
        currency: input.currency || 'INR',
        category: input.category.trim(),
        cardId: input.cardId,
        cardLabel: input.cardLabel,
        offerValue: input.offerValue || 0,
        rewardRaw: input.rewardRaw || 0,
        rewardKind: input.rewardKind || 'none',
        effectiveValue: input.effectiveValue || 0,
        url: input.url,
        notes: input.notes,
        createdAt: now,
        updatedAt: now,
      }
      persist({
        ...snapshot,
        transactions: [tx, ...snapshot.transactions],
      })
      return tx
    },
    [persist, snapshot],
  )

  const updateTransaction = useCallback(
    (id: string, patch: Partial<TransactionInput>) => {
      const transactions = snapshot.transactions.map((t) => {
        if (t.id !== id) return t
        return {
          ...t,
          date: patch.date ?? t.date,
          merchant: patch.merchant?.trim() ?? t.merchant,
          product: patch.product?.trim() ?? t.product,
          amount: patch.amount ?? t.amount,
          currency: patch.currency ?? t.currency,
          category: patch.category?.trim() ?? t.category,
          cardId: patch.cardId ?? t.cardId,
          cardLabel: patch.cardLabel ?? t.cardLabel,
          offerValue: patch.offerValue ?? t.offerValue,
          rewardRaw: patch.rewardRaw ?? t.rewardRaw,
          rewardKind: patch.rewardKind ?? t.rewardKind,
          effectiveValue: patch.effectiveValue ?? t.effectiveValue,
          url: patch.url !== undefined ? patch.url : t.url,
          notes: patch.notes !== undefined ? patch.notes : t.notes,
          updatedAt: new Date().toISOString(),
        }
      })
      persist({ ...snapshot, transactions })
    },
    [persist, snapshot],
  )

  const deleteTransaction = useCallback(
    (id: string) => {
      persist({
        ...snapshot,
        transactions: snapshot.transactions.filter((t) => t.id !== id),
      })
    },
    [persist, snapshot],
  )

  const getTransaction = useCallback(
    (id: string) => snapshot.transactions.find((t) => t.id === id),
    [snapshot.transactions],
  )

  const clearAll = useCallback(() => {
    persist(emptyTransactions())
  }, [persist])

  const aggregates = useMemo(
    () => computeSpendingAggregates(snapshot.transactions),
    [snapshot.transactions],
  )

  const value = useMemo(
    () => ({
      transactions: snapshot.transactions,
      aggregates,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getTransaction,
      clearAll,
    }),
    [
      snapshot.transactions,
      aggregates,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getTransaction,
      clearAll,
    ],
  )

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const ctx = useContext(TransactionContext)
  if (!ctx) throw new Error('useTransactions must be used within TransactionProvider')
  return ctx
}
