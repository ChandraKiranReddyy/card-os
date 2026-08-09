import { GlassCard } from '../../components/ui/GlassCard'
import { Badge } from '../../components/ui/Badge'
import { useCountUp } from '../../hooks/useCountUp'
import { formatINR } from '../../lib/format'
import type { DemoStat } from '../../types'
import { cn } from '../../lib/cn'

export function StatWidget({
  stat,
  delay = 0,
}: {
  stat: DemoStat
  delay?: number
}) {
  const isNumber = typeof stat.value === 'number'
  const numeric = isNumber ? (stat.value as number) : 0
  const counted = useCountUp(numeric)

  let display: string
  if (!isNumber) {
    display = String(stat.value)
  } else if (stat.id === 'capacity') {
    display = `${counted}%`
  } else if (stat.id === 'active') {
    display = String(counted)
  } else {
    display = formatINR(counted)
  }

  return (
    <GlassCard
      className={cn(
        'relative overflow-hidden',
        delay ? '' : '',
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/10 blur-2xl" />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        {stat.label}
      </p>
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-text-primary tabular-nums sm:text-[1.75rem]">
        {display}
      </p>
      {stat.hint && (
        <div className="mt-2">
          <Badge
            tone={
              stat.tone === 'positive'
                ? 'positive'
                : stat.tone === 'warning'
                  ? 'warning'
                  : stat.tone === 'accent'
                    ? 'accent'
                    : 'muted'
            }
          >
            {stat.hint}
          </Badge>
        </div>
      )}
    </GlassCard>
  )
}
