import { useMemo, useState, type ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlassCard } from '../../components/ui/GlassCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { AlertsBar } from '../../components/AlertsBar'
import { useOptimization } from '../../store/OptimizationContext'
import { useWallet } from '../../store/WalletContext'
import { useTransactions } from '../../store/TransactionContext'
import { getMilestoneProgress } from '../../core/milestoneEngine'
import { generateAlerts } from '../../core/alertEngine'
import { walletCardsToProfiles } from '../../core/adapters/walletToProfile'
import { formatINR } from '../../lib/format'
import type {
  OfferType,
  UserBenefit,
  UserMilestone,
} from '../../types/optimization'
import { cn } from '../../lib/cn'

type Tab = 'offers' | 'milestones' | 'benefits' | 'alerts'

export function BenefitsPage() {
  const [tab, setTab] = useState<Tab>('offers')
  const {
    offers,
    milestones,
    benefits,
    addOffer,
    removeOffer,
    addMilestone,
    removeMilestone,
    addBenefit,
    removeBenefit,
    updateBenefit,
  } = useOptimization()
  const { cards } = useWallet()
  const { transactions } = useTransactions()

  const [offerOpen, setOfferOpen] = useState(false)
  const [msOpen, setMsOpen] = useState(false)
  const [benOpen, setBenOpen] = useState(false)

  const alerts = useMemo(
    () =>
      generateAlerts({
        profiles: walletCardsToProfiles(cards),
        transactions,
        milestones,
        benefits,
      }),
    [cards, transactions, milestones, benefits],
  )

  const cardOptions = cards.map((c) => ({
    id: c.walletId,
    label: c.nickname || `${c.issuer} ${c.name}`,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Benefits & optimization"
        description="User-provided offers, spend milestones, card benefits, and quiet alerts. These influence recommendations when applicable."
        badge="Phase 6"
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['offers', 'Offers'],
            ['milestones', 'Milestones'],
            ['benefits', 'Benefits'],
            ['alerts', `Alerts (${alerts.length})`],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={tab === id ? 'primary' : 'secondary'}
            onClick={() => setTab(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      {tab === 'alerts' && (
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <GlassCard>
              <p className="text-sm text-text-secondary">
                No alerts right now. Caps, milestones, and expiring benefits will appear here
                when relevant — never as intrusive popups.
              </p>
            </GlassCard>
          ) : (
            <AlertsBar alerts={alerts} />
          )}
        </div>
      )}

      {tab === 'offers' && (
        <Section
          title="Offers"
          action={
            <Button type="button" size="sm" onClick={() => setOfferOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Add offer
            </Button>
          }
        >
          {offers.length === 0 ? (
            <Empty text="No offers yet. Add bank/merchant discounts or reward multipliers (user-provided)." />
          ) : (
            <ul className="space-y-2">
              {offers.map((o) => (
                <li key={o.id}>
                  <GlassCard className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-text-primary">{o.name}</p>
                        <Badge tone="accent">{o.type.replace('_', ' ')}</Badge>
                        {!o.active && <Badge tone="muted">Inactive</Badge>}
                      </div>
                      <p className="mt-1 text-xs text-text-secondary">
                        {o.issuer || 'Any issuer'}
                        {o.merchant ? ` · ${o.merchant}` : ''}
                        {o.category ? ` · ${o.category}` : ''}
                        {o.minSpend > 0 ? ` · min ${formatINR(o.minSpend)}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {o.discountPercent != null && `${o.discountPercent}% off`}
                        {o.discountFlat != null && ` · flat ${formatINR(o.discountFlat)}`}
                        {o.maxDiscount != null && ` · max ${formatINR(o.maxDiscount)}`}
                        {o.rewardMultiplier != null &&
                          o.rewardMultiplier > 1 &&
                          ` · ×${o.rewardMultiplier} rewards`}
                        {' · '}
                        {o.validFrom.slice(0, 10)} → {o.validTo.slice(0, 10)}
                      </p>
                      <Badge tone="muted" className="mt-2">
                        ✎ USER PROVIDED
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeOffer(o.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-danger" />
                    </Button>
                  </GlassCard>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {tab === 'milestones' && (
        <Section
          title="Milestones"
          action={
            <Button type="button" size="sm" onClick={() => setMsOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Add milestone
            </Button>
          }
        >
          {milestones.length === 0 ? (
            <Empty text="Track spend milestones (e.g. ₹75,000 / ₹1,00,000). Completing one can boost a recommendation." />
          ) : (
            <ul className="space-y-3">
              {milestones.map((m) => {
                const p = getMilestoneProgress(m, transactions)
                return (
                  <li key={m.id}>
                    <GlassCard>
                      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-text-primary">{m.name}</p>
                          <p className="text-xs text-text-muted">
                            {m.period} · value ≈ {formatINR(m.rewardValue)}
                            {m.cardId
                              ? ` · ${cardOptions.find((c) => c.id === m.cardId)?.label || m.cardId}`
                              : ' · all cards'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeMilestone(m.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-danger" />
                        </Button>
                      </div>
                      <p className="mb-2 text-sm text-text-secondary">
                        {formatINR(p.currentSpend)} / {formatINR(m.targetSpend)} ·{' '}
                        {p.progressPct}%
                        {p.remaining > 0
                          ? ` · ${formatINR(p.remaining)} remaining`
                          : ' · completed'}
                      </p>
                      <ProgressBar
                        value={p.progressPct}
                        tone={p.progressPct >= 100 ? 'positive' : 'accent'}
                      />
                    </GlassCard>
                  </li>
                )
              })}
            </ul>
          )}
        </Section>
      )}

      {tab === 'benefits' && (
        <Section
          title="Benefits"
          action={
            <Button type="button" size="sm" onClick={() => setBenOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Add benefit
            </Button>
          }
        >
          {benefits.length === 0 ? (
            <Empty text="Lounge access, fee waivers, partner perks — track expiry and status." />
          ) : (
            <ul className="space-y-2">
              {benefits.map((b) => (
                <li key={b.id}>
                  <GlassCard className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-text-primary">{b.name}</p>
                        <Badge
                          tone={
                            b.status === 'active'
                              ? 'positive'
                              : b.status === 'expired'
                                ? 'danger'
                                : 'muted'
                          }
                        >
                          {b.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary">{b.description}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {b.eligibility}
                        {b.value != null ? ` · ~${formatINR(b.value)}` : ''}
                        {b.expiry ? ` · exp ${b.expiry.slice(0, 10)}` : ''}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(['active', 'used', 'expired'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={cn(
                              'rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase',
                              b.status === s
                                ? 'bg-accent-dim text-accent-soft'
                                : 'text-text-muted hover:bg-white/5',
                            )}
                            onClick={() => updateBenefit(b.id, { status: s })}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeBenefit(b.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-danger" />
                    </Button>
                  </GlassCard>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      <OfferModal
        open={offerOpen}
        onClose={() => setOfferOpen(false)}
        cardOptions={cardOptions}
        onSave={(data) => {
          addOffer(data)
          setOfferOpen(false)
        }}
      />
      <MilestoneModal
        open={msOpen}
        onClose={() => setMsOpen(false)}
        cardOptions={cardOptions}
        onSave={(data) => {
          addMilestone(data)
          setMsOpen(false)
        }}
      />
      <BenefitModal
        open={benOpen}
        onClose={() => setBenOpen(false)}
        cardOptions={cardOptions}
        onSave={(data) => {
          addBenefit(data)
          setBenOpen(false)
        }}
      />
    </div>
  )
}

function Section({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <GlassCard>
      <p className="text-sm text-text-secondary">{text}</p>
    </GlassCard>
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

function OfferModal({
  open,
  onClose,
  cardOptions,
  onSave,
}: {
  open: boolean
  onClose: () => void
  cardOptions: Array<{ id: string; label: string }>
  onSave: (data: Parameters<ReturnType<typeof useOptimization>['addOffer']>[0]) => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useStateOffer(today)

  return (
    <Modal open={open} onClose={onClose} title="Add offer" wide>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name *">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Type">
          <select
            className="h-11 w-full rounded-xl border border-border-soft bg-surface-0 px-3 text-sm"
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as OfferType })
            }
          >
            <option value="bank">bank</option>
            <option value="merchant">merchant</option>
            <option value="instant_discount">instant_discount</option>
            <option value="reward_multiplier">reward_multiplier</option>
          </select>
        </Field>
        <Field label="Issuer">
          <Input
            value={form.issuer}
            onChange={(e) => setForm({ ...form, issuer: e.target.value })}
          />
        </Field>
        <Field label="Card (optional)">
          <select
            className="h-11 w-full rounded-xl border border-border-soft bg-surface-0 px-3 text-sm"
            value={form.cardId}
            onChange={(e) => setForm({ ...form, cardId: e.target.value })}
          >
            <option value="">Any card</option>
            {cardOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Merchant">
          <Input
            value={form.merchant}
            onChange={(e) => setForm({ ...form, merchant: e.target.value })}
            placeholder="Amazon (blank = any)"
          />
        </Field>
        <Field label="Category">
          <Input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Shopping (blank = any)"
          />
        </Field>
        <Field label="Min spend">
          <Input
            inputMode="decimal"
            value={form.minSpend}
            onChange={(e) => setForm({ ...form, minSpend: e.target.value })}
          />
        </Field>
        <Field label="Discount %">
          <Input
            inputMode="decimal"
            value={form.discountPercent}
            onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
          />
        </Field>
        <Field label="Discount flat ₹">
          <Input
            inputMode="decimal"
            value={form.discountFlat}
            onChange={(e) => setForm({ ...form, discountFlat: e.target.value })}
          />
        </Field>
        <Field label="Max discount ₹">
          <Input
            inputMode="decimal"
            value={form.maxDiscount}
            onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
          />
        </Field>
        <Field label="Reward multiplier">
          <Input
            inputMode="decimal"
            value={form.rewardMultiplier}
            onChange={(e) => setForm({ ...form, rewardMultiplier: e.target.value })}
            placeholder="e.g. 2"
          />
        </Field>
        <Field label="Valid from">
          <Input
            type="date"
            value={form.validFrom}
            onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
          />
        </Field>
        <Field label="Valid to">
          <Input
            type="date"
            value={form.validTo}
            onChange={(e) => setForm({ ...form, validTo: e.target.value })}
          />
        </Field>
        <Field label="Eligibility notes">
          <Input
            value={form.eligibilityNotes}
            onChange={(e) => setForm({ ...form, eligibilityNotes: e.target.value })}
          />
        </Field>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => {
            if (!form.name.trim()) return
            onSave({
              type: form.type,
              name: form.name,
              issuer: form.issuer,
              cardId: form.cardId,
              merchant: form.merchant,
              category: form.category,
              minSpend: Number(form.minSpend) || 0,
              discountPercent: numOrNull(form.discountPercent),
              discountFlat: numOrNull(form.discountFlat),
              maxDiscount: numOrNull(form.maxDiscount),
              rewardMultiplier: numOrNull(form.rewardMultiplier),
              validFrom: form.validFrom,
              validTo: form.validTo,
              eligibilityNotes: form.eligibilityNotes,
              active: true,
            })
          }}
        >
          Save offer
        </Button>
      </div>
    </Modal>
  )
}

function useStateOffer(today: string) {
  return useState({
    name: '',
    type: 'instant_discount' as OfferType,
    issuer: '',
    cardId: '',
    merchant: '',
    category: '',
    minSpend: '',
    discountPercent: '',
    discountFlat: '',
    maxDiscount: '',
    rewardMultiplier: '',
    validFrom: today,
    validTo: today,
    eligibilityNotes: '',
  })
}

function MilestoneModal({
  open,
  onClose,
  cardOptions,
  onSave,
}: {
  open: boolean
  onClose: () => void
  cardOptions: Array<{ id: string; label: string }>
  onSave: (data: {
    name: string
    cardId: string
    period: UserMilestone['period']
    targetSpend: number
    rewardValue: number
    active: boolean
    notes: string
  }) => void
}) {
  const [form, setForm] = useState({
    name: '',
    cardId: '',
    period: 'monthly' as UserMilestone['period'],
    targetSpend: '100000',
    rewardValue: '2000',
    notes: '',
  })

  return (
    <Modal open={open} onClose={onClose} title="Add milestone" wide>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name *">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Quarterly spend boost"
          />
        </Field>
        <Field label="Period">
          <select
            className="h-11 w-full rounded-xl border border-border-soft bg-surface-0 px-3 text-sm"
            value={form.period}
            onChange={(e) =>
              setForm({
                ...form,
                period: e.target.value as UserMilestone['period'],
              })
            }
          >
            <option value="monthly">monthly</option>
            <option value="quarterly">quarterly</option>
            <option value="annual">annual</option>
            <option value="custom">custom (365d)</option>
          </select>
        </Field>
        <Field label="Card (optional)">
          <select
            className="h-11 w-full rounded-xl border border-border-soft bg-surface-0 px-3 text-sm"
            value={form.cardId}
            onChange={(e) => setForm({ ...form, cardId: e.target.value })}
          >
            <option value="">Whole wallet</option>
            {cardOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Target spend ₹">
          <Input
            inputMode="decimal"
            value={form.targetSpend}
            onChange={(e) => setForm({ ...form, targetSpend: e.target.value })}
          />
        </Field>
        <Field label="Reward value when hit ₹">
          <Input
            inputMode="decimal"
            value={form.rewardValue}
            onChange={(e) => setForm({ ...form, rewardValue: e.target.value })}
          />
        </Field>
        <Field label="Notes">
          <Input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </Field>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => {
            if (!form.name.trim()) return
            onSave({
              name: form.name,
              cardId: form.cardId,
              period: form.period,
              targetSpend: Number(form.targetSpend) || 0,
              rewardValue: Number(form.rewardValue) || 0,
              active: true,
              notes: form.notes,
            })
          }}
        >
          Save milestone
        </Button>
      </div>
    </Modal>
  )
}

function BenefitModal({
  open,
  onClose,
  cardOptions,
  onSave,
}: {
  open: boolean
  onClose: () => void
  cardOptions: Array<{ id: string; label: string }>
  onSave: (data: {
    name: string
    description: string
    value: number | null
    eligibility: string
    expiry: string | null
    status: UserBenefit['status']
    cardId: string
  }) => void
}) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    value: '',
    eligibility: '',
    expiry: '',
    cardId: '',
  })

  return (
    <Modal open={open} onClose={onClose} title="Add benefit" wide>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name *">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Estimated value ₹">
          <Input
            inputMode="decimal"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
          />
        </Field>
        <Field label="Description">
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <Field label="Eligibility">
          <Input
            value={form.eligibility}
            onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
          />
        </Field>
        <Field label="Expiry">
          <Input
            type="date"
            value={form.expiry}
            onChange={(e) => setForm({ ...form, expiry: e.target.value })}
          />
        </Field>
        <Field label="Card (optional)">
          <select
            className="h-11 w-full rounded-xl border border-border-soft bg-surface-0 px-3 text-sm"
            value={form.cardId}
            onChange={(e) => setForm({ ...form, cardId: e.target.value })}
          >
            <option value="">Any / general</option>
            {cardOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => {
            if (!form.name.trim()) return
            onSave({
              name: form.name,
              description: form.description,
              value: numOrNull(form.value),
              eligibility: form.eligibility,
              expiry: form.expiry || null,
              status: 'active',
              cardId: form.cardId,
            })
          }}
        >
          Save benefit
        </Button>
      </div>
    </Modal>
  )
}

function numOrNull(v: string): number | null {
  if (v.trim() === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

