import { Construction } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GlassCard } from './GlassCard'
import { Badge } from './Badge'

export function PlaceholderPanel({
  title,
  description,
  phaseHint = 'Coming in a later phase',
}: {
  title: string
  description: string
  phaseHint?: string
}) {
  return (
    <GlassCard className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-dim text-accent-soft">
        <Construction className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-lg font-semibold text-text-primary">{title}</h2>
          <Badge tone="warning">Placeholder</Badge>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">{description}</p>
        <p className="mt-2 text-xs text-text-muted">{phaseHint}</p>
      </div>
      <Link
        to="/"
        className="inline-flex h-8 items-center justify-center rounded-lg border border-border-soft bg-surface-2 px-3 text-xs font-medium text-text-primary transition hover:bg-surface-3"
      >
        Back to Dashboard
      </Link>
    </GlassCard>
  )
}
