import { useMemo, useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlassCard } from '../../components/ui/GlassCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useWallet } from '../../store/WalletContext'
import { usePreferences } from '../../store/PreferencesContext'
import { useTransactions } from '../../store/TransactionContext'
import { useOptimization } from '../../store/OptimizationContext'
import { walletCardsToProfiles } from '../../core/adapters/walletToProfile'
import { applyTransactionCapUsage } from '../../core/transactions/applyCapUsage'
import { recommendCards } from '../../core/recommendationEngine'
import { FIXTURE_CARDS, FIXTURE_PURCHASES } from '../../data/fixtures/engineFixtures'
import type { PurchaseInput } from '../../types/engine'
import { formatINR } from '../../lib/format'
import { Link } from 'react-router-dom'

const CATEGORIES = [
  'Shopping',
  'Food',
  'Travel',
  'Fuel',
  'Utilities',
  'Entertainment',
  'Other',
]

export function RewardsPage() {
  const { cards } = useWallet()
  const { weights } = usePreferences()
  const { transactions } = useTransactions()
  const { offers, milestones } = useOptimization()
  const [useFixtures, setUseFixtures] = useState(true)
  const [amount, setAmount] = useState(String(FIXTURE_PURCHASES.basic10k.amount))
  const [merchant, setMerchant] = useState(FIXTURE_PURCHASES.basic10k.merchant)
  const [category, setCategory] = useState(FIXTURE_PURCHASES.basic10k.category)

  const purchase: PurchaseInput = useMemo(
    () => ({
      amount: Number(amount) || 0,
      currency: 'INR',
      merchant,
      category,
    }),
    [amount, merchant, category],
  )

  const profiles = useMemo(() => {
    const base = useFixtures ? FIXTURE_CARDS : walletCardsToProfiles(cards)
    return applyTransactionCapUsage(base, transactions)
  }, [useFixtures, cards, transactions])

  const ranked = useMemo(
    () =>
      recommendCards({
        purchase,
        cards: profiles,
        preferences: weights,
        offers,
        milestones,
        transactions,
      }),
    [purchase, profiles, weights, offers, milestones, transactions],
  )

  const winner = ranked.find((r) => r.breakdown.eligible)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rewards engine"
        description="Deterministic reward, cap, valuation, and ranking — no LLM arithmetic. Fixture profiles are synthetic and not real bank rates."
        badge="Phase 3"
      />

      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-text-primary">Calculation source</p>
          <p className="mt-0.5 text-xs text-text-muted">
            Fixtures = known test math · Wallet = your user-provided rates only
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={useFixtures ? 'primary' : 'secondary'}
            onClick={() => setUseFixtures(true)}
          >
            Synthetic fixtures
          </Button>
          <Button
            type="button"
            size="sm"
            variant={!useFixtures ? 'primary' : 'secondary'}
            onClick={() => setUseFixtures(false)}
          >
            My wallet ({cards.length})
          </Button>
        </div>
      </GlassCard>

      {!useFixtures && cards.length === 0 && (
        <GlassCard>
          <p className="text-sm text-text-secondary">
            Wallet is empty or cards lack a reward rate. Add cards and set a user-provided
            rate in Edit, or switch to fixtures.
          </p>
          <Link
            to="/wallet"
            className="mt-3 inline-flex text-sm font-semibold text-accent-soft hover:underline"
          >
            Open wallet →
          </Link>
        </GlassCard>
      )}

      <GlassCard>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="font-display text-sm font-semibold">Purchase input</h2>
          <Badge tone="muted">Manual (Phase 4 adds URL analysis)</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-medium text-text-secondary">
            Amount (INR)
            <Input
              className="mt-1.5"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label className="text-xs font-medium text-text-secondary">
            Merchant
            <Input
              className="mt-1.5"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />
          </label>
          <label className="text-xs font-medium text-text-secondary">
            Category
            <select
              className="mt-1.5 h-11 w-full rounded-xl border border-border-soft bg-surface-0 px-3 text-sm text-text-primary"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setAmount(String(FIXTURE_PURCHASES.capScenario.amount))
              setMerchant(FIXTURE_PURCHASES.capScenario.merchant)
              setCategory(FIXTURE_PURCHASES.capScenario.category)
              setUseFixtures(true)
            }}
          >
            Load cap scenario
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setAmount(String(FIXTURE_PURCHASES.fuel.amount))
              setMerchant(FIXTURE_PURCHASES.fuel.merchant)
              setCategory(FIXTURE_PURCHASES.fuel.category)
              setUseFixtures(true)
            }}
          >
            Load exclusion scenario
          </Button>
        </div>
      </GlassCard>

      {winner && (
        <GlassCard strong className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 animated-gradient opacity-25" />
          <div className="relative">
            <Badge tone="positive">Top recommendation</Badge>
            <h2 className="mt-2 font-display text-xl font-semibold text-text-primary">
              Use {winner.label}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Effective value{' '}
              <span className="font-semibold text-positive">
                {formatINR(winner.effectiveValue)}
              </span>
              {' · '}
              {winner.estimatedRewardLabel}
            </p>
            <p className="mt-2 text-xs text-text-muted">{winner.capImpact}</p>
          </div>
        </GlassCard>
      )}

      <div className="space-y-3">
        <h2 className="font-display text-sm font-semibold text-text-primary">
          Ranked cards
        </h2>
        {ranked.length === 0 && (
          <GlassCard>
            <p className="text-sm text-text-muted">No profiles to rank.</p>
          </GlassCard>
        )}
        {ranked.map((row) => (
          <GlassCard key={row.cardId} className="space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-text-muted">#{row.rank}</span>
                  <h3 className="font-display text-sm font-semibold text-text-primary">
                    {row.label}
                  </h3>
                  <Badge tone={row.source === 'fixture' ? 'warning' : 'accent'}>
                    {row.source === 'fixture' ? 'Fixture' : 'Wallet'}
                  </Badge>
                  {!row.breakdown.eligible && <Badge tone="danger">Ineligible</Badge>}
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  {row.estimatedRewardLabel} · Effective {formatINR(row.effectiveValue)}
                </p>
              </div>
              <div className="text-right text-xs text-text-muted">
                <div>{row.capImpact}</div>
                {row.offerValue > 0 && <div>Offer {formatINR(row.offerValue)}</div>}
              </div>
            </div>
            <ul className="space-y-1 border-t border-border-subtle pt-2">
              {row.explanation.map((line, i) => (
                <li key={i} className="text-[12px] leading-relaxed text-text-muted">
                  · {line}
                </li>
              ))}
            </ul>
            <p className="text-[10px] uppercase tracking-wide text-text-muted">
              {row.breakdown.verification.status.replaceAll('_', ' ')}
            </p>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
