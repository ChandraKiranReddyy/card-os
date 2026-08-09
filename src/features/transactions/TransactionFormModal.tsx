import { useEffect, useState, type ReactNode } from 'react'
import type { Transaction } from '../../types/transaction'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useWallet } from '../../store/WalletContext'
import { FIXTURE_CARDS } from '../../data/fixtures/engineFixtures'
import { calculateReward } from '../../core/rewardEngine'
import { walletCardToProfile } from '../../core/adapters/walletToProfile'
import { applyTransactionCapUsage } from '../../core/transactions/applyCapUsage'
import { usePreferences } from '../../store/PreferencesContext'
import { useTransactions } from '../../store/TransactionContext'
import type { EngineCardProfile } from '../../types/engine'

const CATEGORIES = [
  'Shopping',
  'Food',
  'Travel',
  'Fuel',
  'Utilities',
  'Entertainment',
  'Other',
]

export function TransactionFormModal({
  open,
  onClose,
  initial,
  mode,
  onSave,
}: {
  open: boolean
  onClose: () => void
  initial?: Transaction | null
  mode: 'create' | 'edit'
  onSave: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void
}) {
  const { cards } = useWallet()
  const { weights } = usePreferences()
  const { transactions } = useTransactions()

  const cardOptions = [
    ...cards.map((c) => ({
      id: c.walletId,
      label: c.nickname || `${c.issuer} ${c.name}`,
      source: 'wallet' as const,
    })),
    ...FIXTURE_CARDS.map((c) => ({
      id: c.id,
      label: `${c.label} (fixture)`,
      source: 'fixture' as const,
    })),
  ]

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    merchant: '',
    product: '',
    amount: '',
    category: 'Shopping',
    cardId: cardOptions[0]?.id ?? '',
    offerValue: '',
    rewardRaw: '',
    rewardKind: 'cashback' as Transaction['rewardKind'],
    effectiveValue: '',
    notes: '',
  })

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        date: initial.date.slice(0, 10),
        merchant: initial.merchant,
        product: initial.product,
        amount: String(initial.amount),
        category: initial.category,
        cardId: initial.cardId,
        offerValue: String(initial.offerValue || ''),
        rewardRaw: String(initial.rewardRaw || ''),
        rewardKind: initial.rewardKind,
        effectiveValue: String(initial.effectiveValue || ''),
        notes: initial.notes || '',
      })
    } else {
      setForm({
        date: new Date().toISOString().slice(0, 10),
        merchant: '',
        product: '',
        amount: '',
        category: 'Shopping',
        cardId: cardOptions[0]?.id ?? '',
        offerValue: '',
        rewardRaw: '',
        rewardKind: 'cashback',
        effectiveValue: '',
        notes: '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when open/initial changes
  }, [open, initial])

  function resolveProfile(cardId: string): EngineCardProfile | null {
    const wallet = cards.find((c) => c.walletId === cardId)
    if (wallet) {
      const base = [walletCardToProfile(wallet)]
      return applyTransactionCapUsage(base, transactions)[0]
    }
    const fx = FIXTURE_CARDS.find((c) => c.id === cardId)
    if (fx) return applyTransactionCapUsage([fx], transactions)[0]
    return null
  }

  function recalculate() {
    const amount = Number(form.amount)
    const offer = Number(form.offerValue) || 0
    if (!(amount > 0) || !form.merchant || !form.cardId) return
    const profile = resolveProfile(form.cardId)
    if (!profile || !profile.rules.length) return
    const breakdown = calculateReward(
      profile,
      {
        amount,
        currency: 'INR',
        merchant: form.merchant,
        category: form.category,
      },
      weights,
      offer,
    )
    setForm((f) => ({
      ...f,
      rewardRaw: String(breakdown.rawRewardAfterCap),
      rewardKind: breakdown.kind === 'none' ? 'none' : breakdown.kind,
      effectiveValue: String(breakdown.totalValue),
    }))
  }

  function submit() {
    const amount = Number(form.amount)
    if (!form.merchant.trim() || !form.product.trim() || !(amount > 0) || !form.cardId) {
      return
    }
    const opt = cardOptions.find((c) => c.id === form.cardId)
    onSave({
      id: initial?.id,
      date: new Date(form.date).toISOString(),
      merchant: form.merchant,
      product: form.product,
      amount,
      currency: 'INR',
      category: form.category,
      cardId: form.cardId,
      cardLabel: opt?.label.replace(' (fixture)', '') || form.cardId,
      offerValue: Number(form.offerValue) || 0,
      rewardRaw: Number(form.rewardRaw) || 0,
      rewardKind: form.rewardKind,
      effectiveValue: Number(form.effectiveValue) || 0,
      notes: form.notes || undefined,
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit transaction' : 'Add transaction'}
      description="Edits recalculate spending, rewards totals, and monthly cap usage."
      wide
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date">
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </Field>
        <Field label="Card">
          <select
            className="h-11 w-full rounded-xl border border-border-soft bg-surface-0 px-3 text-sm"
            value={form.cardId}
            onChange={(e) => setForm({ ...form, cardId: e.target.value })}
          >
            {cardOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Merchant *">
          <Input
            value={form.merchant}
            onChange={(e) => setForm({ ...form, merchant: e.target.value })}
          />
        </Field>
        <Field label="Product *">
          <Input
            value={form.product}
            onChange={(e) => setForm({ ...form, product: e.target.value })}
          />
        </Field>
        <Field label="Amount (INR) *">
          <Input
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </Field>
        <Field label="Category">
          <select
            className="h-11 w-full rounded-xl border border-border-soft bg-surface-0 px-3 text-sm"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Offer value">
          <Input
            inputMode="decimal"
            value={form.offerValue}
            onChange={(e) => setForm({ ...form, offerValue: e.target.value })}
          />
        </Field>
        <Field label="Reward kind">
          <select
            className="h-11 w-full rounded-xl border border-border-soft bg-surface-0 px-3 text-sm"
            value={form.rewardKind}
            onChange={(e) =>
              setForm({
                ...form,
                rewardKind: e.target.value as Transaction['rewardKind'],
              })
            }
          >
            <option value="cashback">cashback</option>
            <option value="points">points</option>
            <option value="miles">miles</option>
            <option value="none">none</option>
          </select>
        </Field>
        <Field label="Reward raw (after caps)">
          <Input
            inputMode="decimal"
            value={form.rewardRaw}
            onChange={(e) => setForm({ ...form, rewardRaw: e.target.value })}
          />
        </Field>
        <Field label="Effective value (₹)">
          <Input
            inputMode="decimal"
            value={form.effectiveValue}
            onChange={(e) => setForm({ ...form, effectiveValue: e.target.value })}
          />
        </Field>
        <Field label="Notes">
          <Input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="secondary" onClick={recalculate}>
          Recalculate rewards
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={submit}>
          Save
        </Button>
      </div>
    </Modal>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-medium text-text-secondary">
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  )
}
