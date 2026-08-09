import { Link } from 'react-router-dom'
import { GlassCard } from '../../components/ui/GlassCard'
import { Badge } from '../../components/ui/Badge'
import { DEMO_TRANSACTIONS } from '../../data/demo'
import { formatINR } from '../../lib/format'
import { useTransactions } from '../../store/TransactionContext'
import { formatRelativeDate } from '../../core/transactions/aggregates'

export function RecentActivity() {
  const { transactions } = useTransactions()
  const live = transactions.length > 0
  const rows = live
    ? [...transactions]
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
        .slice(0, 6)
        .map((tx) => ({
          id: tx.id,
          merchant: tx.merchant,
          category: tx.category,
          amount: tx.amount,
          card: tx.cardLabel,
          date: formatRelativeDate(tx.date),
          rewardLabel: `≈ ${formatINR(tx.effectiveValue)}`,
        }))
    : DEMO_TRANSACTIONS

  return (
    <GlassCard padding="none">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <h3 className="font-display text-sm font-semibold text-text-primary">
          Recent Activity
        </h3>
        <div className="flex items-center gap-2">
          <Badge tone={live ? 'accent' : 'muted'}>{live ? 'Live' : 'Demo'}</Badge>
          {live && (
            <Link
              to="/transactions"
              className="text-[11px] font-semibold text-accent-soft hover:underline"
            >
              All
            </Link>
          )}
        </div>
      </div>
      <ul className="divide-y divide-border-subtle">
        {rows.map((tx) => (
          <li
            key={tx.id}
            className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-white/[0.02]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-text-secondary">
              {tx.merchant.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-text-primary">
                  {tx.merchant}
                </p>
                <span className="text-[10px] text-text-muted">{tx.category}</span>
              </div>
              <p className="mt-0.5 text-xs text-text-muted">
                {tx.card} · {tx.date}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums text-text-primary">
                {formatINR(tx.amount)}
              </p>
              <p className="text-[11px] font-medium text-positive">{tx.rewardLabel}</p>
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  )
}
