import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import type { AnalysisResult } from '../../types/analyzer'
import { GlassCard } from '../../components/ui/GlassCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatINR } from '../../lib/format'
import { cn } from '../../lib/cn'
import { useTransactions } from '../../store/TransactionContext'

export function AnalysisResultView({ result }: { result: AnalysisResult }) {
  const { winner, purchase, recommendations, winnerReason, usedFixtures, offerValue } =
    result
  const { addTransaction } = useTransactions()
  const [markedId, setMarkedId] = useState<string | null>(null)

  function markAsUsed() {
    if (!winner) return
    const tx = addTransaction({
      date: new Date().toISOString(),
      merchant: purchase.merchant,
      product: purchase.product,
      amount: purchase.amount,
      currency: purchase.currency,
      category: purchase.category,
      cardId: winner.cardId,
      cardLabel: winner.label,
      offerValue: offerValue || winner.offerValue || 0,
      rewardRaw: winner.breakdown.rawRewardAfterCap,
      rewardKind:
        winner.breakdown.kind === 'none' ? 'none' : winner.breakdown.kind,
      effectiveValue: winner.effectiveValue,
      url: purchase.url,
      notes: 'Created via Mark as used',
    })
    setMarkedId(tx.id)
  }

  return (
    <div className="space-y-4">
      {winner ? (
        <GlassCard strong className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 animated-gradient opacity-30" />
          <div className="relative space-y-3">
            <Badge tone="positive">Recommendation</Badge>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
              🏆 USE {winner.label}
            </h2>
            <div className="grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
              <p>
                <span className="text-text-muted">Purchase</span>
                <br />
                <span className="font-medium text-text-primary">{purchase.product}</span>
              </p>
              <p>
                <span className="text-text-muted">Amount</span>
                <br />
                <span className="font-medium text-text-primary">
                  {formatINR(purchase.amount)} · {purchase.merchant} · {purchase.category}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
              <Metric
                label="Reward value"
                value={formatINR(winner.breakdown.effectiveValue)}
              />
              <Metric label="Offer value" value={formatINR(offerValue)} />
              <Metric label="Milestone" value="₹0" hint="Phase 6" />
              <Metric
                label="Total"
                value={formatINR(winner.effectiveValue)}
                emphasize
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {markedId ? (
                <>
                  <Badge tone="positive">
                    <Check className="mr-1 inline h-3 w-3" />
                    Marked as used
                  </Badge>
                  <Link
                    to="/transactions"
                    className="text-xs font-semibold text-accent-soft hover:underline"
                  >
                    View transactions →
                  </Link>
                </>
              ) : (
                <Button type="button" onClick={markAsUsed}>
                  Mark as used
                </Button>
              )}
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface-0/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Why this card
              </p>
              <ul className="mt-2 space-y-1">
                {winnerReason.map((line, i) => (
                  <li key={i} className="text-sm leading-relaxed text-text-secondary">
                    · {line}
                  </li>
                ))}
              </ul>
            </div>

            {usedFixtures && (
              <p className="text-xs text-warning">
                Ranked using synthetic fixture cards (wallet empty or no user-provided rates).
                Not real bank reward tables.
              </p>
            )}
          </div>
        </GlassCard>
      ) : (
        <GlassCard>
          <h2 className="font-display text-lg font-semibold">No winning card</h2>
          <ul className="mt-2 space-y-1">
            {winnerReason.map((line, i) => (
              <li key={i} className="text-sm text-text-secondary">
                · {line}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      <div>
        <h3 className="mb-3 font-display text-sm font-semibold text-text-primary">
          Compare cards
        </h3>
        <div className="space-y-2">
          {recommendations.map((row) => (
            <GlassCard
              key={row.cardId}
              className={cn(
                'space-y-2',
                winner?.cardId === row.cardId && 'ring-1 ring-accent/40',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-text-muted">#{row.rank}</span>
                    <p className="font-display text-sm font-semibold text-text-primary">
                      {row.label}
                    </p>
                    {winner?.cardId === row.cardId && (
                      <Badge tone="positive">Winner</Badge>
                    )}
                    {!row.breakdown.eligible && <Badge tone="danger">Ineligible</Badge>}
                    <Badge tone={row.source === 'fixture' ? 'warning' : 'accent'}>
                      {row.source}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {row.estimatedRewardLabel}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-semibold text-text-primary">
                    {formatINR(row.effectiveValue)} effective
                  </p>
                  <p className="text-text-muted">
                    Offer {formatINR(row.offerValue)} · return{' '}
                    {purchase.amount > 0
                      ? `${((row.effectiveValue / purchase.amount) * 100).toFixed(2)}%`
                      : '—'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-text-muted">{row.capImpact}</p>
              <p className="text-xs text-text-secondary">
                {row.breakdown.ineligibilityReason ||
                  row.explanation[0] ||
                  'See engine notes'}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  hint,
  emphasize,
}: {
  label: string
  value: string
  hint?: string
  emphasize?: boolean
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-0/60 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
        {hint ? ` · ${hint}` : ''}
      </p>
      <p
        className={cn(
          'mt-1 font-display text-base font-semibold tabular-nums',
          emphasize ? 'text-positive' : 'text-text-primary',
        )}
      >
        {value}
      </p>
    </div>
  )
}
