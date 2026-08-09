import { cn } from '../../lib/cn'

type Tone = 'default' | 'positive' | 'warning' | 'danger' | 'accent' | 'muted'

const tones: Record<Tone, string> = {
  default: 'bg-white/5 text-text-secondary border-border-soft',
  positive: 'bg-positive-dim text-positive border-positive/20',
  warning: 'bg-warning-dim text-warning border-warning/20',
  danger: 'bg-danger-dim text-danger border-danger/20',
  accent: 'bg-accent-dim text-accent-soft border-accent/25',
  muted: 'bg-white/[0.03] text-text-muted border-border-subtle',
}

export function Badge({
  children,
  tone = 'default',
  className,
}: {
  children: React.ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
