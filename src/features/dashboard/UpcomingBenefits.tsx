import { Plane, Target, Tag, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GlassCard } from '../../components/ui/GlassCard'
import { Badge } from '../../components/ui/Badge'
import { DEMO_BENEFITS } from '../../data/demo'
import { useOptimization } from '../../store/OptimizationContext'
import { useTransactions } from '../../store/TransactionContext'
import { getMilestoneProgress } from '../../core/milestoneEngine'
import { formatINR } from '../../lib/format'

export function UpcomingBenefits() {
  const { offers, milestones, benefits } = useOptimization()
  const { transactions } = useTransactions()

  const liveItems: Array<{
    id: string
    title: string
    subtitle: string
    type: 'milestone' | 'travel' | 'offer' | 'benefit'
    due: string
  }> = []

  for (const m of milestones.filter((x) => x.active).slice(0, 3)) {
    const p = getMilestoneProgress(m, transactions)
    if (p.progressPct >= 100) continue
    liveItems.push({
      id: m.id,
      title: m.name,
      subtitle: `${formatINR(p.currentSpend)} / ${formatINR(m.targetSpend)} · ${p.progressPct}%`,
      type: 'milestone',
      due: `${formatINR(p.remaining)} remaining`,
    })
  }

  for (const o of offers.filter((x) => x.active).slice(0, 2)) {
    liveItems.push({
      id: o.id,
      title: o.name,
      subtitle: [o.merchant, o.category, o.type.replace('_', ' ')]
        .filter(Boolean)
        .join(' · '),
      type: 'offer',
      due: `Until ${o.validTo.slice(0, 10)}`,
    })
  }

  for (const b of benefits.filter((x) => x.status === 'active').slice(0, 2)) {
    liveItems.push({
      id: b.id,
      title: b.name,
      subtitle: b.description || b.eligibility,
      type: b.name.toLowerCase().includes('travel') || b.name.toLowerCase().includes('lounge')
        ? 'travel'
        : 'benefit',
      due: b.expiry ? `Exp ${b.expiry.slice(0, 10)}` : 'Active',
    })
  }

  const items = liveItems.length > 0 ? liveItems : DEMO_BENEFITS.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    type: b.type as 'milestone' | 'travel' | 'offer',
    due: b.due,
  }))
  const live = liveItems.length > 0

  const icons = {
    milestone: Target,
    travel: Plane,
    offer: Tag,
    benefit: Sparkles,
  }

  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-text-primary">
          Upcoming Benefits
        </h3>
        <div className="flex items-center gap-2">
          <Badge tone={live ? 'accent' : 'muted'}>{live ? 'Live' : 'Demo'}</Badge>
          <Link
            to="/benefits"
            className="text-[11px] font-semibold text-accent-soft hover:underline"
          >
            Manage
          </Link>
        </div>
      </div>
      <ul className="space-y-3">
        {items.slice(0, 4).map((b) => {
          const Icon = icons[b.type] || Sparkles
          return (
            <li
              key={b.id}
              className="flex gap-3 rounded-xl border border-border-subtle bg-white/[0.02] p-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-dim text-accent-soft">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">{b.title}</p>
                <p className="mt-0.5 text-xs text-text-secondary">{b.subtitle}</p>
                <p className="mt-1 text-[11px] font-medium text-text-muted">{b.due}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </GlassCard>
  )
}
