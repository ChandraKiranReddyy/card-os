import type { ReactNode } from 'react'
import type { PurchaseDraft } from '../../types/analyzer'
import { GlassCard } from '../../components/ui/GlassCard'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

const CATEGORIES = [
  'Shopping',
  'Food',
  'Travel',
  'Fuel',
  'Utilities',
  'Entertainment',
  'Other',
]

export function ManualFallbackForm({
  draft,
  onChange,
  onAnalyze,
  busy,
  showWarning,
}: {
  draft: PurchaseDraft
  onChange: (draft: PurchaseDraft) => void
  onAnalyze: () => void
  busy?: boolean
  showWarning?: boolean
}) {
  return (
    <GlassCard>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="font-display text-sm font-semibold text-text-primary">
          Purchase details
        </h3>
        {showWarning && (
          <Badge tone="warning">Manual completion needed</Badge>
        )}
      </div>
      {showWarning && (
        <p className="mb-4 text-sm text-text-secondary">
          We couldn&apos;t retrieve all product details. Enter the missing fields to
          continue analysis. CARD//OS does not scrape product pages in V1.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Merchant *">
          <Input
            value={draft.merchant}
            onChange={(e) => onChange({ ...draft, merchant: e.target.value })}
            placeholder="e.g. Amazon"
          />
        </Field>
        <Field label="Product *">
          <Input
            value={draft.product}
            onChange={(e) => onChange({ ...draft, product: e.target.value })}
            placeholder="e.g. Sony WH-1000XM6"
          />
        </Field>
        <Field label="Price (INR) *">
          <Input
            inputMode="decimal"
            value={draft.price ?? ''}
            onChange={(e) =>
              onChange({
                ...draft,
                price: e.target.value === '' ? null : Number(e.target.value),
              })
            }
            placeholder="e.g. 39990"
          />
        </Field>
        <Field label="Category *">
          <select
            className="h-11 w-full rounded-xl border border-border-soft bg-surface-0 px-3 text-sm text-text-primary"
            value={draft.category}
            onChange={(e) => onChange({ ...draft, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Offer value (optional ₹)">
          <Input
            inputMode="decimal"
            value={draft.offerValue || ''}
            onChange={(e) =>
              onChange({
                ...draft,
                offerValue: e.target.value === '' ? 0 : Number(e.target.value),
              })
            }
            placeholder="Instant discount / bank offer"
          />
        </Field>
        <Field label="Country">
          <Input
            value={draft.country}
            onChange={(e) => onChange({ ...draft, country: e.target.value })}
          />
        </Field>
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="button" onClick={onAnalyze} disabled={busy}>
          {busy ? 'Analyzing…' : 'Run analysis'}
        </Button>
      </div>
    </GlassCard>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block text-xs font-medium text-text-secondary">
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  )
}
