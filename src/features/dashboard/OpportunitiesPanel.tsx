import { Link } from 'react-router-dom'
import { GlassCard } from '../../components/ui/GlassCard'
import { Badge } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Button } from '../../components/ui/Button'
import type { MissedOpportunity, WalletEfficiency } from '../../core/analytics'
import { formatINR } from '../../lib/format'

export function OpportunitiesPanel({
  missed,
  efficiency,
  hasData,
}: {
  missed: MissedOpportunity
  efficiency: WalletEfficiency
  hasData: boolean
}) {
  return (
    <GlassCard className="h-full">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold">Opportunities</h3>
        <Badge tone={hasData ? 'accent' : 'muted'}>
          {hasData ? 'Live' : 'Waiting on data'}
        </Badge>
      </div>

      <div className="mb-4 rounded-xl border border-border-subtle bg-surface-0/50 p-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Missed this month
          </p>
          <Badge tone="warning">{missed.label}</Badge>
        </div>
        <p className="mt-1 font-display text-2xl font-semibold text-warning tabular-nums">
          {formatINR(missed.amount)}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
          {missed.explanation}
        </p>
      </div>

      <div>
        <div className="mb-1 flex items-end justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Wallet efficiency
          </p>
          <p className="font-display text-lg font-semibold text-accent-soft tabular-nums">
            {efficiency.score}
            <span className="text-xs text-text-muted"> /100 · {efficiency.grade}</span>
          </p>
        </div>
        <ProgressBar value={efficiency.score} tone="accent" />
        <p className="mt-2 text-[10px] font-mono text-text-muted">{efficiency.formula}</p>
      </div>

      <Link to="/analytics" className="mt-4 inline-block">
        <Button type="button" variant="secondary" size="sm">
          Open analytics
        </Button>
      </Link>
    </GlassCard>
  )
}
